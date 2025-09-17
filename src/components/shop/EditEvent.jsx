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
  Grid,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  FormControlLabel,
  Switch,
  Chip,
  Box,
} from "@mui/material";
import {
  AiOutlineUpload,
  AiOutlineDelete,
  AiOutlinePlus,
  AiOutlineMinus,
} from "react-icons/ai";
import { MdPublish, MdSave } from "react-icons/md";
import {
  ExpandMore as ExpandMoreIcon,
  LocationOn as LocationOnIcon,
  Schedule as ScheduleIcon,
  Settings as SettingsIcon,
  Policy as PolicyIcon,
  Search as SeoIcon,
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
  "Other",
];

const ticketTierNames = [
  "VIP",
  "Premium",
  "Standard",
  "Economy",
  "Student",
  "Early Bird",
  "Group",
  "Senior",
];

const accessLevels = [
  "General",
  "VIP",
  "Backstage",
  "Meet & Greet",
  "All Access",
];

const seatingTypes = [
  "General Admission",
  "Reserved Seating",
  "Standing Only",
  "Mixed Seating",
  "VIP Sections",
];

const EditEvent = ({ eventId }) => {
  const { seller, sellerToken, isSeller } = useShopStore();
  const { events, updateEvent, isLoading, fetchEvent, publishEvent } = useEventStore();
  const { venues, getMyVenues } = useVenueStore();
  const router = useRouter();

  const event = events.find((e) => e._id === eventId);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [eventLoading, setEventLoading] = useState(false);
  const [actionType, setActionType] = useState("save"); // "save" or "publish"

  // Basic event information
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    shortDescription: "",
    category: "",
    subcategory: "",
    tags: "",
    start_Date: "",
    Finish_Date: "",
    doorsOpen: "",
    lastEntry: "",
  });

  // Ticket tiers management
  const [ticketTiers, setTicketTiers] = useState([
    {
      name: "Standard",
      description: "",
      price: 0,
      originalPrice: 0,
      quantity: 0,
      accessLevel: "General",
      saleStartDate: "",
      saleEndDate: "",
      maxPerUser: 10,
    },
  ]);

  // Add-ons management
  const [addOns, setAddOns] = useState([
    {
      name: "",
      description: "",
      price: 0,
      category: "Food & Beverage",
      isRequired: false,
    },
  ]);

  // Event settings
  const [settings, setSettings] = useState({
    allowTransfers: true,
    allowRefunds: true,
    sendReminders: true,
    checkInRequired: false,
    maxTicketsPerUser: 10,
    requireApproval: false,
    allowWaitlist: true,
    autoCheckIn: false,
  });

  // Event policies
  const [policies, setPolicies] = useState({
    refundPolicy: "Full refund up to 7 days before event",
    transferPolicy: "Tickets can be transferred to other users",
    ageRestriction: "All Ages",
    dressCode: "Casual",
    weatherPolicy: "Rain or shine event",
  });

  // SEO settings
  const [seo, setSeo] = useState({
    metaTitle: "",
    metaDescription: "",
    keywords: [],
    slug: "",
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [videoUrls, setVideoUrls] = useState([""]);
  
  // Venue management
  const [venueData, setVenueData] = useState({
    name: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
    capacity: 100,
    seatingType: "General Admission",
    amenities: [],
  });

  const [useExistingVenue, setUseExistingVenue] = useState(false);
  const [selectedVenueId, setSelectedVenueId] = useState("");

  useEffect(() => {
    if (!isSeller || !seller?._id) {
      toast.error("Please log in as a seller");
      router.push("/shop/login");
      return;
    }

    if (!eventId) {
      toast.error("Invalid event ID");
      router.push("/shop/event");
      return;
    }

    // Load venues for seller
    const loadVenues = async () => {
      try {
        if (sellerToken) {
          await getMyVenues(sellerToken);
        }
      } catch (error) {
        console.warn("Failed to load venues:", error.message);
      }
    };

    loadVenues();

    // Fetch event if not found in events array
    const loadEvent = async () => {
      if (!event && eventId) {
        setEventLoading(true);
        try {
          const fetchedEvent = await fetchEvent(eventId, sellerToken);
          setCurrentEvent(fetchedEvent);
        } catch (error) {
          console.error("Failed to fetch event:", error);
          toast.error("Event not found");
          router.push("/shop/event");
        } finally {
          setEventLoading(false);
        }
      } else if (event) {
        setCurrentEvent(event);
      }
    };

    loadEvent();
  }, [eventId, event, isSeller, seller, router, sellerToken, getMyVenues, fetchEvent]);

  // Separate useEffect to populate form data when currentEvent changes
  useEffect(() => {
    if (!currentEvent) return;

    // Populate form data
    setFormData({
      name: currentEvent.name || "",
      description: currentEvent.description || "",
      shortDescription: currentEvent.shortDescription || "",
      category: currentEvent.category || "",
      subcategory: currentEvent.subcategory || "",
      tags: currentEvent.tags ? currentEvent.tags.join(", ") : "",
      start_Date: currentEvent.start_Date ? new Date(currentEvent.start_Date).toISOString().slice(0, 16) : "",
      Finish_Date: currentEvent.Finish_Date ? new Date(currentEvent.Finish_Date).toISOString().slice(0, 16) : "",
      doorsOpen: currentEvent.doorsOpen ? new Date(currentEvent.doorsOpen).toISOString().slice(0, 16) : "",
      lastEntry: currentEvent.lastEntry ? new Date(currentEvent.lastEntry).toISOString().slice(0, 16) : "",
    });

    // Populate ticket tiers
    if (currentEvent.ticketTiers && currentEvent.ticketTiers.length > 0) {
      setTicketTiers(currentEvent.ticketTiers.map(tier => ({
        name: tier.name || "Standard",
        description: tier.description || "",
        price: tier.price || 0,
        originalPrice: tier.originalPrice || 0,
        quantity: tier.quantity || 0,
        accessLevel: tier.accessLevel || "General",
        saleStartDate: tier.saleStartDate ? new Date(tier.saleStartDate).toISOString().slice(0, 16) : "",
        saleEndDate: tier.saleEndDate ? new Date(tier.saleEndDate).toISOString().slice(0, 16) : "",
        maxPerUser: tier.maxPerUser || 10,
      })));
    }

    // Populate add-ons
    if (currentEvent.addOns && currentEvent.addOns.length > 0) {
      setAddOns(currentEvent.addOns.map(addon => ({
        name: addon.name || "",
        description: addon.description || "",
        price: addon.price || 0,
        category: addon.category || "Food & Beverage",
        isRequired: addon.isRequired || false,
      })));
    }

    // Populate settings
    if (currentEvent.settings) {
      setSettings({
        allowTransfers: currentEvent.settings.allowTransfers !== undefined ? currentEvent.settings.allowTransfers : true,
        allowRefunds: currentEvent.settings.allowRefunds !== undefined ? currentEvent.settings.allowRefunds : true,
        sendReminders: currentEvent.settings.sendReminders !== undefined ? currentEvent.settings.sendReminders : true,
        checkInRequired: currentEvent.settings.checkInRequired || false,
        maxTicketsPerUser: currentEvent.settings.maxTicketsPerUser || 10,
        requireApproval: currentEvent.settings.requireApproval || false,
        allowWaitlist: currentEvent.settings.allowWaitlist !== undefined ? currentEvent.settings.allowWaitlist : true,
        autoCheckIn: currentEvent.settings.autoCheckIn || false,
      });
    }

    // Populate policies
    if (currentEvent.policies) {
      setPolicies({
        refundPolicy: currentEvent.policies.refundPolicy || "Full refund up to 7 days before event",
        transferPolicy: currentEvent.policies.transferPolicy || "Tickets can be transferred to other users",
        ageRestriction: currentEvent.policies.ageRestriction || "All Ages",
        dressCode: currentEvent.policies.dressCode || "Casual",
        weatherPolicy: currentEvent.policies.weatherPolicy || "Rain or shine event",
      });
    }

    // Populate SEO
    if (currentEvent.seo) {
      setSeo({
        metaTitle: currentEvent.seo.metaTitle || "",
        metaDescription: currentEvent.seo.metaDescription || "",
        keywords: currentEvent.seo.keywords || [],
        slug: currentEvent.seo.slug || "",
      });
    }

    // Populate venue data
    if (currentEvent.venue) {
      if (typeof currentEvent.venue === 'string') {
        // Venue is just an ID, use existing venue
        setUseExistingVenue(true);
        setSelectedVenueId(currentEvent.venue);
      } else {
        // Venue is an object with details
        setUseExistingVenue(false);
        setVenueData({
          name: currentEvent.venue.name || "",
          address: currentEvent.venue.address || {
            street: "",
            city: "",
            state: "",
            zipCode: "",
            country: "",
          },
          capacity: currentEvent.venue.capacity || 100,
          seatingType: currentEvent.venue.seatingType || "General Admission",
          amenities: currentEvent.venue.amenities || [],
        });
      }
    }

    // Populate images and videos
    if (currentEvent.images && currentEvent.images.length > 0) {
      setImagePreviews(currentEvent.images.map((img) => img.url || img));
    }
    
    if (currentEvent.videos && currentEvent.videos.length > 0) {
      setVideoUrls(currentEvent.videos);
    } else {
      setVideoUrls([""]);
    }
  }, [currentEvent]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTicketTierChange = (index, field, value) => {
    const updatedTiers = [...ticketTiers];
    updatedTiers[index] = { ...updatedTiers[index], [field]: value };
    setTicketTiers(updatedTiers);
  };

  const addTicketTier = () => {
    setTicketTiers([
      ...ticketTiers,
      {
        name: "Standard",
        description: "",
        price: 0,
        originalPrice: 0,
        quantity: 0,
        accessLevel: "General",
        saleStartDate: "",
        saleEndDate: "",
        maxPerUser: 10,
      },
    ]);
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
    setAddOns([
      ...addOns,
      {
        name: "",
        description: "",
        price: 0,
        category: "Food & Beverage",
        isRequired: false,
      },
    ]);
  };

  const removeAddOn = (index) => {
    if (addOns.length > 1) {
      setAddOns(addOns.filter((_, i) => i !== index));
    }
  };

  const handleSettingsChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handlePoliciesChange = (field, value) => {
    setPolicies((prev) => ({ ...prev, [field]: value }));
  };

  const handleSeoChange = (field, value) => {
    setSeo((prev) => ({ ...prev, [field]: value }));
  };

  const handleVenueDataChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setVenueData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setVenueData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (imagePreviews.length + files.length > 10) {
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
    console.log("handleSubmit called", { eventId, currentEvent, isSeller, seller, actionType });
    
    if (!isSeller || !seller?._id) {
      console.log("Not authenticated as seller");
      toast.error("Please log in as a seller");
      router.push("/shop/login");
      return;
    }

    if (!eventId || !currentEvent) {
      console.log("Missing eventId or currentEvent", { eventId, currentEvent });
      toast.error("Event not found");
      router.push("/shop/event");
      return;
    }

    // Validate ticket tiers
    const hasValidTiers = ticketTiers.every(
      (tier) => tier.name && tier.price > 0 && tier.quantity > 0
    );

    if (!hasValidTiers) {
      toast.error("All ticket tiers must have valid price and quantity");
      return;
    }

    try {
      console.log("Preparing to update event", { eventId, formData, ticketTiers, actionType });
      
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

      console.log("Calling updateEvent with:", { eventId, eventData, sellerToken });
      await updateEvent(eventId, eventData, sellerToken);
      console.log("Event updated successfully");
      
      // If action is publish, also publish the event
      if (actionType === "publish") {
        console.log("Publishing event after update");
        await publishEvent(eventId, sellerToken);
        console.log("Event published successfully");
      }
      
      router.push("/shop/event");
    } catch (error) {
      console.error("Error updating event:", error);
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
    <Box sx={{ width: '100%', maxWidth: '6xl', mx: 'auto', p: { xs: 3, md: 4 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h3" sx={{ fontWeight: 600, color: 'text.primary' }}>
          Edit Event
        </Typography>
        <Button
          variant="outlined"
          onClick={() => router.push("/shop/event")}
        >
          Back to Events
        </Button>
      </Box>

      {eventLoading ? (
        <Box sx={{ textAlign: 'center', color: 'text.secondary', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
          <CircularProgress sx={{ mr: 1 }} />
          Loading event...
        </Box>
      ) : currentEvent ? (
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Short Description"
                    name="shortDescription"
                    value={formData.shortDescription}
                    onChange={handleInputChange}
                    variant="outlined"
                    multiline
                    rows={2}
                    helperText="Brief description for event cards and listings"
                  />
                </Grid>
                <Grid item xs={12}>
          <TextField
            fullWidth
                    label="Full Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            multiline
            rows={4}
            variant="outlined"
          />
                </Grid>
                <Grid item xs={12} sm={6}>
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
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Subcategory"
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleInputChange}
                    variant="outlined"
                    placeholder="e.g., Rock Concert, Tech Workshop"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Tags (comma-separated)"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    variant="outlined"
                    placeholder="music, live, outdoor, family-friendly"
                    helperText="Add tags to help users discover your event"
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Event Timing */}
          <Accordion>
            <AccordionSummary expandIcon={<ScheduleIcon />}>
              <Typography variant="h6">Event Timing</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
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
                <Grid item xs={12} sm={6}>
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
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Doors Open"
                    name="doorsOpen"
                    type="datetime-local"
                    value={formData.doorsOpen}
                    onChange={handleInputChange}
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    helperText="When doors open for entry"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Entry"
                    name="lastEntry"
                    type="datetime-local"
                    value={formData.lastEntry}
                    onChange={handleInputChange}
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    helperText="Last time for entry"
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Venue Management */}
          <Accordion>
            <AccordionSummary expandIcon={<LocationOnIcon />}>
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
                    label="Use existing venue"
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
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Venue Name"
                        value={venueData.name}
                        onChange={(e) => handleVenueDataChange("name", e.target.value)}
                        variant="outlined"
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
                        label="Capacity"
            type="number"
                        value={venueData.capacity}
                        onChange={(e) => handleVenueDataChange("capacity", parseInt(e.target.value))}
                        variant="outlined"
            required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        select
                        label="Seating Type"
                        value={venueData.seatingType}
                        onChange={(e) => handleVenueDataChange("seatingType", e.target.value)}
                        variant="outlined"
                      >
                        {seatingTypes.map((type) => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Street Address"
                        value={venueData.address.street}
                        onChange={(e) => handleVenueDataChange("address.street", e.target.value)}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="City"
                        value={venueData.address.city}
                        onChange={(e) => handleVenueDataChange("address.city", e.target.value)}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="State"
                        value={venueData.address.state}
                        onChange={(e) => handleVenueDataChange("address.state", e.target.value)}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="ZIP Code"
                        value={venueData.address.zipCode}
                        onChange={(e) => handleVenueDataChange("address.zipCode", e.target.value)}
            variant="outlined"
          />
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
              <Grid container spacing={3}>
                {ticketTiers.map((tier, index) => (
                  <Grid item xs={12} key={index}>
                    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle1">
                          Tier {index + 1}
                        </Typography>
                        {ticketTiers.length > 1 && (
                          <IconButton
                            onClick={() => removeTicketTier(index)}
                            color="error"
                            size="small"
                          >
                            <AiOutlineDelete />
                          </IconButton>
                        )}
                      </Box>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            select
                            label="Tier Name"
                            value={tier.name}
                            onChange={(e) =>
                              handleTicketTierChange(index, "name", e.target.value)
                            }
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
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            select
                            label="Access Level"
                            value={tier.accessLevel}
                            onChange={(e) =>
                              handleTicketTierChange(index, "accessLevel", e.target.value)
                            }
                            variant="outlined"
                            size="small"
                          >
                            {accessLevels.map((level) => (
                              <MenuItem key={level} value={level}>
                                {level}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Price"
                            type="number"
                            value={tier.price}
                            onChange={(e) =>
                              handleTicketTierChange(index, "price", parseFloat(e.target.value))
                            }
                            variant="outlined"
                            size="small"
                            required
                            inputProps={{ min: 0, step: 0.01 }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Original Price (Optional)"
            type="number"
                            value={tier.originalPrice}
                            onChange={(e) =>
                              handleTicketTierChange(index, "originalPrice", parseFloat(e.target.value))
                            }
            variant="outlined"
                            size="small"
                            inputProps={{ min: 0, step: 0.01 }}
                            helperText="For showing discount"
          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
                            label="Quantity Available"
            type="number"
                            value={tier.quantity}
                            onChange={(e) =>
                              handleTicketTierChange(index, "quantity", parseInt(e.target.value))
                            }
                            variant="outlined"
                            size="small"
            required
                            inputProps={{ min: 1 }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Max Per User"
                            type="number"
                            value={tier.maxPerUser}
                            onChange={(e) =>
                              handleTicketTierChange(index, "maxPerUser", parseInt(e.target.value))
                            }
            variant="outlined"
                            size="small"
                            inputProps={{ min: 1 }}
          />
                        </Grid>
                        <Grid item xs={12}>
          <TextField
            fullWidth
                            label="Description"
                            value={tier.description}
                            onChange={(e) =>
                              handleTicketTierChange(index, "description", e.target.value)
                            }
            variant="outlined"
                            size="small"
                            multiline
                            rows={2}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  </Grid>
                ))}
                <Grid item xs={12}>
                  <Button
                    onClick={addTicketTier}
                    startIcon={<AiOutlinePlus />}
                    variant="outlined"
                    size="small"
                  >
                    Add Ticket Tier
                  </Button>
                </Grid>
              </Grid>
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
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    Images (Max 10)
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
                    <Button
                      component="label"
                htmlFor="image-upload"
                      variant="outlined"
                      startIcon={<AiOutlineUpload />}
                      sx={{ cursor: 'pointer' }}
                    >
                      Upload Images
                    </Button>
                  </Box>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
              {imagePreviews.map((preview, index) => (
                      <Box key={index} sx={{ position: 'relative' }}>
                        <Box
                          component="img"
                          src={preview}
                          alt="Preview"
                          sx={{ 
                            height: 96, 
                            width: 96, 
                            objectFit: 'cover', 
                            borderRadius: 4 
                          }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => removeImage(index)}
                          sx={{ 
                            position: 'absolute', 
                            top: -8, 
                            right: -8, 
                            backgroundColor: 'error.main', 
                            color: 'white',
                            '&:hover': { backgroundColor: 'error.dark' }
                          }}
                        >
                          <AiOutlineDelete />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                </Grid>

                {/* Videos Section */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    Video URLs (Optional)
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    Add video URLs from YouTube, Vimeo, or other video hosting platforms
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {videoUrls.map((url, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                      </Box>
                    ))}
                    
                    <Button
                      onClick={addVideoUrl}
                      startIcon={<AiOutlinePlus />}
                      variant="outlined"
                      size="small"
                    >
                      Add Video URL
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Event Settings */}
          <Accordion>
            <AccordionSummary expandIcon={<SettingsIcon />}>
              <Typography variant="h6">Event Settings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.allowTransfers}
                        onChange={(e) => handleSettingsChange("allowTransfers", e.target.checked)}
                      />
                    }
                    label="Allow Ticket Transfers"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.allowRefunds}
                        onChange={(e) => handleSettingsChange("allowRefunds", e.target.checked)}
                      />
                    }
                    label="Allow Refunds"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.sendReminders}
                        onChange={(e) => handleSettingsChange("sendReminders", e.target.checked)}
                      />
                    }
                    label="Send Reminders"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.checkInRequired}
                        onChange={(e) => handleSettingsChange("checkInRequired", e.target.checked)}
                      />
                    }
                    label="Check-in Required"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Max Tickets Per User"
                    type="number"
                    value={settings.maxTicketsPerUser}
                    onChange={(e) => handleSettingsChange("maxTicketsPerUser", parseInt(e.target.value))}
                    variant="outlined"
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.allowWaitlist}
                        onChange={(e) => handleSettingsChange("allowWaitlist", e.target.checked)}
                      />
                    }
                    label="Allow Waitlist"
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Event Policies */}
          <Accordion>
            <AccordionSummary expandIcon={<PolicyIcon />}>
              <Typography variant="h6">Event Policies</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Refund Policy"
                    value={policies.refundPolicy}
                    onChange={(e) => handlePoliciesChange("refundPolicy", e.target.value)}
                    variant="outlined"
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Transfer Policy"
                    value={policies.transferPolicy}
                    onChange={(e) => handlePoliciesChange("transferPolicy", e.target.value)}
                    variant="outlined"
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Age Restriction"
                    value={policies.ageRestriction}
                    onChange={(e) => handlePoliciesChange("ageRestriction", e.target.value)}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Dress Code"
                    value={policies.dressCode}
                    onChange={(e) => handlePoliciesChange("dressCode", e.target.value)}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Weather Policy"
                    value={policies.weatherPolicy}
                    onChange={(e) => handlePoliciesChange("weatherPolicy", e.target.value)}
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* SEO Settings */}
          <Accordion>
            <AccordionSummary expandIcon={<SeoIcon />}>
              <Typography variant="h6">SEO Settings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Meta Title"
                    value={seo.metaTitle}
                    onChange={(e) => handleSeoChange("metaTitle", e.target.value)}
                    variant="outlined"
                    helperText="Title for search engines (max 60 characters)"
                    inputProps={{ maxLength: 60 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Meta Description"
                    value={seo.metaDescription}
                    onChange={(e) => handleSeoChange("metaDescription", e.target.value)}
                    variant="outlined"
                    multiline
                    rows={3}
                    helperText="Description for search engines (max 160 characters)"
                    inputProps={{ maxLength: 160 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="URL Slug"
                    value={seo.slug}
                    onChange={(e) => handleSeoChange("slug", e.target.value)}
                    variant="outlined"
                    placeholder="my-awesome-event"
                    helperText="URL-friendly version of event name"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Keywords"
                    value={seo.keywords.join(", ")}
                    onChange={(e) => handleSeoChange("keywords", e.target.value.split(",").map(k => k.trim()).filter(k => k))}
                    variant="outlined"
                    placeholder="music, concert, live, entertainment"
                    helperText="Comma-separated keywords"
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button
              type="submit"
              variant="outlined"
              color="primary"
              fullWidth
              disabled={isLoading}
              startIcon={isLoading && actionType === "save" ? <CircularProgress size={20} /> : <MdSave />}
              onClick={handleSaveDraft}
              sx={{ flex: 1 }}
            >
              {isLoading && actionType === "save" ? "Saving Draft..." : "Save Draft"}
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="success"
              fullWidth
              disabled={isLoading}
              startIcon={isLoading && actionType === "publish" ? <CircularProgress size={20} /> : <MdPublish />}
              onClick={handlePublish}
              sx={{ flex: 1 }}
            >
              {isLoading && actionType === "publish" ? "Publishing..." : "Publish Event"}
            </Button>
          </Box>
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center', color: 'text.secondary', py: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Event Not Found</Typography>
          <Typography variant="body2" sx={{ mb: 3 }}>
            The event you're looking for doesn't exist or you don't have permission to edit it.
          </Typography>
          <Button
            variant="contained"
            onClick={() => router.push("/shop/event")}
          >
            Back to Events
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default EditEvent;
