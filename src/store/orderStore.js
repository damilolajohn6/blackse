/* eslint-disable no-unused-vars */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_SERVER || "http://localhost:8000/api/v2";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 30000, // 30 second timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useOrderStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || "An error occurred";

    // Handle different error types
    if (error.response?.status === 401) {
      // Token expired or invalid
      useOrderStore.getState().clearAuth();
      window.location.href = "/login";
    } else if (error.response?.status === 403) {
      // Forbidden
      throw new Error("You don't have permission to perform this action");
    } else if (error.response?.status === 404) {
      // Not found
      throw new Error("Resource not found");
    } else if (error.response?.status >= 500) {
      // Server error
      throw new Error("Server error. Please try again later.");
    }

    throw new Error(message);
  }
);

const useOrderStore = create(
  persist(
    (set, get) => ({
      // State
      orders: [],
      currentOrder: null,
      isLoading: false,
      error: null,
      total: 0,
      page: 1,
      pages: 1,
      limit: 10,
      filters: {
        status: "",
        startDate: "",
        endDate: "",
        search: "",
      },
      sortBy: "createdAt",
      sortOrder: "desc",
      stats: {
        totalSales: 0,
        pendingOrders: 0,
        totalOrders: 0,
        recentOrders: 0,
        averageOrderValue: 0,
        monthlyRevenue: 0,
        topSellingItems: [],
      },
      token: null,

      // Actions
      setToken: (token) => set({ token }),

      clearAuth: () => set({ token: null }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),

      setFilters: (filters) => set({ filters }),

      setSorting: (sortBy, sortOrder) => set({ sortBy, sortOrder }),

      setPage: (page) => set({ page }),

      setLimit: (limit) => set({ limit }),

      // Fetch seller orders with enhanced filtering and sorting
      fetchSellerOrders: async (shopId, token, options = {}) => {
        const {
          page = 1,
          limit = 10,
          status,
          startDate,
          endDate,
          search,
          sortBy = "createdAt",
          sortOrder = "desc",
        } = options;

        set({ isLoading: true, error: null });

        try {
          const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            sortBy,
            sortOrder,
          });

          if (status) params.append("status", status);
          if (startDate) params.append("startDate", startDate);
          if (endDate) params.append("endDate", endDate);
          if (search) params.append("search", search);

          const response = await api.get(
            `/order/get-seller-all-orders/${shopId}?${params}`
          );

          set({
            orders: response.data.orders || [],
            total: response.data.total || 0,
            page: response.data.page || 1,
            pages: response.data.pages || 1,
            isLoading: false,
          });

          return response.data;
        } catch (error) {
          set({
            error: error.message,
            isLoading: false,
            orders: [],
          });
          throw error;
        }
      },

      // Fetch single order details
      fetchOrderById: async (orderId) => {
        set({ isLoading: true, error: null });

        try {
          const response = await api.get(`/order/provider/order/${orderId}`);

          set({
            currentOrder: response.data.order,
            isLoading: false,
          });

          return response.data.order;
        } catch (error) {
          set({
            error: error.message,
            isLoading: false,
            currentOrder: null,
          });
          throw error;
        }
      },

      // Fetch shop statistics
      fetchShopStats: async (shopId, token) => {
        set({ isLoading: true, error: null });

        try {
          const response = await api.get(`/order/shop/stats/${shopId}`);

          set({
            stats: {
              ...get().stats,
              ...response.data.stats,
            },
            isLoading: false,
          });

          return response.data.stats;
        } catch (error) {
          set({
            error: error.message,
            isLoading: false,
          });
          throw error;
        }
      },

      // Update order status with validation
      updateOrderStatus: async (
        orderId,
        status,
        reason,
        courier,
        courierSlug,
        trackingNumber,
        token
      ) => {
        set({ isLoading: true, error: null });

        try {
          // Validate required fields
          if (!orderId || !status) {
            throw new Error("Order ID and status are required");
          }

          if (status === "Shipped" && (!courier || !trackingNumber)) {
            throw new Error(
              "Courier and tracking number are required for shipped orders"
            );
          }

          const payload = {
            status,
            reason: reason || "",
          };

          if (status === "Shipped") {
            payload.courier = courier;
            payload.courierSlug = courierSlug || "other"; // Allow custom slug
            payload.trackingNumber = trackingNumber;
          }

          const response = await api.put(
            `/order/update-order-status/${orderId}`,
            payload
          );

          // Update the order in the current orders list
          set((state) => ({
            orders: state.orders.map((order) =>
              order._id === orderId
                ? { ...order, ...response.data.order }
                : order
            ),
            currentOrder:
              state.currentOrder?._id === orderId
                ? { ...state.currentOrder, ...response.data.order }
                : state.currentOrder,
            isLoading: false,
          }));

          return response.data.order;
        } catch (error) {
          set({
            error: error.message,
            isLoading: false,
          });
          throw error;
        }
      },

      // Approve refund
      approveRefund: async (orderId, reason, token) => {
        set({ isLoading: true, error: null });

        try {
          if (!orderId || !reason?.trim()) {
            throw new Error(
              "Order ID and reason are required for refund approval"
            );
          }

          const response = await api.put(
            `/order/order-refund-success/${orderId}`,
            {
              status: "Refund Success",
              reason: reason.trim(),
            }
          );

          // Update the order in the current orders list
          set((state) => ({
            orders: state.orders.map((order) =>
              order._id === orderId
                ? { ...order, status: "Refund Success" }
                : order
            ),
            currentOrder:
              state.currentOrder?._id === orderId
                ? { ...state.currentOrder, status: "Refund Success" }
                : state.currentOrder,
            isLoading: false,
          }));

          return response.data;
        } catch (error) {
          set({
            error: error.message,
            isLoading: false,
          });
          throw error;
        }
      },

      // Reject refund
      rejectRefund: async (orderId, reason, token) => {
        set({ isLoading: true, error: null });

        try {
          if (!orderId || !reason?.trim()) {
            throw new Error(
              "Order ID and reason are required for refund rejection"
            );
          }

          const response = await api.put(`/order/reject-refund/${orderId}`, {
            reason: reason.trim(),
          });

          // Update the order in the current orders list
          set((state) => ({
            orders: state.orders.map((order) =>
              order._id === orderId
                ? { ...order, ...response.data.order }
                : order
            ),
            currentOrder:
              state.currentOrder?._id === orderId
                ? { ...state.currentOrder, ...response.data.order }
                : state.currentOrder,
            isLoading: false,
          }));

          return response.data;
        } catch (error) {
          set({
            error: error.message,
            isLoading: false,
          });
          throw error;
        }
      },

      // Bulk update orders
      bulkUpdateOrders: async (orderIds, status, reason, token) => {
        set({ isLoading: true, error: null });

        try {
          if (!orderIds?.length || !status) {
            throw new Error(
              "Order IDs and status are required for bulk update"
            );
          }

          const response = await api.put(`/order/bulk-update-status`, {
            orderIds,
            status,
            reason: reason || "",
          });

          // Update the orders in the current orders list
          set((state) => ({
            orders: state.orders.map((order) =>
              orderIds.includes(order._id) ? { ...order, status } : order
            ),
            isLoading: false,
          }));

          return response.data;
        } catch (error) {
          set({
            error: error.message,
            isLoading: false,
          });
          throw error;
        }
      },

      // Export orders
      exportOrders: async (shopId, filters, token) => {
        set({ isLoading: true, error: null });

        try {
          const params = new URLSearchParams();
          if (filters.status) params.append("status", filters.status);
          if (filters.startDate) params.append("startDate", filters.startDate);
          if (filters.endDate) params.append("endDate", filters.endDate);
          if (filters.search) params.append("search", filters.search);

          const response = await api.get(`/order/export/${shopId}?${params}`, {
            responseType: "blob",
          });

          // Create download link
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute(
            "download",
            `orders-${new Date().toISOString().split("T")[0]}.csv`
          );
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);

          set({ isLoading: false });
          return true;
        } catch (error) {
          set({
            error: error.message,
            isLoading: false,
          });
          throw error;
        }
      },

      // Send order notification
      sendOrderNotification: async (orderId, type, message, token) => {
        set({ isLoading: true, error: null });

        try {
          const response = await api.post(
            `/order/send-notification/${orderId}`,
            {
              type,
              message,
            }
          );

          set({ isLoading: false });
          return response.data;
        } catch (error) {
          set({
            error: error.message,
            isLoading: false,
          });
          throw error;
        }
      },

      // Get order analytics
      getOrderAnalytics: async (shopId, timeRange, token) => {
        set({ isLoading: true, error: null });

        try {
          const response = await api.get(`/order/analytics/${shopId}`, {
            params: { timeRange },
          });

          set({
            stats: {
              ...get().stats,
              ...response.data.analytics,
            },
            isLoading: false,
          });

          return response.data.analytics;
        } catch (error) {
          set({
            error: error.message,
            isLoading: false,
          });
          throw error;
        }
      },

      // Reset store
      reset: () =>
        set({
          orders: [],
          currentOrder: null,
          isLoading: false,
          error: null,
          total: 0,
          page: 1,
          pages: 1,
          limit: 10,
          filters: {
            status: "",
            startDate: "",
            endDate: "",
            search: "",
          },
          sortBy: "createdAt",
          sortOrder: "desc",
          stats: {
            totalSales: 0,
            pendingOrders: 0,
            totalOrders: 0,
            recentOrders: 0,
            averageOrderValue: 0,
            monthlyRevenue: 0,
            topSellingItems: [],
          },
        }),

      // Utility functions
      getOrderById: (orderId) => {
        return get().orders.find((order) => order._id === orderId);
      },

      getOrdersByStatus: (status) => {
        return get().orders.filter((order) => order.status === status);
      },

      getTotalRevenue: () => {
        return get().orders.reduce((total, order) => {
          return order.status === "Delivered"
            ? total + order.totalAmount
            : total;
        }, 0);
      },

      getPendingOrdersCount: () => {
        return get().orders.filter((order) => order.status === "Pending")
          .length;
      },

      // Real-time order updates (for WebSocket integration)
      updateOrderRealtime: (updatedOrder) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order._id === updatedOrder._id ? updatedOrder : order
          ),
          currentOrder:
            state.currentOrder?._id === updatedOrder._id
              ? updatedOrder
              : state.currentOrder,
        }));
      },

      // Add new order (for real-time notifications)
      addNewOrder: (newOrder) => {
        set((state) => ({
          orders: [newOrder, ...state.orders],
          total: state.total + 1,
        }));
      },
    }),
    {
      name: "order-store",
      partialize: (state) => ({
        token: state.token,
        filters: state.filters,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
        limit: state.limit,
      }),
    }
  )
);

export default useOrderStore;
