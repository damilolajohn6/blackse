"use client";

import { useState } from "react";
import useShopStore from "@/store/shopStore";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const ShopForgotPassword = () => {
  const { forgotPassword, resetPassword, isLoading } = useShopStore();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Email is required");
      return;
    }
    const result = await forgotPassword(email);
    if (result.success) {
      setStep(2);
    }
  };

  const handleResetPassword = async () => {
    if (!otp || !newPassword) {
      toast.error("OTP and new password are required");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    const result = await resetPassword(email, otp, newPassword, router);
    if (result.success) {
      setEmail("");
      setOtp("");
      setNewPassword("");
      setStep(1);
    }
  };

  if (isLoading) {
    return (
      <Box className="flex justify-center items-center h-screen">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="p-6 max-w-md mx-auto mt-10">
      <Typography variant="h4" className="font-semibold mb-6">
        {step === 1 ? "Forgot Password" : "Reset Password"}
      </Typography>
      {step === 1 ? (
        <Box className="flex flex-col gap-4">
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleForgotPassword}
            disabled={!email}
          >
            Send OTP
          </Button>
          <Button variant="text" onClick={() => router.push("/shop/login")}>
            Back to Login
          </Button>
        </Box>
      ) : (
        <Box className="flex flex-col gap-4">
          <TextField
            label="Email"
            type="email"
            value={email}
            disabled
            fullWidth
          />
          <TextField
            label="OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            fullWidth
            inputProps={{ maxLength: 6 }}
          />
          <TextField
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
            inputProps={{ minLength: 6 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleResetPassword}
            disabled={!otp || !newPassword}
          >
            Reset Password
          </Button>
          <Button variant="text" onClick={() => setStep(1)}>
            Back to Email
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ShopForgotPassword;
