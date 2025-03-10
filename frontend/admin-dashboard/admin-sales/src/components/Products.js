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

const Products = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateAddedFilter, setDateAddedFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [newProduct, setNewProduct] = useState({
    productCode: "",
    name: "",
    price: "",
    stock: "",
    categoryId: "",
    addedBy: "",
  });
  const [editingProductId, setEditingProductId] = useState(null); // Track the product being edited
  const [history, setHistory] = useState([]); // Track changes for undo functionality
  const [redoHistory, setRedoHistory] = useState([]); // Track changes for redo functionality
  const [snackbarOpen, setSnackbarOpen] = useState(false); // Snackbar for notifications
  const [snackbarMessage, setSnackbarMessage] = useState(""); // Snackbar message

  // Fetch products from the backend API
  useEffect(() => {
    axios.get("http://localhost:5250/api/Product")
      .then((response) => setProducts(response.data))
      .catch((error) => console.error("Error fetching products:", error));
  }, []);

  // Filter products based on search query and filters
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter ? product.categoryId.toString() === categoryFilter : true;
    const matchesDate = dateAddedFilter ? new Date(product.dateAdded).toISOString().split('T')[0] === dateAddedFilter : true;
    const matchesUser = userFilter ? product.addedBy === userFilter : true;
    return matchesSearch && matchesCategory && matchesDate && matchesUser;
  });

  // Handle adding or updating a product
  const handleAddProduct = () => {
    const productToAddOrUpdate = {
      ...newProduct,
      dateAdded: new Date().toISOString(),
    };

    if (editingProductId) {
      // Update existing product
      axios.put(`http://localhost:5250/api/Product/${editingProductId}`, productToAddOrUpdate)
        .then((response) => {
          setProducts(products.map((product) =>
            product.id === editingProductId ? response.data : product
          ));
          setNewProduct({
            productCode: "",
            name: "",
            price: "",
            stock: "",
            categoryId: "",
            addedBy: "",
          });
          setEditingProductId(null); // Reset editing mode
        })
        .catch((error) => console.error("Error updating product:", error));
    } else {
      // Add new product
      axios.post("http://localhost:5250/api/Product", productToAddOrUpdate)
        .then((response) => {
          setProducts([...products, response.data]);
          setNewProduct({
            productCode: "",
            name: "",
            price: "",
            stock: "",
            categoryId: "",
            addedBy: "",
          });
        })
        .catch((error) => console.error("Error adding product:", error));
    }
  };

  // Handle editing a product
  const handleEditProduct = (product) => {
    setNewProduct({
      productCode: product.productCode,
      name: product.name,
      price: product.price,
      stock: product.stock,
      categoryId: product.categoryId,
      addedBy: product.addedBy,
    });
    setEditingProductId(product.id); // Set the product ID being edited
  };

  // Handle deleting a product
  const handleDeleteProduct = (id) => {
    const deletedProduct = products.find((product) => product.id === id);

    // Delete from the database
    axios.delete(`http://localhost:5250/api/Product/${id}`)
      .then(() => {
        // Update local state
        setProducts(products.filter((product) => product.id !== id));
        setHistory([...history, { type: "delete", data: deletedProduct }]); // Add to history
        setRedoHistory([]); // Clear redo history
        setSnackbarMessage("Product deleted. Click undo to revert.");
        setSnackbarOpen(true);
      })
      .catch((error) => {
        console.error("Error deleting product:", error);
        setSnackbarMessage("Failed to delete product.");
        setSnackbarOpen(true);
      });
  };

  // Handle undo action
  const handleUndo = () => {
    if (history.length > 0) {
      const lastAction = history[history.length - 1]; // Get the last action
      if (lastAction.type === "delete") {
        console.log("Restoring product:", lastAction.data); // Log the product being restored

        // Step 1: Restore the product in the database
        axios.post("http://localhost:5250/api/Product", lastAction.data)
          .then((response) => {
            console.log("Product restored:", response.data); // Log the response
            // Step 2: Update local state with the restored product
            setProducts([...products, response.data]); // Add the restored product back to the list
            setHistory(history.slice(0, -1)); // Remove the last action from history
            setRedoHistory([...redoHistory, lastAction]); // Add the action to redo history
            setSnackbarMessage("Undo successful. Product restored.");
            setSnackbarOpen(true);
          })
          .catch((error) => {
            console.error("Error restoring product:", error);
            setSnackbarMessage("Failed to restore product.");
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
        // Delete the product again from the database
        axios.delete(`http://localhost:5250/api/Product/${lastRedoAction.data.id}`)
          .then(() => {
            // Update local state
            setProducts(products.filter((product) => product.id !== lastRedoAction.data.id));
            setRedoHistory(redoHistory.slice(0, -1)); // Remove the last action from redo history
            setHistory([...history, lastRedoAction]); // Add back to history
            setSnackbarMessage("Redo successful. Product deleted.");
            setSnackbarOpen(true);
          })
          .catch((error) => {
            console.error("Error deleting product:", error);
            setSnackbarMessage("Failed to delete product.");
            setSnackbarOpen(true);
          });
      }
    }
  };

  // Close the snackbar
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // Download filtered products as PDF
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [["Product Code", "Name", "Price", "Stock", "Category ID", "Date Added", "Added By"]],
      body: filteredProducts.map((product) => [
        product.productCode,
        product.name,
        `$${product.price}`,
        product.stock,
        product.categoryId,
        new Date(product.dateAdded).toLocaleDateString(),
        product.addedBy,
      ]),
    });
    doc.save("products.pdf");
  };

  // Download filtered products as Excel
  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredProducts.map((product) => ({
        "Product Code": product.productCode,
        "Name": product.name,
        "Price": `$${product.price}`,
        "Stock": product.stock,
        "Category ID": product.categoryId,
        "Date Added": new Date(product.dateAdded).toLocaleDateString(),
        "Added By": product.addedBy,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    XLSX.writeFile(workbook, "products.xlsx");
  };

  return (
    <Box sx={{ flexGrow: 1, height: "100vh", overflow: "hidden", backgroundColor: "#f5f5f5", fontFamily: "Candara, sans-serif" }}>
      {/* App Bar */}
      <StyledAppBar position="static">
        <Toolbar>
          <StyledTypography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Supermarket POS - Products
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
          {/* Add New Product Form and Filters */}
          <Grid item xs={12}>
            <Grid container spacing={3}>
              {/* Add New Product Form */}
              <Grid item xs={12} md={8}>
                <Paper sx={{ padding: "20px", height: "100%" }}>
                  <StyledTypography variant="h6">
                    {editingProductId ? "Edit Product" : "Add New Product"}
                  </StyledTypography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Product Code"
                        variant="outlined"
                        margin="normal"
                        value={newProduct.productCode}
                        onChange={(e) => setNewProduct({ ...newProduct, productCode: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Product Name"
                        variant="outlined"
                        margin="normal"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Price"
                        variant="outlined"
                        margin="normal"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Stock"
                        variant="outlined"
                        margin="normal"
                        value={newProduct.stock}
                        onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Category ID"
                        variant="outlined"
                        margin="normal"
                        value={newProduct.categoryId}
                        onChange={(e) => setNewProduct({ ...newProduct, categoryId: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Added By"
                        variant="outlined"
                        margin="normal"
                        value={newProduct.addedBy}
                        onChange={(e) => setNewProduct({ ...newProduct, addedBy: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAddProduct}
                        sx={{ backgroundColor: themeColor, "&:hover": { backgroundColor: "#689F38" } }}
                      >
                        {editingProductId ? "Update Product" : "Add Product"}
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
                        <InputLabel>Category</InputLabel>
                        <Select
                          value={categoryFilter}
                          onChange={(e) => setCategoryFilter(e.target.value)}
                          label="Category"
                        >
                          <MenuItem value="">All</MenuItem>
                          <MenuItem value="1">Electronics</MenuItem>
                          <MenuItem value="2">Groceries</MenuItem>
                          <MenuItem value="3">Clothing</MenuItem>
                          <MenuItem value="4">Furniture</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Date Added"
                        type="date"
                        variant="outlined"
                        margin="normal"
                        value={dateAddedFilter}
                        onChange={(e) => setDateAddedFilter(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Added By</InputLabel>
                        <Select
                          value={userFilter}
                          onChange={(e) => setUserFilter(e.target.value)}
                          label="Added By"
                        >
                          <MenuItem value="">All</MenuItem>
                          <MenuItem value="Admin">Admin</MenuItem>
                          <MenuItem value="Manager">Manager</MenuItem>
                          <MenuItem value="Staff">Staff</MenuItem>
                        </Select>
                      </FormControl>
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
                label="Search Products"
                variant="outlined"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ padding: "20px" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <StyledTypography variant="h6">Products</StyledTypography>
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
                      <TableCell sx={{ fontSize: '0.875rem', padding: '8px' }}>Price</TableCell>
                      <TableCell sx={{ fontSize: '0.875rem', padding: '8px' }}>Stock</TableCell>
                      <TableCell sx={{ fontSize: '0.875rem', padding: '8px' }}>Category ID</TableCell>
                      <TableCell sx={{ fontSize: '0.875rem', padding: '8px' }}>Date Added</TableCell>
                      <TableCell sx={{ fontSize: '0.875rem', padding: '8px' }}>Added By</TableCell>
                      <TableCell sx={{ fontSize: '0.875rem', padding: '8px' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell sx={{ fontSize: '0.875rem', padding: '8px' }}>{product.productCode}</TableCell>
                        <TableCell sx={{ fontSize: '0.875rem', padding: '8px' }}>{product.name}</TableCell>
                        <TableCell sx={{ fontSize: '0.875rem', padding: '8px' }}>${product.price}</TableCell>
                        <TableCell sx={{ fontSize: '0.875rem', padding: '8px' }}>{product.stock}</TableCell>
                        <TableCell sx={{ fontSize: '0.875rem', padding: '8px' }}>{product.categoryId}</TableCell>
                        <TableCell sx={{ fontSize: '0.875rem', padding: '8px' }}>{new Date(product.dateAdded).toLocaleDateString()}</TableCell>
                        <TableCell sx={{ fontSize: '0.875rem', padding: '8px' }}>{product.addedBy}</TableCell>
                        <TableCell sx={{ fontSize: '0.875rem', padding: '8px' }}>
                          <IconButton
                            color="primary"
                            size="small"
                            onClick={() => handleEditProduct(product)}
                            sx={{ mr: 1 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleDeleteProduct(product.id)}
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

export default Products;