"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useAdminStore from "@/store/adminStore";
import {
  TextField,
  Button,
  CircularProgress,
  Typography,
  Box,
} from "@mui/material";
import { toast } from "react-toastify";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading } = useAdminStore();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please provide email and password");
      return;
    }
    await login(email, password, router);
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        bgcolor: "#f5f5f5",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 400,
          p: 4,
          bgcolor: "white",
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Typography variant="h5" sx={{ mb: 4, textAlign: "center" }}>
          Admin Login
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={{ mb: 3 }}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{ mb: 3 }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={isLoading}
            startIcon={isLoading && <CircularProgress size={20} />}
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </Box>
    </Box>
  );
}
