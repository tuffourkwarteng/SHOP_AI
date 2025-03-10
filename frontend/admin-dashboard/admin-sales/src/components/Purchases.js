import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  AppBar, Toolbar, Typography, Container, Grid, Paper, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Box, Button, MenuItem, Select, InputLabel, FormControl, Snackbar, Alert, IconButton
} from "@mui/material";
import { styled } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TableViewIcon from "@mui/icons-material/TableView";
import DeleteIcon from "@mui/icons-material/Delete";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import EditIcon from "@mui/icons-material/Edit";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

const themeColor = "#8BC34A"; // Lemon Green Theme

const StyledAppBar = styled(AppBar)({
  backgroundColor: themeColor,
  fontFamily: "Candara, sans-serif",
});

const StyledTypography = styled(Typography)({
  fontFamily: "Candara, sans-serif",
});

const Purchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [newPurchase, setNewPurchase] = useState({
    productCode: "",
    productName: "",
    quantity: "",
    price: "",
    supplier: "",
    date: "",
  });
  const [editingPurchaseId, setEditingPurchaseId] = useState(null); // Track the purchase being edited
  const [history, setHistory] = useState([]); // Track changes for undo functionality
  const [redoHistory, setRedoHistory] = useState([]); // Track changes for redo functionality
  const [snackbarOpen, setSnackbarOpen] = useState(false); // Snackbar for notifications
  const [snackbarMessage, setSnackbarMessage] = useState(""); // Snackbar message

  // Fetch purchases from the backend API
  useEffect(() => {
    axios.get("http://localhost:5250/api/Purchase")
      .then((response) => setPurchases(response.data))
      .catch((error) => console.error("Error fetching purchases:", error));
  }, []);

  // Filter purchases based on search query and filters
  const filteredPurchases = purchases.filter((purchase) => {
    const matchesSearch = purchase.productName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSupplier = supplierFilter ? purchase.supplier === supplierFilter : true;
    const matchesDate = dateFilter ? new Date(purchase.date).toISOString().split('T')[0] === dateFilter : true;
    return matchesSearch && matchesSupplier && matchesDate;
  });

  // Handle adding or updating a purchase
  const handleAddPurchase = () => {
    const purchaseToAddOrUpdate = {
      ...newPurchase,
      date: new Date().toISOString(),
    };

    if (editingPurchaseId) {
      // Update existing purchase
      axios.put(`http://localhost:5250/api/Purchase/${editingPurchaseId}`, purchaseToAddOrUpdate)
        .then((response) => {
          setPurchases(purchases.map((purchase) =>
            purchase.id === editingPurchaseId ? response.data : purchase
          ));
          setNewPurchase({
            productCode: "",
            productName: "",
            quantity: "",
            price: "",
            supplier: "",
            date: "",
          });
          setEditingPurchaseId(null); // Reset editing mode
        })
        .catch((error) => console.error("Error updating purchase:", error));
    } else {
      // Add new purchase
      axios.post("http://localhost:5250/api/Purchase", purchaseToAddOrUpdate)
        .then((response) => {
          setPurchases([...purchases, response.data]);
          setNewPurchase({
            productCode: "",
            productName: "",
            quantity: "",
            price: "",
            supplier: "",
            date: "",
          });
        })
        .catch((error) => console.error("Error adding purchase:", error));
    }
  };

  // Handle editing a purchase
  const handleEditPurchase = (purchase) => {
    setNewPurchase({
      productCode: purchase.productCode,
      productName: purchase.productName,
      quantity: purchase.quantity,
      price: purchase.price,
      supplier: purchase.supplier,
      date: purchase.date,
    });
    setEditingPurchaseId(purchase.id); // Set the purchase ID being edited
  };

  // Handle deleting a purchase
  const handleDeletePurchase = (id) => {
    const deletedPurchase = purchases.find((purchase) => purchase.id === id);

    // Delete from the database
    axios.delete(`http://localhost:5250/api/Purchase/${id}`)
      .then(() => {
        // Update local state
        setPurchases(purchases.filter((purchase) => purchase.id !== id));
        setHistory([...history, { type: "delete", data: deletedPurchase }]); // Add to history
        setRedoHistory([]); // Clear redo history
        setSnackbarMessage("Purchase deleted. Click undo to revert.");
        setSnackbarOpen(true);
      })
      .catch((error) => {
        console.error("Error deleting purchase:", error);
        setSnackbarMessage("Failed to delete purchase.");
        setSnackbarOpen(true);
      });
  };

  // Handle undo action
  const handleUndo = () => {
    if (history.length > 0) {
      const lastAction = history[history.length - 1]; // Get the last action
      if (lastAction.type === "delete") {
        // Restore the purchase in the database
        axios.post("http://localhost:5250/api/Purchase", lastAction.data)
          .then((response) => {
            setPurchases([...purchases, response.data]); // Add the restored purchase back to the list
            setHistory(history.slice(0, -1)); // Remove the last action from history
            setRedoHistory([...redoHistory, lastAction]); // Add the action to redo history
            setSnackbarMessage("Undo successful. Purchase restored.");
            setSnackbarOpen(true);
          })
          .catch((error) => {
            console.error("Error restoring purchase:", error);
            setSnackbarMessage("Failed to restore purchase.");
            setSnackbarOpen(true);
          });
      }
    }
  };

  // Handle redo action
  const handleRedo = () => {
    if (redoHistory.length > 0) {
      const lastRedoAction = redoHistory[redoHistory.length - 1];
      if (lastRedoAction.type === "delete") {
        // Delete the purchase again from the database
        axios.delete(`http://localhost:5250/api/Purchase/${lastRedoAction.data.id}`)
          .then(() => {
            setPurchases(purchases.filter((purchase) => purchase.id !== lastRedoAction.data.id));
            setRedoHistory(redoHistory.slice(0, -1)); // Remove the last action from redo history
            setHistory([...history, lastRedoAction]); // Add back to history
            setSnackbarMessage("Redo successful. Purchase deleted.");
            setSnackbarOpen(true);
          })
          .catch((error) => {
            console.error("Error deleting purchase:", error);
            setSnackbarMessage("Failed to delete purchase.");
            setSnackbarOpen(true);
          });
      }
    }
  };

  // Close the snackbar
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // Download filtered purchases as PDF
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [["Product Code", "Product Name", "Quantity", "Price", "Supplier", "Date"]],
      body: filteredPurchases.map((purchase) => [
        purchase.productCode,
        purchase.productName,
        purchase.quantity,
        `$${purchase.price}`,
        purchase.supplier,
        new Date(purchase.date).toLocaleDateString(),
      ]),
    });
    doc.save("purchases.pdf");
  };

  // Download filtered purchases as Excel
  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredPurchases.map((purchase) => ({
        "Product Code": purchase.productCode,
        "Product Name": purchase.productName,
        "Quantity": purchase.quantity,
        "Price": `$${purchase.price}`,
        "Supplier": purchase.supplier,
        "Date": new Date(purchase.date).toLocaleDateString(),
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Purchases");
    XLSX.writeFile(workbook, "purchases.xlsx");
  };

  return (
    <Box sx={{ flexGrow: 1, height: "100vh", overflow: "hidden", backgroundColor: "#f5f5f5", fontFamily: "Candara, sans-serif" }}>
      {/* App Bar */}
      <StyledAppBar position="static">
        <Toolbar>
          <StyledTypography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Supermarket POS - Purchases
          </StyledTypography>
          <Button
            variant="contained"
            startIcon={<UndoIcon />}
            onClick={handleUndo}
            disabled={history.length === 0}
            sx={{ backgroundColor: themeColor, "&:hover": { backgroundColor: "#689F38" }, mr: 2 }}
          >
            Undo
          </Button>
          <Button
            variant="contained"
            startIcon={<RedoIcon />}
            onClick={handleRedo}
            disabled={redoHistory.length === 0}
            sx={{ backgroundColor: themeColor, "&:hover": { backgroundColor: "#689F38" } }}
          >
            Redo
          </Button>
        </Toolbar>
      </StyledAppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Add New Purchase Form and Filters */}
          <Grid item xs={12}>
            <Grid container spacing={3}>
              {/* Add New Purchase Form */}
              <Grid item xs={12} md={8}>
                <Paper sx={{ padding: "20px", height: "100%" }}>
                  <StyledTypography variant="h6">
                    {editingPurchaseId ? "Edit Purchase" : "Add New Purchase"}
                  </StyledTypography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Product Code"
                        variant="outlined"
                        margin="normal"
                        value={newPurchase.productCode}
                        onChange={(e) => setNewPurchase({ ...newPurchase, productCode: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Product Name"
                        variant="outlined"
                        margin="normal"
                        value={newPurchase.productName}
                        onChange={(e) => setNewPurchase({ ...newPurchase, productName: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Quantity"
                        variant="outlined"
                        margin="normal"
                        value={newPurchase.quantity}
                        onChange={(e) => setNewPurchase({ ...newPurchase, quantity: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Price"
                        variant="outlined"
                        margin="normal"
                        value={newPurchase.price}
                        onChange={(e) => setNewPurchase({ ...newPurchase, price: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Supplier"
                        variant="outlined"
                        margin="normal"
                        value={newPurchase.supplier}
                        onChange={(e) => setNewPurchase({ ...newPurchase, supplier: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Date"
                        type="date"
                        variant="outlined"
                        margin="normal"
                        value={newPurchase.date}
                        onChange={(e) => setNewPurchase({ ...newPurchase, date: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAddPurchase}
                        sx={{ backgroundColor: themeColor, "&:hover": { backgroundColor: "#689F38" } }}
                      >
                        {editingPurchaseId ? "Update Purchase" : "Add Purchase"}
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Filters */}
              <Grid item xs={12} md={4}>
                <Paper sx={{ padding: "20px", height: "100%" }}>
                  <StyledTypography variant="h6">Filters</StyledTypography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Supplier</InputLabel>
                        <Select
                          value={supplierFilter}
                          onChange={(e) => setSupplierFilter(e.target.value)}
                          label="Supplier"
                        >
                          <MenuItem value="">All</MenuItem>
                          <MenuItem value="Supplier A">Supplier A</MenuItem>
                          <MenuItem value="Supplier B">Supplier B</MenuItem>
                          <MenuItem value="Supplier C">Supplier C</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Date"
                        type="date"
                        variant="outlined"
                        margin="normal"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </Grid>

          {/* Live Search and Table */}
          <Grid item xs={12}>
            <Paper sx={{ padding: "20px", mb: 2 }}>
              <TextField
                fullWidth
                label="Search Purchases"
                variant="outlined"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ padding: "20px" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <StyledTypography variant="h6">Purchases</StyledTypography>
                <Box>
                  <Button
                    variant="contained"
                    startIcon={<PictureAsPdfIcon />}
                    onClick={downloadPDF}
                    sx={{ backgroundColor: themeColor, "&:hover": { backgroundColor: "#689F38" }, mr: 2 }}
                  >
                    Download PDF
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<TableViewIcon />}
                    onClick={downloadExcel}
                    sx={{ backgroundColor: themeColor, "&:hover": { backgroundColor: "#689F38" } }}
                  >
                    Download Excel
                  </Button>
                </Box>
              </Box>
              <TableContainer>
                <Table size="small" sx={{ fontSize: '0.875rem' }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontSize: '0.875rem', padding: '8px' }}>Product Code</TableCell>
                      <TableCell sx={{ fontSize: '0.875rem', padding: '8px' }}>Product Name</TableCell>
                      <TableCell sx={{ fontSize: '0.875rem', padding: '8px' }}>Quantity</TableCell>
                      <TableCell sx={{ fontSize: '0.875rem', padding: '8px' }}>Price</TableCell>
                      <TableCell sx={{ fontSize: '0.875rem', padding: '8px' }}>Supplier</TableCell>
                      <TableCell sx={{ fontSize: '0.875rem', padding: '8px' }}>Date</TableCell>
                      <TableCell sx={{ fontSize: '0.875rem', padding: '8px' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredPurchases.map((purchase) => (
                      <TableRow key={purchase.id}>
                        <TableCell sx={{ fontSize: '0.875rem', padding: '8px' }}>{purchase.productCode}</TableCell>
                        <TableCell sx={{ fontSize: '0.875rem', padding: '8px' }}>{purchase.productName}</TableCell>
                        <TableCell sx={{ fontSize: '0.875rem', padding: '8px' }}>{purchase.quantity}</TableCell>
                        <TableCell sx={{ fontSize: '0.875rem', padding: '8px' }}>${purchase.price}</TableCell>
                        <TableCell sx={{ fontSize: '0.875rem', padding: '8px' }}>{purchase.supplier}</TableCell>
                        <TableCell sx={{ fontSize: '0.875rem', padding: '8px' }}>{new Date(purchase.date).toLocaleDateString()}</TableCell>
                        <TableCell sx={{ fontSize: '0.875rem', padding: '8px' }}>
                          <IconButton
                            color="primary"
                            size="small"
                            onClick={() => handleEditPurchase(purchase)}
                            sx={{ mr: 1 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleDeletePurchase(purchase.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Snackbar for Notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="info" sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Purchases;