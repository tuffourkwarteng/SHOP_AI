import React from "react";
import { Typography, Paper } from "@mui/material";

const Dashboard = () => {
  return (
    <Paper sx={{ padding: "20px", margin: "20px" }}>
      <Typography variant="h4" gutterBottom>
        Welcome to the Dashboard
      </Typography>
      <Typography variant="body1">
        This is the default page of the application. Use the sidebar to navigate to other pages.
      </Typography>
    </Paper>
  );
};

export default Dashboard;