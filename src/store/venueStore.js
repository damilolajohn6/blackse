import { create } from "zustand";
import axios from "axios";
import { toast } from "react-toastify";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_SERVER || "http://localhost:8000/api/v2";

const useVenueStore = create((set, get) => ({
  venues: [],
  currentVenue: null,
  nearbyVenues: [],
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

  // Create venue
  createVenue: async (venueData, token) => {
    set({ isLoading: true, error: null });
    try {
      if (!token) {
        throw new Error("Authentication token missing");
      }
      const { data } = await axios.post(
        `${API_BASE_URL}/events-venues/create`,
        venueData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      set((state) => ({
        venues: [...state.venues, data.venue],
        isLoading: false,
      }));
      toast.success("Venue created successfully!");
      return data.venue;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to create venue";
      console.error("createVenue error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Get all venues
  getAllVenues: async (token, options = {}) => {
    set({ isLoading: true, error: null });
    try {
      if (!token) {
        throw new Error("Authentication token missing");
      }

      const {
        page = 1,
        limit = 10,
        city,
        state,
        country,
        capacity,
        amenities,
        sortBy = "createdAt",
        order = "desc",
      } = options;

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        order,
      });

      if (city) params.append("city", city);
      if (state) params.append("state", state);
      if (country) params.append("country", country);
      if (capacity) params.append("capacity", capacity);
      if (amenities) params.append("amenities", amenities);

      const { data } = await axios.get(
        `${API_BASE_URL}/events-venues/all?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      set({ 
        venues: data.venues || [], 
        isLoading: false,
        pagination: {
          page: data.page || page,
          limit: data.pages ? Math.ceil(data.total / data.pages) : limit,
          total: data.total || 0,
          pages: data.pages || 0,
        }
      });
      return data.venues;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch venues";
      console.error("getAllVenues error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ isLoading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  // Get venue by ID
  getVenueById: async (venueId, token) => {
    set({ isLoading: true, error: null, currentVenue: null });
    try {
      if (!token) {
        throw new Error("Authentication token missing");
      }
      const { data } = await axios.get(
        `${API_BASE_URL}/events-venues/${venueId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      set({ currentVenue: data.venue, isLoading: false });
      return data.venue;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch venue";
      console.error("getVenueById error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Update venue
  updateVenue: async (venueId, venueData, token) => {
    set({ isLoading: true, error: null });
    try {
      if (!token) {
        throw new Error("Authentication token missing");
      }
      const { data } = await axios.put(
        `${API_BASE_URL}/events-venues/update/${venueId}`,
        venueData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      set((state) => ({
        venues: state.venues.map((venue) =>
          venue._id === venueId ? data.venue : venue
        ),
        currentVenue:
          state.currentVenue?._id === venueId ? data.venue : state.currentVenue,
        isLoading: false,
      }));
      toast.success("Venue updated successfully!");
      return data.venue;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update venue";
      console.error("updateVenue error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Delete venue
  deleteVenue: async (venueId, token) => {
    set({ isLoading: true, error: null });
    try {
      if (!token) {
        throw new Error("Authentication token missing");
      }
      await axios.delete(`${API_BASE_URL}/events-venues/delete/${venueId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      set((state) => ({
        venues: state.venues.filter((venue) => venue._id !== venueId),
        currentVenue:
          state.currentVenue?._id === venueId ? null : state.currentVenue,
        isLoading: false,
      }));
      toast.success("Venue deleted successfully!");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete venue";
      console.error("deleteVenue error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Get nearby venues
  getNearbyVenues: async (lat, lng, maxDistance = 10000, limit = 10, token) => {
    set({ isLoading: true, error: null });
    try {
      if (!token) {
        throw new Error("Authentication token missing");
      }
      const { data } = await axios.get(
        `${API_BASE_URL}/events-venues/nearby?lat=${lat}&lng=${lng}&maxDistance=${maxDistance}&limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      set({ nearbyVenues: data.venues || [], isLoading: false });
      return data.venues;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to get nearby venues";
      console.error("getNearbyVenues error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ isLoading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  // Get my venues (seller's venues)
  getMyVenues: async (token, options = {}) => {
    set({ isLoading: true, error: null });
    try {
      if (!token) {
        throw new Error("Authentication token missing");
      }

      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        order = "desc",
      } = options;

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        order,
      });

      const { data } = await axios.get(
        `${API_BASE_URL}/events-venues/my-venues?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      set({ 
        venues: data.venues || [], 
        isLoading: false,
        pagination: {
          page: data.page || page,
          limit: data.pages ? Math.ceil(data.total / data.pages) : limit,
          total: data.total || 0,
          pages: data.pages || 0,
        }
      });
      return data.venues;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch my venues";
      console.error("getMyVenues error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ isLoading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  // Get available seats
  getAvailableSeats: async (venueId, eventId, token) => {
    set({ isLoading: true, error: null });
    try {
      if (!token) {
        throw new Error("Authentication token missing");
      }
      const { data } = await axios.get(
        `${API_BASE_URL}/events-venues/${venueId}/seats/available?eventId=${eventId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      set({ isLoading: false });
      return data.seats;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to get available seats";
      console.error("getAvailableSeats error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ isLoading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  // Reserve seats
  reserveSeats: async (venueId, seatData, token) => {
    set({ isLoading: true, error: null });
    try {
      if (!token) {
        throw new Error("Authentication token missing");
      }
      const { data } = await axios.post(
        `${API_BASE_URL}/events-venues/${venueId}/seats/reserve`,
        seatData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      set({ isLoading: false });
      toast.success("Seats reserved successfully!");
      return data.reservation;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to reserve seats";
      console.error("reserveSeats error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Release seats
  releaseSeats: async (venueId, reservationId, token) => {
    set({ isLoading: true, error: null });
    try {
      if (!token) {
        throw new Error("Authentication token missing");
      }
      await axios.post(
        `${API_BASE_URL}/events-venues/${venueId}/seats/release`,
        { reservationId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      set({ isLoading: false });
      toast.success("Seats released successfully!");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to release seats";
      console.error("releaseSeats error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Search venues
  searchVenues: async (searchParams, token) => {
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
        `${API_BASE_URL}/events-venues/search?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      
      set({ 
        venues: data.venues || [], 
        isLoading: false,
        pagination: {
          page: data.page || 1,
          limit: data.pages ? Math.ceil(data.total / data.pages) : 10,
          total: data.total || 0,
          pages: data.pages || 0,
        }
      });
      return data.venues;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to search venues";
      console.error("searchVenues error:", {
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
    venues: [],
    currentVenue: null,
    nearbyVenues: [],
    isLoading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0,
    },
  }),

  // Get venues by city
  getVenuesByCity: async (city, token, options = {}) => {
    return get().searchVenues({ city, ...options }, token);
  },

  // Get venues by capacity range
  getVenuesByCapacity: async (minCapacity, maxCapacity, token, options = {}) => {
    return get().searchVenues({ 
      minCapacity, 
      maxCapacity, 
      ...options 
    }, token);
  },
}));

export default useVenueStore;
