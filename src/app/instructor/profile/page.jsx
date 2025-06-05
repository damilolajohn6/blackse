"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Chip,
  Avatar,
  Grid,
  Alert,
  useMediaQuery,
  useTheme,
  Drawer,
  IconButton,
} from "@mui/material";
import FileUpload from "@/components/Upload/FileUpload";
import useInstructorStore from "@/store/instructorStore";
import { toast } from "react-toastify";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import InstructorDashboardSideBar from "@/components/Instructor/InstructorDashboardSideBar";

export default function InstructorProfilePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <div className="flex flex-col md:flex-row w-full min-h-screen bg-gray-100">
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 240,
          },
        }}
      >
        <InstructorDashboardSideBar active={12} onClose={handleDrawerToggle} />
      </Drawer>

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <InstructorDashboardSideBar active={12} />
      </div>

      <MainContent
        isMobile={isMobile}
        handleDrawerToggle={handleDrawerToggle}
      />
    </div>
  );
}

function MainContent({ isMobile, handleDrawerToggle }) {
  const {
    instructor,
    loadInstructor,
    updateInstructor,
    logoutInstructor,
    isLoading,
  } = useInstructorStore();
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    bio: "",
    expertise: "",
    website: "",
    linkedin: "",
    twitter: "",
    phoneNumber: "",
    countryCode: "",
  });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarError, setAvatarError] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInstructor = async () => {
      const result = await loadInstructor();
      if (result.success && result.instructor) {
        setForm({
          firstName: result.instructor.fullname?.firstName || "",
          lastName: result.instructor.fullname?.lastName || "",
          email: result.instructor.email || "",
          bio: result.instructor.bio || "",
          expertise: result.instructor.expertise?.join(", ") || "",
          website: result.instructor.socialLinks?.website || "",
          linkedin: result.instructor.socialLinks?.linkedin || "",
          twitter: result.instructor.socialLinks?.twitter || "",
          phoneNumber: result.instructor.phoneNumber?.number || "",
          countryCode: result.instructor.phoneNumber?.countryCode || "",
        });
        if (result.instructor.avatar?.url) {
          setAvatarPreview(result.instructor.avatar.url);
        }
      } else {
        toast.error("Failed to load profile. Please log in again.");
        router.push("/instructor/login");
      }
    };
    fetchInstructor();
  }, [loadInstructor, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleAvatarChange = (fileData) => {
    if (fileData.file) {
      setAvatar(fileData.file);
      setAvatarPreview(URL.createObjectURL(fileData.file));
      setAvatarError("");
    } else if (fileData.error) {
      setAvatarError(fileData.error);
      setAvatar(null);
      setAvatarPreview(null);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (form.firstName && !form.lastName) {
      newErrors.lastName = "Last name is required if first name is provided";
    }
    if (form.lastName && !form.firstName) {
      newErrors.firstName = "First name is required if last name is provided";
    }
    if (form.bio && form.bio.length > 500) {
      newErrors.bio = "Bio cannot exceed 500 characters";
    }
    if (form.expertise) {
      const expertiseArray = form.expertise
        .split(",")
        .map((item) => item.trim());
      if (expertiseArray.some((item) => item.length > 50)) {
        newErrors.expertise = "Expertise items cannot exceed 50 characters";
      }
    }
    if (form.website && !/^https?:\/\/[^\s$.?#].[^\s]*$/.test(form.website)) {
      newErrors.website = "Invalid website URL";
    }
    if (form.linkedin && !/^https?:\/\/[^\s$.?#].[^\s]*$/.test(form.linkedin)) {
      newErrors.linkedin = "Invalid LinkedIn URL";
    }
    if (form.twitter && !/^https?:\/\/[^\s$.?#].[^\s]*$/.test(form.twitter)) {
      newErrors.twitter = "Invalid Twitter URL";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!validateForm()) {
      toast.error("Please fix the form errors");
      setLoading(false);
      return;
    }

    const instructorData = {
      fullname:
        form.firstName || form.lastName
          ? {
              firstName: form.firstName,
              lastName: form.lastName,
            }
          : undefined,
      bio: form.bio || undefined,
      expertise: form.expertise
        ? form.expertise
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item)
        : undefined,
      socialLinks: {
        website: form.website || undefined,
        linkedin: form.linkedin || undefined,
        twitter: form.twitter || undefined,
      },
      avatar: avatar ? { file: avatar } : undefined,
    };

    const result = await updateInstructor(instructorData);
    if (!result.success) {
      toast.error(result.message || "Failed to update profile");
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    const result = await logoutInstructor(router);
    if (!result.success) {
      toast.error("Logout failed");
    }
  };

  if (!instructor && isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        p: { xs: 2, md: 4 },
        maxWidth: 800,
        mx: "auto",
      }}
    >
      {/* Mobile Header */}
      {isMobile && (
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6">Profile Settings</Typography>
        </Box>
      )}

      <Box
        sx={{
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 3,
          p: { xs: 2, sm: 3 },
        }}
      >
        <Typography variant="h5" align="center" gutterBottom>
          Instructor Profile
        </Typography>
        {instructor?.approvalStatus?.isInstructorApproved ? (
          <Chip
            label="Approved"
            color="success"
            sx={{ mb: 2, display: "block", mx: "auto" }}
          />
        ) : (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Approval Status: Pending
            {instructor?.approvalStatus?.approvalReason
              ? ` (Reason: ${instructor.approvalStatus.approvalReason})`
              : ""}
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                margin="normal"
                error={!!errors.firstName}
                helperText={errors.firstName}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                margin="normal"
                error={!!errors.lastName}
                helperText={errors.lastName}
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={form.email}
                margin="normal"
                disabled
                helperText="Email cannot be changed"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Country Code"
                name="countryCode"
                value={form.countryCode}
                margin="normal"
                disabled
                helperText="Phone number cannot be changed"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phoneNumber"
                value={form.phoneNumber}
                margin="normal"
                disabled
                helperText="Phone number cannot be changed"
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Bio"
                name="bio"
                multiline
                rows={4}
                value={form.bio}
                onChange={handleChange}
                margin="normal"
                error={!!errors.bio}
                helperText={errors.bio || "Max 500 characters"}
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Expertise (comma-separated)"
                name="expertise"
                value={form.expertise}
                onChange={handleChange}
                margin="normal"
                error={!!errors.expertise}
                helperText={
                  errors.expertise ||
                  "e.g., JavaScript, Python, Web Development"
                }
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Website"
                name="website"
                value={form.website}
                onChange={handleChange}
                margin="normal"
                error={!!errors.website}
                helperText={errors.website}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="LinkedIn"
                name="linkedin"
                value={form.linkedin}
                onChange={handleChange}
                margin="normal"
                error={!!errors.linkedin}
                helperText={errors.linkedin}
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Twitter"
                name="twitter"
                value={form.twitter}
                onChange={handleChange}
                margin="normal"
                error={!!errors.twitter}
                helperText={errors.twitter}
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ mt: 2, mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Avatar
                </Typography>
                {avatarPreview && (
                  <Avatar
                    src={avatarPreview}
                    sx={{ width: 100, height: 100, mb: 1 }}
                    alt="Avatar Preview"
                  />
                )}
                <FileUpload
                  label="Upload New Avatar"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  error={avatarError}
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
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
                {loading || isLoading ? "Updating..." : "Update Profile"}
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="outlined"
                color="error"
                sx={{ mt: 2 }}
                onClick={handleLogout}
                disabled={isLoading}
              >
                Logout
              </Button>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Box>
  );
}
