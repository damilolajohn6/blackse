import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import { toast } from "react-toastify";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_SERVER || "http://localhost:8000/api/v2";

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      seller: null,
      sellerToken: null,
      isAuthenticated: false,
      isSeller: false,
      isLoading: false,

      // User signup
      signup: async (userData) => {
        set({ isLoading: true });
        try {
          const formData = new FormData();
          formData.append("fullname", JSON.stringify(userData.fullname));
          formData.append("username", userData.username);
          formData.append("email", userData.email);
          formData.append("password", userData.password);
          if (userData.phone) {
            formData.append("phone", JSON.stringify(userData.phone));
          }
          if (userData.avatar) {
            formData.append("avatar", JSON.stringify(userData.avatar));
          }
          formData.append("role", userData.role || "user");

          const formDataEntries = {};
          for (const [key, value] of formData.entries()) {
            formDataEntries[key] = value;
          }
          console.debug("Signup FormData:", formDataEntries);

          const res = await axios.post(
            `${API_BASE_URL}/user/create-user`,
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
              withCredentials: true,
            }
          );

          toast.success(res.data.message);
          return { success: true, email: userData.email };
        } catch (error) {
          console.error("Signup error:", error.message, error.response?.data);
          const message =
            error.response?.data?.message ||
            "Failed to create account. Please try again.";
          toast.error(message);
          return { success: false, message };
        } finally {
          set({ isLoading: false });
        }
      },

      // Verify OTP
      verifyOtp: async (email, otp, router) => {
        set({ isLoading: true });
        try {
          console.debug("Verify OTP request:", {
            url: `${API_BASE_URL}/user/activation`,
            email,
            otp,
          });
          const res = await axios.post(
            `${API_BASE_URL}/user/activation`,
            { email, otp },
            { withCredentials: true }
          );
          const { user, token } = res.data;
          set({
            user,
            token,
            isAuthenticated: true,
            isSeller:
              user.role === "seller" && user.approvalStatus.isSellerApproved,
          });
          localStorage.setItem("token", token);
          toast.success("Account verified successfully!");
          router.push("/login");
          return { success: true };
        } catch (error) {
          console.error(
            "Verify OTP error:",
            error.message,
            error.response?.data
          );
          const message =
            error.response?.data?.message || "Failed to verify OTP.";
          toast.error(message);
          return { success: false, message };
        } finally {
          set({ isLoading: false });
        }
      },

      // Resend OTP
      resendOtp: async (email) => {
        set({ isLoading: true });
        try {
          console.debug("Resend OTP request:", {
            url: `${API_BASE_URL}/user/resend-otp`,
            email,
          });
          const res = await axios.post(
            `${API_BASE_URL}/user/resend-otp`,
            { email },
            { withCredentials: true }
          );
          toast.success(res.data.message);
          return { success: true };
        } catch (error) {
          console.error(
            "Resend OTP error:",
            error.message,
            error.response?.data
          );
          const message =
            error.response?.data?.message || "Failed to resend OTP.";
          toast.error(message);
          return { success: false, message };
        } finally {
          set({ isLoading: false });
        }
      },

      // User login
      login: async (email, password, router) => {
        set({ isLoading: true });
        try {
          console.debug("Login request:", {
            url: `${API_BASE_URL}/user/login-user`,
            email,
          });
          const res = await axios.post(
            `${API_BASE_URL}/user/login-user`,
            { email, password },
            { withCredentials: true }
          );
          const { user, token } = res.data;
          set({
            user,
            token,
            isAuthenticated: true,
            isSeller:
              user.role === "seller" && user.approvalStatus.isSellerApproved,
          });
          localStorage.setItem("token", token);
          toast.success("Login Success!");
          router.push("/");
          return { success: true };
        } catch (error) {
          console.error("Login error:", error.message, error.response?.data);
          const message =
            error.response?.data?.message || "Login failed. Please try again.";
          toast.error(message);
          return { success: false, message };
        } finally {
          set({ isLoading: false });
        }
      },

      // Forgot password
      forgotPassword: async (email) => {
        set({ isLoading: true });
        try {
          console.debug("Forgot password request:", {
            url: `${API_BASE_URL}/user/forgot-password`,
            email,
          });
          const res = await axios.post(
            `${API_BASE_URL}/user/forgot-password`,
            { email },
            { withCredentials: true }
          );
          toast.success(res.data.message);
          return { success: true };
        } catch (error) {
          console.error(
            "Forgot password error:",
            error.message,
            error.response?.data
          );
          const message =
            error.response?.data?.message || "Failed to send reset OTP.";
          toast.error(message);
          return { success: false, message };
        } finally {
          set({ isLoading: false });
        }
      },

      // Reset password
      resetPassword: async (
        email,
        otp,
        newPassword,
        confirmPassword,
        router
      ) => {
        set({ isLoading: true });
        try {
          console.debug("Reset password request:", {
            url: `${API_BASE_URL}/user/reset-password`,
            email,
          });
          const res = await axios.post(
            `${API_BASE_URL}/user/reset-password`,
            { email, otp, newPassword, confirmPassword },
            { withCredentials: true }
          );
          toast.success(res.data.message);
          router.push("/login");
          return { success: true };
        } catch (error) {
          console.error(
            "Reset password error:",
            error.message,
            error.response?.data
          );
          const message =
            error.response?.data?.message || "Failed to reset password.";
          toast.error(message);
          return { success: false, message };
        } finally {
          set({ isLoading: false });
        }
      },

      // Fetch user profile
      fetchProfile: async (userId) => {
        set({ isLoading: true });
        try {
          const { token } = get();
          if (!token) {
            throw new Error("No authentication token available");
          }
          console.debug("Fetch profile request:", {
            url: `${API_BASE_URL}/social/profile/${userId}`,
            userId,
          });
          const { data } = await axios.get(
            `${API_BASE_URL}/social/profile/${userId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
              withCredentials: true,
            }
          );
          return { success: true, profile: data.user };
        } catch (error) {
          console.error(
            "Fetch profile error:",
            error.message,
            error.response?.data
          );
          const message =
            error.response?.data?.message || "Failed to fetch profile";
          toast.error(message);
          return { success: false, message };
        } finally {
          set({ isLoading: false });
        }
      },

      // Shop login
      loginShop: async (email, password, router) => {
        set({ isLoading: true });
        try {
          console.debug("Shop login request:", {
            url: `${API_BASE_URL}/shop/login-shop`,
            email,
          });
          const res = await axios.post(
            `${API_BASE_URL}/shop/login-shop`,
            { email, password },
            { withCredentials: true }
          );
          const { seller, token } = res.data;
          set({
            seller,
            sellerToken: token,
            isSeller: true,
          });
          localStorage.setItem("seller_token", token);
          toast.success("Shop login successful!");
          router.push("/shop/dashboard");
          return { success: true };
        } catch (error) {
          console.error(
            "Shop login error:",
            error.message,
            error.response?.data
          );
          const message = error.response?.data?.message || "Shop login failed.";
          toast.error(message);
          return { success: false, message };
        } finally {
          set({ isLoading: false });
        }
      },

      // Create shop
      createShop: async (shopData, router) => {
        set({ isLoading: true });
        try {
          console.debug("Create shop input data:", shopData);

          const payload = {
            fullname: shopData.fullname,
            name: shopData.name,
            email: shopData.email,
            password: shopData.password,
            address: shopData.address,
            zipCode: shopData.zipCode,
            phone: shopData.phone,
            avatar: shopData.avatar,
          };

          console.debug("Create shop payload:", payload);

          const res = await axios.post(
            `${API_BASE_URL}/shop/create-shop`,
            payload,
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
          console.error(
            "Create shop error:",
            error.message,
            error.response?.data
          );
          const message =
            error.response?.data?.message || "Failed to create shop.";
          toast.error(message);
          return { success: false, message };
        } finally {
          set({ isLoading: false });
        }
      },

      // Activate shop
      activateShop: async (email, otp, router) => {
        set({ isLoading: true });
        try {
          console.debug("Activate shop request:", {
            url: `${API_BASE_URL}/shop/activation`,
            email,
            otp,
          });
          const res = await axios.post(
            `${API_BASE_URL}/shop/activation`,
            { email, otp },
            { withCredentials: true }
          );
          const { seller, token } = res.data;
          set({
            seller,
            sellerToken: token,
            isSeller: true,
          });
          localStorage.setItem("seller_token", token);
          toast.success("Shop activated successfully!");
          router.push("/shop/dashboard");
          return { success: true };
        } catch (error) {
          console.error(
            "Activate shop error:",
            error.message,
            error.response?.data
          );
          const message =
            error.response?.data?.message || "Failed to activate shop.";
          toast.error(message);
          return { success: false, message };
        } finally {
          set({ isLoading: false });
        }
      },

      // Load shop
      loadShop: async () => {
        set({ isLoading: true });
        try {
          const currentToken =
            get().sellerToken || localStorage.getItem("seller_token");
          if (!currentToken) {
            console.warn("loadShop: No sellerToken in store or localStorage");
            set({ seller: null, sellerToken: null, isSeller: false });
            return { success: false, message: "No seller token available" };
          }
          console.debug("Load shop request:", {
            url: `${API_BASE_URL}/shop/getshop`,
          });
          const res = await axios.get(`${API_BASE_URL}/shop/getshop`, {
            headers: { Authorization: `Bearer ${currentToken}` },
            withCredentials: true,
          });
          set({
            seller: res.data.seller,
            sellerToken: res.data.token || currentToken,
            isSeller: true,
          });
          return { success: true, seller: res.data.seller };
        } catch (error) {
          console.error(
            "loadShop error:",
            error.message,
            error.response?.status,
            error.response?.data
          );
          if (
            error.response?.status === 401 ||
            error.response?.status === 404
          ) {
            set({
              seller: null,
              sellerToken: null,
              isSeller: false,
            });
            localStorage.removeItem("seller_token");
          }
          return {
            success: false,
            message: error.response?.data?.message || "Failed to load shop",
          };
        } finally {
          set({ isLoading: false });
        }
      },

      // Create coupon
      createCoupon: async (couponData) => {
        set({ isLoading: true });
        try {
          const { sellerToken, seller } = get();
          if (!sellerToken || !seller) {
            throw new Error("Seller not authenticated");
          }
          console.debug("Create coupon request:", {
            url: `${API_BASE_URL}/coupon/create-coupon-code`,
            couponData,
          });
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
          console.error(
            "Create coupon error:",
            error.message,
            error.response?.data
          );
          const message =
            error.response?.data?.message || "Failed to create coupon.";
          toast.error(message);
          return { success: false, message };
        } finally {
          set({ isLoading: false });
        }
      },

      // Fetch coupons
      fetchCoupons: async () => {
        set({ isLoading: true });
        try {
          const { sellerToken, seller } = get();
          if (!sellerToken || !seller) {
            console.warn("fetchCoupons: Seller not authenticated");
            throw new Error("Seller not authenticated");
          }
          console.debug("Fetch coupons request:", {
            url: `${API_BASE_URL}/coupon/get-coupon/${seller._id}`,
            sellerId: seller._id,
          });
          const res = await axios.get(
            `${API_BASE_URL}/coupon/get-coupon/${seller._id}`,
            {
              headers: { Authorization: `Bearer ${sellerToken}` },
              withCredentials: true,
            }
          );
          console.info("Coupons fetched:", {
            shopId: seller._id,
            count: res.data.couponCodes?.length || 0,
          });
          return { success: true, coupons: res.data.couponCodes || [] };
        } catch (error) {
          console.error(
            "Fetch coupons error:",
            error.message,
            error.response?.status,
            error.response?.data
          );
          const message =
            error.response?.data?.message || "Failed to fetch coupons.";
          toast.error(message);
          return {
            success: false,
            coupons: [],
            message,
          };
        } finally {
          set({ isLoading: false });
        }
      },

      // Update coupon
      updateCoupon: async (couponId, couponData) => {
        set({ isLoading: true });
        try {
          const { sellerToken, seller } = get();
          if (!sellerToken || !seller) {
            throw new Error("Seller not authenticated");
          }
          console.debug("Update coupon request:", {
            url: `${API_BASE_URL}/coupon/update-coupon/${couponId}`,
            couponData,
          });
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
          console.error(
            "Update coupon error:",
            error.message,
            error.response?.data
          );
          const message =
            error.response?.data?.message || "Failed to update coupon.";
          toast.error(message);
          return { success: false, message };
        } finally {
          set({ isLoading: false });
        }
      },

      // Delete coupon
      deleteCoupon: async (couponId) => {
        set({ isLoading: true });
        try {
          const { sellerToken, seller } = get();
          if (!sellerToken || !seller) {
            throw new Error("Seller not authenticated");
          }
          console.debug("Delete coupon request:", {
            url: `${API_BASE_URL}/coupon/delete-coupon/${couponId}`,
          });
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
          console.error(
            "Delete coupon error:",
            error.message,
            error.response?.data
          );
          const message =
            error.response?.data?.message || "Failed to delete coupon.";
          toast.error(message);
          return { success: false, message };
        } finally {
          set({ isLoading: false });
        }
      },

      // Logout (all roles)
      logout: async (router) => {
        set({ isLoading: true });
        try {
          console.debug("Logout request:", {
            user: `${API_BASE_URL}/user/logout`,
            shop: `${API_BASE_URL}/shop/logout`,
          });
          await Promise.all([
            axios.get(`${API_BASE_URL}/user/logout`, { withCredentials: true }),
            axios.get(`${API_BASE_URL}/shop/logout`, { withCredentials: true }),
          ]);
          set({
            user: null,
            token: null,
            seller: null,
            sellerToken: null,
            isAuthenticated: false,
            isSeller: false,
          });
          localStorage.removeItem("token");
          localStorage.removeItem("seller_token");
          toast.success("Log out successful!");
          router.push("/login");
          return { success: true };
        } catch (error) {
          console.error("Logout error:", error.message, error.response?.data);
          const message = error.response?.data?.message || "Logout failed.";
          toast.error(message);
          return { success: false, message };
        } finally {
          set({ isLoading: false });
        }
      },

      // Check authentication
      checkAuth: async () => {
        set({ isLoading: true });
        try {
          const token = localStorage.getItem("token");
          const sellerToken = localStorage.getItem("seller_token");

          if (token) {
            console.debug("Check user auth request:", {
              url: `${API_BASE_URL}/user/getuser`,
            });
            const { data } = await axios.get(`${API_BASE_URL}/user/getuser`, {
              headers: { Authorization: `Bearer ${token}` },
              withCredentials: true,
            });
            set({
              user: data.user,
              token,
              isAuthenticated: true,
              isSeller:
                data.user.role === "seller" &&
                data.user.approvalStatus.isSellerApproved,
            });
            return { success: true, isAuthenticated: true };
          } else if (sellerToken) {
            console.debug("Check seller auth request:", {
              url: `${API_BASE_URL}/shop/getshop`,
            });
            const { data } = await axios.get(`${API_BASE_URL}/shop/getshop`, {
              headers: { Authorization: `Bearer ${sellerToken}` },
              withCredentials: true,
            });
            set({
              seller: data.seller,
              sellerToken,
              isSeller: true,
            });
            return { success: true, isSeller: true };
          } else {
            console.debug("checkAuth: No tokens found");
            return {
              success: false,
              isAuthenticated: false,
              isSeller: false,
            };
          }
        } catch (error) {
          console.error(
            "Check auth error:",
            error.message,
            error.response?.data
          );
          set({
            isAuthenticated: false,
            isSeller: false,
            user: null,
            token: null,
            seller: null,
            sellerToken: null,
          });
          localStorage.removeItem("token");
          localStorage.removeItem("seller_token");
          return {
            success: false,
            isAuthenticated: false,
            isSeller: false,
          };
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "auth-storage",
      storage: {
        getItem: (name) => {
          const value = localStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: (name, value) =>
          localStorage.setItem(name, JSON.stringify(value)),
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);

export default useAuthStore;
