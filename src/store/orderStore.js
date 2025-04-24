import { create } from "zustand";
import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_SERVER || "http://localhost:8000/api/v2";

const useOrderStore = create((set) => ({
  orders: [],
  isLoading: false,
  error: null,
  total: 0,
  page: 1,
  pages: 1,
  stats: {
    totalSales: 0,
    pendingOrders: 0,
    totalOrders: 0,
    recentOrders: 0,
  },

  fetchSellerOrders: async (
    shopId,
    token,
    { page = 1, limit = 10, status, startDate, endDate } = {}
  ) => {
    set({ isLoading: true, error: null });
    try {
      const params = { page, limit };
      if (status) params.status = status;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const response = await axios.get(
        `${API_BASE_URL}/order/get-seller-all-orders/${shopId}`,
        {
          params,
          withCredentials: true,
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        }
      );
      set({
        orders: response.data.orders,
        total: response.data.total,
        page: response.data.page,
        pages: response.data.pages,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch orders",
        isLoading: false,
      });
      throw error;
    }
  },

  fetchShopStats: async (shopId, token) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(
        `${API_BASE_URL}/order/shop/stats/${shopId}`,
        {
          withCredentials: true,
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        }
      );
      set({
        stats: response.data.stats,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch shop stats",
        isLoading: false,
      });
      throw error;
    }
  },

  updateOrderStatus: async (orderId, status, reason, token) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(
        `${API_BASE_URL}/order/update-order-status/${orderId}`,
        { status, reason },
        {
          withCredentials: true,
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            "Content-Type": "application/json",
          },
        }
      );
      set((state) => ({
        orders: state.orders.map((order) =>
          order._id === orderId ? response.data.order : order
        ),
        isLoading: false,
      }));
      return response.data.order;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to update order status",
        isLoading: false,
      });
      throw error;
    }
  },

  approveRefund: async (orderId, reason, token) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(
        `${API_BASE_URL}/order/order-refund-success/${orderId}`,
        { status: "Refund Success", reason },
        {
          withCredentials: true,
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            "Content-Type": "application/json",
          },
        }
      );
      set((state) => ({
        orders: state.orders.map((order) =>
          order._id === orderId ? { ...order, status: "Refund Success" } : order
        ),
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to approve refund",
        isLoading: false,
      });
      throw error;
    }
  },
}));

export default useOrderStore;
