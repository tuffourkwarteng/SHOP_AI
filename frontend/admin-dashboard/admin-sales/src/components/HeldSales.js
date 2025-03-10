import React from "react";
import { Box, Typography } from "@mui/material";

const HeldSales = () => {
  return (
    <Box sx={{ flexGrow: 1, height: "100vh", overflow: "hidden", backgroundColor: "#f5f5f5", fontFamily: "Candara, sans-serif" }}>
      <Typography variant="h4" sx={{ p: 3 }}>
        Held Sales
      </Typography>
      {/* Add your held sales content here */}
    </Box>
  );
};

export default HeldSales;