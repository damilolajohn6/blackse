"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useShopStore from "@/store/shopStore";
import useOrderStore from "@/store/orderStore";
import { toast } from "react-toastify";
import { Button, TextField, CircularProgress, Typography } from "@mui/material";
import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_SERVER || "http://localhost:8000/api/v2";

const WithdrawRequest = () => {
  const { seller, sellerToken, isSeller } = useShopStore();
  const { availableBalance } = useOrderStore();
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [details, setDetails] = useState({
    accountName: "",
    bankName: "",
    institutionNumber: "",
    accountNumber: "",
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

    if (amount > availableBalance) {
      toast.error("Insufficient available balance");
      return;
    }

    const withdrawMethod = {
      type: "BankTransfer",
      details: {
        accountName: details.accountName,
        bankName: details.bankName,
        institutionNumber: details.institutionNumber,
        accountNumber: details.accountNumber,
      },
    };

    if (!Object.values(details).every((v) => v.trim())) {
      toast.error("Please provide all bank details");
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
      setDetails({
        accountName: "",
        bankName: "",
        institutionNumber: "",
        accountNumber: "",
      });
      router.push("/shop/transactions");
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

  const handleDetailsChange = (e) => {
    const { name, value } = e.target;
    setDetails((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <Typography variant="h5" className="font-semibold mb-6">
        Create Withdrawal Request
      </Typography>
      <Typography variant="body1" className="mb-4">
        Available Balance: ${availableBalance.toFixed(2)}
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
        <TextField
          label="Account Name"
          name="accountName"
          fullWidth
          value={details.accountName}
          onChange={handleDetailsChange}
          required
        />
        <TextField
          label="Bank Name"
          name="bankName"
          fullWidth
          value={details.bankName}
          onChange={handleDetailsChange}
          required
        />
        <TextField
          label="Institution Number"
          name="institutionNumber"
          fullWidth
          value={details.institutionNumber}
          onChange={handleDetailsChange}
          required
          inputProps={{ maxLength: 9 }}
        />
        <TextField
          label="Account Number"
          name="accountNumber"
          fullWidth
          value={details.accountNumber}
          onChange={handleDetailsChange}
          required
          inputProps={{ maxLength: 17 }}
        />
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
