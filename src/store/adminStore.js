import { create } from "zustand";
import axios from "axios";
import { toast } from "react-toastify";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_SERVER || "http://localhost:8000/api/v2";

const useAdminStore = create((set) => ({
  admin: null,
  adminToken: null,
  isAdmin: false,
  isLoading: false,
  users: [],
  sellers: [],
  withdrawals: [],

  login: async (email, password, router) => {
    set({ isLoading: true });
    try {
      const res = await axios.post(
        `${API_BASE_URL}/admin/login-admin`,
        { email, password },
        { withCredentials: true }
      );
      set({
        admin: res.data.admin,
        adminToken: res.data.token,
        isAdmin: true,
      });
      toast.success("Logged in successfully!");
      router.push("/admin/dashboard");
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to login";
      console.error("Admin login error:", errorMessage);
      toast.error(errorMessage);
      return { success: false };
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async (router) => {
    set({ isLoading: true });
    try {
      await axios.get(`${API_BASE_URL}/admin/logout`, {
        withCredentials: true,
      });
      set({
        admin: null,
        adminToken: null,
        isAdmin: false,
        users: [],
        sellers: [],
        withdrawals: [],
      });
      toast.success("Logged out successfully!");
      router.push("/admin/login");
    } catch (error) {
      console.error("Admin logout error:", error.message);
      toast.error("Failed to logout");
    } finally {
      set({ isLoading: false });
    }
  },

  loadAdmin: async () => {
    set({ isLoading: true });
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/get-admin`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${useAdminStore.getState().adminToken}`,
        },
      });
      set({ admin: res.data.admin, isAdmin: true });
    } catch (error) {
      console.error("Load admin error:", error.message);
      set({ admin: null, adminToken: null, isAdmin: false });
    } finally {
      set({ isLoading: false });
    }
  },

  updateAdminProfile: async (data) => {
    set({ isLoading: true });
    try {
      const res = await axios.put(`${API_BASE_URL}/admin/update-admin`, data, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${useAdminStore.getState().adminToken}`,
        },
      });
      set({ admin: res.data.admin });
      toast.success("Profile updated successfully!");
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update profile";
      console.error("Update admin profile error:", errorMessage);
      toast.error(errorMessage);
      return { success: false };
    } finally {
      set({ isLoading: false });
    }
  },

  registerAdmin: async (data, router) => {
    set({ isLoading: true });
    try {
      const res = await axios.post(
        `${API_BASE_URL}/admin/create-admin`,
        data,
        { withCredentials: true }
      );
      set({
        admin: res.data.admin,
        adminToken: res.data.token,
        isAdmin: true,
      });
      toast.success("Admin registered successfully!");
      router.push("/admin/dashboard");
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to register";
      console.error("Admin register error:", errorMessage);
      toast.error(errorMessage);
      return { success: false };
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUsers: async () => {
    set({ isLoading: true });
    try {
      const res = await axios.get(`${API_BASE_URL}/user/admin-all-users`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${useAdminStore.getState().adminToken}`,
        },
      });
      set({ users: res.data.users });
    } catch (error) {
      console.error("Fetch users error:", error.message);
      toast.error("Failed to fetch users");
    } finally {
      set({ isLoading: false });
    }
  },

  deleteUser: async (userId) => {
    set({ isLoading: true });
    try {
      await axios.delete(`${API_BASE_URL}/user/delete-user/${userId}`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${useAdminStore.getState().adminToken}`,
        },
      });
      set((state) => ({
        users: state.users.filter((user) => user._id !== userId),
      }));
      toast.success("User deleted successfully!");
    } catch (error) {
      console.error("Delete user error:", error.message);
      toast.error("Failed to delete user");
    } finally {
      set({ isLoading: false });
    }
  },

  fetchSellers: async () => {
    set({ isLoading: true });
    try {
      const res = await axios.get(`${API_BASE_URL}/shop/admin-all-sellers`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${useAdminStore.getState().adminToken}`,
        },
      });
      set({ sellers: res.data.sellers });
    } catch (error) {
      console.error("Fetch sellers error:", error.message);
      toast.error("Failed to fetch sellers");
    } finally {
      set({ isLoading: false });
    }
  },

  deleteSeller: async (sellerId) => {
    set({ isLoading: true });
    try {
      await axios.delete(`${API_BASE_URL}/shop/delete-seller/${sellerId}`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${useAdminStore.getState().adminToken}`,
        },
      });
      set((state) => ({
        sellers: state.sellers.filter((seller) => seller._id !== sellerId),
      }));
      toast.success("Seller deleted successfully!");
    } catch (error) {
      console.error("Delete seller error:", error.message);
      toast.error("Failed to delete seller");
    } finally {
      set({ isLoading: false });
    }
  },

  fixSellerProfile: async (sellerId, firstName, lastName) => {
    set({ isLoading: true });
    try {
      const res = await axios.put(
        `${API_BASE_URL}/shop/admin-fix-shop-profile/${sellerId}`,
        { firstName, lastName },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${useAdminStore.getState().adminToken}`,
          },
        }
      );
      set((state) => ({
        sellers: state.sellers.map((seller) =>
          seller._id === sellerId ? res.data.shop : seller
        ),
      }));
      toast.success("Seller profile updated successfully!");
    } catch (error) {
      console.error("Fix seller profile error:", error.message);
      toast.error("Failed to update seller profile");
    } finally {
      set({ isLoading: false });
    }
  },

  fetchWithdrawals: async () => {
    set({ isLoading: true });
    try {
      const res = await axios.get(
        `${API_BASE_URL}/withdraw/get-all-withdraw-request`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${useAdminStore.getState().adminToken}`,
          },
        }
      );
      set({ withdrawals: res.data.withdrawals });
    } catch (error) {
      console.error("Fetch withdrawals error:", error.message);
      toast.error("Failed to fetch withdrawals");
    } finally {
      set({ isLoading: false });
    }
  },

  updateWithdrawal: async (withdrawalId, status, reason) => {
    set({ isLoading: true });
    try {
      const res = await axios.put(
        `${API_BASE_URL}/withdraw/update-withdraw-request/${withdrawalId}`,
        { status, reason },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${useAdminStore.getState().adminToken}`,
          },
        }
      );
      set((state) => ({
        withdrawals: state.withdrawals.map((withdrawal) =>
          withdrawal._id === withdrawalId ? res.data.withdraw : withdrawal
        ),
      }));
      toast.success("Withdrawal updated successfully!");
    } catch (error) {
      console.error("Update withdrawal error:", error.message);
      toast.error("Failed to update withdrawal");
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useAdminStore;
