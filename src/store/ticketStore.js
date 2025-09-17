import { create } from "zustand";
import axios from "axios";
import { toast } from "react-toastify";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_SERVER || "http://localhost:8000/api/v2";

const useTicketStore = create((set, get) => ({
  tickets: [],
  currentTicket: null,
  ticketAnalytics: null,
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

  // Purchase tickets
  purchaseTickets: async (ticketData, token) => {
    set({ isLoading: true, error: null });
    try {
      if (!token) {
        throw new Error("Authentication token missing");
      }
      const { data } = await axios.post(
        `${API_BASE_URL}/events-tickets/purchase`,
        ticketData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      set((state) => ({
        tickets: [...state.tickets, ...data.tickets],
        isLoading: false,
      }));
      toast.success("Tickets purchased successfully!");
      return data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to purchase tickets";
      console.error("purchaseTickets error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Get my tickets
  getMyTickets: async (token, options = {}) => {
    set({ isLoading: true, error: null });
    try {
      if (!token) {
        throw new Error("Authentication token missing");
      }

      const {
        page = 1,
        limit = 10,
        status,
        eventId,
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
      if (eventId) params.append("eventId", eventId);

      const { data } = await axios.get(
        `${API_BASE_URL}/events-tickets/my-tickets?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      set({ 
        tickets: data.tickets || [], 
        isLoading: false,
        pagination: {
          page: data.page || page,
          limit: data.pages ? Math.ceil(data.total / data.pages) : limit,
          total: data.total || 0,
          pages: data.pages || 0,
        }
      });
      return data.tickets;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch tickets";
      console.error("getMyTickets error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ isLoading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  // Get ticket details
  getTicketDetails: async (ticketId, token) => {
    set({ isLoading: true, error: null, currentTicket: null });
    try {
      if (!token) {
        throw new Error("Authentication token missing");
      }
      const { data } = await axios.get(
        `${API_BASE_URL}/events-tickets/${ticketId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      set({ currentTicket: data.ticket, isLoading: false });
      return data.ticket;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch ticket details";
      console.error("getTicketDetails error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Validate ticket
  validateTicket: async (ticketId, validationData, token) => {
    set({ isLoading: true, error: null });
    try {
      if (!token) {
        throw new Error("Authentication token missing");
      }
      const { data } = await axios.post(
        `${API_BASE_URL}/events-tickets/${ticketId}/validate`,
        validationData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      set({ isLoading: false });
      toast.success("Ticket validated successfully!");
      return data.validation;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to validate ticket";
      console.error("validateTicket error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Transfer ticket
  transferTicket: async (ticketId, transferData, token) => {
    set({ isLoading: true, error: null });
    try {
      if (!token) {
        throw new Error("Authentication token missing");
      }
      const { data } = await axios.post(
        `${API_BASE_URL}/events-tickets/${ticketId}/transfer`,
        transferData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      set((state) => ({
        tickets: state.tickets.map((ticket) =>
          ticket._id === ticketId ? data.ticket : ticket
        ),
        currentTicket:
          state.currentTicket?._id === ticketId ? data.ticket : state.currentTicket,
        isLoading: false,
      }));
      toast.success("Ticket transferred successfully!");
      return data.ticket;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to transfer ticket";
      console.error("transferTicket error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Refund tickets
  refundTickets: async (ticketIds, refundData, token) => {
    set({ isLoading: true, error: null });
    try {
      if (!token) {
        throw new Error("Authentication token missing");
      }
      const { data } = await axios.post(
        `${API_BASE_URL}/events-tickets/refund`,
        { ticketIds, ...refundData },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      set((state) => ({
        tickets: state.tickets.map((ticket) =>
          ticketIds.includes(ticket._id) ? data.tickets.find(t => t._id === ticket._id) || ticket : ticket
        ),
        isLoading: false,
      }));
      toast.success("Tickets refunded successfully!");
      return data.refund;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to refund tickets";
      console.error("refundTickets error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Check ticket availability
  checkTicketAvailability: async (eventId, tierName, quantity, token) => {
    set({ isLoading: true, error: null });
    try {
      if (!token) {
        throw new Error("Authentication token missing");
      }
      const { data } = await axios.get(
        `${API_BASE_URL}/events-tickets/availability/${eventId}?tierName=${tierName}&quantity=${quantity}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      set({ isLoading: false });
      return data.availability;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to check ticket availability";
      console.error("checkTicketAvailability error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ isLoading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  // Get ticket analytics
  getTicketAnalytics: async (eventId, token, options = {}) => {
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
        `${API_BASE_URL}/events-tickets/analytics/${eventId}?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      set({ 
        ticketAnalytics: data.analytics, 
        isLoading: false 
      });
      return data.analytics;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to get ticket analytics";
      console.error("getTicketAnalytics error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ isLoading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  // Generate ticket PDF
  generateTicketPDF: async (ticketId, token) => {
    set({ isLoading: true, error: null });
    try {
      if (!token) {
        throw new Error("Authentication token missing");
      }
      const response = await axios.get(
        `${API_BASE_URL}/events-tickets/${ticketId}/pdf`,
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
      link.setAttribute('download', `ticket-${ticketId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      set({ isLoading: false });
      toast.success("Ticket PDF generated successfully!");
      return true;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to generate ticket PDF";
      console.error("generateTicketPDF error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Search tickets
  searchTickets: async (searchParams, token) => {
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
        `${API_BASE_URL}/events-tickets/search?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      
      set({ 
        tickets: data.tickets || [], 
        isLoading: false,
        pagination: {
          page: data.page || 1,
          limit: data.pages ? Math.ceil(data.total / data.pages) : 10,
          total: data.total || 0,
          pages: data.pages || 0,
        }
      });
      return data.tickets;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to search tickets";
      console.error("searchTickets error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ isLoading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  // Get tickets by event
  getTicketsByEvent: async (eventId, token, options = {}) => {
    return get().searchTickets({ eventId, ...options }, token);
  },

  // Get tickets by status
  getTicketsByStatus: async (status, token, options = {}) => {
    return get().searchTickets({ status, ...options }, token);
  },

  // Get tickets by user
  getTicketsByUser: async (userId, token, options = {}) => {
    return get().searchTickets({ userId, ...options }, token);
  },

  // Reset store state
  resetStore: () => set({
    tickets: [],
    currentTicket: null,
    ticketAnalytics: null,
    isLoading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0,
    },
  }),

  // Get ticket summary
  getTicketSummary: async (eventId, token) => {
    try {
      const analytics = await get().getTicketAnalytics(eventId, token);
      const availability = await get().checkTicketAvailability(eventId, null, null, token);
      
      return {
        analytics,
        availability,
        summary: {
          totalTicketsSold: analytics?.totalTicketsSold || 0,
          totalRevenue: analytics?.totalRevenue || 0,
          availableTickets: availability?.availableTickets || 0,
          soldOutTiers: availability?.soldOutTiers || [],
        },
      };
    } catch (error) {
      console.error("getTicketSummary error:", error);
      throw error;
    }
  },
}));

export default useTicketStore;
