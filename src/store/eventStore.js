import { create } from "zustand";
import axios from "axios";
import { toast } from "react-toastify";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_SERVER || "http://localhost:8000/api/v2";

const useEventStore = create((set) => ({
  events: [],
  currentEvent: null,
  isLoading: false,
  error: null,

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

  fetchShopEvents: async (shopId, token) => {
    set({ isLoading: true, error: null });
    try {
      if (!token) {
        throw new Error("Authentication token missing");
      }
      const { data } = await axios.get(
        `${API_BASE_URL}/event/get-all-events/${shopId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      set({ events: data.events || [], isLoading: false });
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
}));

export default useEventStore;
