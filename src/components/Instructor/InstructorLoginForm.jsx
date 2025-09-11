"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import useInstructorStore from "@/store/instructorStore";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export default function InstructorLoginForm() {
  const [formData, setFormData] = useState({ 
    email: "", 
    password: "",
    rememberMe: false 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { loginInstructor, isLoading, isInstructor } = useInstructorStore();

  // Enhanced form validation
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear specific error when user starts typing
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await loginInstructor(
        formData.email.trim(), 
        formData.password, 
        router
      );
      
      if (result.success) {
        toast.success("Login successful! Welcome back.");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.message || "Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Redirect if already logged in
  useEffect(() => {
    if (isInstructor) {
      toast.info("You are already logged in");
      router.push("/instructor/dashboard");
    }
  }, [isInstructor, router]);

  // Load saved credentials if remember me was checked
  useEffect(() => {
    const savedEmail = localStorage.getItem("instructor_remember_email");
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail, rememberMe: true }));
    }
  }, []);

  // Save email if remember me is checked
  useEffect(() => {
    if (formData.rememberMe && formData.email) {
      localStorage.setItem("instructor_remember_email", formData.email);
    } else if (!formData.rememberMe) {
      localStorage.removeItem("instructor_remember_email");
    }
  }, [formData.rememberMe, formData.email]);
  

  return (
    <Box
      sx={{
        maxWidth: 400,
        mx: "auto",
        mt: 16,
        p: 3,
        bgcolor: "background.paper",
        borderRadius: 2,
        boxShadow: 2,
      }}
    >
      <Typography style={{ fontFamily: 'poppins', fontWeight: 600}} variant="h5" align="center" gutterBottom>
        Instructor Login
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          margin="normal"
          required
          style={{ fontFamily: 'poppins'}}
          error={!!errors.email}
          helperText={errors.email}
        />
        <TextField
          fullWidth
          label="Password"
          name="password"
          type={showPassword ? "text" : "password"}
          value={formData.password}
          onChange={handleInputChange}
          margin="normal"
          required
          style={{ fontFamily: 'poppins', fontWeight: 600}}
          error={!!errors.password}
          helperText={errors.password}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleTogglePasswordVisibility}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <input
              id="rememberMe"
              name="rememberMe"
              type="checkbox"
              checked={formData.rememberMe}
              onChange={handleInputChange}
              style={{ marginRight: '8px' }}
            />
            <label htmlFor="rememberMe" style={{ fontFamily: 'poppins', fontSize: '14px', color: '#374151' }}>
              Remember me
            </label>
          </Box>
          <Link style={{ fontFamily: 'poppins'}} href="/instructor/auth/forgot-password" variant="body2">
            Forgot Password?
          </Link>
        </Box>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 2 }}
          disabled={isSubmitting || isLoading}
          style={{ fontFamily: 'poppins'}}
          startIcon={isSubmitting || isLoading ? <CircularProgress size={20} /> : null}
        >
          {isSubmitting || isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </form>
      <Typography style={{ fontFamily: 'poppins'}} align="center" sx={{ mt: 2 }}>
        Don't have an account? <Link style={{ fontFamily: 'poppins'}} className="text-blue-500 font-medium underline hover:text-blue-600" href="/instructor/auth/register">Create one here</Link>
      </Typography>
    </Box>
  );
}
