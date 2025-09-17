"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useShopStore from "@/store/shopStore";
import useEventStore from "@/store/eventStore";
import { toast } from "react-toastify";
import {
  Typography,
  Button,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Grid,
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  LinearProgress,
} from "@mui/material";
import { 
  AiOutlineEdit, 
  AiOutlineDelete, 
  AiOutlineCalendar,
  AiOutlineClockCircle,
  AiOutlineDollar,
  AiOutlineUser,
  AiOutlineSetting,
  AiOutlineFileText,
  AiOutlineBarChart,
  AiOutlineCamera,
  AiOutlineVideoCamera,
  AiOutlineTag,
  AiOutlineShop,
  AiOutlineEnvironment,
  AiOutlineCheckCircle,
  AiOutlineCloseCircle
} from "react-icons/ai";
import { MdPublish } from "react-icons/md";

const ViewEvent = ({ eventId }) => {
  const { seller, isSeller, sellerToken, isLoading: authLoading } = useShopStore();
  const { currentEvent, isLoading, error, fetchEvent, deleteEvent, publishEvent } =
    useEventStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);

  console.log("ViewEvent received eventId:", eventId);

  useEffect(() => {
    // Wait for authentication to load before checking
    if (authLoading) return;

    if (!eventId) {
      console.error("ViewEvent: No eventId provided");
      toast.error("Event ID is missing", { toastId: "no-event-id" });
      router.push("/shop/event");
      return;
    }

    if (!isSeller || !seller?._id || !sellerToken) {
      toast.error("Please log in as a seller", { toastId: "auth-error" });
      router.push("/shop/login");
      return;
    }

    const fetchData = async () => {
      try {
        await fetchEvent(eventId, sellerToken);
      } catch (err) {
        // Error handled by useEventStore
      }
    };

    fetchData();
  }, [eventId, isSeller, seller, sellerToken, authLoading, fetchEvent, router]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Published": return "success";
      case "Draft": return "warning";
      case "Cancelled": return "error";
      case "Completed": return "info";
      default: return "default";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this event?")) {
      try {
        await deleteEvent(eventId, sellerToken);
        router.push("/shop/event");
      } catch (err) {
        // Error handled by useEventStore
      }
    }
  };

  const handlePublish = async () => {
    if (confirm("Are you sure you want to publish this event? Once published, it will be visible to the public.")) {
      try {
        await publishEvent(eventId, sellerToken);
        // Refresh the event data to show updated status
        await fetchEvent(eventId, sellerToken);
      } catch (err) {
        // Error handled by useEventStore
      }
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <CircularProgress size={30} className="mr-2" />
        <Typography>Loading authentication...</Typography>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <CircularProgress size={30} className="mr-2" />
        <Typography>Loading event...</Typography>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600">
        <Typography variant="h6">{error}</Typography>
        <Button
          onClick={() => fetchEvent(eventId, sellerToken)}
          variant="contained"
          color="primary"
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (!currentEvent) {
    return (
      <div className="text-center text-gray-600">
        <Typography variant="h6">Event not found</Typography>
        <Link href="/shop/event">
          <Button variant="contained" color="primary" className="mt-4">
            Back to Events
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '1200px', mx: 'auto', p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 1 }}>
            {currentEvent.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              label={currentEvent.status}
              color={getStatusColor(currentEvent.status)}
              size="small"
            />
            <Typography variant="body2" color="text.secondary">
              {currentEvent.category} • {currentEvent.subcategory}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Link href={`/shop/event/edit-event/${eventId}`}>
            <Button variant="outlined" startIcon={<AiOutlineEdit />}>
              Edit
            </Button>
          </Link>
          {currentEvent.status === "Draft" && (
            <Button
              variant="contained"
              color="success"
              startIcon={<MdPublish />}
              onClick={handlePublish}
            >
              Publish Event
            </Button>
          )}
          <Button
            variant="outlined"
            color="error"
            startIcon={<AiOutlineDelete />}
            onClick={handleDelete}
          >
            Delete
          </Button>
          <Link href="/shop/event">
            <Button variant="contained" color="primary">
              Back to Events
            </Button>
          </Link>
        </Box>
      </Box>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="event details tabs">
            <Tab label="Overview" icon={<AiOutlineCalendar />} iconPosition="start" />
            <Tab label="Tickets" icon={<AiOutlineDollar />} iconPosition="start" />
            <Tab label="Venue" icon={<AiOutlineEnvironment />} iconPosition="start" />
            <Tab label="Settings" icon={<AiOutlineSetting />} iconPosition="start" />
            <Tab label="Policies" icon={<AiOutlineFileText />} iconPosition="start" />
            <Tab label="Analytics" icon={<AiOutlineBarChart />} iconPosition="start" />
            <Tab label="Media" icon={<AiOutlineCamera />} iconPosition="start" />
          </Tabs>
        </Box>

        <CardContent>
          {/* Overview Tab */}
          {activeTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Event Information
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon><AiOutlineFileText /></ListItemIcon>
                    <ListItemText 
                      primary="Description" 
                      secondary={currentEvent.description || "No description available"} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><AiOutlineCalendar /></ListItemIcon>
                    <ListItemText 
                      primary="Start Date" 
                      secondary={formatDate(currentEvent.start_Date)} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><AiOutlineClockCircle /></ListItemIcon>
                    <ListItemText 
                      primary="End Date" 
                      secondary={formatDate(currentEvent.Finish_Date)} 
                    />
                  </ListItem>
                  {currentEvent.doorsOpen && (
                    <ListItem>
                      <ListItemIcon><AiOutlineCheckCircle /></ListItemIcon>
                      <ListItemText 
                        primary="Doors Open" 
                        secondary={formatDate(currentEvent.doorsOpen)} 
                      />
                    </ListItem>
                  )}
                  {currentEvent.lastEntry && (
                    <ListItem>
                      <ListItemIcon><AiOutlineCloseCircle /></ListItemIcon>
                      <ListItemText 
                        primary="Last Entry" 
                        secondary={formatDate(currentEvent.lastEntry)} 
                      />
                    </ListItem>
                  )}
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Quick Stats
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Card variant="outlined" sx={{ 
                      borderColor: currentEvent.status === "Draft" ? "warning.main" : 
                                  currentEvent.status === "Published" ? "success.main" : "info.main",
                      backgroundColor: currentEvent.status === "Draft" ? "warning.light" : 
                                     currentEvent.status === "Published" ? "success.light" : "info.light"
                    }}>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Chip
                          label={currentEvent.status}
                          color={getStatusColor(currentEvent.status)}
                          size="large"
                          sx={{ mb: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {currentEvent.status === "Draft" && "Ready to publish"}
                          {currentEvent.status === "Published" && "Live and visible to public"}
                          {currentEvent.status === "Running" && "Event is currently active"}
                          {currentEvent.status === "Completed" && "Event has ended"}
                          {currentEvent.status === "Cancelled" && "Event has been cancelled"}
                        </Typography>
                        {currentEvent.status === "Draft" && (
                          <Button
                            variant="contained"
                            color="success"
                            startIcon={<MdPublish />}
                            onClick={handlePublish}
                            sx={{ mt: 1 }}
                            size="small"
                          >
                            Publish Now
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {currentEvent.totalCapacity || 0}
                        </Typography>
                        <Typography variant="body2">Total Capacity</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="success.main">
                          {currentEvent.totalSold || 0}
                        </Typography>
                        <Typography variant="body2">Tickets Sold</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="warning.main">
                          {formatCurrency(currentEvent.totalRevenue || 0)}
                        </Typography>
                        <Typography variant="body2">Total Revenue</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="info.main">
                          {currentEvent.analytics?.views || 0}
                        </Typography>
                        <Typography variant="body2">Views</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Tags
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {currentEvent.tags && currentEvent.tags.length > 0
                      ? currentEvent.tags.map((tag) => (
                          <Chip key={tag} label={tag} size="small" />
                        ))
                      : <Typography variant="body2" color="text.secondary">No tags</Typography>}
                  </Box>
                </Box>
              </Grid>
            </Grid>
          )}

          {/* Tickets Tab */}
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Ticket Tiers
              </Typography>
              {currentEvent.ticketTiers && currentEvent.ticketTiers.length > 0 ? (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Price</TableCell>
                        <TableCell>Original Price</TableCell>
                        <TableCell>Quantity</TableCell>
                        <TableCell>Sold</TableCell>
                        <TableCell>Available</TableCell>
                        <TableCell>Access Level</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {currentEvent.ticketTiers.map((tier, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Box>
                              <Typography variant="subtitle2">{tier.name}</Typography>
                              {tier.description && (
                                <Typography variant="body2" color="text.secondary">
                                  {tier.description}
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>{formatCurrency(tier.price)}</TableCell>
                          <TableCell>
                            {tier.originalPrice ? formatCurrency(tier.originalPrice) : '-'}
                          </TableCell>
                          <TableCell>{tier.quantity}</TableCell>
                          <TableCell>{tier.sold}</TableCell>
                          <TableCell>{tier.quantity - tier.sold}</TableCell>
                          <TableCell>
                            <Chip label={tier.accessLevel} size="small" />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={tier.isAvailable ? 'Available' : 'Sold Out'} 
                              color={tier.isAvailable ? 'success' : 'error'}
                              size="small" 
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No ticket tiers configured
                </Typography>
              )}
            </Box>
          )}

          {/* Venue Tab */}
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Venue Information
              </Typography>
              {currentEvent.venue ? (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <List>
                      <ListItem>
                        <ListItemIcon><AiOutlineEnvironment /></ListItemIcon>
                        <ListItemText 
                          primary="Venue Name" 
                          secondary={currentEvent.venue.name} 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><AiOutlineUser /></ListItemIcon>
                        <ListItemText 
                          primary="Capacity" 
                          secondary={currentEvent.venue.capacity?.toLocaleString()} 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><AiOutlineSetting /></ListItemIcon>
                        <ListItemText 
                          primary="Seating Type" 
                          secondary={currentEvent.venue.seatingType} 
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Address
                    </Typography>
                    <Typography variant="body2">
                      {currentEvent.venue.address?.street && `${currentEvent.venue.address.street}, `}
                      {currentEvent.venue.address?.city && `${currentEvent.venue.address.city}, `}
                      {currentEvent.venue.address?.state && `${currentEvent.venue.address.state} `}
                      {currentEvent.venue.address?.zipCode && `${currentEvent.venue.address.zipCode}`}
                      {currentEvent.venue.address?.country && `, ${currentEvent.venue.address.country}`}
                    </Typography>
                    
                    {currentEvent.venue.amenities && currentEvent.venue.amenities.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="h6" gutterBottom>
                          Amenities
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {currentEvent.venue.amenities.map((amenity, index) => (
                            <Chip key={index} label={amenity} size="small" />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Grid>
                </Grid>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No venue information available
                </Typography>
              )}
            </Box>
          )}

          {/* Settings Tab */}
          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Event Settings
              </Typography>
              {currentEvent.settings ? (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <List>
                      <ListItem>
                        <ListItemText 
                          primary="Allow Transfers" 
                          secondary={currentEvent.settings.allowTransfers ? 'Yes' : 'No'} 
                        />
                        <Chip 
                          label={currentEvent.settings.allowTransfers ? 'Enabled' : 'Disabled'} 
                          color={currentEvent.settings.allowTransfers ? 'success' : 'error'}
                          size="small" 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Allow Refunds" 
                          secondary={currentEvent.settings.allowRefunds ? 'Yes' : 'No'} 
                        />
                        <Chip 
                          label={currentEvent.settings.allowRefunds ? 'Enabled' : 'Disabled'} 
                          color={currentEvent.settings.allowRefunds ? 'success' : 'error'}
                          size="small" 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Send Reminders" 
                          secondary={currentEvent.settings.sendReminders ? 'Yes' : 'No'} 
                        />
                        <Chip 
                          label={currentEvent.settings.sendReminders ? 'Enabled' : 'Disabled'} 
                          color={currentEvent.settings.sendReminders ? 'success' : 'error'}
                          size="small" 
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <List>
                      <ListItem>
                        <ListItemText 
                          primary="Max Tickets Per User" 
                          secondary={currentEvent.settings.maxTicketsPerUser || 'No limit'} 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Check-in Required" 
                          secondary={currentEvent.settings.checkInRequired ? 'Yes' : 'No'} 
                        />
                        <Chip 
                          label={currentEvent.settings.checkInRequired ? 'Required' : 'Not Required'} 
                          color={currentEvent.settings.checkInRequired ? 'success' : 'error'}
                          size="small" 
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Require Approval" 
                          secondary={currentEvent.settings.requireApproval ? 'Yes' : 'No'} 
                        />
                        <Chip 
                          label={currentEvent.settings.requireApproval ? 'Required' : 'Not Required'} 
                          color={currentEvent.settings.requireApproval ? 'success' : 'error'}
                          size="small" 
                        />
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No settings configured
                </Typography>
              )}
            </Box>
          )}

          {/* Policies Tab */}
          {activeTab === 4 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Event Policies
              </Typography>
              {currentEvent.policies ? (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Refund Policy
                        </Typography>
                        <Typography variant="body2">
                          {currentEvent.policies.refundPolicy || 'No refund policy specified'}
                        </Typography>
                      </CardContent>
                    </Card>
                    <Card variant="outlined" sx={{ mt: 2 }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Transfer Policy
                        </Typography>
                        <Typography variant="body2">
                          {currentEvent.policies.transferPolicy || 'No transfer policy specified'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Age Restriction
                        </Typography>
                        <Typography variant="body2">
                          {currentEvent.policies.ageRestriction || 'No age restrictions'}
                        </Typography>
                      </CardContent>
                    </Card>
                    <Card variant="outlined" sx={{ mt: 2 }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Dress Code
                        </Typography>
                        <Typography variant="body2">
                          {currentEvent.policies.dressCode || 'No dress code specified'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No policies configured
                </Typography>
              )}
            </Box>
          )}

          {/* Analytics Tab */}
          {activeTab === 5 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Event Analytics
              </Typography>
              {currentEvent.analytics ? (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={3}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {currentEvent.analytics.views || 0}
                        </Typography>
                        <Typography variant="body2">Total Views</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="success.main">
                          {currentEvent.analytics.favorites || 0}
                        </Typography>
                        <Typography variant="body2">Favorites</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="info.main">
                          {currentEvent.analytics.shares || 0}
                        </Typography>
                        <Typography variant="body2">Shares</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="warning.main">
                          {((currentEvent.analytics.conversionRate || 0) * 100).toFixed(1)}%
                        </Typography>
                        <Typography variant="body2">Conversion Rate</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No analytics data available
                </Typography>
              )}
            </Box>
          )}

          {/* Media Tab */}
          {activeTab === 6 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Event Media
              </Typography>
              
              {/* Images */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Images
                </Typography>
                {currentEvent.images && currentEvent.images.length > 0 ? (
                  <Grid container spacing={2}>
                    {currentEvent.images.map((img, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card>
                          <Box
                            component="img"
                            src={img.url}
                            alt={`Event image ${index + 1}`}
                            sx={{
                              width: '100%',
                              height: 200,
                              objectFit: 'cover'
                            }}
                          />
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No images available
                  </Typography>
                )}
              </Box>

              {/* Videos */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Videos
                </Typography>
                {currentEvent.videos && currentEvent.videos.length > 0 ? (
                  <Grid container spacing={2}>
                    {currentEvent.videos.map((video, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card>
                          <CardContent>
                            <Typography variant="subtitle2" gutterBottom>
                              Video {index + 1}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {video.url}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No videos available
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ViewEvent;
