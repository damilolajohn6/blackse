"use client";

import { useEffect, useState, useCallback } from "react";
import useShopStore from "@/store/shopStore";
import {
  Box,
  Button,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const CouponManagement = () => {
  const {
    seller,
    sellerToken,
    isSeller,
    isLoading,
    fetchCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
  } = useShopStore();
  const router = useRouter();
  const [coupons, setCoupons] = useState([]);
  const [error, setError] = useState(null);
  const [newCoupon, setNewCoupon] = useState({
    name: "",
    value: "",
    minAmount: "",
    maxAmount: "",
    selectedProduct: "",
  });
  const [editCoupon, setEditCoupon] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  useEffect(() => {
    console.debug("CouponManagement: Seller state:", {
      isSeller,
      sellerId: seller?._id,
      hasToken: !!sellerToken,
    });
    if (!isLoading && !isSeller) {
      toast.error("Please login as a seller");
      router.push("/shop/login");
    }
  }, [isSeller, isLoading, seller, sellerToken, router]);

  const loadCoupons = useCallback(async () => {
    if (!seller || !sellerToken) {
      console.warn("loadCoupons: Missing seller or sellerToken");
      setError("Seller not authenticated");
      toast.error("Please login as a seller");
      return;
    }
    setError(null);
    try {
      const { success, coupons, message } = await fetchCoupons();
      if (success) {
        setCoupons(coupons);
      } else {
        setError(message);
        toast.error(message);
      }
    } catch (error) {
      const msg = error.message || "Failed to fetch coupons";
      setError(msg);
      toast.error(msg);
    }
  }, [seller, sellerToken, fetchCoupons]);

  useEffect(() => {
    if (isSeller && seller && sellerToken) {
      loadCoupons();
    }
  }, [isSeller, seller, sellerToken, loadCoupons]);

  const handleCreateCoupon = async () => {
    if (!newCoupon.name || !newCoupon.value) {
      toast.error("Coupon name and value are required");
      return;
    }
    const result = await createCoupon({
      name: newCoupon.name.toUpperCase(),
      value: Number(newCoupon.value),
      minAmount: newCoupon.minAmount ? Number(newCoupon.minAmount) : undefined,
      maxAmount: newCoupon.maxAmount ? Number(newCoupon.maxAmount) : undefined,
      selectedProduct: newCoupon.selectedProduct || undefined,
    });
    if (result.success) {
      setCoupons([...coupons, result.coupon]);
      setNewCoupon({
        name: "",
        value: "",
        minAmount: "",
        maxAmount: "",
        selectedProduct: "",
      });
      toast.success("Coupon created successfully");
    }
  };

  const handleEditCoupon = async () => {
    if (!editCoupon.name || !editCoupon.value) {
      toast.error("Coupon name and value are required");
      return;
    }
    const result = await updateCoupon(editCoupon._id, {
      name: editCoupon.name.toUpperCase(),
      value: Number(editCoupon.value),
      minAmount: editCoupon.minAmount
        ? Number(editCoupon.minAmount)
        : undefined,
      maxAmount: editCoupon.maxAmount
        ? Number(editCoupon.maxAmount)
        : undefined,
      selectedProduct: editCoupon.selectedProduct || undefined,
    });
    if (result.success) {
      setCoupons(
        coupons.map((c) => (c._id === editCoupon._id ? result.coupon : c))
      );
      setOpenEditDialog(false);
      setEditCoupon(null);
      toast.success("Coupon updated successfully");
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    const result = await deleteCoupon(couponId);
    if (result.success) {
      setCoupons(coupons.filter((c) => c._id !== couponId));
      toast.success("Coupon deleted successfully");
    }
  };

  if (isLoading) {
    return (
      <Box className="flex justify-center items-center h-screen">
        <CircularProgress />
      </Box>
    );
  }

  if (!isSeller) {
    return null;
  }

  return (
    <Box className="p-6">
      <Typography variant="h4" className="font-semibold mb-6">
        Manage Coupons
      </Typography>
      {error && (
        <Paper className="p-4 mb-6">
          <Typography color="error">{error}</Typography>
          <Button
            variant="contained"
            onClick={loadCoupons}
            className="mt-4 mr-4"
          >
            Retry
          </Button>
          <Button
            variant="outlined"
            onClick={() => router.push("/shop/login")}
            className="mt-4"
          >
            Login Again
          </Button>
        </Paper>
      )}
      <Paper className="p-4 mb-6">
        <Typography variant="h6" className="mb-4">
          Create New Coupon
        </Typography>
        <Box className="flex flex-col gap-4">
          <TextField
            label="Coupon Code"
            value={newCoupon.name}
            onChange={(e) =>
              setNewCoupon({ ...newCoupon, name: e.target.value })
            }
            fullWidth
            inputProps={{ maxLength: 20 }}
          />
          <TextField
            label="Discount Value (%)"
            type="number"
            value={newCoupon.value}
            onChange={(e) =>
              setNewCoupon({ ...newCoupon, value: e.target.value })
            }
            fullWidth
            inputProps={{ min: 1, max: 100 }}
          />
          <TextField
            label="Minimum Amount"
            type="number"
            value={newCoupon.minAmount}
            onChange={(e) =>
              setNewCoupon({ ...newCoupon, minAmount: e.target.value })
            }
            fullWidth
            inputProps={{ min: 0 }}
          />
          <TextField
            label="Maximum Amount"
            type="number"
            value={newCoupon.maxAmount}
            onChange={(e) =>
              setNewCoupon({ ...newCoupon, maxAmount: e.target.value })
            }
            fullWidth
            inputProps={{ min: 0 }}
          />
          <TextField
            label="Selected Product ID (optional)"
            value={newCoupon.selectedProduct}
            onChange={(e) =>
              setNewCoupon({ ...newCoupon, selectedProduct: e.target.value })
            }
            fullWidth
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateCoupon}
            disabled={!newCoupon.name || !newCoupon.value}
          >
            Create Coupon
          </Button>
        </Box>
      </Paper>
      <Paper className="p-4">
        <Typography variant="h6" className="mb-4">
          Your Coupons
        </Typography>
        {coupons.length > 0 ? (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Discount (%)</TableCell>
                <TableCell>Min Amount</TableCell>
                <TableCell>Max Amount</TableCell>
                <TableCell>Product ID</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {coupons.map((coupon) => (
                <TableRow key={coupon._id}>
                  <TableCell>{coupon.name}</TableCell>
                  <TableCell>{coupon.value}</TableCell>
                  <TableCell>{coupon.minAmount || "N/A"}</TableCell>
                  <TableCell>{coupon.maxAmount || "N/A"}</TableCell>
                  <TableCell>{coupon.selectedProduct || "N/A"}</TableCell>
                  <TableCell>
                    {new Date(coupon.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => {
                        setEditCoupon(coupon);
                        setOpenEditDialog(true);
                      }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteCoupon(coupon._id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Typography>No coupons found</Typography>
        )}
      </Paper>
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
        <DialogTitle>Edit Coupon</DialogTitle>
        <DialogContent>
          {editCoupon && (
            <Box className="flex flex-col gap-4">
              <TextField
                label="Coupon Code"
                value={editCoupon.name}
                onChange={(e) =>
                  setEditCoupon({ ...editCoupon, name: e.target.value })
                }
                fullWidth
                inputProps={{ maxLength: 20 }}
              />
              <TextField
                label="Discount Value (%)"
                type="number"
                value={editCoupon.value}
                onChange={(e) =>
                  setEditCoupon({ ...editCoupon, value: e.target.value })
                }
                fullWidth
                inputProps={{ min: 1, max: 100 }}
              />
              <TextField
                label="Minimum Amount"
                type="number"
                value={editCoupon.minAmount || ""}
                onChange={(e) =>
                  setEditCoupon({ ...editCoupon, minAmount: e.target.value })
                }
                fullWidth
                inputProps={{ min: 0 }}
              />
              <TextField
                label="Maximum Amount"
                type="number"
                value={editCoupon.maxAmount || ""}
                onChange={(e) =>
                  setEditCoupon({ ...editCoupon, maxAmount: e.target.value })
                }
                fullWidth
                inputProps={{ min: 0 }}
              />
              <TextField
                label="Selected Product ID (optional)"
                value={editCoupon.selectedProduct || ""}
                onChange={(e) =>
                  setEditCoupon({
                    ...editCoupon,
                    selectedProduct: e.target.value,
                  })
                }
                fullWidth
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button
            onClick={handleEditCoupon}
            variant="contained"
            disabled={!editCoupon?.name || !editCoupon?.value}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CouponManagement;
