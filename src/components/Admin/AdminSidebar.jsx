"use client";

import { useRouter } from "next/navigation";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
} from "@mui/material";
import { Dashboard, People, Store, Payment, Person } from "@mui/icons-material";

const drawerWidth = 240;

const navItems = [
  { text: "Dashboard", icon: <Dashboard />, path: "/admin/dashboard" },
  { text: "Users", icon: <People />, path: "/admin/users" },
  { text: "Sellers", icon: <Store />, path: "/admin/sellers" },
  { text: "Withdrawals", icon: <Payment />, path: "/admin/withdrawals" },
  { text: "Profile", icon: <Person />, path: "/admin/profile" },
];

export default function AdminSidebar() {
  const router = useRouter();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: "border-box" },
      }}
    >
      <Toolbar />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton onClick={() => router.push(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}
