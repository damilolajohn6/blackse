"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";
import { toast } from "react-toastify";
import {
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Typography,
} from "@mui/material";
import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_SERVER || "http://localhost:8000/api/v2";

const WithdrawRequest = () => {
  const { seller, sellerToken, isSeller } = useAuthStore();
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [details, setDetails] = useState({
    accountNumber: "",
    bankName: "",
    email: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isSeller || !seller) {
      toast.error("Please log in as a seller");
      router.push("/shop/login");
      return;
    }

    if (!amount || amount < 10 || amount > 10000) {
      toast.error("Amount must be between $10 and $10,000");
      return;
    }

    const withdrawMethod = { type: method, details };
    if (!method || !Object.values(details).some((v) => v)) {
      toast.error("Please select a withdrawal method and provide details");
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/withdraw/create-withdraw-request`,
        { amount: Number(amount), withdrawMethod },
        {
          headers: { Authorization: `Bearer ${sellerToken}` },
          withCredentials: true,
        }
      );
      toast.success("Withdrawal request created successfully!");
      setAmount("");
      setMethod("");
      setDetails({ accountNumber: "", bankName: "", email: "" });
      router.push("/shop/dashboard");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to create withdrawal request";
      console.error("create-withdraw-request error:", {
        message: errorMessage,
        status: error.response?.status,
      });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <Typography variant="h5" className="font-semibold mb-6">
        Create Withdrawal Request
      </Typography>
      <Typography variant="body1" className="mb-4">
        Available Balance: ${seller?.availableBalance?.toFixed(2) || "0.00"}
      </Typography>
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          label="Amount ($)"
          type="number"
          fullWidth
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          inputProps={{ min: 10, max: 10000, step: 0.01 }}
        />
        <FormControl fullWidth>
          <InputLabel>Method</InputLabel>
          <Select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            label="Method"
            required
          >
            <MenuItem value="BankTransfer">Bank Transfer</MenuItem>
            <MenuItem value="PayPal">PayPal</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </Select>
        </FormControl>
        {method === "BankTransfer" && (
          <>
            <TextField
              label="Account Number"
              fullWidth
              value={details.accountNumber}
              onChange={(e) =>
                setDetails({ ...details, accountNumber: e.target.value })
              }
              required
            />
            <TextField
              label="Bank Name"
              fullWidth
              value={details.bankName}
              onChange={(e) =>
                setDetails({ ...details, bankName: e.target.value })
              }
              required
            />
          </>
        )}
        {method === "PayPal" && (
          <TextField
            label="PayPal Email"
            fullWidth
            value={details.email}
            onChange={(e) => setDetails({ ...details, email: e.target.value })}
            required
          />
        )}
        {method === "Other" && (
          <TextField
            label="Details"
            fullWidth
            value={details.description}
            onChange={(e) =>
              setDetails({ ...details, description: e.target.value })
            }
            required
          />
        )}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={isLoading}
          startIcon={isLoading && <CircularProgress size={20} />}
        >
          {isLoading ? "Submitting..." : "Submit Request"}
        </Button>
      </form>
    </div>
  );
};

export default WithdrawRequest;
