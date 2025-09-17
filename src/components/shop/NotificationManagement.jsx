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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  Switch,
  FormControlLabel,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  Send as SendIcon,
  Schedule as ScheduleIcon,
  History as HistoryIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  Notifications as NotificationIcon,
  Event as EventIcon,
  People as PeopleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import useNotificationStore from "@/store/notificationStore";
import useEventStore from "@/store/eventStore";
import useAuthStore from "@/store/shopStore";
import { toast } from "react-hot-toast";

const NotificationManagement = () => {
  const { sellerToken, seller } = useAuthStore();
  const { events } = useEventStore();
  const {
    notifications,
    templates,
    isLoading,
    error,
    sendEventReminders,
    sendEventCancellation,
    sendEventPostponement,
    sendSoldOutNotification,
    sendCustomNotification,
    scheduleAutomaticReminders,
    getNotificationHistory,
    getNotificationTemplates,
    createNotificationTemplate,
    sendBulkNotifications,
  } = useNotificationStore();

  const [selectedTab, setSelectedTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [notificationType, setNotificationType] = useState("reminder");
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    scheduledDate: "",
    recipients: "all",
    channels: ["email"],
    templateId: "",
  });

  useEffect(() => {
    if (sellerToken) {
      getNotificationHistory(null, sellerToken);
      getNotificationTemplates(sellerToken);
    }
  }, [sellerToken, getNotificationHistory, getNotificationTemplates]);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleOpenDialog = (type = "reminder") => {
    setNotificationType(type);
    setFormData({
      subject: "",
      message: "",
      scheduledDate: "",
      recipients: "all",
      channels: ["email"],
      templateId: "",
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEvent("");
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleChannelToggle = (channel) => {
    setFormData((prev) => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter((c) => c !== channel)
        : [...prev.channels, channel],
    }));
  };

  const handleSendNotification = async () => {
    if (!selectedEvent) {
      toast.error("Please select an event");
      return;
    }

    try {
      const event = events.find((e) => e._id === selectedEvent);
      if (!event) {
        toast.error("Event not found");
        return;
      }

      const notificationData = {
        eventId: selectedEvent,
        subject: formData.subject,
        message: formData.message,
        scheduledDate: formData.scheduledDate,
        recipients: formData.recipients,
        channels: formData.channels,
      };

      switch (notificationType) {
        case "reminder":
          await sendEventReminders(notificationData, sellerToken);
          break;
        case "cancellation":
          await sendEventCancellation(notificationData, sellerToken);
          break;
        case "postponement":
          await sendEventPostponement(notificationData, sellerToken);
          break;
        case "soldout":
          await sendSoldOutNotification(notificationData, sellerToken);
          break;
        case "custom":
          await sendCustomNotification(notificationData, sellerToken);
          break;
        default:
          throw new Error("Invalid notification type");
      }

      toast.success("Notification sent successfully!");
      handleCloseDialog();
    } catch (error) {
      toast.error(error.message || "Failed to send notification");
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "reminder":
        return <ScheduleIcon />;
      case "cancellation":
        return <WarningIcon />;
      case "postponement":
        return <EventIcon />;
      case "soldout":
        return <PeopleIcon />;
      case "custom":
        return <NotificationIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "reminder":
        return "primary";
      case "cancellation":
        return "error";
      case "postponement":
        return "warning";
      case "soldout":
        return "success";
      case "custom":
        return "info";
      default:
        return "default";
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

  return (
    <Box>
      {/* Quick Actions */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card
            sx={{
              cursor: "pointer",
              "&:hover": { bgcolor: "action.hover" },
            }}
            onClick={() => handleOpenDialog("reminder")}
          >
            <CardContent sx={{ textAlign: "center" }}>
              <ScheduleIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="subtitle1">Send Reminder</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card
            sx={{
              cursor: "pointer",
              "&:hover": { bgcolor: "action.hover" },
            }}
            onClick={() => handleOpenDialog("cancellation")}
          >
            <CardContent sx={{ textAlign: "center" }}>
              <WarningIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="subtitle1">Event Cancellation</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card
            sx={{
              cursor: "pointer",
              "&:hover": { bgcolor: "action.hover" },
            }}
            onClick={() => handleOpenDialog("postponement")}
          >
            <CardContent sx={{ textAlign: "center" }}>
              <EventIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="subtitle1">Event Postponement</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card
            sx={{
              cursor: "pointer",
              "&:hover": { bgcolor: "action.hover" },
            }}
            onClick={() => handleOpenDialog("soldout")}
          >
            <CardContent sx={{ textAlign: "center" }}>
              <PeopleIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="subtitle1">Sold Out Alert</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card
            sx={{
              cursor: "pointer",
              "&:hover": { bgcolor: "action.hover" },
            }}
            onClick={() => handleOpenDialog("custom")}
          >
            <CardContent sx={{ textAlign: "center" }}>
              <NotificationIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="subtitle1">Custom Message</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={selectedTab} onChange={handleTabChange}>
            <Tab label="Send Notifications" />
            <Tab label="Templates" />
            <Tab label="History" />
            <Tab label="Settings" />
          </Tabs>
        </Box>

        <CardContent>
          {/* Send Notifications Tab */}
          {selectedTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Send Notifications
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Event Selection
                      </Typography>
                      <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Select Event</InputLabel>
                        <Select
                          value={selectedEvent}
                          onChange={(e) => setSelectedEvent(e.target.value)}
                          label="Select Event"
                        >
                          {events?.map((event) => (
                            <MenuItem key={event._id} value={event._id}>
                              {event.name} - {new Date(event.start_Date).toLocaleDateString()}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <Typography variant="body2" color="text.secondary">
                        Choose an event to send notifications to its attendees
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Quick Actions
                      </Typography>
                      <Box display="flex" flexDirection="column" gap={1}>
                        <Button
                          variant="outlined"
                          startIcon={<ScheduleIcon />}
                          onClick={() => handleOpenDialog("reminder")}
                          disabled={!selectedEvent}
                        >
                          Send Event Reminder
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<WarningIcon />}
                          onClick={() => handleOpenDialog("cancellation")}
                          disabled={!selectedEvent}
                        >
                          Cancel Event
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<EventIcon />}
                          onClick={() => handleOpenDialog("postponement")}
                          disabled={!selectedEvent}
                        >
                          Postpone Event
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<NotificationIcon />}
                          onClick={() => handleOpenDialog("custom")}
                          disabled={!selectedEvent}
                        >
                          Send Custom Message
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Templates Tab */}
          {selectedTab === 1 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6">Notification Templates</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => {/* TODO: Open template creation dialog */}}
                >
                  Create Template
                </Button>
              </Box>
              <Grid container spacing={2}>
                {templates?.map((template) => (
                  <Grid item xs={12} sm={6} md={4} key={template._id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {template.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={2}>
                          {template.description}
                        </Typography>
                        <Chip
                          label={template.type}
                          color={getNotificationColor(template.type)}
                          size="small"
                        />
                        <Box display="flex" justifyContent="flex-end" mt={2}>
                          <IconButton size="small">
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small" color="error">
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* History Tab */}
          {selectedTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Notification History
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Type</TableCell>
                      <TableCell>Event</TableCell>
                      <TableCell>Subject</TableCell>
                      <TableCell>Recipients</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Sent Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {notifications?.map((notification) => (
                      <TableRow key={notification._id}>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            {getNotificationIcon(notification.type)}
                            <Typography variant="body2" sx={{ ml: 1 }}>
                              {notification.type}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{notification.eventName}</TableCell>
                        <TableCell>{notification.subject}</TableCell>
                        <TableCell>{notification.recipientCount}</TableCell>
                        <TableCell>
                          <Chip
                            label={notification.status}
                            color={notification.status === "Sent" ? "success" : "default"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(notification.sentAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <IconButton size="small">
                            <EditIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Settings Tab */}
          {selectedTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Notification Settings
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Automatic Reminders
                      </Typography>
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="Send automatic reminders 24 hours before event"
                      />
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="Send automatic reminders 1 hour before event"
                      />
                      <FormControlLabel
                        control={<Switch />}
                        label="Send follow-up messages after event"
                      />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Communication Preferences
                      </Typography>
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="Email notifications"
                      />
                      <FormControlLabel
                        control={<Switch />}
                        label="SMS notifications"
                      />
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="Push notifications"
                      />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Send Notification Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              Send {notificationType.charAt(0).toUpperCase() + notificationType.slice(1)} Notification
            </Typography>
            <IconButton onClick={handleCloseDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subject"
                value={formData.subject}
                onChange={(e) => handleInputChange("subject", e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Message"
                multiline
                rows={4}
                value={formData.message}
                onChange={(e) => handleInputChange("message", e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Scheduled Date (Optional)"
                type="datetime-local"
                value={formData.scheduledDate}
                onChange={(e) => handleInputChange("scheduledDate", e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Recipients</InputLabel>
                <Select
                  value={formData.recipients}
                  onChange={(e) => handleInputChange("recipients", e.target.value)}
                  label="Recipients"
                >
                  <MenuItem value="all">All Attendees</MenuItem>
                  <MenuItem value="paid">Paid Attendees Only</MenuItem>
                  <MenuItem value="unpaid">Unpaid Attendees Only</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Communication Channels
              </Typography>
              <Box display="flex" gap={1}>
                <Chip
                  label="Email"
                  clickable
                  color={formData.channels.includes("email") ? "primary" : "default"}
                  onClick={() => handleChannelToggle("email")}
                  icon={<EmailIcon />}
                />
                <Chip
                  label="SMS"
                  clickable
                  color={formData.channels.includes("sms") ? "primary" : "default"}
                  onClick={() => handleChannelToggle("sms")}
                  icon={<SmsIcon />}
                />
                <Chip
                  label="Push"
                  clickable
                  color={formData.channels.includes("push") ? "primary" : "default"}
                  onClick={() => handleChannelToggle("push")}
                  icon={<NotificationIcon />}
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSendNotification}
            startIcon={<SendIcon />}
          >
            Send Notification
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NotificationManagement;
