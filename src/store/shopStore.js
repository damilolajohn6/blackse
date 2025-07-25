import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import { toast } from "react-toastify";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_SERVER || "http://localhost:8000/api/v2";

const useShopStore = create(
  persist(
    (set, get) => ({
      seller: null,
      sellerToken: null,
      isSeller: false,
      isLoading: false,

      // Validate token
      validateToken: async () => {
        const sellerToken =
          get().sellerToken || localStorage.getItem("seller_token");
        if (!sellerToken) {
          console.warn("validateToken: No seller token available");
          return { success: false, message: "No seller token available" };
        }
        try {
          console.debug("Validate token request:", {
            url: `${API_BASE_URL}/shop/validate-token`,
          });
          const res = await axios.get(`${API_BASE_URL}/shop/validate-token`, {
            headers: { Authorization: `Bearer ${sellerToken}` },
            withCredentials: true,
          });
          return { success: true, data: res.data };
        } catch (error) {
          console.error("validateToken error:", {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
          });
          return {
            success: false,
            message: error.response?.data?.message || "Token validation failed",
          };
        }
      },

      // Refresh token
      refreshToken: async () => {
        set({ isLoading: true });
        const sellerToken =
          get().sellerToken || localStorage.getItem("seller_token");
        if (!sellerToken) {
          console.warn("refreshToken: No seller token available");
          return { success: false, message: "No seller token available" };
        }
        try {
          console.debug("Refresh token request:", {
            url: `${API_BASE_URL}/shop/refresh-token`,
          });
          const res = await axios.post(
            `${API_BASE_URL}/shop/refresh-token`,
            {},
            {
              headers: { Authorization: `Bearer ${sellerToken}` },
              withCredentials: true,
            }
          );
          const { token, seller } = res.data;
          set({ sellerToken: token, seller, isSeller: true });
          localStorage.setItem("seller_token", token);
          console.info("refreshToken: Token refreshed successfully");
          return { success: true, newToken: token };
        } catch (error) {
          console.error("refreshToken error:", {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
          });
          get().logoutShop();
          return {
            success: false,
            message: error.response?.data?.message || "Failed to refresh token",
          };
        } finally {
          set({ isLoading: false });
        }
      },

      // Shop login
      loginShop: async (email, password, router) => {
        set({ isLoading: true });
        try {
          console.debug("Shop login request:", { email });
          const res = await axios.post(
            `${API_BASE_URL}/shop/login-shop`,
            { email, password },
            { withCredentials: true }
          );
          const { seller, token } = res.data;
          set({ seller, sellerToken: token, isSeller: true });
          localStorage.setItem("seller_token", token);
          toast.success("Shop login successful!");
          router.push("/shop/dashboard");
          return { success: true };
        } catch (error) {
          console.error("Shop login error:", {
            message: error.message,
            data: error.response?.data,
          });
          const message = error.response?.data?.message || "Shop login failed.";
          toast.error(message);
          return { success: false, message };
        } finally {
          set({ isLoading: false });
        }
      },

      // Load shop data
      loadShop: async () => {
        set({ isLoading: true });
        const sellerToken =
          get().sellerToken || localStorage.getItem("seller_token");
        if (!sellerToken) {
          console.warn("loadShop: No sellerToken available.");
          set({
            seller: null,
            sellerToken: null,
            isSeller: false,
          });
          return { success: false, message: "No seller token available" };
        }

        // Validate token before loading shop
        const tokenValidation = await get().validateToken();
        if (!tokenValidation.success) {
          console.warn(
            "loadShop: Token validation failed",
            tokenValidation.message
          );
          get().logoutShop();
          return tokenValidation;
        }

        try {
          console.debug("Loading shop data:", {
            url: `${API_BASE_URL}/shop/getshop`,
            token: sellerToken.substring(0, 20) + "...",
          });
          const res = await axios.get(`${API_BASE_URL}/shop/getshop`, {
            headers: { Authorization: `Bearer ${sellerToken}` },
            withCredentials: true,
          });
          set({
            seller: res.data.seller,
            sellerToken: res.data.token || sellerToken,
            isSeller: true,
          });
          return { success: true, seller: res.data.seller };
        } catch (error) {
          console.error("loadShop error:", {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
          });
          if (
            error.response?.status === 401 ||
            error.response?.status === 403
          ) {
            const refreshResult = await get().refreshToken();
            if (refreshResult.success) {
              // Retry loading shop with new token
              try {
                const retryRes = await axios.get(
                  `${API_BASE_URL}/shop/getshop`,
                  {
                    headers: {
                      Authorization: `Bearer ${refreshResult.newToken}`,
                    },
                    withCredentials: true,
                  }
                );
                set({
                  seller: retryRes.data.seller,
                  sellerToken: retryRes.data.token || refreshResult.newToken,
                  isSeller: true,
                });
                return { success: true, seller: retryRes.data.seller };
              } catch (retryError) {
                console.error("loadShop retry error:", {
                  message: retryError.message,
                  status: retryError.response?.status,
                  data: retryError.response?.data,
                });
                get().logoutShop();
                return {
                  success: false,
                  message:
                    retryError.response?.data?.message ||
                    "Failed to load shop after token refresh",
                };
              }
            } else {
              get().logoutShop();
              return refreshResult;
            }
          }
          return {
            success: false,
            message: error.response?.data?.message || "Failed to load shop",
          };
        } finally {
          set({ isLoading: false });
        }
      },

      // Check authentication
      checkAuth: async () => {
        set({ isLoading: true });
        const sellerToken =
          get().sellerToken || localStorage.getItem("seller_token");
        if (!sellerToken) {
          console.warn("checkAuth: No seller token available");
          set({
            seller: null,
            sellerToken: null,
            isSeller: false,
          });
          return { success: false, message: "No seller token available" };
        }

        const tokenValidation = await get().validateToken();
        if (!tokenValidation.success) {
          console.warn(
            "checkAuth: Token validation failed",
            tokenValidation.message
          );
          get().logoutShop();
          return tokenValidation;
        }

        try {
          console.debug("Check auth request:", {
            url: `${API_BASE_URL}/shop/getshop`,
            token: sellerToken.substring(0, 20) + "...",
          });
          const res = await axios.get(`${API_BASE_URL}/shop/getshop`, {
            headers: { Authorization: `Bearer ${sellerToken}` },
            withCredentials: true,
          });
          set({
            seller: res.data.seller,
            sellerToken: res.data.token || sellerToken,
            isSeller: true,
          });
          return { success: true, isSeller: true };
        } catch (error) {
          console.error("checkAuth error:", {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
          });
          if (
            error.response?.status === 401 ||
            error.response?.status === 403
          ) {
            const refreshResult = await get().refreshToken();
            if (refreshResult.success) {
              // Retry auth check with new token
              try {
                const retryRes = await axios.get(
                  `${API_BASE_URL}/shop/getshop`,
                  {
                    headers: {
                      Authorization: `Bearer ${refreshResult.newToken}`,
                    },
                    withCredentials: true,
                  }
                );
                set({
                  seller: retryRes.data.seller,
                  sellerToken: retryRes.data.token || refreshResult.newToken,
                  isSeller: true,
                });
                return { success: true, isSeller: true };
              } catch (retryError) {
                console.error("checkAuth retry error:", {
                  message: retryError.message,
                  status: retryError.response?.status,
                  data: retryError.response?.data,
                });
                get().logoutShop();
                return {
                  success: false,
                  message:
                    retryError.response?.data?.message ||
                    "Failed to check auth after token refresh",
                };
              }
            } else {
              get().logoutShop();
              return refreshResult;
            }
          }
          get().logoutShop();
          return {
            success: false,
            message: error.response?.data?.message || "Authentication failed",
          };
        } finally {
          set({ isLoading: false });
        }
      },

      // Shop logout
      logoutShop: async (router) => {
        set({ isLoading: true });
        try {
          console.debug("Shop logout request");
          await axios.get(`${API_BASE_URL}/shop/logout`, {
            withCredentials: true,
          });
        } catch (error) {
          console.error("Shop logout API call failed:", {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
          });
        } finally {
          set({
            seller: null,
            sellerToken: null,
            isSeller: false,
            isLoading: false,
          });
          localStorage.removeItem("seller_token");
          toast.success("Shop logged out successfully!");
          if (router) router.push("/shop/login");
        }
        return { success: true };
      },

      // Other methods (createShop, activateShop, etc.) remain unchanged
      createShop: async (shopData, router) => {
        set({ isLoading: true });
        try {
          console.debug("Create shop request:", shopData);
          const res = await axios.post(
            `${API_BASE_URL}/shop/create-shop`,
            shopData,
            {
              headers: { "Content-Type": "application/json" },
              withCredentials: true,
            }
          );
          toast.success(res.data.message);
          router.push(
            `/shop/create/activation?email=${encodeURIComponent(
              shopData.email
            )}`
          );
          return { success: true };
        } catch (error) {
          console.error("Create shop error:", {
            message: error.message,
            data: error.response?.data,
          });
          const message =
            error.response?.data?.message || "Failed to create shop.";
          toast.error(message);
          return { success: false, message };
        } finally {
          set({ isLoading: false });
        }
      },

      activateShop: async (email, otp, router) => {
        set({ isLoading: true });
        try {
          console.debug("Activate shop request:", { email, otp });
          const res = await axios.post(
            `${API_BASE_URL}/shop/activation`,
            { email, otp },
            { withCredentials: true }
          );
          const { seller, token } = res.data;
          set({ seller, sellerToken: token, isSeller: true });
          localStorage.setItem("seller_token", token);
          toast.success("Shop activated successfully!");
          router.push("/shop/dashboard");
          return { success: true };
        } catch (error) {
          console.error("Activate shop error:", {
            message: error.message,
            data: error.response?.data,
          });
          const message =
            error.response?.data?.message || "Failed to activate shop.";
          toast.error(message);
          return { success: false, message };
        } finally {
          set({ isLoading: false });
        }
      },

      createCoupon: async (couponData) => {
        set({ isLoading: true });
        try {
          const { sellerToken, seller } = get();
          if (!sellerToken || !seller) {
            throw new Error("Seller not authenticated");
          }
          console.debug("Create coupon request:", couponData);
          const res = await axios.post(
            `${API_BASE_URL}/coupon/create-coupon-code`,
            { ...couponData, shopId: seller._id },
            {
              headers: { Authorization: `Bearer ${sellerToken}` },
              withCredentials: true,
            }
          );
          toast.success("Coupon created successfully!");
          return { success: true, coupon: res.data.couponCode };
        } catch (error) {
          console.error("Create coupon error:", {
            message: error.message,
            data: error.response?.data,
          });
          const message =
            error.response?.data?.message || "Failed to create coupon.";
          toast.error(message);
          return { success: false, message };
        } finally {
          set({ isLoading: false });
        }
      },

      fetchCoupons: async () => {
        set({ isLoading: true });
        try {
          const { sellerToken, seller } = get();
          if (!sellerToken || !seller) {
            throw new Error("Seller not authenticated");
          }
          console.debug("Fetch coupons request for seller:", seller._id);
          const res = await axios.get(
            `${API_BASE_URL}/coupon/get-coupon/${seller._id}`,
            {
              headers: { Authorization: `Bearer ${sellerToken}` },
              withCredentials: true,
            }
          );
          console.info("Coupons fetched:", res.data.couponCodes?.length || 0);
          return { success: true, coupons: res.data.couponCodes || [] };
        } catch (error) {
          console.error("Fetch coupons error:", {
            message: error.message,
            data: error.response?.data,
          });
          const message =
            error.response?.data?.message || "Failed to fetch coupons.";
          toast.error(message);
          return { success: false, coupons: [], message };
        } finally {
          set({ isLoading: false });
        }
      },

      updateCoupon: async (couponId, couponData) => {
        set({ isLoading: true });
        try {
          const { sellerToken, seller } = get();
          if (!sellerToken || !seller) {
            throw new Error("Seller not authenticated");
          }
          console.debug("Update coupon request:", { couponId, couponData });
          const res = await axios.put(
            `${API_BASE_URL}/coupon/update-coupon/${couponId}`,
            { ...couponData, shopId: seller._id },
            {
              headers: { Authorization: `Bearer ${sellerToken}` },
              withCredentials: true,
            }
          );
          toast.success("Coupon updated successfully!");
          return { success: true, coupon: res.data.couponCode };
        } catch (error) {
          console.error("Update coupon error:", {
            message: error.message,
            data: error.response?.data,
          });
          const message =
            error.response?.data?.message || "Failed to update coupon.";
          toast.error(message);
          return { success: false, message };
        } finally {
          set({ isLoading: false });
        }
      },

      deleteCoupon: async (couponId) => {
        set({ isLoading: true });
        try {
          const { sellerToken } = get();
          if (!sellerToken) {
            throw new Error("Seller not authenticated");
          }
          console.debug("Delete coupon request:", { couponId });
          await axios.delete(
            `${API_BASE_URL}/coupon/delete-coupon/${couponId}`,
            {
              headers: { Authorization: `Bearer ${sellerToken}` },
              withCredentials: true,
            }
          );
          toast.success("Coupon deleted successfully!");
          return { success: true };
        } catch (error) {
          console.error("Delete coupon error:", {
            message: error.message,
            data: error.response?.data,
          });
          const message =
            error.response?.data?.message || "Failed to delete coupon.";
          toast.error(message);
          return { success: false, message };
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "shop-auth-storage",
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const { state } = JSON.parse(str);
          return {
            state: {
              seller: state.seller,
              sellerToken: state.sellerToken,
              isSeller: state.isSeller,
            },
          };
        },
        setItem: (name, value) => {
          const str = JSON.stringify({
            state: {
              seller: value.state.seller,
              sellerToken: value.state.sellerToken,
              isSeller: value.state.isSeller,
            },
          });
          localStorage.setItem(name, str);
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);

export default useShopStore;
