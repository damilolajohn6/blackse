import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import { toast } from "react-toastify";

// Helper function to get cookie value
const getCookie = (name) => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

import { API_CONFIG } from "@/config/api";

const API_BASE_URL = API_CONFIG.BASE_URL;

const uploadToCloudinary = async (file, folder, resourceType) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "upload_preset",
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
  );
  formData.append("cloud_name", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
  formData.append("folder", folder);
  formData.append("resource_type", resourceType);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
    { method: "POST", body: formData }
  );
  const data = await res.json();
  if (!data.secure_url) {
    throw new Error(`Failed to upload ${resourceType} to Cloudinary`);
  }
  return data;
};

const useInstructorStore = create(
  persist(
    (set, get) => ({
      instructor: null,
      instructorToken: null,
      isInstructor: false,
      isLoading: false,
      dashboardStats: null,
      withdrawals: [],
      courses: [],
      totalCourses: 0,
      liveClasses: [],
      totalLiveClasses: 0,
      activeLiveClass: null,
      liveClassStats: null,

      // Utility methods
      isTokenValid: () => {
        const token =
          get().instructorToken ||
          (typeof window !== "undefined"
            ? localStorage.getItem("instructor_token")
            : null) ||
          getCookie("instructor_token");
        if (!token) return false;

        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          const currentTime = Date.now() / 1000;
          return payload.exp > currentTime;
        } catch {
          return false;
        }
      },

      clearInstructorData: () => {
        set({
          instructor: null,
          instructorToken: null,
          isInstructor: false,
          dashboardStats: null,
          withdrawals: [],
          courses: [],
          totalCourses: 0,
          liveClasses: [],
          totalLiveClasses: 0,
          activeLiveClass: null,
          liveClassStats: null,
        });
        if (typeof window !== "undefined") {
          localStorage.removeItem("instructor_token");
        }
      },

      refreshToken: async () => {
        try {
          const currentToken =
            get().instructorToken ||
            (typeof window !== "undefined"
              ? localStorage.getItem("instructor_token")
              : null) ||
            getCookie("instructor_token");

          if (!currentToken) {
            return { success: false, message: "No token to refresh" };
          }

          const res = await axios.post(
            `${API_BASE_URL}/instructor/refresh-token`,
            {},
            {
              headers: { Authorization: `Bearer ${currentToken}` },
              withCredentials: true,
            }
          );

          const newToken = res.data.token || res.data.data?.token;
          if (!newToken) {
            throw new Error("No new token received");
          }

          set({ instructorToken: newToken });
          if (typeof window !== "undefined") {
            localStorage.setItem("instructor_token", newToken);
          }
          return { success: true, token: newToken };
        } catch (error) {
          console.error(
            "Refresh token error:",
            error.response?.data || error.message
          );
          return { success: false, message: "Token refresh failed" };
        }
      },

      loadInstructor: async () => {
        set({ isLoading: true });
        
        // Set a timeout to prevent loading from getting stuck
        const timeoutId = setTimeout(() => {
          console.warn("Load instructor timeout - forcing loading to false");
          set({ isLoading: false });
        }, 10000); // 10 second timeout

        try {
          const currentToken =
            get().instructorToken ||
            (typeof window !== "undefined"
              ? localStorage.getItem("instructor_token")
              : null) ||
            getCookie("instructor_token");

          console.log("Load instructor token check:", {
            storeToken: !!get().instructorToken,
            localStorageToken:
              typeof window !== "undefined"
                ? !!localStorage.getItem("instructor_token")
                : false,
            cookieToken: !!getCookie("instructor_token"),
            hasToken: !!currentToken,
          });

          if (!currentToken) {
            console.log("No instructor token available for loadInstructor");
            set({
              instructor: null,
              instructorToken: null,
              isInstructor: false,
            });
            return { success: false, message: "No instructor token available", isInstructor: false };
          }

          const res = await axios.get(
            `${API_BASE_URL}/instructor/get-instructor`,
            {
              headers: { Authorization: `Bearer ${currentToken}` },
              withCredentials: true,
              timeout: API_CONFIG.TIMEOUT,
            }
          );

          console.log("Load instructor response:", res.data);

          const instructorData =
            res.data.data || res.data.instructor || res.data;

          if (!instructorData) {
            console.error("No instructor data found in response:", res.data);
            throw new Error("Instructor data not found in response");
          }

          set({
            instructor: instructorData,
            instructorToken: currentToken,
            isInstructor:
              instructorData.approvalStatus?.isInstructorApproved || false,
          });

          if (typeof window !== "undefined") {
            localStorage.setItem("instructor_token", currentToken);
          }
          return { success: true, instructor: instructorData };
        } catch (error) {
          console.error(
            "Load instructor error:",
            error.message,
            error.response?.data
          );

          // Handle network errors gracefully
          if (error.message?.includes('Network Error') || error.message?.includes('CONNECTION_REFUSED') || error.code === 'NETWORK_ERROR') {
            console.log("Network error during instructor load, backend may be unavailable");
            return { success: false, message: "Network error - backend unavailable" };
          }

          if (
            error.response?.status === 401 ||
            error.response?.status === 404
          ) {
            set({
              instructor: null,
              instructorToken: null,
              isInstructor: false,
            });
            if (typeof window !== "undefined") {
              localStorage.removeItem("instructor_token");
            }
          } else {
            // For other errors, also reset instructor data to prevent inconsistent state
            set({
              instructor: null,
              instructorToken: null,
              isInstructor: false,
            });
          }
          return {
            success: false,
            message:
              error.response?.data?.message || "Failed to load instructor",
            isInstructor: false,
          };
        } finally {
          clearTimeout(timeoutId);
          set({ isLoading: false });
        }
      },

      checkInstructorAuth: async () => {
        set({ isLoading: true });
        try {
          const token =
            typeof window !== "undefined"
              ? localStorage.getItem("instructor_token")
              : null;
          if (!token) {
            set({
              instructor: null,
              instructorToken: null,
              isInstructor: false,
            });
            return { success: false, isInstructor: false };
          }

          const res = await axios.get(
            `${API_BASE_URL}/instructor/get-instructor`,
            {
              headers: { Authorization: `Bearer ${token}` },
              withCredentials: true,
            }
          );

          const instructorData =
            res.data.data || res.data.instructor || res.data;
          set({
            instructor: instructorData,
            instructorToken: token,
            isInstructor:
              instructorData?.approvalStatus?.isInstructorApproved || false,
          });
          return { success: true, isInstructor: true };
        } catch (error) {
          console.error(
            "Check instructor auth error:",
            error.message,
            error.response?.data
          );
          set({ instructor: null, instructorToken: null, isInstructor: false });
          if (typeof window !== "undefined") {
            localStorage.removeItem("instructor_token");
          }
          return { success: false, isInstructor: false };
        } finally {
          set({ isLoading: false });
        }
      },

      loginInstructor: async (email, password, router) => {
        set({ isLoading: true });
        try {
          const res = await axios.post(
            `${API_BASE_URL}/instructor/login-instructor`,
            { email, password },
            { withCredentials: true }
          );

          console.log("Login response:", res.data);

          const { instructor, token } = res.data.data || res.data;

          if (!instructor) {
            throw new Error("Instructor data not found in response");
          }

          if (!token) {
            throw new Error("Authentication token not found in response");
          }

          const isApproved =
            instructor.approvalStatus?.isInstructorApproved || false;

          set({
            instructor: instructor,
            instructorToken: token,
            isInstructor: isApproved,
          });

          if (typeof window !== "undefined") {
            localStorage.setItem("instructor_token", token);
          }

          toast.success("Instructor login successful!");
          router.push("/instructor/dashboard");
          return { success: true };
        } catch (error) {
          console.error(
            "Instructor login error:",
            error.message,
            error.response?.data
          );
          const message =
            error.response?.data?.message ||
            error.message ||
            "Instructor login failed.";
          toast.error(message);
          return { success: false, message };
        } finally {
          set({ isLoading: false });
        }
      },

      logoutInstructor: async (router) => {
        set({ isLoading: true });
        try {
          await axios.get(`${API_BASE_URL}/instructor/instructor-logout`, {
            withCredentials: true,
          });

          get().clearInstructorData();
          toast.success("Instructor logged out successfully!");
          await router.push("/instructor/auth/login");
          return { success: true };
        } catch (error) {
          console.error(
            "Instructor logout error:",
            error.message,
            error.response?.data
          );
          const message =
            error.response?.data?.message || "Instructor logout failed.";
          toast.error(message);
          return { success: false, message };
        } finally {
          set({ isLoading: false });
        }
      },

      updateInstructor: async (instructorData) => {
        set({ isLoading: true });
        try {
          if (!instructorData || Object.keys(instructorData).length === 0) {
            throw new Error("No data provided for update");
          }

          const res = await axios.put(
            `${API_BASE_URL}/instructor/update-instructor`,
            instructorData,
            {
              headers: { Authorization: `Bearer ${get().instructorToken}` },
              withCredentials: true,
            }
          );

          set({ instructor: res.data.instructor });
          toast.success("Profile updated successfully");
          return { success: true, instructor: res.data.instructor };
        } catch (error) {
          console.error(
            "Instructor update error:",
            error.response?.data || error.message
          );
          toast.error(
            error.response?.data?.message || "Failed to update profile"
          );
          return {
            success: false,
            message: error.response?.data?.message || error.message,
          };
        } finally {
          set({ isLoading: false });
        }
      },

      loadDashboardAnalytics: async (period = "30d") => {
        set({ isLoading: true });
        try {
          console.log("Loading dashboard analytics with period:", period);
          
          // Check if we have a valid token
          const token = get().instructorToken;
          if (!token) {
            console.warn("No instructor token available for dashboard analytics");
            return { success: false, message: "No authentication token" };
          }

          const res = await axios.get(
            `${API_BASE_URL}/course/instructor-dashboard`,
            {
              params: { period },
              headers: { Authorization: `Bearer ${token}` },
              withCredentials: true,
              timeout: API_CONFIG.TIMEOUT,
            }
          );
          
          console.log("Dashboard analytics response:", res.data);
          const dashboardData = res.data.data || res.data;
          
          // Handle case where dashboard data might be null or undefined
          if (!dashboardData) {
            console.warn("No dashboard data received from API");
            const defaultData = {
              overview: {
                totalCourses: 0,
                publishedCourses: 0,
                draftCourses: 0,
                totalEnrollments: 0,
                totalRevenue: 0,
                averageRating: 0,
              },
              recentAnalytics: {
                newEnrollments: 0,
                newReviews: 0,
                averageRating: 0,
              },
              topCourses: [],
            };
            set({ dashboardStats: defaultData });
            return { success: true, stats: defaultData };
          }
          
          // Transform the data structure to match frontend expectations
          const transformedData = {
            totalCourses: dashboardData.overview?.totalCourses || 0,
            publishedCourses: dashboardData.overview?.publishedCourses || 0,
            draftCourses: dashboardData.overview?.draftCourses || 0,
            totalEnrollments: dashboardData.overview?.totalEnrollments || 0,
            totalRevenue: dashboardData.overview?.totalRevenue || 0,
            averageRating: dashboardData.overview?.averageRating || 0,
            accountBalance: dashboardData.overview?.totalRevenue || 0, // Use revenue as available balance
            monthlyEnrollments: dashboardData.recentAnalytics?.newEnrollments || 0,
            totalReviews: dashboardData.recentAnalytics?.newReviews || 0,
            recentAnalytics: dashboardData.recentAnalytics,
            topCourses: dashboardData.topCourses,
          };
          
          set({ dashboardStats: transformedData });
          return { success: true, stats: transformedData };
        } catch (error) {
          console.error(
            "Load dashboard analytics error:",
            error.message,
            error.response?.data
          );
          
          // Handle specific error types
          if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
            console.warn("Network error - backend may be unavailable");
            return { success: false, message: "Network error - please check your connection" };
          }
          
          if (error.response?.status === 401) {
            console.warn("Authentication failed - token may be expired");
            return { success: false, message: "Authentication failed" };
          }
          
          if (error.response?.status === 404) {
            console.warn("Dashboard endpoint not found");
            return { success: false, message: "Dashboard service unavailable" };
          }
          
          const message = error.response?.data?.message || "Failed to load analytics";
          return { success: false, message };
        } finally {
          set({ isLoading: false });
        }
      },

      getInstructorStats: async () => {
        try {
          const token = get().instructorToken;
          if (!token) {
            console.warn("No instructor token available for stats");
            return { success: false, message: "No authentication token" };
          }

          const res = await axios.get(
            `${API_BASE_URL}/instructor/instructor-stats`,
            {
              headers: { Authorization: `Bearer ${token}` },
              withCredentials: true,
              timeout: API_CONFIG.TIMEOUT,
            }
          );
          const stats = res.data.data || res.data.stats || res.data;
          return { success: true, stats };
        } catch (error) {
          console.error(
            "Get instructor stats error:",
            error.message,
            error.response?.data
          );
          
          // Handle specific error types
          if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
            console.warn("Network error - backend may be unavailable");
            return { success: false, message: "Network error - please check your connection" };
          }
          
          // Return default stats instead of failing
          const defaultStats = {
            totalCourses: 0,
            totalStudents: 0,
            totalEarnings: 0,
            averageRating: 0,
            totalReviews: 0,
          };
          return { success: true, stats: defaultStats };
        }
      },

      fetchWithdrawals: async (params = {}) => {
        try {
          const res = await axios.get(
            `${API_BASE_URL}/instructor-withdraw/get-my-instructor-withdrawals`,
            {
              params,
              headers: { Authorization: `Bearer ${get().instructorToken}` },
              withCredentials: true,
            }
          );
          const withdrawalsData = res.data.data || res.data;
          set({
            withdrawals: withdrawalsData.withdrawals || [],
            totalWithdrawals: withdrawalsData.total || 0,
          });
          return { success: true, withdrawals: withdrawalsData.withdrawals || [] };
        } catch (error) {
          console.error(
            "Fetch withdrawals error:",
            error.message,
            error.response?.data
          );
          const message =
            error.response?.data?.message || "Failed to fetch withdrawals";
          return { success: false, message, withdrawals: [] };
        }
      },

      getWithdrawalStats: async () => {
        try {
          console.log("Loading withdrawal stats");
          const res = await axios.get(
            `${API_BASE_URL}/instructor-withdraw/withdrawal-stats`,
            {
              headers: { Authorization: `Bearer ${get().instructorToken}` },
              withCredentials: true,
            }
          );
          console.log("Withdrawal stats response:", res.data);
          const stats = res.data.data || res.data.stats || res.data;
          return { success: true, stats };
        } catch (error) {
          console.error(
            "Get withdrawal stats error:",
            error.message,
            error.response?.data
          );
          // Return default stats instead of failing
          const defaultStats = {
            totalWithdrawals: 0,
            totalAmount: 0,
            pendingAmount: 0,
            approvedAmount: 0,
            succeededAmount: 0,
            rejectedAmount: 0,
            statusBreakdown: {}
          };
          console.log("Using default withdrawal stats:", defaultStats);
          return { success: true, stats: defaultStats };
        }
      },

      cancelWithdrawal: async (withdrawalId) => {
        set({ isLoading: true });
        try {
          const res = await axios.delete(
            `${API_BASE_URL}/instructor-withdraw/cancel-withdrawal/${withdrawalId}`,
            {
              headers: { Authorization: `Bearer ${get().instructorToken}` },
              withCredentials: true,
            }
          );
          
          // Update local state
          set((state) => ({
            withdrawals: state.withdrawals.map(w => 
              w._id === withdrawalId 
                ? { ...w, status: 'Cancelled' }
                : w
            ),
          }));
          
          toast.success(res.data.message || "Withdrawal cancelled successfully");
          return { success: true };
        } catch (error) {
          console.error(
            "Cancel withdrawal error:",
            error.message,
            error.response?.data
          );
          const message =
            error.response?.data?.message || "Failed to cancel withdrawal";
          toast.error(message);
          return { success: false, message };
        } finally {
          set({ isLoading: false });
        }
      },

      fetchCourses: async (params = {}) => {
        try {
          const token = get().instructorToken;
          if (!token) {
            console.warn("No instructor token available for courses");
            return { success: false, message: "No authentication token", courses: [] };
          }

          const res = await axios.get(
            `${API_BASE_URL}/course/get-instructor-courses`,
            {
              params,
              headers: { Authorization: `Bearer ${token}` },
              withCredentials: true,
              timeout: API_CONFIG.TIMEOUT,
            }
          );
          const coursesData = res.data.data || res.data;
          set({
            courses: coursesData.courses || [],
            totalCourses: coursesData.total || 0,
          });
          return { success: true, courses: coursesData.courses || [] };
        } catch (error) {
          console.error(
            "Fetch courses error:",
            error.message,
            error.response?.data
          );
          
          // Handle specific error types
          if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
            console.warn("Network error - backend may be unavailable");
            return { success: false, message: "Network error - please check your connection", courses: [] };
          }
          
          const message = error.response?.data?.message || "Failed to fetch courses";
          return { success: false, message, courses: [] };
        }
      },

      getCourseById: async (courseId) => {
        try {
          const res = await axios.get(
            `${API_BASE_URL}/course/get-course/${courseId}`,
            {
              headers: { Authorization: `Bearer ${get().instructorToken}` },
              withCredentials: true,
            }
          );
          const courseData = res.data.data || res.data;
          return { success: true, course: courseData.course };
        } catch (error) {
          console.error(
            "Get course error:",
            error.message,
            error.response?.data
          );
          const message =
            error.response?.data?.message || "Failed to fetch course";
          return { success: false, message };
        }
      },

      getCourseAnalytics: async (courseId, period = "30d") => {
        try {
          const res = await axios.get(
            `${API_BASE_URL}/course/course-analytics/${courseId}`,
            {
              params: { period },
              headers: { Authorization: `Bearer ${get().instructorToken}` },
              withCredentials: true,
            }
          );
          const analytics = res.data.data || res.data;
          return { success: true, analytics };
        } catch (error) {
          console.error(
            "Get course analytics error:",
            error.message,
            error.response?.data
          );
          const message =
            error.response?.data?.message || "Failed to fetch course analytics";
          return { success: false, message };
        }
      },

      getCourseInsights: async (courseId) => {
        try {
          const res = await axios.get(
            `${API_BASE_URL}/course/course-insights/${courseId}`,
            {
              headers: { Authorization: `Bearer ${get().instructorToken}` },
              withCredentials: true,
            }
          );
          const insights = res.data.data || res.data;
          return { success: true, insights };
        } catch (error) {
          console.error(
            "Get course insights error:",
            error.message,
            error.response?.data
          );
          const message =
            error.response?.data?.message || "Failed to fetch course insights";
          return { success: false, message };
        }
      },

      createWithdrawal: async (amount, withdrawMethod, bankDetails = {}) => {
        set({ isLoading: true });
        try {
          if (!amount || amount <= 0) {
            throw new Error("Please enter a valid withdrawal amount");
          }

          if (!withdrawMethod) {
            throw new Error("Please select a withdrawal method");
          }

          if (amount < 10) {
            throw new Error("Minimum withdrawal amount is $10");
          }

          if (amount > 10000) {
            throw new Error("Maximum withdrawal amount is $10,000 per day");
          }

          const payload = {
            amount,
            withdrawMethod,
            ...(withdrawMethod.type === "BankTransfer" && bankDetails),
          };

          const res = await axios.post(
            `${API_BASE_URL}/instructor-withdraw/create-instructor-withdraw-request`,
            payload,
            {
              headers: { Authorization: `Bearer ${get().instructorToken}` },
              withCredentials: true,
            }
          );

          const withdrawalData = res.data.data || res.data;
          set((state) => ({
            withdrawals: [withdrawalData.withdraw, ...state.withdrawals],
          }));
          toast.success("Withdrawal request created successfully!");
          return { success: true, withdraw: withdrawalData.withdraw };
        } catch (error) {
          console.error(
            "Create withdrawal error:",
            error.message,
            error.response?.data
          );
          const message =
            error.response?.data?.message ||
            error.message ||
            "Failed to create withdrawal";
          toast.error(message);
          return { success: false, message };
        } finally {
          set({ isLoading: false });
        }
      },

      createCourse: async (courseData, router) => {
        set({ isLoading: true });
        try {
          const res = await axios.post(
            `${API_BASE_URL}/course/create-course`,
            courseData,
            {
              headers: { Authorization: `Bearer ${get().instructorToken}` },
              withCredentials: true,
            }
          );
          const courseResult = res.data.data || res.data;
          toast.success("Course created successfully");
          router.push("/instructor/dashboard/courses");
          return { success: true, course: courseResult.course };
        } catch (error) {
          console.error(
            "Course creation error:",
            error.response?.data || error.message
          );
          toast.error(
            error.response?.data?.message || "Failed to create course"
          );
          return {
            success: false,
            message: error.response?.data?.message || error.message,
          };
        } finally {
          set({ isLoading: false });
        }
      },

      updateCourse: async (courseId, courseData) => {
        set({ isLoading: true });
        try {
          const res = await axios.put(
            `${API_BASE_URL}/course/update-course/${courseId}`,
            courseData,
            {
              headers: { Authorization: `Bearer ${get().instructorToken}` },
              withCredentials: true,
            }
          );

          const courseResult = res.data.data || res.data;
          toast.success("Course updated successfully");
          return { success: true, course: courseResult.course };
        } catch (error) {
          console.error(
            "Course update error:",
            error.response?.data || error.message
          );
          toast.error(
            error.response?.data?.message || "Failed to update course"
          );
          return {
            success: false,
            message: error.response?.data?.message || error.message,
          };
        } finally {
          set({ isLoading: false });
        }
      },

      publishCourse: async (courseId, router) => {
        set({ isLoading: true });
        try {
          const res = await axios.post(
            `${API_BASE_URL}/course/publish-course/${courseId}`,
            {},
            { 
              headers: { Authorization: `Bearer ${get().instructorToken}` },
              withCredentials: true,
            }
          );
          const publishResult = res.data.data || res.data;
          toast.success("Course submitted for review");
          router.push("/instructor/dashboard/courses");
          return { success: true, course: publishResult.course };
        } catch (error) {
          console.error(
            "Publish course error:",
            error.response?.data || error.message
          );
          toast.error(
            error.response?.data?.message || "Failed to publish course"
          );
          return {
            success: false,
            message: error.response?.data?.message || error.message,
          };
        } finally {
          set({ isLoading: false });
        }
      },

      deleteCourse: async (courseId) => {
        set({ isLoading: true });
        try {
          await axios.delete(
            `${API_BASE_URL}/course/delete-course/${courseId}`,
            {
              headers: { Authorization: `Bearer ${get().instructorToken}` },
              withCredentials: true,
            }
          );
          set((state) => ({
            courses: state.courses.filter((course) => course._id !== courseId),
            totalCourses: state.totalCourses - 1,
          }));
          return { success: true };
        } catch (error) {
          console.error(
            "Delete course error:",
            error.message,
            error.response?.data
          );
          return {
            success: false,
            message: error.response?.data?.message || "Failed to delete course",
          };
        } finally {
          set({ isLoading: false });
        }
      },

      signupInstructor: async (instructorData, router) => {
        set({ isLoading: true });
        try {
          const requiredFields = [
            "fullname.firstName",
            "fullname.lastName",
            "email",
            "password",
            "phoneNumber.countryCode",
            "phoneNumber.number",
          ];
          const missingFields = requiredFields.filter(
            (field) =>
              !field.split(".").reduce((obj, key) => obj?.[key], instructorData)
          );
          if (missingFields.length > 0) {
            throw new Error(
              `Missing required fields: ${missingFields.join(", ")}`
            );
          }

          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(instructorData.email)) {
            throw new Error("Please enter a valid email address");
          }

          if (instructorData.password.length < 8) {
            throw new Error("Password must be at least 8 characters long");
          }

          if (
            !instructorData.phoneNumber.number ||
            instructorData.phoneNumber.number.length < 10
          ) {
            throw new Error("Please enter a valid phone number");
          }

          const formData = new FormData();
          formData.append("fullname", JSON.stringify(instructorData.fullname));
          formData.append("email", instructorData.email);
          formData.append("password", instructorData.password);
          formData.append(
            "phoneNumber",
            JSON.stringify(instructorData.phoneNumber)
          );

          if (instructorData.bio) formData.append("bio", instructorData.bio);
          if (instructorData.expertise && instructorData.expertise.length > 0) {
            formData.append(
              "expertise",
              JSON.stringify(instructorData.expertise)
            );
          }
          if (
            instructorData.socialLinks &&
            Object.values(instructorData.socialLinks).some((v) => v)
          ) {
            formData.append(
              "socialLinks",
              JSON.stringify(instructorData.socialLinks)
            );
          }

          if (instructorData.avatar?.file) {
            const avatarResult = await uploadToCloudinary(
              instructorData.avatar.file,
              "instructor_avatars",
              "image"
            );
            formData.append(
              "avatar",
              JSON.stringify({
                public_id: avatarResult.public_id,
                url: avatarResult.secure_url,
              })
            );
          } else if (
            instructorData.avatar?.url &&
            instructorData.avatar?.public_id
          ) {
            formData.append("avatar", JSON.stringify(instructorData.avatar));
          }

          const res = await axios.post(
            `${API_BASE_URL}/instructor/create-instructor`,
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
              withCredentials: true,
            }
          );

          toast.success(res.data.message);
          router.push(
            `/instructor/register/activation?email=${encodeURIComponent(
              instructorData.email
            )}`
          );
          return { success: true, email: instructorData.email };
        } catch (error) {
          console.error(
            "Instructor signup error:",
            error.message,
            error.response?.data
          );
          const message =
            error.response?.data?.message ||
            error.message ||
            "Failed to create instructor account.";
          toast.error(message);
          return { success: false, message };
        } finally {
          set({ isLoading: false });
        }
      },

      verifyInstructorOtp: async (email, otp, router) => {
        set({ isLoading: true });
        try {
          const res = await axios.post(
            `${API_BASE_URL}/instructor/instructor-activation`,
            { email, otp },
            { withCredentials: true }
          );
          const { instructor, token } = res.data;
          set({
            instructor,
            instructorToken: token,
            isInstructor: instructor.approvalStatus.isInstructorApproved,
          });
          if (typeof window !== "undefined") {
            localStorage.setItem("instructor_token", token);
          }
          toast.success("Instructor account verified successfully!");
          router.push("/instructor/dashboard");
          return { success: true };
        } catch (error) {
          console.error(
            "Verify instructor OTP error:",
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

      resendInstructorOtp: async (email) => {
        set({ isLoading: true });
        try {
          const res = await axios.post(
            `${API_BASE_URL}/instructor/resend-otp`,
            { email },
            { withCredentials: true }
          );
          toast.success(res.data.message);
          return { success: true };
        } catch (error) {
          console.error(
            "Resend instructor OTP error:",
            error.message,
            error.response?.data
          );
          const message =
            error.response?.data?.message || "Failed to resend OTP.";
          toast.error(error.message);
          return { success: false, message };
        } finally {
          set({ isLoading: false });
        }
      },

      forgotInstructorPassword: async (email) => {
        set({ isLoading: true });
        try {
          const res = await axios.post(
            `${API_BASE_URL}/instructor/forgot-password`,
            { email },
            { withCredentials: true }
          );
          toast.success(res.data.message);
          return { success: true, email };
        } catch (error) {
          console.error(
            "Instructor forgot password error:",
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

      resetInstructorPassword: async (email, otp, password, router) => {
        set({ isLoading: true });
        try {
          await axios.post(
            `${API_BASE_URL}/instructor/reset-password`,
            { email, otp, password },
            { withCredentials: true }
          );
          toast.success("Password reset successfully!");
          router.push("/instructor/auth/login");
          return { success: true };
        } catch (error) {
          console.error(
            "Reset instructor password error:",
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

      fetchSuggestedCategoriesTags: async () => {
        try {
          const res = await axios.get(
            `${API_BASE_URL}/course/categories`,
            {
              headers: { Authorization: `Bearer ${get().instructorToken}` },
              withCredentials: true,
            }
          );
          const categoriesData = res.data.data || res.data;
          return { success: true, categories: categoriesData };
        } catch (error) {
          console.error(
            "Fetch suggested categories error:",
            error.response?.data || error.message
          );
          return { success: false, categories: [], tags: [] };
        }
      },

      getCourseLevels: async () => {
        try {
          const res = await axios.get(
            `${API_BASE_URL}/course/levels`,
            {
              headers: { Authorization: `Bearer ${get().instructorToken}` },
              withCredentials: true,
            }
          );
          const levelsData = res.data.data || res.data;
          return { success: true, levels: levelsData };
        } catch (error) {
          console.error(
            "Fetch course levels error:",
            error.response?.data || error.message
          );
          return { success: false, levels: [] };
        }
      },

      getCourseLanguages: async () => {
        try {
          const res = await axios.get(
            `${API_BASE_URL}/course/languages`,
            {
              headers: { Authorization: `Bearer ${get().instructorToken}` },
              withCredentials: true,
            }
          );
          const languagesData = res.data.data || res.data;
          return { success: true, languages: languagesData };
        } catch (error) {
          console.error(
            "Fetch course languages error:",
            error.response?.data || error.message
          );
          return { success: false, languages: [] };
        }
      },

      bulkUpdateCourseStatus: async (courseIds, status) => {
        set({ isLoading: true });
        try {
          const res = await axios.put(
            `${API_BASE_URL}/course/bulk-update-course-status`,
            { courseIds, status },
            {
              headers: { Authorization: `Bearer ${get().instructorToken}` },
              withCredentials: true,
            }
          );
          const result = res.data.data || res.data;
          toast.success("Courses updated successfully");
          return { success: true, result };
        } catch (error) {
          console.error(
            "Bulk update course status error:",
            error.response?.data || error.message
          );
          toast.error(
            error.response?.data?.message || "Failed to update courses"
          );
          return {
            success: false,
            message: error.response?.data?.message || error.message,
          };
        } finally {
          set({ isLoading: false });
        }
      },

      // ===== LIVE CLASS METHODS =====
      
      createLiveClass: async (liveClassData, router) => {
        set({ isLoading: true });
        try {
          const res = await axios.post(
            `${API_BASE_URL}/course/create-live-class`,
            liveClassData,
            {
              headers: { Authorization: `Bearer ${get().instructorToken}` },
              withCredentials: true,
            }
          );
          const result = res.data.data || res.data;
          toast.success("Live class created successfully");
          router.push("/instructor/dashboard/live-classes");
          return { success: true, liveClass: result.liveClass };
        } catch (error) {
          console.error(
            "Create live class error:",
            error.response?.data || error.message
          );
          toast.error(
            error.response?.data?.message || "Failed to create live class"
          );
          return {
            success: false,
            message: error.response?.data?.message || error.message,
          };
        } finally {
          set({ isLoading: false });
        }
      },

      fetchLiveClasses: async (params = {}) => {
        try {
          const res = await axios.get(
            `${API_BASE_URL}/course/get-instructor-live-classes`,
            {
              params,
              headers: { Authorization: `Bearer ${get().instructorToken}` },
              withCredentials: true,
            }
          );
          const liveClassesData = res.data.data || res.data;
          set({
            liveClasses: liveClassesData.liveClasses || [],
            totalLiveClasses: liveClassesData.total || 0,
          });
          return { success: true, liveClasses: liveClassesData.liveClasses || [] };
        } catch (error) {
          console.error(
            "Fetch live classes error:",
            error.message,
            error.response?.data
          );
          const message =
            error.response?.data?.message || "Failed to fetch live classes";
          return { success: false, message, liveClasses: [] };
        }
      },

      getLiveClassById: async (liveClassId) => {
        try {
          const res = await axios.get(
            `${API_BASE_URL}/course/get-live-class/${liveClassId}`,
            {
              headers: { Authorization: `Bearer ${get().instructorToken}` },
              withCredentials: true,
            }
          );
          const liveClassData = res.data.data || res.data;
          return { success: true, liveClass: liveClassData.liveClass };
        } catch (error) {
          console.error(
            "Get live class error:",
            error.message,
            error.response?.data
          );
          const message =
            error.response?.data?.message || "Failed to fetch live class";
          return { success: false, message };
        }
      },

      updateLiveClass: async (liveClassId, liveClassData) => {
        set({ isLoading: true });
        try {
          const res = await axios.put(
            `${API_BASE_URL}/course/update-live-class/${liveClassId}`,
            liveClassData,
            {
              headers: { Authorization: `Bearer ${get().instructorToken}` },
              withCredentials: true,
            }
          );
          const result = res.data.data || res.data;
          toast.success("Live class updated successfully");
          return { success: true, liveClass: result.liveClass };
        } catch (error) {
          console.error(
            "Update live class error:",
            error.response?.data || error.message
          );
          toast.error(
            error.response?.data?.message || "Failed to update live class"
          );
          return {
            success: false,
            message: error.response?.data?.message || error.message,
          };
        } finally {
          set({ isLoading: false });
        }
      },

      deleteLiveClass: async (liveClassId) => {
        set({ isLoading: true });
        try {
          await axios.delete(
            `${API_BASE_URL}/course/delete-live-class/${liveClassId}`,
            {
              headers: { Authorization: `Bearer ${get().instructorToken}` },
              withCredentials: true,
            }
          );
          set((state) => ({
            liveClasses: state.liveClasses.filter((liveClass) => liveClass._id !== liveClassId),
            totalLiveClasses: state.totalLiveClasses - 1,
          }));
          toast.success("Live class deleted successfully");
          return { success: true };
        } catch (error) {
          console.error(
            "Delete live class error:",
            error.message,
            error.response?.data
          );
          toast.error(
            error.response?.data?.message || "Failed to delete live class"
          );
          return {
            success: false,
            message: error.response?.data?.message || "Failed to delete live class",
          };
        } finally {
          set({ isLoading: false });
        }
      },

      startLiveClass: async (liveClassId) => {
        set({ isLoading: true });
        try {
          const res = await axios.post(
            `${API_BASE_URL}/course/start-live-class/${liveClassId}`,
            {},
            {
              headers: { Authorization: `Bearer ${get().instructorToken}` },
              withCredentials: true,
            }
          );
          const result = res.data.data || res.data;
          set({ activeLiveClass: result.liveClass });
          toast.success("Live class started successfully");
          return { success: true, liveClass: result.liveClass };
        } catch (error) {
          console.error(
            "Start live class error:",
            error.response?.data || error.message
          );
          toast.error(
            error.response?.data?.message || "Failed to start live class"
          );
          return {
            success: false,
            message: error.response?.data?.message || error.message,
          };
        } finally {
          set({ isLoading: false });
        }
      },

      endLiveClass: async (liveClassId) => {
        set({ isLoading: true });
        try {
          const res = await axios.post(
            `${API_BASE_URL}/course/end-live-class/${liveClassId}`,
            {},
            {
              headers: { Authorization: `Bearer ${get().instructorToken}` },
              withCredentials: true,
            }
          );
          const result = res.data.data || res.data;
          set({ activeLiveClass: null });
          toast.success("Live class ended successfully");
          return { success: true, liveClass: result.liveClass };
        } catch (error) {
          console.error(
            "End live class error:",
            error.response?.data || error.message
          );
          toast.error(
            error.response?.data?.message || "Failed to end live class"
          );
          return {
            success: false,
            message: error.response?.data?.message || error.message,
          };
        } finally {
          set({ isLoading: false });
        }
      },

      joinLiveClass: async (liveClassId) => {
        set({ isLoading: true });
        try {
          const res = await axios.post(
            `${API_BASE_URL}/course/join-live-class/${liveClassId}`,
            {},
            {
              headers: { Authorization: `Bearer ${get().instructorToken}` },
              withCredentials: true,
            }
          );
          const result = res.data.data || res.data;
          set({ activeLiveClass: result.liveClass });
          return { success: true, liveClass: result.liveClass, webrtcConfig: result.webrtcConfig };
        } catch (error) {
          console.error(
            "Join live class error:",
            error.response?.data || error.message
          );
          toast.error(
            error.response?.data?.message || "Failed to join live class"
          );
          return {
            success: false,
            message: error.response?.data?.message || error.message,
          };
        } finally {
          set({ isLoading: false });
        }
      },

      leaveLiveClass: async (liveClassId) => {
        set({ isLoading: true });
        try {
          await axios.post(
            `${API_BASE_URL}/course/leave-live-class/${liveClassId}`,
            {},
            {
              headers: { Authorization: `Bearer ${get().instructorToken}` },
              withCredentials: true,
            }
          );
          set({ activeLiveClass: null });
          return { success: true };
        } catch (error) {
          console.error(
            "Leave live class error:",
            error.response?.data || error.message
          );
          toast.error(
            error.response?.data?.message || "Failed to leave live class"
          );
          return {
            success: false,
            message: error.response?.data?.message || error.message,
          };
        } finally {
          set({ isLoading: false });
        }
      },

      getLiveClassAnalytics: async (liveClassId, period = "30d") => {
        try {
          const res = await axios.get(
            `${API_BASE_URL}/course/live-class-analytics/${liveClassId}`,
            {
              params: { period },
              headers: { Authorization: `Bearer ${get().instructorToken}` },
              withCredentials: true,
            }
          );
          const analytics = res.data.data || res.data;
          return { success: true, analytics };
        } catch (error) {
          console.error(
            "Get live class analytics error:",
            error.message,
            error.response?.data
          );
          const message =
            error.response?.data?.message || "Failed to fetch live class analytics";
          return { success: false, message };
        }
      },

      getLiveClassStats: async () => {
        try {
          const res = await axios.get(
            `${API_BASE_URL}/course/instructor-live-class-stats`,
            {
              headers: { Authorization: `Bearer ${get().instructorToken}` },
              withCredentials: true,
            }
          );
          const stats = res.data.data || res.data;
          set({ liveClassStats: stats });
          return { success: true, stats };
        } catch (error) {
          console.error(
            "Get live class stats error:",
            error.message,
            error.response?.data
          );
          const defaultStats = {
            totalLiveClasses: 0,
            activeLiveClasses: 0,
            totalParticipants: 0,
            totalDuration: 0,
            averageParticipants: 0,
            completionRate: 0,
          };
          set({ liveClassStats: defaultStats });
          return { success: true, stats: defaultStats };
        }
      },

      getLiveClassParticipants: async (liveClassId) => {
        try {
          const res = await axios.get(
            `${API_BASE_URL}/course/get-live-class-participants/${liveClassId}`,
            {
              headers: { Authorization: `Bearer ${get().instructorToken}` },
              withCredentials: true,
            }
          );
          const participants = res.data.data || res.data;
          return { success: true, participants: participants.participants || [] };
        } catch (error) {
          console.error(
            "Get live class participants error:",
            error.message,
            error.response?.data
          );
          const message =
            error.response?.data?.message || "Failed to fetch participants";
          return { success: false, message, participants: [] };
        }
      },

      muteParticipant: async (liveClassId, participantId, mute = true) => {
        try {
          const res = await axios.post(
            `${API_BASE_URL}/course/mute-participant/${liveClassId}`,
            { participantId, mute },
            {
              headers: { Authorization: `Bearer ${get().instructorToken}` },
              withCredentials: true,
            }
          );
          const result = res.data.data || res.data;
          toast.success(mute ? "Participant muted" : "Participant unmuted");
          return { success: true, participant: result.participant };
        } catch (error) {
          console.error(
            "Mute participant error:",
            error.response?.data || error.message
          );
          toast.error(
            error.response?.data?.message || "Failed to mute/unmute participant"
          );
          return {
            success: false,
            message: error.response?.data?.message || error.message,
          };
        }
      },

      removeParticipant: async (liveClassId, participantId) => {
        try {
          const res = await axios.post(
            `${API_BASE_URL}/course/remove-participant/${liveClassId}`,
            { participantId },
            {
              headers: { Authorization: `Bearer ${get().instructorToken}` },
              withCredentials: true,
            }
          );
          const result = res.data.data || res.data;
          toast.success("Participant removed from live class");
          return { success: true, participant: result.participant };
        } catch (error) {
          console.error(
            "Remove participant error:",
            error.response?.data || error.message
          );
          toast.error(
            error.response?.data?.message || "Failed to remove participant"
          );
          return {
            success: false,
            message: error.response?.data?.message || error.message,
          };
        }
      },

      clearLiveClassData: () => {
        set({
          liveClasses: [],
          totalLiveClasses: 0,
          activeLiveClass: null,
          liveClassStats: null,
        });
      },
    }),
    {
      name: "instructor-storage",
      partialize: (state) => ({
        instructorToken: state.instructorToken,
        isInstructor: state.isInstructor,
      }),
    }
  )
);

export default useInstructorStore;

