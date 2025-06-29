"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useAdminStore from "@/store/adminStore";
import {
  Typography,
  Box,
  TextField,
  Button,
  CircularProgress,
  Avatar,
} from "@mui/material";

export default function AdminProfile() {
  const { admin, isLoading, updateAdminProfile } = useAdminStore();
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: admin?.fullname.firstName || "",
    lastName: admin?.fullname.lastName || "",
    avatarUrl: admin?.avatar?.url || "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { firstName, lastName, avatarUrl } = formData;
    if (!firstName || !lastName) {
      toast.error("First and last name are required");
      return;
    }
    await updateAdminProfile(
      {
        fullname: { firstName, lastName },
        avatar: avatarUrl ? { url: avatarUrl } : undefined,
      },
      router
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (!admin) {
    return null;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Admin Profile
      </Typography>
      <Box sx={{ maxWidth: 400 }}>
        <Avatar
          src={formData.avatarUrl}
          sx={{ width: 100, height: 100, mb: 3 }}
        />
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
            label="Avatar URL"
            name="avatarUrl"
            fullWidth
            value={formData.avatarUrl}
            onChange={handleChange}
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
            {isLoading ? "Updating..." : "Update Profile"}
          </Button>
        </form>
      </Box>
    </Box>
  );
}
