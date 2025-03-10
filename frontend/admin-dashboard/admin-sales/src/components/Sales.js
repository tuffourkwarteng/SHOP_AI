import React, { useState, useEffect, useRef } from "react"; // Added useRef
import axios from "axios";
import {
  AppBar, Toolbar, Typography, Grid, Paper, TextField, Button, List, ListItem,
  ListItemText, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Select, MenuItem, Box, TablePagination, Autocomplete, Checkbox, Dialog,
  DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import { styled } from "@mui/material/styles";
import PaymentIcon from "@mui/icons-material/Payment";
import DeleteIcon from "@mui/icons-material/Delete";
import PrintIcon from "@mui/icons-material/Print";
import EmailIcon from "@mui/icons-material/Email";
import SmsIcon from "@mui/icons-material/Sms";

const themeColor = "#8BC34A"; // Lemon Green Theme

const StyledAppBar = styled(AppBar)({
  backgroundColor: themeColor,
  fontFamily: "Candara, sans-serif",
});

const StyledTypography = styled(Typography)({
  fontFamily: "Candara, sans-serif",
});

const Sales = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [salesSearchQuery, setSalesSearchQuery] = useState("");
  const [salesDateFilter, setSalesDateFilter] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showQuantityDialog, setShowQuantityDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(""); // Initialize to empty string
  const [amountPaid, setAmountPaid] = useState(""); // Amount paid by the customer
  const [paymentMode, setPaymentMode] = useState("Cash"); // Payment mode (Cash, Momo, Card)
  const [momoNetwork, setMomoNetwork] = useState(""); // Momo network (MTN, Telecel, Airtel Tigo)

  // Ref for auto-focusing the quantity input
  const quantityInputRef = useRef(null);

  // Auto-focus the quantity input when the dialog opens
  useEffect(() => {
    if (selectedProduct && quantityInputRef.current) {
      quantityInputRef.current.focus();
    }
  }, [selectedProduct]);

  // Fetch products from the backend API
  useEffect(() => {
    axios.get("http://localhost:5250/api/Product")
      .then((response) => {
        console.log("Products fetched:", response.data); // Debugging
        setProducts(response.data);
      })
      .catch((error) => console.error("Error fetching products:", error));
  }, []);

  // Fetch recent sales from the backend API
  useEffect(() => {
    axios.get("http://localhost:5250/api/Sales/recent")
      .then((response) => setRecentSales(response.data))
      .catch((error) => console.error("Error fetching sales:", error));
  }, []);

  useEffect(() => {
    // Update the digital clock every second
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const addToCart = (product, quantity = 1) => {
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      updateQuantity(cart.indexOf(existingItem), existingItem.quantity + quantity);
    } else {
      setCart([...cart, { ...product, quantity }]);
    }
    setSearchQuery(""); // Clear the search query after adding to cart
  };

  const updateQuantity = (index, quantity) => {
    const updatedCart = [...cart];
    if (quantity <= 0) {
      updatedCart.splice(index, 1); // Remove item if quantity is 0
    } else {
      updatedCart[index].quantity = quantity;
    }
    setCart(updatedCart);
  };

  const handleDeleteItem = (index) => {
    const updatedCart = [...cart];
    updatedCart.splice(index, 1); // Remove the entire item from the cart
    setCart(updatedCart);
  };

  const handleSendEmail = () => {
    if (customerEmail) {
      console.log(`Sending email to ${customerEmail}`);
      alert(`Email sent to ${customerEmail}`);
    } else {
      alert("Please enter a valid email address.");
    }
  };

  const handleSendSMS = () => {
    if (customerPhone) {
      console.log(`Sending SMS to ${customerPhone}`);
      alert(`SMS sent to ${customerPhone}`);
    } else {
      alert("Please enter a valid phone number.");
    }
  };

  const handleSaveAndPrintReceipt = async () => {
    if (cart.length === 0) {
      alert("Cart is empty. Add products before saving.");
      return;
    }

    const totalAmount = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    const changeDue = amountPaid ? (parseFloat(amountPaid) - totalAmount).toFixed(2) : 0;

    if (changeDue < 0) {
      alert("Amount paid is less than the total amount. Please enter a valid amount.");
      return;
    }

    const saleData = {
      saleDate: new Date().toISOString(),
      totalAmount,
      customerEmail,
      customerPhone,
      paymentMode,
      momoNetwork: paymentMode === "Momo" ? momoNetwork : null,
      amountPaid: parseFloat(amountPaid),
      changeDue,
      saleItems: cart.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    try {
      // Save the sale to the database
      const response = await axios.post("http://localhost:5250/api/Sales", saleData);
      console.log("Sale saved:", response.data);

      // Print the receipt
      window.print();

      // Clear the cart and customer details
      clearReceipt();

      // Refresh recent sales
      const salesResponse = await axios.get("http://localhost:5250/api/Sales/recent");
      setRecentSales(salesResponse.data);

      alert("Sale saved and receipt printed.");
    } catch (error) {
      console.error("Error saving sale:", error);
      alert("Failed to save sale.");
    }
  };

  const handleHoldSale = () => {
    if (cart.length === 0) {
      alert("Cart is empty. Add products before holding.");
      return;
    }

    // Save the held sale to local storage
    localStorage.setItem("heldSale", JSON.stringify(cart));
    alert("Sale held. You can resume later.");

    // Clear the cart
    clearReceipt();
  };

  const handleReprintReceipt = (sale) => {
    console.log("Reprinting receipt for sale:", sale);
    alert(`Reprinting receipt for sale ID: ${sale.id}`);
  };

  const clearReceipt = () => {
    setCart([]);
    setCustomerEmail("");
    setCustomerPhone("");
    setAmountPaid("");
    setPaymentMode("Cash"); // Reset payment mode to Cash
    setMomoNetwork(""); // Reset Momo network
  };

  const handleSearchQueryChange = (e, value) => {
    setSearchQuery(value);
    if (value && value.length === 13) { // Assuming barcode length is 13
      const product = products.find((p) => p.barcode === value);
      if (product) {
        if (showQuantityDialog) {
          setSelectedProduct(product);
          setQuantity(""); // Clear quantity input
        } else {
          addToCart(product);
        }
        setSearchQuery(""); // Clear the search query after adding to cart
      }
    }
  };

  const handleProductSelect = (product) => {
    if (showQuantityDialog) {
      setSelectedProduct(product);
      setQuantity(""); // Clear quantity input
    } else {
      addToCart(product);
    }
    setSearchQuery(""); // Clear the search query after selecting a product
  };

  const handleQuantityDialogClose = () => {
    setSelectedProduct(null);
    setQuantity(""); // Clear quantity input
  };

  const handleQuantityDialogConfirm = () => {
    if (selectedProduct && quantity) {
      addToCart(selectedProduct, parseInt(quantity, 10));
      setSelectedProduct(null);
      setQuantity(""); // Clear quantity input
    }
  };

  const handleSalesSearchQueryChange = (e) => {
    setSalesSearchQuery(e.target.value);
  };

  const handleSalesDateFilterChange = (e) => {
    setSalesDateFilter(e.target.value);
  };

  const filteredRecentSales = recentSales.filter((sale) => {
    const matchesSearchQuery = sale.id.toString().includes(salesSearchQuery) ||
      sale.customerEmail.toLowerCase().includes(salesSearchQuery.toLowerCase());
    const matchesDateFilter = salesDateFilter ? new Date(sale.saleDate).toLocaleDateString() === new Date(salesDateFilter).toLocaleDateString() : true;
    return matchesSearchQuery && matchesDateFilter;
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const totalAmount = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const changeDue = amountPaid ? (parseFloat(amountPaid) - totalAmount).toFixed(2) : 0;

  return (
    <Box sx={{ flexGrow: 1, height: "100vh", overflow: "hidden", backgroundColor: "#f5f5f5", fontFamily: "Candara, sans-serif" }}>
      {/* Main Content, Cart, and Receipt Preview */}
      <Grid container spacing={2} sx={{ height: "100%", margin: 0, padding: "10px" }}>
        {/* Main Content (Product Search and Recent Sales) */}
        <Grid item xs={6} sx={{ height: "100%", overflow: "auto" }}>
          <StyledAppBar position="static">
            <Toolbar>
              <StyledTypography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Supermarket POS - Sales
              </StyledTypography>
              <StyledTypography variant="h6">
                {currentTime.toLocaleTimeString()}
              </StyledTypography>
            </Toolbar>
          </StyledAppBar>

          <Grid container spacing={2} sx={{ marginTop: "20px" }}>
            {/* Product Search */}
            <Grid item xs={12}>
              <Paper sx={{ padding: "20px" }}>
                <StyledTypography variant="h6">Product Search</StyledTypography>
                <Autocomplete
                  freeSolo
                  options={products}
                  getOptionLabel={(product) => product ? `${product.name} (ID: ${product.id})` : ""}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Search Products by Name or ID"
                      variant="outlined"
                      margin="normal"
                      fullWidth
                      sx={{ width: "100%" }} // Ensure full width
                    />
                  )}
                  value={searchQuery}
                  onChange={(e, value) => {
                    if (value && typeof value === "object") {
                      handleProductSelect(value);
                    }
                  }}
                  onInputChange={(e, value) => handleSearchQueryChange(e, value)}
                />
                {/* Checkbox moved under the search box */}
                <Box sx={{ display: "flex", alignItems: "center", marginTop: 2 }}>
                  <Checkbox
                    checked={showQuantityDialog}
                    onChange={(e) => setShowQuantityDialog(e.target.checked)}
                  />
                  <StyledTypography variant="body1">Show Quantity Dialog</StyledTypography>
                </Box>
              </Paper>
            </Grid>

            {/* Recent Sales Table */}
            <Grid item xs={12}>
              <Paper sx={{ padding: "20px" }}>
                <StyledTypography variant="h6">Recent Sales</StyledTypography>
                <Grid container spacing={2} sx={{ marginBottom: "10px" }}>
                  <Grid item xs={8}>
                    <TextField
                      fullWidth
                      label="Search Sales by ID or Email"
                      variant="outlined"
                      margin="normal"
                      value={salesSearchQuery}
                      onChange={handleSalesSearchQueryChange}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      label="Filter by Date"
                      type="date"
                      variant="outlined"
                      margin="normal"
                      value={salesDateFilter}
                      onChange={handleSalesDateFilterChange}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
                <TableContainer sx={{ maxHeight: 440 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Sale ID</TableCell>
                        <TableCell>Total Amount</TableCell>
                        <TableCell>Customer Email</TableCell>
                        <TableCell>Sale Date</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredRecentSales
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((sale) => (
                          <TableRow key={sale.id}>
                            <TableCell>{sale.id}</TableCell>
                            <TableCell>${sale.totalAmount.toFixed(2)}</TableCell>
                            <TableCell>{sale.customerEmail}</TableCell>
                            <TableCell>{new Date(sale.saleDate).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <IconButton color="primary" onClick={() => handleReprintReceipt(sale)}>
                                <PrintIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[10, 25, 50]}
                  component="div"
                  count={filteredRecentSales.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        {/* Cart and Receipt Preview (Side by Side) */}
        <Grid item xs={6} sx={{ height: "100%", display: "flex", gap: 2 }}>
          {/* Cart */}
          <Paper sx={{ padding: "20px", flex: 1, height: "50%" }}>
            <StyledTypography variant="h6">Cart</StyledTypography>
            <List>
              {cart.map((item, index) => (
                <ListItem key={index}>
                  <ListItemText primary={item.name} secondary={`$${item.price}`} />
                  <Select
                    value={item.quantity}
                    onChange={(e) => updateQuantity(index, e.target.value)}
                  >
                    {[...Array(10).keys()].map(i => (
                      <MenuItem key={i + 1} value={i + 1}>{i + 1}</MenuItem>
                    ))}
                  </Select>
                  <IconButton color="primary" onClick={() => handleDeleteItem(index)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItem>
              ))}
            </List>
            <StyledTypography variant="h6">
              Total: ${totalAmount.toFixed(2)}
            </StyledTypography>
            <TextField
              fullWidth
              label="Amount Paid"
              variant="outlined"
              margin="normal"
              type="number"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
            />
            <StyledTypography variant="body1">
              Change Due: ${changeDue}
            </StyledTypography>
            <Box sx={{ marginTop: 2 }}>
              <Select
                fullWidth
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                variant="outlined"
              >
                <MenuItem value="Cash">Cash</MenuItem>
                <MenuItem value="Momo">Momo</MenuItem>
                <MenuItem value="Card">Card</MenuItem>
              </Select>
              {paymentMode === "Momo" && (
                <Select
                  fullWidth
                  value={momoNetwork}
                  onChange={(e) => setMomoNetwork(e.target.value)}
                  variant="outlined"
                  sx={{ marginTop: 2 }}
                >
                  <MenuItem value="MTN">MTN</MenuItem>
                  <MenuItem value="Telecel">Telecel</MenuItem>
                  <MenuItem value="Airtel Tigo">Airtel Tigo</MenuItem>
                </Select>
              )}
            </Box>
            <Button fullWidth variant="contained" startIcon={<PaymentIcon />} sx={{ marginTop: "10px" }} onClick={handleSaveAndPrintReceipt}>
              Save and Print Receipt
            </Button>
            <Button fullWidth variant="contained" color="secondary" startIcon={<PaymentIcon />} sx={{ marginTop: "10px" }} onClick={handleHoldSale}>
              Hold Sale
            </Button>
          </Paper>

          {/* Receipt Preview */}
          <Paper sx={{ padding: "20px", flex: 1, height: "50%" }}>
            <StyledTypography variant="h6">Receipt Preview</StyledTypography>
            <Paper sx={{ padding: "10px", backgroundColor: "#fff", minHeight: "200px", border: "1px solid #ccc" }}>
              <StyledTypography variant="body1">
                <strong>BethelMarts Ghana</strong><br />
                ---------------------------------<br />
                {cart.map((item, index) => (
                  <div key={index}>
                    {item.name} x {item.quantity} - ${item.price * item.quantity}
                    <br />
                  </div>
                ))}
                ---------------------------------<br />
                <strong>Total: ${totalAmount.toFixed(2)}</strong><br />
                <strong>Amount Paid: ${amountPaid}</strong><br />
                <strong>Change Due: ${changeDue}</strong><br />
                <strong>Payment Mode: {paymentMode}</strong><br />
                {paymentMode === "Momo" && (
                  <strong>Momo Network: {momoNetwork}</strong>
                )}
              </StyledTypography>
            </Paper>
            <TextField fullWidth label="Customer Email" variant="outlined" margin="normal" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
            <TextField fullWidth label="Customer Phone" variant="outlined" margin="normal" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
            <Button
              fullWidth
              variant="contained"
              startIcon={<EmailIcon />}
              sx={{ marginTop: "10px", backgroundColor: "#1976d2", "&:hover": { backgroundColor: "#1565c0" } }}
              onClick={handleSendEmail}
            >
              Send Email
            </Button>
            <Button
              fullWidth
              variant="contained"
              startIcon={<SmsIcon />}
              sx={{ marginTop: "10px", backgroundColor: "#4caf50", "&:hover": { backgroundColor: "#388e3c" } }}
              onClick={handleSendSMS}
            >
              Send SMS
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Quantity Dialog */}
      <Dialog open={Boolean(selectedProduct)} onClose={handleQuantityDialogClose}>
        <DialogTitle>Enter Quantity</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Quantity"
            type="number"
            variant="outlined"
            margin="normal"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && quantity) {
                handleQuantityDialogConfirm();
              }
            }}
            inputRef={quantityInputRef} // Use ref for auto-focus
            autoFocus // Ensure the cursor is focused on the input
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleQuantityDialogClose}>Cancel</Button>
          <Button onClick={handleQuantityDialogConfirm} color="primary">Add to Cart</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Sales;