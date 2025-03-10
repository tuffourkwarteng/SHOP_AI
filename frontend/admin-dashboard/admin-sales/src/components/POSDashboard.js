import React, { useState } from "react";
import { Paper, List, ListItem, ListItemText, Collapse } from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom"; // Add navigation

const drawerWidth = 280; // Width of the sidebar
const themeColor = "#8BC34A"; // Lemon Green Theme

const SidebarButton = styled(ListItem)(({ selected }) => ({
  textAlign: "left",
  cursor: "pointer",
  padding: "10px 20px",
  borderRadius: "5px",
  backgroundColor: selected ? themeColor : "transparent",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    backgroundColor: selected ? themeColor : "#E0E0E0", // Hover color
    transform: "scale(1.02)", // Slight zoom effect on hover
  },
}));

const POSDashboard = () => {
  const [selectedTab, setSelectedTab] = useState("Dashboard");
  const [openSalesSubmenu, setOpenSalesSubmenu] = useState(false);
  const [openProductsSubmenu, setOpenProductsSubmenu] = useState(false); // State for Products submenu
  const navigate = useNavigate(); // Hook for navigation

  // Handle button clicks
  const handleButtonClick = (text) => {
    setSelectedTab(text);
    // Navigate to the corresponding route
    switch (text) {
      case "Dashboard":
        navigate("/");
        break;
      case "Products":
        navigate("/products");
        break;
      case "Purchases": // Add navigation for Purchases
        navigate("/purchases");
        break;
      case "Sell":
        navigate("/sales"); // Link "Sell" to the Sales component
        break;
      case "Held Sales":
        navigate("/held-sales"); // Link "Held Sales" to the HeldSales component
        break;
      case "Inventory":
        navigate("/inventory");
        break;
      case "Reports":
        navigate("/reports");
        break;
      case "Settings":
        navigate("/settings");
        break;
      default:
        break;
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        width: drawerWidth,
        height: "50vh", // Same height as the cart
        borderRadius: "10px",
        margin: "10px",
        overflow: "hidden", // Ensure content doesn't overflow the card
        position: "fixed", // Fix the sidebar to the left
        left: 0, // Align to the left
        top: 0, // Align to the top
      }}
    >
      <List>
        {["Dashboard", "Inventory", "Reports", "Settings"].map((text) => (
          <SidebarButton
            key={text}
            selected={selectedTab === text}
            onClick={() => handleButtonClick(text)}
          >
            <ListItemText primary={text} />
          </SidebarButton>
        ))}

        {/* Products Submenu */}
        <SidebarButton
          selected={selectedTab === "Products"}
          onClick={() => {
            setSelectedTab("Products");
            setOpenProductsSubmenu(!openProductsSubmenu);
          }}
        >
          <ListItemText primary="Products" />
          {openProductsSubmenu ? <ExpandLess /> : <ExpandMore />}
        </SidebarButton>
        <Collapse in={openProductsSubmenu} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <SidebarButton
              selected={selectedTab === "Products"}
              onClick={() => handleButtonClick("Products")}
              sx={{ pl: 4 }}
            >
              <ListItemText primary="Manage Products" />
            </SidebarButton>
            <SidebarButton
              selected={selectedTab === "Purchases"}
              onClick={() => handleButtonClick("Purchases")}
              sx={{ pl: 4 }}
            >
              <ListItemText primary="Purchases" />
            </SidebarButton>
          </List>
        </Collapse>

        {/* Sales Submenu */}
        <SidebarButton
          selected={selectedTab === "Sales"}
          onClick={() => {
            setSelectedTab("Sales");
            setOpenSalesSubmenu(!openSalesSubmenu);
          }}
        >
          <ListItemText primary="Sales" />
          {openSalesSubmenu ? <ExpandLess /> : <ExpandMore />}
        </SidebarButton>
        <Collapse in={openSalesSubmenu} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <SidebarButton
              selected={selectedTab === "Sell"}
              onClick={() => handleButtonClick("Sell")}
              sx={{ pl: 4 }}
            >
              <ListItemText primary="Sell" />
            </SidebarButton>
            <SidebarButton
              selected={selectedTab === "Held Sales"}
              onClick={() => handleButtonClick("Held Sales")}
              sx={{ pl: 4 }}
            >
              <ListItemText primary="Held Sales" />
            </SidebarButton>
          </List>
        </Collapse>
      </List>
    </Paper>
  );
};

export default POSDashboard;