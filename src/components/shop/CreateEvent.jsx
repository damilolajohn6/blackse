"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useShopStore from "@/store/shopStore";
import useEventStore from "@/store/eventStore";
import useVenueStore from "@/store/venueStore";
import { toast } from "react-toastify";
import { 
  TextField, 
  Button, 
  MenuItem, 
  CircularProgress, 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Grid, 
  Chip, 
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  FormLabel,
  FormControlLabel,
  Switch,
  Divider,
  Alert
} from "@mui/material";
import { 
  AiOutlineUpload, 
  AiOutlineDelete, 
  AiOutlinePlus,
  AiOutlineMinus
} from "react-icons/ai";
import { MdPublish, MdSave } from "react-icons/md";
import { 
  ExpandMore as ExpandMoreIcon,
  LocationOn as LocationOnIcon,
  Schedule as ScheduleIcon,
  Settings as SettingsIcon,
  Policy as PolicyIcon,
  Search as SeoIcon
} from "@mui/icons-material";

const categories = [
  "Concert",
  "Workshop",
  "Festival",
  "Seminar",
  "Sale",
  "Conference",
  "Sports",
  "Theater",
  "Comedy",
  "Other"
];

const ticketTierNames = [
  "VIP",
  "Premium", 
  "Standard",
  "Economy",
  "Student",
  "Early Bird",
  "Group",
  "Senior"
];

const accessLevels = [
  "General",
  "VIP",
  "Backstage", 
  "Meet & Greet",
  "All Access"
];

const seatingTypes = [
  "General Admission",
  "Reserved Seating",
  "Mixed",
  "Standing Only"
];

const CreateEventForm = () => {
  const { seller, sellerToken, isSeller } = useShopStore();
  const { createEvent, isLoading, publishEvent } = useEventStore();
  const { getMyVenues, venues } = useVenueStore();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    shortDescription: "",
    category: "",
    subcategory: "",
    start_Date: "",
    Finish_Date: "",
    doorsOpen: "",
    lastEntry: "",
    tags: "",
    ageRestriction: "All Ages",
    dressCode: "Casual",
    weatherPolicy: "Rain or shine event"
  });

  const [actionType, setActionType] = useState("save"); // "save" or "publish"
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [videos, setVideos] = useState([]);
  const [videoUrls, setVideoUrls] = useState([""]);
  
  // Venue management
  const [venueData, setVenueData] = useState({
    name: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
      coordinates: {
        type: "Point",
        coordinates: [0, 0]
      }
    },
    capacity: 100,
    seatingType: "General Admission",
    amenities: []
  });
  const [useExistingVenue, setUseExistingVenue] = useState(false);
  const [selectedVenueId, setSelectedVenueId] = useState("");

  // Ticket tiers
  const [ticketTiers, setTicketTiers] = useState([
    {
      name: "Standard",
      description: "",
      price: 0,
      originalPrice: 0,
      quantity: 100,
      benefits: [],
      accessLevel: "General",
      saleStartDate: "",
      saleEndDate: "",
      minPurchaseQuantity: 1,
      maxPurchaseQuantity: 10
    }
  ]);

  // Add-ons
  const [addOns, setAddOns] = useState([
    {
      name: "",
      description: "",
      price: 0,
      category: "General",
      available: 100,
      sold: 0
    }
  ]);

  // Settings
  const [settings, setSettings] = useState({
    allowTransfers: true,
    allowRefunds: true,
    refundDeadline: "",
    transferDeadline: "",
    requireApproval: false,
    sendReminders: true,
    reminderDays: [7, 3, 1],
    checkInRequired: false,
    maxTicketsPerUser: 10
  });

  // Policies
  const [policies, setPolicies] = useState({
    cancellationPolicy: "",
    refundPolicy: "",
    transferPolicy: "",
    termsAndConditions: "",
    privacyPolicy: ""
  });

  // SEO
  const [seo, setSeo] = useState({
    metaTitle: "",
    metaDescription: "",
    keywords: [],
    slug: ""
  });


  // Load seller's venues on component mount
  useEffect(() => {
    if (isSeller && sellerToken) {
      loadVenues();
    }
  }, [isSeller, sellerToken]);

  const loadVenues = async () => {
    try {
      if (sellerToken) {
        await getMyVenues(sellerToken);
      }
    } catch (error) {
      console.warn("Failed to load venues:", error.message);
      // Don't show error toast for venue loading failure
      // This is optional functionality
    }
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleVenueChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setVenueData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setVenueData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleTicketTierChange = (index, field, value) => {
    const updatedTiers = [...ticketTiers];
    updatedTiers[index] = { ...updatedTiers[index], [field]: value };
    setTicketTiers(updatedTiers);
  };

  const addTicketTier = () => {
    setTicketTiers([...ticketTiers, {
      name: "Standard",
      description: "",
      price: 0,
      originalPrice: 0,
      quantity: 100,
      benefits: [],
      accessLevel: "General",
      saleStartDate: "",
      saleEndDate: "",
      minPurchaseQuantity: 1,
      maxPurchaseQuantity: 10
    }]);
  };

  const removeTicketTier = (index) => {
    if (ticketTiers.length > 1) {
      setTicketTiers(ticketTiers.filter((_, i) => i !== index));
    }
  };

  const handleAddOnChange = (index, field, value) => {
    const updatedAddOns = [...addOns];
    updatedAddOns[index] = { ...updatedAddOns[index], [field]: value };
    setAddOns(updatedAddOns);
  };

  const addAddOn = () => {
    setAddOns([...addOns, {
      name: "",
      description: "",
      price: 0,
      category: "General",
      available: 100,
      sold: 0
    }]);
  };

  const removeAddOn = (index) => {
    setAddOns(addOns.filter((_, i) => i !== index));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 10) {
      toast.error("Maximum 10 images allowed");
      return;
    }

    const newImages = [];
    const newPreviews = [];

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        newImages.push(reader.result);
        newPreviews.push(reader.result);
        if (newImages.length === files.length) {
          setImages((prev) => [...prev, ...newImages]);
          setImagePreviews((prev) => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleVideoUrlChange = (index, value) => {
    const updatedUrls = [...videoUrls];
    updatedUrls[index] = value;
    setVideoUrls(updatedUrls);
  };

  const addVideoUrl = () => {
    setVideoUrls([...videoUrls, ""]);
  };

  const removeVideoUrl = (index) => {
    if (videoUrls.length > 1) {
      setVideoUrls(videoUrls.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isSeller || !seller?._id) {
      toast.error("Please log in as a seller");
      router.push("/shop/login");
      return;
    }

    if (images.length === 0) {
      toast.error("At least one image is required");
      return;
    }

    if (ticketTiers.some(tier => tier.price <= 0 || tier.quantity <= 0)) {
      toast.error("All ticket tiers must have valid price and quantity");
      return;
    }

    try {
      const eventData = {
        ...formData,
        images,
        videos: videoUrls.filter(url => url.trim() !== ""),
        tags: formData.tags ? formData.tags.split(",").map((tag) => tag.trim()) : [],
        ticketTiers: ticketTiers.filter(tier => tier.name && tier.price > 0),
        addOns: addOns.filter(addon => addon.name && addon.price >= 0),
        settings,
        policies,
        seo: {
          ...seo,
          keywords: seo.keywords.filter(k => k.trim() !== "")
        },
        venue: useExistingVenue ? selectedVenueId : venueData
      };

      const createdEvent = await createEvent(eventData, sellerToken);
      
      // If action is publish, also publish the event
      if (actionType === "publish" && createdEvent?._id) {
        await publishEvent(createdEvent._id, sellerToken);
      }
      
      router.push("/shop/event");
    } catch (error) {
      // Error is handled by useEventStore
    }
  };

  const handleSaveDraft = () => {
    setActionType("save");
  };

  const handlePublish = () => {
    setActionType("publish");
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 md:p-8">
      <Typography variant="h4" className="text-2xl font-semibold text-gray-900 pb-6">
        Create Event
      </Typography>


      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Basic Information</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12}>
        <TextField
          fullWidth
          label="Event Name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
          variant="outlined"
        />
              </Grid>
              <Grid item xs={12} md={6}>
        <TextField
          fullWidth
                  label="Short Description"
                  name="shortDescription"
                  value={formData.shortDescription}
          onChange={handleInputChange}
          variant="outlined"
                  helperText="Brief description for cards and previews"
        />
              </Grid>
              <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          select
          label="Category"
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          required
          variant="outlined"
        >
          {categories.map((cat) => (
            <MenuItem key={cat} value={cat}>
              {cat}
            </MenuItem>
          ))}
        </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Subcategory"
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleInputChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Tags (comma-separated)"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  variant="outlined"
                  helperText="e.g., music, outdoor, family-friendly"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  multiline
                  rows={4}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Event Timing */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Event Timing</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
        <TextField
          fullWidth
                  label="Start Date & Time"
          name="start_Date"
          type="datetime-local"
          value={formData.start_Date}
          onChange={handleInputChange}
          required
          variant="outlined"
          InputLabelProps={{ shrink: true }}
        />
              </Grid>
              <Grid item xs={12} md={4}>
        <TextField
          fullWidth
                  label="End Date & Time"
          name="Finish_Date"
          type="datetime-local"
          value={formData.Finish_Date}
          onChange={handleInputChange}
          required
          variant="outlined"
          InputLabelProps={{ shrink: true }}
        />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Doors Open"
                  name="doorsOpen"
                  type="datetime-local"
                  value={formData.doorsOpen}
                  onChange={handleInputChange}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Last Entry"
                  name="lastEntry"
                  type="datetime-local"
                  value={formData.lastEntry}
                  onChange={handleInputChange}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
        <TextField
          fullWidth
                  label="Age Restriction"
                  name="ageRestriction"
                  value={formData.ageRestriction}
          onChange={handleInputChange}
          variant="outlined"
        />
              </Grid>
              <Grid item xs={12} md={4}>
        <TextField
          fullWidth
                  label="Dress Code"
                  name="dressCode"
                  value={formData.dressCode}
          onChange={handleInputChange}
          variant="outlined"
        />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Venue Management */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Venue Management</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={useExistingVenue}
                      onChange={(e) => setUseExistingVenue(e.target.checked)}
                    />
                  }
                  label="Use Existing Venue"
                />
              </Grid>
              
              {useExistingVenue ? (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    select
                    label="Select Venue"
                    value={selectedVenueId}
                    onChange={(e) => setSelectedVenueId(e.target.value)}
                    variant="outlined"
                    disabled={venues.length === 0}
                    helperText={venues.length === 0 ? "No venues found. Create a new venue instead." : ""}
                  >
                    {venues.length > 0 ? (
                      venues.map((venue) => (
                        <MenuItem key={venue._id} value={venue._id}>
                          {venue.name} - {venue.address?.city || 'Unknown'}, {venue.address?.state || 'Unknown'}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No venues available</MenuItem>
                    )}
                  </TextField>
                </Grid>
              ) : (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Venue Name"
                      name="name"
                      value={venueData.name}
                      onChange={handleVenueChange}
                      required
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
        <TextField
          fullWidth
                      label="Capacity"
                      name="capacity"
          type="number"
                      value={venueData.capacity}
                      onChange={handleVenueChange}
          required
          variant="outlined"
        />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Street Address"
                      name="address.street"
                      value={venueData.address.street}
                      onChange={handleVenueChange}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="City"
                      name="address.city"
                      value={venueData.address.city}
                      onChange={handleVenueChange}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="State"
                      name="address.state"
                      value={venueData.address.state}
                      onChange={handleVenueChange}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Country"
                      name="address.country"
                      value={venueData.address.country}
                      onChange={handleVenueChange}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
        <TextField
          fullWidth
                      label="ZIP Code"
                      name="address.zipCode"
                      value={venueData.address.zipCode}
                      onChange={handleVenueChange}
          variant="outlined"
        />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      select
                      label="Seating Type"
                      name="seatingType"
                      value={venueData.seatingType}
                      onChange={handleVenueChange}
                      variant="outlined"
                    >
                      {seatingTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </>
              )}
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Ticket Tiers */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Ticket Tiers</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div className="space-y-4">
              {ticketTiers.map((tier, index) => (
                <Card key={index} className="p-4">
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        select
                        label="Tier Name"
                        value={tier.name}
                        onChange={(e) => handleTicketTierChange(index, 'name', e.target.value)}
                        variant="outlined"
                        size="small"
                      >
                        {ticketTierNames.map((name) => (
                          <MenuItem key={name} value={name}>
                            {name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="Price"
                        type="number"
                        value={tier.price}
                        onChange={(e) => handleTicketTierChange(index, 'price', Number(e.target.value))}
                        variant="outlined"
                        size="small"
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="Quantity"
                        type="number"
                        value={tier.quantity}
                        onChange={(e) => handleTicketTierChange(index, 'quantity', Number(e.target.value))}
                        variant="outlined"
                        size="small"
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Box display="flex" alignItems="center" height="100%">
                        <IconButton 
                          onClick={() => removeTicketTier(index)}
                          disabled={ticketTiers.length === 1}
                          color="error"
                        >
                          <AiOutlineDelete />
                        </IconButton>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Description"
                        value={tier.description}
                        onChange={(e) => handleTicketTierChange(index, 'description', e.target.value)}
                        variant="outlined"
                        size="small"
                        multiline
                        rows={2}
                      />
                    </Grid>
                  </Grid>
                </Card>
              ))}
              <Button
                onClick={addTicketTier}
                startIcon={<AiOutlinePlus />}
                variant="outlined"
              >
                Add Ticket Tier
              </Button>
            </div>
          </AccordionDetails>
        </Accordion>

        {/* Media Upload */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Media Upload</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              {/* Images Section */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" className="mb-2">
                  Images (Max 10)
                </Typography>
                <div className="flex items-center space-x-4 mb-4">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <AiOutlineUpload className="mr-2" />
              Upload Images
            </label>
          </div>
                <div className="grid grid-cols-4 gap-4">
            {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
              <img
                src={preview}
                alt="Preview"
                className="h-24 w-24 object-cover rounded"
              />
                      <IconButton
                        size="small"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white"
                      >
                        <AiOutlineDelete />
                      </IconButton>
                    </div>
            ))}
          </div>
              </Grid>

              {/* Videos Section */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" className="mb-2">
                  Video URLs (Optional)
                </Typography>
                <Typography variant="body2" color="textSecondary" className="mb-4">
                  Add video URLs from YouTube, Vimeo, or other video hosting platforms
                </Typography>
                
                <div className="space-y-3">
                  {videoUrls.map((url, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <TextField
                        fullWidth
                        label={`Video URL ${index + 1}`}
                        value={url}
                        onChange={(e) => handleVideoUrlChange(index, e.target.value)}
                        variant="outlined"
                        size="small"
                        placeholder="https://www.youtube.com/watch?v=..."
                        helperText="Enter a valid video URL"
                      />
                      <IconButton
                        onClick={() => removeVideoUrl(index)}
                        disabled={videoUrls.length === 1}
                        color="error"
                        size="small"
                      >
                        <AiOutlineDelete />
                      </IconButton>
                    </div>
                  ))}
                  
                  <Button
                    onClick={addVideoUrl}
                    startIcon={<AiOutlinePlus />}
                    variant="outlined"
                    size="small"
                  >
                    Add Video URL
                  </Button>
        </div>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Event Settings */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Event Settings</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.allowTransfers}
                      onChange={(e) => setSettings(prev => ({ ...prev, allowTransfers: e.target.checked }))}
                    />
                  }
                  label="Allow Ticket Transfers"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.allowRefunds}
                      onChange={(e) => setSettings(prev => ({ ...prev, allowRefunds: e.target.checked }))}
                    />
                  }
                  label="Allow Refunds"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.sendReminders}
                      onChange={(e) => setSettings(prev => ({ ...prev, sendReminders: e.target.checked }))}
                    />
                  }
                  label="Send Automatic Reminders"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.checkInRequired}
                      onChange={(e) => setSettings(prev => ({ ...prev, checkInRequired: e.target.checked }))}
                    />
                  }
                  label="Require Check-in"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Max Tickets Per User"
                  type="number"
                  value={settings.maxTicketsPerUser}
                  onChange={(e) => setSettings(prev => ({ ...prev, maxTicketsPerUser: Number(e.target.value) }))}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* SEO Settings */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">SEO Settings</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Meta Title"
                  value={seo.metaTitle}
                  onChange={(e) => setSeo(prev => ({ ...prev, metaTitle: e.target.value }))}
                  variant="outlined"
                  helperText="Title for search engines"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Meta Description"
                  value={seo.metaDescription}
                  onChange={(e) => setSeo(prev => ({ ...prev, metaDescription: e.target.value }))}
                  variant="outlined"
                  multiline
                  rows={2}
                  helperText="Description for search engines"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="URL Slug"
                  value={seo.slug}
                  onChange={(e) => setSeo(prev => ({ ...prev, slug: e.target.value }))}
                  variant="outlined"
                  helperText="URL-friendly version of event name"
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        <div className="flex gap-4 mt-8">
          <Button
            type="submit"
            variant="outlined"
            color="primary"
            fullWidth
            size="large"
            disabled={isLoading}
            startIcon={isLoading && actionType === "save" ? <CircularProgress size={20} /> : <MdSave />}
            onClick={handleSaveDraft}
            className="flex-1"
          >
            {isLoading && actionType === "save" ? "Saving Draft..." : "Save Draft"}
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="success"
            fullWidth
            size="large"
            disabled={isLoading}
            startIcon={isLoading && actionType === "publish" ? <CircularProgress size={20} /> : <MdPublish />}
            onClick={handlePublish}
            className="flex-1"
          >
            {isLoading && actionType === "publish" ? "Publishing..." : "Publish Event"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateEventForm;
