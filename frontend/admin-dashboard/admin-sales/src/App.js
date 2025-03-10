import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Box, CssBaseline } from "@mui/material";
import POSDashboard from "./components/POSDashboard";
import Dashboard from "./components/Dashboard";
import Products from "./components/Products";
import Sales from "./components/Sales";
import HeldSales from "./components/HeldSales"; // Import HeldSales component
import Inventory from "./components/Inventory";
import Purchases from "./components/Purchases"; // Import Purchases component

function App() {
  return (
    <Router>
      <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        <CssBaseline /> {/* Ensures consistent styling across browsers */}

        {/* Sidebar */}
        <POSDashboard />

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1, // Takes up remaining space
            overflow: "auto", // Allows scrolling if content overflows
            p: 3, // Padding
            marginLeft: "300px", // Reduced margin to close the gap
            width: `calc(100% - 300px)`, // Adjusted width to match the reduced margin
          }}
        >
          <Routes>
            <Route path="/" element={<Dashboard />} /> {/* Default page */}
            <Route path="/products" element={<Products />} />
            <Route path="/sales" element={<Sales />} /> {/* Sales route */}
            <Route path="/held-sales" element={<HeldSales />} /> {/* Held Sales route */}
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/purchases" element={<Purchases />} /> {/* Purchases route */}
          </Routes>
        </Box>
      </Box>
    </Router>
  );
}

export default App;