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

export default function AdminRegister() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const { registerAdmin, isLoading } = useAdminStore();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password, firstName, lastName } = formData;
    if (!email || !password || !firstName || !lastName) {
      toast.error("Please provide all fields");
      return;
    }
    await registerAdmin(
      { email, password, fullname: { firstName, lastName } },
      router
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
          Admin Registration
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="First Name"
            name="firstName"
            fullWidth
            value={formData.firstName}
            onChange={handleChange}
            required
            sx={{ mb: 3 }}
          />
          <TextField
            label="Last Name"
            name="lastName"
            fullWidth
            value={formData.lastName}
            onChange={handleChange}
            required
            sx={{ mb: 3 }}
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            fullWidth
            value={formData.email}
            onChange={handleChange}
            required
            sx={{ mb: 3 }}
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            fullWidth
            value={formData.password}
            onChange={handleChange}
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
            {isLoading ? "Registering..." : "Register"}
          </Button>
        </form>
      </Box>
    </Box>
  );
}
