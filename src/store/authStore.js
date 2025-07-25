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
      isAuthenticated: false,
      isLoading: false,

      // User signup
      signup: async (userData) => {
        set({ isLoading: true });
        try {
          const formData = new FormData();
          formData.append("fullname", userData.fullname);
          formData.append("username", userData.username);
          formData.append("email", userData.email);
          formData.append("password", userData.password);
          if (userData.phone) {
            formData.append("phone", userData.phone);
          }
          if (userData.avatar) {
            // Assuming avatar is a File object
            formData.append("avatar", userData.avatar);
          }
          formData.append("role", userData.role || "user");

          console.debug("Signup FormData:", Object.fromEntries(formData));

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
          console.debug("Verify OTP request:", { email, otp });
          const res = await axios.post(
            `${API_BASE_URL}/user/activation`,
            { email, otp },
            { withCredentials: true }
          );
          const { user, token } = res.data;
          set({ user, token, isAuthenticated: true });
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
          console.debug("Resend OTP request:", { email });
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
          console.debug("Login request:", { email });
          const res = await axios.post(
            `${API_BASE_URL}/user/login-user`,
            { email, password },
            { withCredentials: true }
          );
          const { user, token } = res.data;
          set({ user, token, isAuthenticated: true });
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
          console.debug("Forgot password request:", { email });
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
          console.debug("Reset password request:", { email });
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
          console.debug("Fetch profile request:", { userId });
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

      // User logout
      logout: async (router) => {
        set({ isLoading: true });
        try {
          console.debug("User logout request");
          await axios.get(`${API_BASE_URL}/user/logout`, {
            withCredentials: true,
          });
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
          localStorage.removeItem("token");
          toast.success("Logged out successfully!");
          router.push("/login");
          return { success: true };
        } catch (error) {
          console.error("Logout error:", error.message, error.response?.data);
          // Force logout on client-side even if server fails
          set({ user: null, token: null, isAuthenticated: false });
          localStorage.removeItem("token");
          const message = error.response?.data?.message || "Logout failed.";
          toast.error(message);
          return { success: false, message };
        } finally {
          set({ isLoading: false });
        }
      },

      // Check user authentication
      checkAuth: async () => {
        set({ isLoading: true });
        const token = get().token || localStorage.getItem("token");
        if (!token) {
          set({ isAuthenticated: false, isLoading: false });
          return { success: false, isAuthenticated: false };
        }

        try {
          console.debug("Checking user auth...");
          const { data } = await axios.get(`${API_BASE_URL}/user/getuser`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          });
          set({
            user: data.user,
            token,
            isAuthenticated: true,
          });
          return { success: true, isAuthenticated: true };
        } catch (error) {
          console.error(
            "Check auth error:",
            error.message,
            error.response?.data
          );
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
          localStorage.removeItem("token");
          return { success: false, isAuthenticated: false };
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "user-auth-storage",
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const { state } = JSON.parse(str);
          return {
            state: {
              user: state.user,
              token: state.token,
              isAuthenticated: state.isAuthenticated,
            },
          };
        },
        setItem: (name, value) => {
          const str = JSON.stringify({
            state: {
              user: value.state.user,
              token: value.state.token,
              isAuthenticated: value.state.isAuthenticated,
            },
          });
          localStorage.setItem(name, str);
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);

export default useAuthStore;
