import { create } from "zustand";
import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_SERVER || "http://localhost:8000/api/v2";

const useProductStore = create((set) => ({
  products: [],
  isLoading: false,
  error: null,
  product: null,

  createProduct: async (productData, token) => {
    set({ isLoading: true, error: null });
    try {
      if (!token) {
        console.error("createProduct: No token provided");
        throw new Error("Authentication token missing");
      }
      const { data } = await axios.post(
        `${API_BASE_URL}/product/create-product`,
        productData,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      set((state) => ({
        products: [...state.products, data.product],
        isLoading: false,
      }));
      return data.product;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to create product";
      console.error("createProduct error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ isLoading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  fetchShopProducts: async (shopId, token) => {
    set({ isLoading: true, error: null });
    try {
      if (!token) {
        console.error("fetchShopProducts: No token provided");
        throw new Error("Authentication token missing");
      }
      const { data } = await axios.get(
        `${API_BASE_URL}/product/get-all-products-shop/${shopId}`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      set({ products: data.products || [], isLoading: false });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch products";
      console.error("fetchShopProducts error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ isLoading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  fetchSingleProduct: async (productId, token) => {
    set({ isLoading: true, error: null, product: null });
    try {
      const response = await axios.get(
        `${API_BASE_URL}/product/get-product/${productId}`,
        {
          withCredentials: true,
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        }
      );
      set({ product: response.data.product, isLoading: false });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch product";
      console.error("fetchSingleProduct error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ isLoading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  updateProduct: async (productId, productData, token) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(
        `${API_BASE_URL}/product/update-product/${productId}`,
        productData,
        {
          withCredentials: true,
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            "Content-Type": "application/json",
          },
        }
      );
      set({ product: response.data.product, isLoading: false });
      return response.data.product;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update product";
      console.error("updateProduct error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ isLoading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },
}));

export default useProductStore;
