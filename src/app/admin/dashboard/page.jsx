"use client";

import { useEffect } from "react";
import useAdminStore from "@/store/adminStore";
import { Typography, Box, Card, CardContent, Grid } from "@mui/material";

export default function AdminDashboard() {
  const {
    admin,
    users,
    sellers,
    withdrawals,
    fetchUsers,
    fetchSellers,
    fetchWithdrawals,
  } = useAdminStore();

  useEffect(() => {
    fetchUsers();
    fetchSellers();
    fetchWithdrawals();
  }, [fetchUsers, fetchSellers, fetchWithdrawals]);

  if (!admin) {
    return null;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Admin Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Admin Profile</Typography>
              <Typography>
                Name: {admin.fullname.firstName} {admin.fullname.lastName}
              </Typography>
              <Typography>Email: {admin.email}</Typography>
              <Typography>Role: {admin.role}</Typography>
              <Typography>
                Permissions: {admin.permissions.join(", ")}
              </Typography>
              {admin.lastLogin && (
                <Typography>
                  Last Login: {new Date(admin.lastLogin).toLocaleString()}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Total Users</Typography>
                  <Typography variant="h4">{users.length}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Total Sellers</Typography>
                  <Typography variant="h4">{sellers.length}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Pending Withdrawals</Typography>
                  <Typography variant="h4">
                    {
                      withdrawals.filter((w) => w.status === "Processing")
                        .length
                    }
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
