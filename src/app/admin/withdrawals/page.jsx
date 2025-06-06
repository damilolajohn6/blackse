"use client";

import { useEffect, useState } from "react";
import useAdminStore from "@/stores/adminStore";
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
  MenuItem,
} from "@mui/material";

export default function WithdrawalsManagement() {
  const { withdrawals, isLoading, fetchWithdrawals, updateWithdrawal } =
    useAdminStore();
  const [open, setOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [formData, setFormData] = useState({ status: "", reason: "" });

  useEffect(() => {
    fetchWithdrawals();
  }, [fetchWithdrawals]);

  const handleOpenUpdateDialog = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setFormData({ status: withdrawal.status, reason: "" });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedWithdrawal(null);
  };

  const handleUpdate = async () => {
    if (selectedWithdrawal) {
      await updateWithdrawal(
        selectedWithdrawal._id,
        formData.status,
        formData.reason
      );
      handleClose();
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Manage Withdrawals
      </Typography>
      {isLoading ? (
        <CircularProgress />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Seller</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Method</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {withdrawals.map((withdrawal) => (
              <TableRow key={withdrawal._id}>
                <TableCell>{withdrawal.seller.name}</TableCell>
                <TableCell>${withdrawal.amount}</TableCell>
                <TableCell>{withdrawal.status}</TableCell>
                <TableCell>{withdrawal.withdrawMethod.type}</TableCell>
                <TableCell>
                  {new Date(withdrawal.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleOpenUpdateDialog(withdrawal)}
                    disabled={["Succeeded", "Failed"].includes(
                      withdrawal.status
                    )}
                  >
                    Update
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Update Withdrawal</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Status"
            fullWidth
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value })
            }
            sx={{ mb: 2 }}
          >
            {["Processing", "Approved", "Rejected", "Succeeded", "Failed"].map(
              (status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              )
            )}
          </TextField>
          <TextField
            label="Reason (required for Rejected/Failed)"
            fullWidth
            value={formData.reason}
            onChange={(e) =>
              setFormData({ ...formData, reason: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleUpdate} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
