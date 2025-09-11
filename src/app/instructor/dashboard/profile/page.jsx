"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  TextField,
  Typography,
  CircularProgress,
  Chip,
  Avatar,
  Grid,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import FileUpload from "@/components/Upload/FileUpload";
import useInstructorStore from "@/store/instructorStore";
import { toast } from "react-toastify";
import { AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Poppins, Jost } from "next/font/google";
const poppins = Poppins(
  {
    subsets: ["latin"],
    weight: ["100", "200", "300", "400", "500", "600", "700", "800"]
  },
)
const jost = Jost(
  {
    subsets: ["latin"],
    weight: ["100", "200", "300", "400", "500", "600", "700", "800"]
  },
)


export default function InstructorProfilePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <div className="flex flex-col md:flex-row w-full min-h-screen bg-gray-100">
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
        router.push("/instructor/auth/login");
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
    <Box sx={{
      width: "100%",
    }}>
      <Box sx={{
        bgcolor: "background.paper",
        p: { xs: 2, sm: 3 },
      }}
      >
        <Typography style={{ fontFamily: 'poppins' }} variant="h5" align="center" gutterBottom>
          Instructor Profile
        </Typography>
        {/* Approval Status */}
        {instructor?.isVerified ? (
          <Alert className="border-green-200 bg-green-50 text-green-800">
            <AlertDescription>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Approved
              </Badge>
              <span className={"ml-2 " + jost.className}>Your instructor account is approved and active.</span>
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-yellow-200 bg-yellow-50 text-yellow-800">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Approval Status: Pending</strong>
            </AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="grid lg:grid-cols-2 gap-2">
              <div className="w-full space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  className={errors.firstName ? "border-red-500" : ""}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                )}
              </div>

              <div className="w-full space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  className={errors.lastName ? "border-red-500" : ""}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="w-full space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                value={form.email}
                disabled
              />
              <p className="text-muted-foreground text-sm mt-1">
                Email cannot be changed
              </p>
            </div>

            {/* Country Code */}
            <div className="grid lg:grid-cols-12 gap-2">
              <div className="w-full space-y-2 lg:col-span-2">
                <Label htmlFor="countryCode">Country Code</Label>
                <Input
                  id="countryCode"
                  name="countryCode"
                  value={form.countryCode}
                  disabled
                />
              </div>
              {/* Phone Number */}
              <div className="w-full space-y-2 lg:col-span-10">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={form.phoneNumber}
                  disabled
                />
                <p className="text-muted-foreground text-sm mt-1">
                  Phone number cannot be changed
                </p>
              </div>
            </div>

            {/* Bio */}
            <div className="w-full space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                rows={4}
                value={form.bio}
                onChange={handleChange}
                className={errors.bio ? "border-red-500 min-h-40 resize-none" : " min-h-40 resize-none"}
              />
              <p className={`text-sm mt-1 ${errors.bio ? "text-red-500" : "text-muted-foreground"}`}>
                {errors.bio || "Max 500 characters"}
              </p>
            </div>

            {/* Expertise */}
            <div className="w-full space-y-2">
              <Label htmlFor="expertise">Expertise (comma-separated)</Label>
              <Input
                id="expertise"
                name="expertise"
                value={form.expertise}
                onChange={handleChange}
                className={errors.expertise ? "border-red-500" : ""}
              />
              <p className={`text-sm mt-1 ${errors.expertise ? "text-red-500" : "text-muted-foreground"}`}>
                {errors.expertise || "e.g., JavaScript, Python, Web Development"}
              </p>
            </div>

            {/* Website */}
            <div className="w-full space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                value={form.website}
                onChange={handleChange}
                className={errors.website ? "border-red-500" : ""}
              />
              {errors.website && (
                <p className="text-red-500 text-sm mt-1">{errors.website}</p>
              )}
            </div>

            {/* LinkedIn */}
            <div className="w-full space-y-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                name="linkedin"
                value={form.linkedin}
                onChange={handleChange}
                className={errors.linkedin ? "border-red-500" : ""}
              />
              {errors.linkedin && (
                <p className="text-red-500 text-sm mt-1">{errors.linkedin}</p>
              )}
            </div>

            {/* Twitter */}
            <div className="w-full space-y-2">
              <Label htmlFor="twitter">Twitter</Label>
              <Input
                id="twitter"
                name="twitter"
                value={form.twitter}
                onChange={handleChange}
                className={errors.twitter ? "border-red-500" : ""}
              />
              {errors.twitter && (
                <p className="text-red-500 text-sm mt-1">{errors.twitter}</p>
              )}
            </div>

            {/* Avatar Upload Section */}
            <div className="w-full space-y-2">
              <Label>Avatar</Label>
              {avatarPreview && (
                <img
                  src={avatarPreview}
                  alt="Avatar Preview"
                  className="w-24 h-24 rounded-full object-cover mb-2"
                />
              )}
              <FileUpload
                label="Upload New Avatar"
                accept="image/*"
                onChange={handleAvatarChange}
                error={avatarError}
              />
            </div>

            {/* <Grid item xs={12} sm={6}>
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
            </Grid> */}
            <Grid item xs={12}>
              <Button
                type="submit"
                className={'flex items-center gap-2'}
                disabled={loading || isLoading}
              >
                {loading || isLoading ? <CircularProgress size={20} /> : null}
                {loading || isLoading ? "Updating..." : "Update Profile"}
              </Button>

            </Grid>
            <Grid item xs={12}>
              <Button
                variant="destructive"
                onClick={handleLogout}
                disabled={isLoading}>
                Logout
              </Button>
            </Grid>
          </div>
        </form>
      </Box>
    </Box>
  );
}
