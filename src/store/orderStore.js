import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import { toast } from "react-toastify";
import useShopStore from "./shopStore";

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
    const token =
      useOrderStore.getState().token || useShopStore.getState().sellerToken;
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

    if (error.response?.status === 401) {
      useOrderStore.getState().clearAuth();
      window.location.href = "/login";
    } else if (error.response?.status === 403) {
      throw new Error("You don't have permission to perform this action");
    } else if (error.response?.status === 404) {
      throw new Error("Resource not found");
    } else if (error.response?.status >= 500) {
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
      transactions: [], // Updated to include bank-specific withdrawal details
      availableBalance: 0,
      isLoading: false,
      error: null,
      total: 0,
      page: 1,
      pages: 1,
      limit: 10,
      transactionTotal: 0,
      transactionPage: 1,
      transactionPages: 1,
      filters: {
        status: "",
        startDate: "",
        endDate: "",
        search: "",
        transactionType: "",
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

      setTransactionPage: (page) => set({ transactionPage: page }),

      // Fetch shop transaction history
      fetchShopTransactions: async (shopId, params = {}) => {
        set({ isLoading: true, error: null });
        const { page = 1, limit = 10, startDate, endDate, type } = params;
        const sellerToken = get().token || useShopStore.getState().sellerToken;

        if (!sellerToken) {
          console.error("fetchShopTransactions: No seller token available", {
            shopId,
            params,
          });
          set({ isLoading: false, error: "No seller token available" });
          toast.error("Authentication required. Please log in.");
          return { success: false, message: "No seller token available" };
        }

        try {
          console.debug("fetchShopTransactions request:", {
            url: `${API_BASE_URL}/order/shop/transactions/${shopId}`,
            params,
            token: sellerToken.substring(0, 20) + "...",
          });
          const res = await api.get(
            `${API_BASE_URL}/order/shop/transactions/${shopId}`,
            {
              params: { page, limit, startDate, endDate, type },
            }
          );
          set({
            transactions: res.data.transactions.map((tx) => ({
              ...tx,
              withdrawMethod: tx.withdrawId
                ? {
                    type: "BankTransfer",
                    details: tx.metadata?.withdrawMethod?.details || {},
                  }
                : undefined,
            })),
            availableBalance: res.data.availableBalance,
            transactionTotal: res.data.total,
            transactionPage: res.data.page,
            transactionPages: res.data.pages,
            isLoading: false,
          });
          console.info("fetchShopTransactions: Transactions fetched", {
            shopId,
            transactionCount: res.data.transactions.length,
            page,
            limit,
            type,
            startDate,
            endDate,
          });
          toast.success("Transaction history loaded successfully!");
          return {
            success: true,
            transactions: res.data.transactions,
            availableBalance: res.data.availableBalance,
            total: res.data.total,
            page: res.data.page,
            pages: res.data.pages,
          };
        } catch (error) {
          console.error("fetchShopTransactions error:", {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            shopId,
          });
          const message =
            error.response?.data?.message || "Failed to fetch transactions";
          set({
            isLoading: false,
            error: message,
            transactions: [],
            availableBalance: 0,
            transactionTotal: 0,
            transactionPage: 1,
            transactionPages: 1,
          });
          toast.error(message);
          return { success: false, message };
        }
      },

      // Existing actions (unchanged, included for completeness)
      fetchSellerOrders: async (shopId, token, params = {}) => {
        set({ isLoading: true, error: null });
        const {
          page = 1,
          limit = 10,
          sortBy = "createdAt",
          sortOrder = "desc",
        } = params;
        const sellerToken = token || useShopStore.getState().sellerToken;

        if (!sellerToken) {
          console.error("fetchSellerOrders: No seller token available", {
            shopId,
            params,
          });
          set({ isLoading: false, error: "No seller token available" });
          return { success: false, message: "No seller token available" };
        }

        try {
          console.debug("fetchSellerOrders request:", {
            url: `${API_BASE_URL}/order/get-seller-all-orders/${shopId}`,
            params,
            token: sellerToken.substring(0, 20) + "...",
          });
          const res = await axios.get(
            `${API_BASE_URL}/order/get-seller-all-orders/${shopId}`,
            {
              params: { page, limit, sortBy, sortOrder },
              headers: { Authorization: `Bearer ${sellerToken}` },
              withCredentials: true,
            }
          );
          set({
            orders: res.data.orders,
            total: res.data.total,
            page: res.data.page,
            pages: res.data.pages,
            isLoading: false,
          });
          console.info("fetchSellerOrders: Orders fetched", {
            shopId,
            orderCount: res.data.orders.length,
            page,
            limit,
          });
          return { success: true, orders: res.data.orders };
        } catch (error) {
          console.error("fetchSellerOrders error:", {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            shopId,
          });
          set({
            isLoading: false,
            error: error.response?.data?.message || "Failed to fetch orders",
          });
          return {
            success: false,
            message: error.response?.data?.message || "Failed to fetch orders",
          };
        }
      },

      fetchOrderById: async (orderId) => {
        set({ isLoading: true, error: null });

        try {
          const response = await api.get(`/order/provider/order/${orderId}`);
          set({
            currentOrder: response.data.order,
            isLoading: false,
          });
          console.info("fetchOrderById: Order fetched", { orderId });
          return response.data.order;
        } catch (error) {
          console.error("fetchOrderById error:", {
            message: error.message,
            status: error.response?.status,
            orderId,
          });
          set({
            error: error.message,
            isLoading: false,
            currentOrder: null,
          });
          toast.error(error.message);
          throw error;
        }
      },

      fetchShopStats: async (shopId, token) => {
        set({ isLoading: true, error: null });
        const sellerToken = token || useShopStore.getState().sellerToken;

        if (!sellerToken) {
          console.error("fetchShopStats: No seller token available", {
            shopId,
          });
          set({ isLoading: false, error: "No seller token available" });
          return { success: false, message: "No seller token available" };
        }

        try {
          console.debug("fetchShopStats request:", {
            url: `${API_BASE_URL}/order/shop/stats/${shopId}`,
            token: sellerToken.substring(0, 20) + "...",
          });
          const res = await api.get(
            `${API_BASE_URL}/order/shop/stats/${shopId}`
          );
          set({ stats: res.data.stats, isLoading: false });
          console.info("fetchShopStats: Stats fetched", {
            shopId,
            stats: res.data.stats,
          });
          return { success: true, stats: res.data.stats };
        } catch (error) {
          console.error("fetchShopStats error:", {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            shopId,
          });
          set({
            isLoading: false,
            error: error.response?.data?.message || "Failed to fetch stats",
          });
          return {
            success: false,
            message: error.response?.data?.message || "Failed to fetch stats",
          };
        }
      },

      updateOrderStatus: async (
        orderId,
        status,
        reason,
        courier,
        courierSlug,
        trackingNumber
      ) => {
        set({ isLoading: true, error: null });

        try {
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
            payload.courierSlug = courierSlug || "other";
            payload.trackingNumber = trackingNumber;
          }

          const response = await api.put(
            `/order/update-order-status/${orderId}`,
            payload
          );

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
          console.info("updateOrderStatus: Order status updated", {
            orderId,
            status,
          });
          toast.success(`Order status updated to ${status}`);
          return response.data.order;
        } catch (error) {
          console.error("updateOrderStatus error:", {
            message: error.message,
            status: error.response?.status,
            orderId,
          });
          set({
            error: error.message,
            isLoading: false,
          });
          toast.error(error.message);
          throw error;
        }
      },

      approveRefund: async (orderId, refundId, reason) => {
        set({ isLoading: true, error: null });

        try {
          if (!orderId || !refundId || !reason?.trim()) {
            throw new Error(
              "Order ID, refund ID, and reason are required for refund approval"
            );
          }

          const response = await api.put(
            `/order/order-refund-success/${orderId}`,
            {
              status: "Approved",
              refundId,
              reason: reason.trim(),
            }
          );

          set((state) => ({
            orders: state.orders.map((order) =>
              order._id === orderId
                ? {
                    ...order,
                    status: "Refund Success",
                    refundHistory: response.data.order.refundHistory,
                  }
                : order
            ),
            currentOrder:
              state.currentOrder?._id === orderId
                ? {
                    ...state.currentOrder,
                    status: "Refund Success",
                    refundHistory: response.data.order.refundHistory,
                  }
                : state.currentOrder,
            isLoading: false,
          }));
          console.info("approveRefund: Refund approved", { orderId, refundId });
          toast.success("Refund approved successfully");
          return response.data;
        } catch (error) {
          console.error("approveRefund error:", {
            message: error.message,
            status: error.response?.status,
            orderId,
          });
          set({
            error: error.message,
            isLoading: false,
          });
          toast.error(error.message);
          throw error;
        }
      },

      rejectRefund: async (orderId, refundId, reason) => {
        set({ isLoading: true, error: null });

        try {
          if (!orderId || !refundId || !reason?.trim()) {
            throw new Error(
              "Order ID, refund ID, and reason are required for refund rejection"
            );
          }

          const response = await api.put(
            `/order/order-refund-success/${orderId}`,
            {
              status: "Rejected",
              refundId,
              reason: reason.trim(),
            }
          );

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
          console.info("rejectRefund: Refund rejected", { orderId, refundId });
          toast.success("Refund rejected successfully");
          return response.data;
        } catch (error) {
          console.error("rejectRefund error:", {
            message: error.message,
            status: error.response?.status,
            orderId,
          });
          set({
            error: error.message,
            isLoading: false,
          });
          toast.error(error.message);
          throw error;
        }
      },

      bulkUpdateOrders: async (orderIds, status, reason) => {
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

          set((state) => ({
            orders: state.orders.map((order) =>
              orderIds.includes(order._id) ? { ...order, status } : order
            ),
            isLoading: false,
          }));
          console.info("bulkUpdateOrders: Orders updated", {
            orderIds,
            status,
          });
          toast.success(`Updated ${orderIds.length} orders to ${status}`);
          return response.data;
        } catch (error) {
          console.error("bulkUpdateOrders error:", {
            message: error.message,
            status: error.response?.status,
            orderIds,
          });
          set({
            error: error.message,
            isLoading: false,
          });
          toast.error(error.message);
          throw error;
        }
      },

      exportOrders: async (shopId, filters) => {
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
          console.info("exportOrders: Orders exported", { shopId });
          toast.success("Orders exported successfully");
          return true;
        } catch (error) {
          console.error("exportOrders error:", {
            message: error.message,
            status: error.response?.status,
            shopId,
          });
          set({
            error: error.message,
            isLoading: false,
          });
          toast.error(error.message);
          throw error;
        }
      },

      sendOrderNotification: async (orderId, type, message) => {
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
          console.info("sendOrderNotification: Notification sent", {
            orderId,
            type,
          });
          toast.success("Notification sent successfully");
          return response.data;
        } catch (error) {
          console.error("sendOrderNotification error:", {
            message: error.message,
            status: error.response?.status,
            orderId,
          });
          set({
            error: error.message,
            isLoading: false,
          });
          toast.error(error.message);
          throw error;
        }
      },

      getOrderAnalytics: async (shopId, timeRange) => {
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
          console.info("getOrderAnalytics: Analytics fetched", {
            shopId,
            timeRange,
          });
          return response.data.analytics;
        } catch (error) {
          console.error("getOrderAnalytics error:", {
            message: error.message,
            status: error.response?.status,
            shopId,
          });
          set({
            error: error.message,
            isLoading: false,
          });
          toast.error(error.message);
          throw error;
        }
      },

      reset: () =>
        set({
          orders: [],
          currentOrder: null,
          transactions: [],
          availableBalance: 0,
          isLoading: false,
          error: null,
          total: 0,
          page: 1,
          pages: 1,
          limit: 10,
          transactionTotal: 0,
          transactionPage: 1,
          transactionPages: 1,
          filters: {
            status: "",
            startDate: "",
            endDate: "",
            search: "",
            transactionType: "",
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
        console.info("updateOrderRealtime: Order updated", {
          orderId: updatedOrder._id,
        });
      },

      addNewOrder: (newOrder) => {
        set((state) => ({
          orders: [newOrder, ...state.orders],
          total: state.total + 1,
        }));
        console.info("addNewOrder: New order added", { orderId: newOrder._id });
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
