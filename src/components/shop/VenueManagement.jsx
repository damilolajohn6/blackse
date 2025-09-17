"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Typography,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  Fab,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
  Image as ImageIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import useVenueStore from "@/store/venueStore";
import useAuthStore from "@/store/shopStore";
import { toast } from "react-hot-toast";

const VenueManagement = () => {
  const { sellerToken, seller } = useAuthStore();
  const {
    venues,
    isLoading,
    error,
    createVenue,
    updateVenue,
    deleteVenue,
    getMyVenues,
  } = useVenueStore();

  const [openDialog, setOpenDialog] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
      coordinates: { lat: 0, lng: 0 },
    },
    capacity: 0,
    seatingType: "General",
    amenities: [],
    images: [],
    contactInfo: {
      phone: "",
      email: "",
      website: "",
    },
    operatingHours: {
      monday: { open: "", close: "", closed: false },
      tuesday: { open: "", close: "", closed: false },
      wednesday: { open: "", close: "", closed: false },
      thursday: { open: "", close: "", closed: false },
      friday: { open: "", close: "", closed: false },
      saturday: { open: "", close: "", closed: false },
      sunday: { open: "", close: "", closed: false },
    },
    status: "Active",
  });

  const seatingTypes = ["General", "Reserved", "VIP", "Standing", "Mixed"];
  const amenitiesOptions = [
    "Parking",
    "Wheelchair Accessible",
    "Air Conditioning",
    "Sound System",
    "Lighting",
    "Stage",
    "Bar",
    "Restrooms",
    "WiFi",
    "Security",
  ];

  useEffect(() => {
    console.log("VenueManagement useEffect triggered:", { sellerToken: !!sellerToken, seller: !!seller });
    if (sellerToken && seller) {
      try {
        console.log("Calling getMyVenues with token:", sellerToken.substring(0, 20) + "...");
        getMyVenues(sellerToken);
      } catch (error) {
        console.error("Failed to load venues:", error);
      }
    }
  }, [sellerToken, seller, getMyVenues]);

  const handleOpenDialog = (venue = null) => {
    if (venue) {
      setEditingVenue(venue);
      setFormData({
        ...venue,
        amenities: venue.amenities || [],
        images: venue.images || [],
      });
    } else {
      setEditingVenue(null);
      setFormData({
        name: "",
        description: "",
        address: {
          street: "",
          city: "",
          state: "",
          country: "",
          zipCode: "",
          coordinates: { lat: 0, lng: 0 },
        },
        capacity: 0,
        seatingType: "General",
        amenities: [],
        images: [],
        contactInfo: {
          phone: "",
          email: "",
          website: "",
        },
        operatingHours: {
          monday: { open: "", close: "", closed: false },
          tuesday: { open: "", close: "", closed: false },
          wednesday: { open: "", close: "", closed: false },
          thursday: { open: "", close: "", closed: false },
          friday: { open: "", close: "", closed: false },
          saturday: { open: "", close: "", closed: false },
          sunday: { open: "", close: "", closed: false },
        },
        status: "Active",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingVenue(null);
  };

  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleAmenityToggle = (amenity) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingVenue) {
        await updateVenue(editingVenue._id, formData, sellerToken);
        toast.success("Venue updated successfully!");
      } else {
        await createVenue(formData, sellerToken);
        toast.success("Venue created successfully!");
      }
      handleCloseDialog();
    } catch (error) {
      toast.error(error.message || "Failed to save venue");
    }
  };

  const handleDelete = async (venueId) => {
    if (window.confirm("Are you sure you want to delete this venue?")) {
      try {
        await deleteVenue(venueId, sellerToken);
        toast.success("Venue deleted successfully!");
      } catch (error) {
        toast.error(error.message || "Failed to delete venue");
      }
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  console.log("VenueManagement render:", { 
    venues: venues?.length || 0, 
    isLoading, 
    error,
    sellerToken: !!sellerToken,
    seller: !!seller 
  });

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          My Venues ({venues?.length || 0})
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ bgcolor: "primary.main" }}
        >
          Add Venue
        </Button>
      </Box>

      {/* Venues Grid */}
      <Grid container spacing={3}>
        {(venues || []).map((venue) => (
          <Grid item xs={12} sm={6} md={4} key={venue?._id || Math.random()}>
            <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>
                    <LocationIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" component="h3" noWrap>
                      {venue?.name || "Unnamed Venue"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {venue?.address?.city || "Unknown"}, {venue?.address?.state || "Unknown"}
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" mb={2}>
                  {venue?.description?.substring(0, 100) || "No description available"}
                  {venue?.description?.length > 100 && "..."}
                </Typography>

                <Box display="flex" alignItems="center" mb={1}>
                  <PeopleIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
                  <Typography variant="body2" color="text.secondary">
                    Capacity: {(venue?.capacity || 0).toLocaleString()}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" mb={2}>
                  <Chip
                    label={venue?.seatingType || "General"}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    label={venue?.status || "Active"}
                    size="small"
                    color={venue?.status === "Active" ? "success" : "default"}
                    sx={{ ml: 1 }}
                  />
                </Box>

                {venue?.amenities && venue.amenities.length > 0 && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      Amenities:
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                      {venue.amenities.slice(0, 3).map((amenity) => (
                        <Chip
                          key={amenity}
                          label={amenity}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                      {venue.amenities.length > 3 && (
                        <Chip
                          label={`+${venue.amenities.length - 3} more`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </Box>
                )}
              </CardContent>

              <CardActions>
                <Button
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => handleOpenDialog(venue)}
                >
                  Edit
                </Button>
                <Button
                  size="small"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => handleDelete(venue?._id)}
                >
                  Delete
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {(venues || []).length === 0 && (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" mb={2}>
            No venues found
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Create your first venue to start hosting events
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Your First Venue
          </Button>
        </Box>
      )}

      {/* Add/Edit Venue Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { maxHeight: "90vh" }
        }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {editingVenue ? "Edit Venue" : "Add New Venue"}
            </Typography>
            <IconButton onClick={handleCloseDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <form onSubmit={handleSubmit}>
          <DialogContent dividers>
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Venue Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => handleInputChange("capacity", parseInt(e.target.value))}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Seating Type</InputLabel>
                  <Select
                    value={formData.seatingType}
                    onChange={(e) => handleInputChange("seatingType", e.target.value)}
                    label="Seating Type"
                  >
                    {seatingTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) => handleInputChange("status", e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                    <MenuItem value="Maintenance">Maintenance</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Address */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Address
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Street Address"
                  value={formData.address.street}
                  onChange={(e) => handleInputChange("address.street", e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="City"
                  value={formData.address.city}
                  onChange={(e) => handleInputChange("address.city", e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="State"
                  value={formData.address.state}
                  onChange={(e) => handleInputChange("address.state", e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Zip Code"
                  value={formData.address.zipCode}
                  onChange={(e) => handleInputChange("address.zipCode", e.target.value)}
                />
              </Grid>

              {/* Amenities */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Amenities
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {amenitiesOptions.map((amenity) => (
                    <Chip
                      key={amenity}
                      label={amenity}
                      clickable
                      color={formData.amenities.includes(amenity) ? "primary" : "default"}
                      onClick={() => handleAmenityToggle(amenity)}
                    />
                  ))}
                </Box>
              </Grid>

              {/* Contact Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Contact Information
                </Typography>
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={formData.contactInfo.phone}
                  onChange={(e) => handleInputChange("contactInfo.phone", e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.contactInfo.email}
                  onChange={(e) => handleInputChange("contactInfo.email", e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Website"
                  value={formData.contactInfo.website}
                  onChange={(e) => handleInputChange("contactInfo.website", e.target.value)}
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingVenue ? "Update Venue" : "Create Venue"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default VenueManagement;
