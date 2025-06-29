"use client";

import { useRouter } from "next/navigation";
import useAdminStore from "@/store/adminStore";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";

export default function AdminHeader() {
  const { admin, logout } = useAdminStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout(router);
  };

  return (
    <AppBar position="static" sx={{ mb: 3 }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Admin Panel
        </Typography>
        {admin && (
          <Typography sx={{ mr: 2 }}>
            {admin.fullname.firstName} {admin.fullname.lastName}
          </Typography>
        )}
        <Button color="inherit" onClick={handleLogout}>
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
}
