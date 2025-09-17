"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  Analytics as AnalyticsIcon,
  Notifications as NotificationIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  Publish as PublishIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import useEventStore from "@/store/eventStore";
import useAnalyticsStore from "@/store/analyticsStore";
import useAuthStore from "@/store/shopStore";

const EventManagementDashboard = () => {
  const router = useRouter();
  const { sellerToken, seller } = useAuthStore();
  const { events, isLoading: eventsLoading, publishEvent, fetchShopEvents } = useEventStore();
  const { analytics, isLoading: analyticsLoading, getAnalyticsSummary } = useAnalyticsStore();

  useEffect(() => {
    if (sellerToken && seller) {
      getAnalyticsSummary(sellerToken, { shopId: seller._id });
    }
  }, [sellerToken, seller, getAnalyticsSummary]);

  const quickActions = [
    {
      title: "Create Event",
      description: "Create a new event",
      icon: <AddIcon />,
      color: "primary",
      path: "/shop/event/create",
    },
    {
      title: "Manage Venues",
      description: "Manage your venues",
      icon: <LocationIcon />,
      color: "success",
      path: "/shop/event/venues",
    },
    {
      title: "Analytics",
      description: "View event analytics",
      icon: <AnalyticsIcon />,
      color: "info",
      path: "/shop/event/analytics",
    },
    {
      title: "Notifications",
      description: "Send notifications",
      icon: <NotificationIcon />,
      color: "warning",
      path: "/shop/event/notifications",
    },
  ];

  const statsCards = [
    {
      title: "Total Events",
      value: events?.length || 0,
      icon: <EventIcon />,
      color: "primary",
    },
    {
      title: "Published Events",
      value: events?.filter(e => e.status === "Published").length || 0,
      icon: <CalendarIcon />,
      color: "success",
    },
    {
      title: "Total Revenue",
      value: `$${(analytics?.overview?.totalRevenue || 0).toLocaleString()}`,
      icon: <MoneyIcon />,
      color: "info",
    },
    {
      title: "Total Attendees",
      value: (analytics?.overview?.totalTicketsSold || 0).toLocaleString(),
      icon: <PeopleIcon />,
      color: "warning",
    },
  ];

  const handleNavigation = (path) => {
    router.push(path);
  };

  const handlePublish = async (eventId) => {
    if (confirm("Are you sure you want to publish this event? Once published, it will be visible to the public.")) {
      try {
        await publishEvent(eventId, sellerToken);
        // Refresh the events list to show updated status
        if (seller?._id) {
          await fetchShopEvents(seller._id, sellerToken);
        }
      } catch (err) {
        // Error handled by useEventStore
      }
    }
  };

  return (
    <Box sx={{ mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Event Management Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your events, venues, analytics, and notifications
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" component="div" color={`${stat.color}.main`}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: `${stat.color}.main` }}>
                    {stat.icon}
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
        Quick Actions
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {quickActions.map((action, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 4,
                },
              }}
              onClick={() => handleNavigation(action.path)}
            >
              <CardContent sx={{ textAlign: "center", p: 3 }}>
                <Avatar
                  sx={{
                    bgcolor: `${action.color}.main`,
                    width: 56,
                    height: 56,
                    mx: "auto",
                    mb: 2,
                  }}
                >
                  {action.icon}
                </Avatar>
                <Typography variant="h6" component="h3" gutterBottom>
                  {action.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {action.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Events Preview */}
      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
        Recent Events
      </Typography>
      <Card>
        <CardContent>
          {eventsLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <Typography>Loading events...</Typography>
            </Box>
          ) : events?.length > 0 ? (
            <Grid container spacing={2}>
              {events?.slice(0, 4).map((event) => (
                <Grid item xs={12} sm={6} md={3} key={event._id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" noWrap gutterBottom>
                        {event.name}
                      </Typography>
                      <Box display="flex" alignItems="center" mb={1}>
                        <CalendarIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
                        <Typography variant="body2" color="text.secondary">
                          {new Date(event.start_Date).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" mb={1}>
                        <LocationIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {event.venue?.name || "TBD"}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Chip
                          label={event.status}
                          color={
                            event.status === "Published" ? "success" :
                            event.status === "Draft" ? "default" : "warning"
                          }
                          size="small"
                        />
                        <Typography variant="body2" color="text.secondary">
                          ${(event.price || 0).toLocaleString()}
                        </Typography>
                      </Box>
                      
                      {/* Action Buttons */}
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box display="flex" gap={1}>
                          <Tooltip title="View Event">
                            <IconButton
                              size="small"
                              onClick={() => handleNavigation(`/shop/event/${event._id}`)}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Event">
                            <IconButton
                              size="small"
                              onClick={() => handleNavigation(`/shop/event/edit-event/${event._id}`)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {event.status === "Draft" && (
                            <Tooltip title="Publish Event">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handlePublish(event._id)}
                              >
                                <PublishIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box textAlign="center" py={4}>
              <EventIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No events found
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Create your first event to get started
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleNavigation("/shop/event/create")}
              >
                Create Event
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default EventManagementDashboard;
