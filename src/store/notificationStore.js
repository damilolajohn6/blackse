import { create } from "zustand";
import axios from "axios";
import { toast } from "react-toastify";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_SERVER || "http://localhost:8000/api/v2";

const useNotificationStore = create((set, get) => ({
  notifications: [],
  notificationHistory: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },

  // Clear error state
  clearError: () => set({ error: null }),

  // Set loading state
  setLoading: (loading) => set({ isLoading: loading }),

  // Send event reminders
  sendEventReminders: async (eventId, reminderData, token) => {
    set({ isLoading: true, error: null });
    try {
      if (!token) {
        throw new Error("Authentication token missing");
      }
      const { data } = await axios.post(
        `${API_BASE_URL}/events-notifications/reminders/${eventId}`,
        reminderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      set({ isLoading: false });
      toast.success("Event reminders sent successfully!");
      return data.notification;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to send event reminders";
      console.error("sendEventReminders error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Send event cancellation
  sendEventCancellation: async (eventId, cancellationData, token) => {
    set({ isLoading: true, error: null });
    try {
      if (!token) {
        throw new Error("Authentication token missing");
      }
      const { data } = await axios.post(
        `${API_BASE_URL}/events-notifications/cancellation/${eventId}`,
        cancellationData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      set({ isLoading: false });
      toast.success("Event cancellation notification sent successfully!");
      return data.notification;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to send cancellation notification";
      console.error("sendEventCancellation error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Send event postponement
  sendEventPostponement: async (eventId, postponementData, token) => {
    set({ isLoading: true, error: null });
    try {
      if (!token) {
        throw new Error("Authentication token missing");
      }
      const { data } = await axios.post(
        `${API_BASE_URL}/events-notifications/postponement/${eventId}`,
        postponementData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      set({ isLoading: false });
      toast.success("Event postponement notification sent successfully!");
      return data.notification;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to send postponement notification";
      console.error("sendEventPostponement error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Send sold out notification
  sendSoldOutNotification: async (eventId, soldOutData, token) => {
    set({ isLoading: true, error: null });
    try {
      if (!token) {
        throw new Error("Authentication token missing");
      }
      const { data } = await axios.post(
        `${API_BASE_URL}/events-notifications/sold-out/${eventId}`,
        soldOutData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      set({ isLoading: false });
      toast.success("Sold out notification sent successfully!");
      return data.notification;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to send sold out notification";
      console.error("sendSoldOutNotification error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Send custom notification
  sendCustomNotification: async (eventId, customData, token) => {
    set({ isLoading: true, error: null });
    try {
      if (!token) {
        throw new Error("Authentication token missing");
      }
      const { data } = await axios.post(
        `${API_BASE_URL}/events-notifications/custom/${eventId}`,
        customData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      set({ isLoading: false });
      toast.success("Custom notification sent successfully!");
      return data.notification;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to send custom notification";
      console.error("sendCustomNotification error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Schedule automatic reminders
  scheduleAutomaticReminders: async (eventId, scheduleData, token) => {
    set({ isLoading: true, error: null });
    try {
      if (!token) {
        throw new Error("Authentication token missing");
      }
      const { data } = await axios.post(
        `${API_BASE_URL}/events-notifications/schedule/${eventId}`,
        scheduleData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      set({ isLoading: false });
      toast.success("Automatic reminders scheduled successfully!");
      return data.schedule;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to schedule automatic reminders";
      console.error("scheduleAutomaticReminders error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Get notification history
  getNotificationHistory: async (eventId, token, options = {}) => {
    set({ isLoading: true, error: null });
    try {
      if (!token) {
        throw new Error("Authentication token missing");
      }

      const {
        page = 1,
        limit = 10,
        type,
        status,
        startDate,
        endDate,
        sortBy = "createdAt",
        order = "desc",
      } = options;

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        order,
      });

      if (type) params.append("type", type);
      if (status) params.append("status", status);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      // If no eventId provided, get shop-level notification history
      const endpoint = eventId 
        ? `${API_BASE_URL}/events-notifications/history/${eventId}?${params}`
        : `${API_BASE_URL}/events-notifications/history?${params}`;

      const { data } = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      set({ 
        notificationHistory: data.notifications || [], 
        isLoading: false,
        pagination: {
          page: data.page || page,
          limit: data.pages ? Math.ceil(data.total / data.pages) : limit,
          total: data.total || 0,
          pages: data.pages || 0,
        }
      });
      return data.notifications;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to get notification history";
      console.error("getNotificationHistory error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ isLoading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  // Get notification templates
  getNotificationTemplates: async (token) => {
    set({ isLoading: true, error: null });
    try {
      if (!token) {
        throw new Error("Authentication token missing");
      }
      const { data } = await axios.get(
        `${API_BASE_URL}/events-notifications/templates`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      set({ isLoading: false });
      return data.templates;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to get notification templates";
      console.error("getNotificationTemplates error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ isLoading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  // Create notification template
  createNotificationTemplate: async (templateData, token) => {
    set({ isLoading: true, error: null });
    try {
      if (!token) {
        throw new Error("Authentication token missing");
      }
      const { data } = await axios.post(
        `${API_BASE_URL}/events-notifications/templates`,
        templateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      set({ isLoading: false });
      toast.success("Notification template created successfully!");
      return data.template;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to create notification template";
      console.error("createNotificationTemplate error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Update notification template
  updateNotificationTemplate: async (templateId, templateData, token) => {
    set({ isLoading: true, error: null });
    try {
      if (!token) {
        throw new Error("Authentication token missing");
      }
      const { data } = await axios.put(
        `${API_BASE_URL}/events-notifications/templates/${templateId}`,
        templateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      set({ isLoading: false });
      toast.success("Notification template updated successfully!");
      return data.template;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update notification template";
      console.error("updateNotificationTemplate error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Delete notification template
  deleteNotificationTemplate: async (templateId, token) => {
    set({ isLoading: true, error: null });
    try {
      if (!token) {
        throw new Error("Authentication token missing");
      }
      await axios.delete(
        `${API_BASE_URL}/events-notifications/templates/${templateId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      set({ isLoading: false });
      toast.success("Notification template deleted successfully!");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete notification template";
      console.error("deleteNotificationTemplate error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Get notification statistics
  getNotificationStats: async (eventId, token, options = {}) => {
    set({ isLoading: true, error: null });
    try {
      if (!token) {
        throw new Error("Authentication token missing");
      }

      const {
        startDate,
        endDate,
        groupBy = "day",
      } = options;

      const params = new URLSearchParams({
        groupBy,
      });

      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const { data } = await axios.get(
        `${API_BASE_URL}/events-notifications/stats/${eventId}?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      set({ isLoading: false });
      return data.stats;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to get notification statistics";
      console.error("getNotificationStats error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ isLoading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  // Reset store state
  resetStore: () => set({
    notifications: [],
    notificationHistory: [],
    isLoading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0,
    },
  }),

  // Get notifications by type
  getNotificationsByType: async (eventId, type, token, options = {}) => {
    return get().getNotificationHistory(eventId, token, { type, ...options });
  },

  // Get notifications by status
  getNotificationsByStatus: async (eventId, status, token, options = {}) => {
    return get().getNotificationHistory(eventId, token, { status, ...options });
  },

  // Send bulk notifications
  sendBulkNotifications: async (eventIds, notificationData, token) => {
    set({ isLoading: true, error: null });
    try {
      if (!token) {
        throw new Error("Authentication token missing");
      }
      const { data } = await axios.post(
        `${API_BASE_URL}/events-notifications/bulk`,
        { eventIds, ...notificationData },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      set({ isLoading: false });
      toast.success("Bulk notifications sent successfully!");
      return data.notifications;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to send bulk notifications";
      console.error("sendBulkNotifications error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },
}));

export default useNotificationStore;
