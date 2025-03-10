import React from "react";
import { Box, Typography } from "@mui/material";

const Inventory = () => {
  return (
    <Box sx={{ flexGrow: 1, height: "100vh", overflow: "hidden", backgroundColor: "#f5f5f5", fontFamily: "Candara, sans-serif" }}>
      <Typography variant="h4" sx={{ p: 3 }}>
        Inventory
      </Typography>
      {/* Add your held sales content here */}
    </Box>
  );
};

export default Inventory;