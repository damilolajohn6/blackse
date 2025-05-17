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
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate seller authentication
      if (!isSeller || !seller || !sellerToken) {
        toast.error("Please log in as a seller");
        router.push("/shop/login");
        return;
      }

      // Validate amount
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount < 10 || parsedAmount > 10000) {
        toast.error("Amount must be between $10 and $10,000");
        return;
      }

      // Validate withdrawal method and details
      if (!method) {
        toast.error("Please select a withdrawal method");
        return;
      }

      const withdrawMethod = { type: method, details: {} };
      if (method === "BankTransfer") {
        if (!details.accountNumber || !details.bankName) {
          toast.error("Please provide account number and bank name");
          return;
        }
        withdrawMethod.details = {
          accountNumber: details.accountNumber,
          bankName: details.bankName,
        };
      } else if (method === "PayPal") {
        if (
          !details.email ||
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email)
        ) {
          toast.error("Please provide a valid PayPal email");
          return;
        }
        withdrawMethod.details = { email: details.email };
      } else if (method === "Other") {
        if (!details.description) {
          toast.error("Please provide withdrawal details");
          return;
        }
        withdrawMethod.details = { description: details.description };
      }

      // Check available balance
      if (parsedAmount > (seller.availableBalance || 0)) {
        toast.error("Insufficient available balance");
        return;
      }

      // Make API call
      const { data } = await axios.post(
        `${API_BASE_URL}/withdraw/create-withdraw-request`,
        { amount: parsedAmount, withdrawMethod },
        {
          headers: { Authorization: `Bearer ${sellerToken}` },
          withCredentials: true,
        }
      );

      toast.success("Withdrawal request created successfully!");
      setAmount("");
      setMethod("");
      setDetails({
        accountNumber: "",
        bankName: "",
        email: "",
        description: "",
      });
      router.push("/shop/dashboard");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to create withdrawal request";
      console.error("create-withdraw-request error:", {
        message: errorMessage,
        status: error.response?.status,
        details: error.response?.data,
        withdrawMethod: { type: method, details },
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
          error={
            amount && (parseFloat(amount) < 10 || parseFloat(amount) > 10000)
          }
          helperText={
            amount && (parseFloat(amount) < 10 || parseFloat(amount) > 10000)
              ? "Amount must be between $10 and $10,000"
              : ""
          }
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
            error={
              details.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email)
            }
            helperText={
              details.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email)
                ? "Please enter a valid email"
                : ""
            }
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
            multiline
            rows={3}
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
