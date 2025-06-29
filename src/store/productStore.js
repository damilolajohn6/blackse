import { create } from "zustand";
import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_SERVER || "http://localhost:8000/api/v2";

const useProductStore = create((set) => ({
  products: [],
  shopProducts: [],
  categoryProducts: [],
  flashSaleProducts: [],
  categories: [],
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
        shopProducts: [...state.shopProducts, data.product],
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

  updateProduct: async (productId, productData, token) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axios.put(
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
      set((state) => ({
        shopProducts: state.shopProducts.map((p) =>
          p._id === productId ? data.product : p
        ),
        product: data.product,
        isLoading: false,
      }));
      return data.product;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update product";
      console.error("updateProduct error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
        productId,
      });
      set({ isLoading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  deleteProduct: async (productId, token) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axios.delete(
        `${API_BASE_URL}/product/delete-shop-product/${productId}`,
        {
          withCredentials: true,
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        }
      );
      set((state) => ({
        shopProducts: state.shopProducts.filter((p) => p._id !== productId),
        isLoading: false,
      }));
      return data.message;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete product";
      console.error("deleteProduct error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
        productId,
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
      set({ shopProducts: data.products || [], isLoading: false });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch shop products";
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

  fetchProductsByCategory: async (shopId, category, token) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axios.get(
        `${API_BASE_URL}/product/get-shop-products-by-category/${shopId}/${category}`,
        {
          withCredentials: true,
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        }
      );
      set({ categoryProducts: data.products || [], isLoading: false });
      return data.products; // Optional: return the data if needed
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch products by category";
      console.error("fetchProductsByCategory error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
        shopId,
        category,
      });
      set({ isLoading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  fetchFlashSaleProducts: async (token) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axios.get(
        `${API_BASE_URL}/product/get-flash-sale-products`,
        {
          withCredentials: true,
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        }
      );
      set({ flashSaleProducts: data.products || [], isLoading: false });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch flash sale products";
      console.error("fetchFlashSaleProducts error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ isLoading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axios.get(
        `${API_BASE_URL}/product/get-categories`
      );
      set({ categories: data.categories || [], isLoading: false });
      return data.categories;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch categories";
      console.error("fetchCategories error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      set({ isLoading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  addFlashSale: async (productId, flashSaleData, token) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/product/add-flash-sale/${productId}`,
        flashSaleData,
        {
          withCredentials: true,
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            "Content-Type": "application/json",
          },
        }
      );
      set((state) => ({
        shopProducts: state.shopProducts.map((p) =>
          p._id === productId ? data.product : p
        ),
        isLoading: false,
      }));
      return data.product;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to add flash sale";
      console.error("addFlashSale error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
        productId,
      });
      set({ isLoading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  removeFlashSale: async (productId, token) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/product/remove-flash-sale/${productId}`,
        {},
        {
          withCredentials: true,
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        }
      );
      set((state) => ({
        shopProducts: state.shopProducts.map((p) =>
          p._id === productId ? data.product : p
        ),
        isLoading: false,
      }));
      return data.product;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to remove flash sale";
      console.error("removeFlashSale error:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
        productId,
      });
      set({ isLoading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },
}));

export default useProductStore;
