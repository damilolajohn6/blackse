"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import { Box, Typography, TextField, Button, Paper } from "@mui/material";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_SERVER || "http://localhost:8000/api/v2";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1); // 1: Request OTP, 2: Reset Password
  const router = useRouter();

  const handleRequestOtp = async () => {
    if (!email) {
      toast.error("Email is required");
      return;
    }
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/user/forgot-password`,
        { email },
        { withCredentials: true }
      );
      toast.success(data.message);
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    }
  };

  const handleResetPassword = async () => {
    if (!otp || !newPassword || !confirmPassword) {
      toast.error("All fields are required");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/user/reset-password`,
        { email, otp, newPassword, confirmPassword },
        { withCredentials: true }
      );
      toast.success(data.message);
      router.push("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    }
  };

  return (
    <Box className="w-full p-6 md:p-8 flex justify-center">
      <Paper className="p-6 w-full max-w-md">
        <Typography variant="h5" className="font-semibold mb-4">
          Forgot Password
        </Typography>
        {step === 1 ? (
          <>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              className="mb-4"
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleRequestOtp}
              fullWidth
            >
              Send OTP
            </Button>
          </>
        ) : (
          <>
            <TextField
              label="OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              fullWidth
              className="mb-4"
            />
            <TextField
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
              className="mb-4"
            />
            <TextField
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
              className="mb-4"
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleResetPassword}
              fullWidth
            >
              Reset Password
            </Button>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default ForgotPassword;
