import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import {
  AppBar,
  Box,
  Container,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import { NavLink, Outlet } from "react-router-dom";

const drawerWidth = 240;

const navItems = [
  { label: "Employees", path: "/employees", icon: <GroupsOutlinedIcon /> },
  { label: "Insights", path: "/insights", icon: <DashboardOutlinedIcon /> },
];

export function AppLayout() {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: `calc(100% - ${drawerWidth}px)`,
          ml: `${drawerWidth}px`,
          bgcolor: "white",
          color: "text.primary",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Toolbar>
          <Typography variant="h6" component="h1">
            ACME Salary Management
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            borderRight: "1px solid",
            borderColor: "divider",
          },
        }}
      >
        <Toolbar />
        <Box component="nav" sx={{ px: 1, py: 2 }}>
          <List>
            {navItems.map((item) => (
              <ListItemButton
                key={item.path}
                component={NavLink}
                to={item.path}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  "&.active": {
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    "& .MuiListItemIcon-root": {
                      color: "primary.contrastText",
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: `calc(100% - ${drawerWidth}px)`,
        }}
      >
        <Toolbar />
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}
