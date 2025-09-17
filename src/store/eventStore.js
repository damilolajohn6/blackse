import { create } from "zustand";
import axios from "axios";
import { toast } from "react-toastify";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_SERVER || "http://localhost:8000/api/v2";

const useEventStore = create((set, get) => ({
  events: [],
  currentEvent: null,
  isLoading: false,
  error: null,
  analytics: null,
  eventStats: null,
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

  // Create event
  createEvent: async (eventData, token) => {
    set({ isLoading: true, error: null });
    try {
      if (!token) {
        throw new Error("Authentication token missing");
      }
      const { data } = await axios.post(
        `${API_BASE_URL}/event/create-event`,
        eventData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      set((state) => ({
        events: [...state.events, data.event],
        isLoading: false,
      }));
      toast.success("Event created successfully!");
      return data.event;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to create event";
      console.error("createEvent error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Fetch single event
  fetchEvent: async (eventId, token) => {
    set({ isLoading: true, error: null, currentEvent: null });
    try {
      if (!token) {
        throw new Error("Authentication token missing");
      }
      const { data } = await axios.get(
        `${API_BASE_URL}/event/get-event/${eventId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      set({ currentEvent: data.event, isLoading: false });
      return data.event;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch event";
      console.error("fetchEvent error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Fetch shop events with pagination and filters
  fetchShopEvents: async (shopId, token, options = {}) => {
    set({ isLoading: true, error: null });
    try {
      if (!token) {
        throw new Error("Authentication token missing");
      }
      
      const {
        page = 1,
        limit = 10,
        status,
        category,
        sortBy = "createdAt",
        order = "desc",
      } = options;

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        order,
      });

      if (status) params.append("status", status);
      if (category) params.append("category", category);

      const { data } = await axios.get(
        `${API_BASE_URL}/event/get-all-events/${shopId}?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      
      set({ 
        events: data.events || [], 
        isLoading: false,
        pagination: {
          page: data.page || page,
          limit: data.pages ? Math.ceil(data.total / data.pages) : limit,
          total: data.total || 0,
          pages: data.pages || 0,
        }
      });
      return data.events;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch events";
      console.error("fetchShopEvents error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ isLoading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  // Update event
  updateEvent: async (eventId, eventData, token) => {
    set({ isLoading: true, error: null });
    try {
      if (!token) {
        throw new Error("Authentication token missing");
      }
      const { data } = await axios.put(
        `${API_BASE_URL}/event/update-event/${eventId}`,
        eventData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      set((state) => ({
        events: state.events.map((event) =>
          event._id === eventId ? data.event : event
        ),
        currentEvent:
          state.currentEvent?._id === eventId ? data.event : state.currentEvent,
        isLoading: false,
      }));
      toast.success("Event updated successfully!");
      return data.event;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update event";
      console.error("updateEvent error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Delete event
  deleteEvent: async (eventId, token) => {
    set({ isLoading: true, error: null });
    try {
      if (!token) {
        throw new Error("Authentication token missing");
      }
      await axios.delete(`${API_BASE_URL}/event/delete-shop-event/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      set((state) => ({
        events: state.events.filter((event) => event._id !== eventId),
        currentEvent:
          state.currentEvent?._id === eventId ? null : state.currentEvent,
        isLoading: false,
      }));
      toast.success("Event deleted successfully!");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete event";
      console.error("deleteEvent error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Publish event
  publishEvent: async (eventId, token) => {
    set({ isLoading: true, error: null });
    try {
      if (!token) {
        throw new Error("Authentication token missing");
      }
      const { data } = await axios.put(
        `${API_BASE_URL}/event/publish/${eventId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      set((state) => ({
        events: state.events.map((event) =>
          event._id === eventId ? data.event : event
        ),
        currentEvent:
          state.currentEvent?._id === eventId ? data.event : state.currentEvent,
        isLoading: false,
      }));
      toast.success("Event published successfully!");
      return data.event;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to publish event";
      console.error("publishEvent error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Get event availability
  getEventAvailability: async (eventId, token) => {
    set({ isLoading: true, error: null });
    try {
      if (!token) {
        throw new Error("Authentication token missing");
      }
      const { data } = await axios.get(
        `${API_BASE_URL}/event/availability/${eventId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      set({ isLoading: false });
      return data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to get event availability";
      console.error("getEventAvailability error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ isLoading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  // Calculate pricing
  calculatePricing: async (eventId, tierName, quantity = 1, token) => {
    set({ isLoading: true, error: null });
    try {
      if (!token) {
        throw new Error("Authentication token missing");
      }
      const { data } = await axios.post(
        `${API_BASE_URL}/event/calculate-pricing/${eventId}`,
        { tierName, quantity },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      set({ isLoading: false });
      return data.pricing;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to calculate pricing";
      console.error("calculatePricing error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ isLoading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  // Get event statistics
  getEventStats: async (eventId, token) => {
    set({ isLoading: true, error: null });
    try {
      if (!token) {
        throw new Error("Authentication token missing");
      }
      const { data } = await axios.get(
        `${API_BASE_URL}/event/stats/${eventId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      set({ eventStats: data.stats, isLoading: false });
      return data.stats;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to get event statistics";
      console.error("getEventStats error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ isLoading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  // Search events
  searchEvents: async (searchParams, token) => {
    set({ isLoading: true, error: null });
    try {
      if (!token) {
        throw new Error("Authentication token missing");
      }
      
      const params = new URLSearchParams();
      Object.keys(searchParams).forEach(key => {
        if (searchParams[key] !== undefined && searchParams[key] !== null && searchParams[key] !== '') {
          params.append(key, searchParams[key]);
        }
      });

      const { data } = await axios.get(
        `${API_BASE_URL}/event/search?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      
      set({ 
        events: data.events || [], 
        isLoading: false,
        pagination: {
          page: data.page || 1,
          limit: data.pages ? Math.ceil(data.total / data.pages) : 10,
          total: data.total || 0,
          pages: data.pages || 0,
        }
      });
      return data.events;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to search events";
      console.error("searchEvents error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ isLoading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  // Get nearby events
  getNearbyEvents: async (lat, lng, maxDistance = 10000, limit = 10, token) => {
    set({ isLoading: true, error: null });
    try {
      if (!token) {
        throw new Error("Authentication token missing");
      }
      const { data } = await axios.get(
        `${API_BASE_URL}/event/nearby?lat=${lat}&lng=${lng}&maxDistance=${maxDistance}&limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      set({ events: data.events || [], isLoading: false });
      return data.events;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to get nearby events";
      console.error("getNearbyEvents error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ isLoading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  // Get events by date range
  getEventsByDateRange: async (startDate, endDate, page = 1, limit = 10, token) => {
    set({ isLoading: true, error: null });
    try {
      if (!token) {
        throw new Error("Authentication token missing");
      }
      const { data } = await axios.get(
        `${API_BASE_URL}/event/by-date-range?startDate=${startDate}&endDate=${endDate}&page=${page}&limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      set({ 
        events: data.events || [], 
        isLoading: false,
        pagination: {
          page: data.page || page,
          limit: data.pages ? Math.ceil(data.total / data.pages) : limit,
          total: data.total || 0,
          pages: data.pages || 0,
        }
      });
      return data.events;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to get events by date range";
      console.error("getEventsByDateRange error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ isLoading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  // Get popular events
  getPopularEvents: async (limit = 10, token) => {
    set({ isLoading: true, error: null });
    try {
      if (!token) {
        throw new Error("Authentication token missing");
      }
      const { data } = await axios.get(
        `${API_BASE_URL}/event/popular?limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      set({ events: data.events || [], isLoading: false });
      return data.events;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to get popular events";
      console.error("getPopularEvents error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ isLoading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  // Get event by slug
  getEventBySlug: async (slug, token) => {
    set({ isLoading: true, error: null, currentEvent: null });
    try {
      if (!token) {
        throw new Error("Authentication token missing");
      }
      const { data } = await axios.get(
        `${API_BASE_URL}/event/slug/${slug}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      set({ currentEvent: data.event, isLoading: false });
      return data.event;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to get event by slug";
      console.error("getEventBySlug error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ isLoading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  // Test Cloudinary configuration
  testCloudinary: async (token) => {
    set({ isLoading: true, error: null });
    try {
      if (!token) {
        throw new Error("Authentication token missing");
      }
      const { data } = await axios.get(
        `${API_BASE_URL}/event/test-cloudinary`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      set({ isLoading: false });
      return data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to test Cloudinary configuration";
      console.error("testCloudinary error:", {
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
    events: [],
    currentEvent: null,
    isLoading: false,
    error: null,
    analytics: null,
    eventStats: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0,
    },
  }),

  // Get events by status
  getEventsByStatus: async (status, shopId, token, options = {}) => {
    return get().fetchShopEvents(shopId, token, { ...options, status });
  },

  // Get events by category
  getEventsByCategory: async (category, shopId, token, options = {}) => {
    return get().fetchShopEvents(shopId, token, { ...options, category });
  },
}));

export default useEventStore;
