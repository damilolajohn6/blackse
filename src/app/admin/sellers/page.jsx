"use client";

import { useEffect, useState } from "react";
import useAdminStore from "@/store/adminStore";
import {
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";

export default function SellersManagement() {
  const { sellers, isLoading, fetchSellers, deleteSeller, fixSellerProfile } =
    useAdminStore();
  const [open, setOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [formData, setFormData] = useState({ firstName: "", lastName: "" });

  useEffect(() => {
    fetchSellers();
  }, [fetchSellers]);

  const handleDelete = async (sellerId) => {
    if (confirm("Are you sure you want to delete this seller?")) {
      await deleteSeller(sellerId);
    }
  };

  const handleOpenFixDialog = (seller) => {
    setSelectedSeller(seller);
    setFormData({
      firstName: seller.fullname.firstName,
      lastName: seller.fullname.lastName,
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedSeller(null);
  };

  const handleFixProfile = async () => {
    if (selectedSeller) {
      await fixSellerProfile(
        selectedSeller._id,
        formData.firstName,
        formData.lastName
      );
      handleClose();
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Manage Sellers
      </Typography>
      {isLoading ? (
        <CircularProgress />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Shop Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sellers.map((seller) => (
              <TableRow key={seller._id}>
                <TableCell>
                  {seller.fullname.firstName} {seller.fullname.lastName}
                </TableCell>
                <TableCell>{seller.name}</TableCell>
                <TableCell>{seller.email}</TableCell>
                <TableCell>
                  {new Date(seller.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleOpenFixDialog(seller)}
                    sx={{ mr: 1 }}
                  >
                    Fix Profile
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleDelete(seller._id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Fix Seller Profile</DialogTitle>
        <DialogContent>
          <TextField
            label="First Name"
            fullWidth
            value={formData.firstName}
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            label="Last Name"
            fullWidth
            value={formData.lastName}
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleFixProfile}
            variant="contained"
            color="primary"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
