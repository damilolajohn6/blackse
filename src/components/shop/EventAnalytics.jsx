"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Tabs,
  Tab,
  Button,
  CircularProgress,
  Alert,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  Event as EventIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
} from "@mui/icons-material";
import useAnalyticsStore from "@/store/analyticsStore";
import useAuthStore from "@/store/shopStore";
import useEventStore from "@/store/eventStore";
import { toast } from "react-hot-toast";

const EventAnalytics = () => {
  const { sellerToken, seller } = useAuthStore();
  const { events } = useEventStore();
  const {
    analytics,
    isLoading,
    error,
    getEventAnalytics,
    getSalesAnalytics,
    getRevenueAnalytics,
    getAttendeeAnalytics,
    getShopAnalytics,
    exportAnalyticsData,
  } = useAnalyticsStore();

  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (sellerToken && seller) {
      loadAnalytics();
    }
  }, [sellerToken, seller, selectedEvent, dateRange]);

  const loadAnalytics = async () => {
    try {
      if (selectedEvent) {
        await getEventAnalytics(selectedEvent, sellerToken);
      } else {
        await getShopAnalytics(seller._id, sellerToken, dateRange);
      }
    } catch (error) {
      console.error("Failed to load analytics:", error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleEventSelect = (eventId) => {
    setSelectedEvent(eventId);
  };

  const handleExportData = async () => {
    try {
      const format = "csv"; // or "excel"
      await exportAnalyticsData(sellerToken, format, { shopId: seller._id, ...dateRange });
      toast.success("Analytics data exported successfully!");
    } catch (error) {
      toast.error("Failed to export analytics data");
    }
  };

  const StatCard = ({ title, value, icon, color = "primary", trend = null }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="text.secondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" color={`${color}.main`}>
              {value}
            </Typography>
            {trend && (
              <Box display="flex" alignItems="center" mt={1}>
                <TrendingUpIcon fontSize="small" color={trend > 0 ? "success" : "error"} />
                <Typography
                  variant="body2"
                  color={trend > 0 ? "success.main" : "error.main"}
                  sx={{ ml: 0.5 }}
                >
                  {Math.abs(trend)}%
                </Typography>
              </Box>
            )}
          </Box>
          <Box color={`${color}.main`}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

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

  return (
    <Box>
      {/* Header Controls */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="h5">
            {selectedEvent ? "Event Analytics" : "Shop Analytics"}
          </Typography>
          {selectedEvent && (
            <Chip
              label={`Event: ${events.find(e => e._id === selectedEvent)?.name || "Unknown"}`}
              color="primary"
              onDelete={() => setSelectedEvent(null)}
            />
          )}
        </Box>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadAnalytics}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleExportData}
          >
            Export Data
          </Button>
        </Box>
      </Box>

      {/* Event Selector */}
      {!selectedEvent && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Select Event for Detailed Analytics
            </Typography>
            <Grid container spacing={2}>
              {events?.slice(0, 6).map((event) => (
                <Grid item xs={12} sm={6} md={4} key={event._id}>
                  <Card
                    variant="outlined"
                    sx={{
                      cursor: "pointer",
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                    onClick={() => handleEventSelect(event._id)}
                  >
                    <CardContent>
                      <Typography variant="subtitle1" noWrap>
                        {event.name}
                      </Typography>
                      <Box display="flex" alignItems="center" mt={1}>
                        <CalendarIcon fontSize="small" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          {new Date(event.start_Date).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" mt={0.5}>
                        <LocationIcon fontSize="small" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {event.venue?.name || "TBD"}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Analytics Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={selectedTab} onChange={handleTabChange}>
            <Tab label="Overview" />
            <Tab label="Sales" />
            <Tab label="Revenue" />
            <Tab label="Attendees" />
            <Tab label="Events" />
          </Tabs>
        </Box>

        <CardContent>
          {/* Overview Tab */}
          {selectedTab === 0 && (
            <Box>
              <Grid container spacing={3} mb={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Total Events"
                    value={analytics?.overview?.totalEvents || 0}
                    icon={<EventIcon fontSize="large" />}
                    color="primary"
                    trend={analytics?.overview?.eventsTrend}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Total Revenue"
                    value={`$${(analytics?.overview?.totalRevenue || 0).toLocaleString()}`}
                    icon={<MoneyIcon fontSize="large" />}
                    color="success"
                    trend={analytics?.overview?.revenueTrend}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Total Tickets Sold"
                    value={(analytics?.overview?.totalTicketsSold || 0).toLocaleString()}
                    icon={<PeopleIcon fontSize="large" />}
                    color="info"
                    trend={analytics?.overview?.ticketsTrend}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Average Rating"
                    value={(analytics?.overview?.averageRating || 0).toFixed(1)}
                    icon={<TrendingUpIcon fontSize="large" />}
                    color="warning"
                  />
                </Grid>
              </Grid>

              {/* Recent Activity */}
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Event</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Tickets Sold</TableCell>
                      <TableCell>Revenue</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analytics?.recentActivity?.map((activity, index) => (
                      <TableRow key={index}>
                        <TableCell>{activity.eventName}</TableCell>
                        <TableCell>
                          {new Date(activity.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{activity.ticketsSold}</TableCell>
                        <TableCell>${activity.revenue.toLocaleString()}</TableCell>
                        <TableCell>
                          <Chip
                            label={activity.status}
                            color={activity.status === "Completed" ? "success" : "default"}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Sales Tab */}
          {selectedTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Sales Performance
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Sales by Event
                      </Typography>
                      {analytics?.sales?.byEvent?.map((sale, index) => (
                        <Box key={index} mb={2}>
                          <Box display="flex" justifyContent="space-between" mb={1}>
                            <Typography variant="body2">{sale.eventName}</Typography>
                            <Typography variant="body2">{sale.ticketsSold} tickets</Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={(sale.ticketsSold / analytics.sales.maxTickets) * 100}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Sales Trends
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Sales performance over the selected period
                      </Typography>
                      {/* Chart placeholder */}
                      <Box
                        height={200}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        bgcolor="grey.50"
                        borderRadius={1}
                        mt={2}
                      >
                        <Typography color="text.secondary">
                          Sales Chart (Chart.js integration needed)
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Revenue Tab */}
          {selectedTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Revenue Analytics
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <StatCard
                    title="Total Revenue"
                    value={`$${(analytics?.revenue?.total || 0).toLocaleString()}`}
                    icon={<MoneyIcon fontSize="large" />}
                    color="success"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <StatCard
                    title="Average per Event"
                    value={`$${(analytics?.revenue?.averagePerEvent || 0).toLocaleString()}`}
                    icon={<TrendingUpIcon fontSize="large" />}
                    color="primary"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <StatCard
                    title="Projected Monthly"
                    value={`$${(analytics?.revenue?.projectedMonthly || 0).toLocaleString()}`}
                    icon={<CalendarIcon fontSize="large" />}
                    color="info"
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Attendees Tab */}
          {selectedTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Attendee Analytics
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Demographics
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Age distribution, location, and preferences
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Engagement
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Check-in rates, feedback, and repeat attendance
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Events Tab */}
          {selectedTab === 4 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Event Performance
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Event Name</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Tickets Sold</TableCell>
                      <TableCell>Revenue</TableCell>
                      <TableCell>Rating</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {events?.map((event) => (
                      <TableRow key={event._id}>
                        <TableCell>{event.name}</TableCell>
                        <TableCell>
                          {new Date(event.start_Date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{event.ticketsSold || 0}</TableCell>
                        <TableCell>${(event.revenue || 0).toLocaleString()}</TableCell>
                        <TableCell>{event.averageRating || "N/A"}</TableCell>
                        <TableCell>
                          <Chip
                            label={event.status}
                            color={
                              event.status === "Published" ? "success" :
                              event.status === "Draft" ? "default" : "warning"
                            }
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default EventAnalytics;
