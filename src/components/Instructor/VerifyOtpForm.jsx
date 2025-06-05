"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import useInstructorStore from "@/store/instructorStore";

export default function InstructorVerifyOtpForm() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const { verifyInstructorOtp, resendInstructorOtp, isLoading } = useInstructorStore();

  useEffect(() => {
    if (!email) {
      router.push("/instructor/register");
    }
  }, [email, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await verifyInstructorOtp(email, otp, router);
    if (!result.success) {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    await resendInstructorOtp(email);
    setLoading(false);
  };

  return (
    <Box
      sx={{
        maxWidth: 400,
        mx: "auto",
        mt: 8,
        p: 3,
        bgcolor: "background.paper",
        borderRadius: 2,
        boxShadow: 3,
      }}
    >
      <Typography variant="h5" align="center" gutterBottom>
        Verify OTP
      </Typography>
      <Typography align="center" color="textSecondary" sx={{ mb: 2 }}>
        Enter the OTP sent to {email}
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          margin="normal"
          required
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 2 }}
          disabled={loading || isLoading}
          startIcon={
            loading || isLoading ? <CircularProgress size={20} /> : null
          }
        >
          {loading || isLoading ? "Verifying..." : "Verify OTP"}
        </Button>
        <Button
          fullWidth
          variant="outlined"
          sx={{ mt: 2 }}
          onClick={handleResendOtp}
          disabled={loading || isLoading}
        >
          Resend OTP
        </Button>
      </form>
    </Box>
  );
}
