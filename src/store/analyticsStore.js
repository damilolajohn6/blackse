import { create } from "zustand";
import axios from "axios";
import { toast } from "react-toastify";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_SERVER || "http://localhost:8000/api/v2";

const useAnalyticsStore = create((set, get) => ({
  analytics: null,
  eventAnalytics: null,
  salesAnalytics: null,
  revenueAnalytics: null,
  attendeeAnalytics: null,
  shopAnalytics: null,
  isLoading: false,
  error: null,
  dateRange: {
    startDate: null,
    endDate: null,
  },

  // Clear error state
  clearError: () => set({ error: null }),

  // Set loading state
  setLoading: (loading) => set({ isLoading: loading }),

  // Set date range for analytics
  setDateRange: (startDate, endDate) => set({ 
    dateRange: { startDate, endDate } 
  }),

  // Get event analytics
  getEventAnalytics: async (eventId, token, options = {}) => {
    set({ isLoading: true, error: null });
    try {
      if (!token) {
        throw new Error("Authentication token missing");
      }

      const {
        startDate,
        endDate,
        groupBy = "day",
        includeRefunds = true,
      } = options;

      const params = new URLSearchParams({
        groupBy,
        includeRefunds: includeRefunds.toString(),
      });

      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const { data } = await axios.get(
        `${API_BASE_URL}/analytics/event/${eventId}?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      set({ 
        eventAnalytics: data.analytics, 
        isLoading: false 
      });
      return data.analytics;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to get event analytics";
      console.error("getEventAnalytics error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Get sales analytics
  getSalesAnalytics: async (token, options = {}) => {
    set({ isLoading: true, error: null });
    try {
      if (!token) {
        throw new Error("Authentication token missing");
      }

      const {
        startDate,
        endDate,
        groupBy = "day",
        eventId,
        ticketTier,
        includeRefunds = true,
      } = options;

      const params = new URLSearchParams({
        groupBy,
        includeRefunds: includeRefunds.toString(),
      });

      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (eventId) params.append("eventId", eventId);
      if (ticketTier) params.append("ticketTier", ticketTier);

      const { data } = await axios.get(
        `${API_BASE_URL}/analytics/sales?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      set({ 
        salesAnalytics: data.analytics, 
        isLoading: false 
      });
      return data.analytics;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to get sales analytics";
      console.error("getSalesAnalytics error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Get revenue analytics
  getRevenueAnalytics: async (token, options = {}) => {
    set({ isLoading: true, error: null });
    try {
      if (!token) {
        throw new Error("Authentication token missing");
      }

      const {
        startDate,
        endDate,
        groupBy = "month",
        includeRefunds = true,
        includeFees = true,
      } = options;

      const params = new URLSearchParams({
        groupBy,
        includeRefunds: includeRefunds.toString(),
        includeFees: includeFees.toString(),
      });

      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const { data } = await axios.get(
        `${API_BASE_URL}/analytics/revenue?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      set({ 
        revenueAnalytics: data.analytics, 
        isLoading: false 
      });
      return data.analytics;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to get revenue analytics";
      console.error("getRevenueAnalytics error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Get attendee analytics
  getAttendeeAnalytics: async (eventId, token, options = {}) => {
    set({ isLoading: true, error: null });
    try {
      if (!token) {
        throw new Error("Authentication token missing");
      }

      const {
        groupBy = "age",
        includeDemographics = true,
        includeGeographic = true,
      } = options;

      const params = new URLSearchParams({
        groupBy,
        includeDemographics: includeDemographics.toString(),
        includeGeographic: includeGeographic.toString(),
      });

      const { data } = await axios.get(
        `${API_BASE_URL}/analytics/attendees/${eventId}?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      set({ 
        attendeeAnalytics: data.analytics, 
        isLoading: false 
      });
      return data.analytics;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to get attendee analytics";
      console.error("getAttendeeAnalytics error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Get shop analytics
  getShopAnalytics: async (token, options = {}) => {
    set({ isLoading: true, error: null });
    try {
      if (!token) {
        throw new Error("Authentication token missing");
      }

      const {
        startDate,
        endDate,
        groupBy = "month",
        includeEvents = true,
        includeRevenue = true,
        includeAttendees = true,
      } = options;

      const params = new URLSearchParams({
        groupBy,
        includeEvents: includeEvents.toString(),
        includeRevenue: includeRevenue.toString(),
        includeAttendees: includeAttendees.toString(),
      });

      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const { data } = await axios.get(
        `${API_BASE_URL}/analytics/shop?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      set({ 
        shopAnalytics: data.analytics, 
        isLoading: false 
      });
      return data.analytics;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to get shop analytics";
      console.error("getShopAnalytics error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Export analytics data
  exportAnalyticsData: async (shopId, token, options = {}) => {
    set({ isLoading: true, error: null });
    try {
      if (!token) {
        throw new Error("Authentication token missing");
      }

      const {
        startDate,
        endDate,
        format = "csv",
        includeEvents = true,
        includeSales = true,
        includeRevenue = true,
        includeAttendees = true,
      } = options;

      const params = new URLSearchParams({
        format,
        includeEvents: includeEvents.toString(),
        includeSales: includeSales.toString(),
        includeRevenue: includeRevenue.toString(),
        includeAttendees: includeAttendees.toString(),
      });

      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await axios.get(
        `${API_BASE_URL}/analytics/export/${shopId}?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
          responseType: 'blob',
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics-export-${Date.now()}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      set({ isLoading: false });
      toast.success("Analytics data exported successfully!");
      return true;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to export analytics data";
      console.error("exportAnalyticsData error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Get platform analytics (admin only)
  getPlatformAnalytics: async (token, options = {}) => {
    set({ isLoading: true, error: null });
    try {
      if (!token) {
        throw new Error("Authentication token missing");
      }

      const {
        startDate,
        endDate,
        groupBy = "month",
        includeShops = true,
        includeEvents = true,
        includeRevenue = true,
      } = options;

      const params = new URLSearchParams({
        groupBy,
        includeShops: includeShops.toString(),
        includeEvents: includeEvents.toString(),
        includeRevenue: includeRevenue.toString(),
      });

      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const { data } = await axios.get(
        `${API_BASE_URL}/analytics/platform?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      set({ 
        analytics: data.analytics, 
        isLoading: false 
      });
      return data.analytics;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to get platform analytics";
      console.error("getPlatformAnalytics error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Reset store state
  resetStore: () => set({
    analytics: null,
    eventAnalytics: null,
    salesAnalytics: null,
    revenueAnalytics: null,
    attendeeAnalytics: null,
    shopAnalytics: null,
    isLoading: false,
    error: null,
    dateRange: {
      startDate: null,
      endDate: null,
    },
  }),

  // Get analytics summary
  getAnalyticsSummary: async (token, options = {}) => {
    try {
      const [sales, revenue, shop] = await Promise.all([
        get().getSalesAnalytics(token, options),
        get().getRevenueAnalytics(token, options),
        get().getShopAnalytics(token, options),
      ]);

      return {
        sales,
        revenue,
        shop,
        overview: {
          totalRevenue: revenue?.totalRevenue || 0,
          totalTicketsSold: sales?.totalTicketsSold || 0,
          totalEvents: shop?.totalEvents || 0,
          averageTicketPrice: sales?.averageTicketPrice || 0,
          averageRating: shop?.averageRating || 0,
          eventsTrend: shop?.eventsTrend || 0,
          revenueTrend: revenue?.revenueTrend || 0,
          ticketsTrend: sales?.ticketsTrend || 0,
        },
        recentActivity: sales?.recentActivity || [],
      };
    } catch (error) {
      console.error("getAnalyticsSummary error:", error);
      throw error;
    }
  },
}));

export default useAnalyticsStore;
