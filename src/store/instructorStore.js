import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import { toast } from "react-toastify";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_SERVER || "http://localhost:8000/api/v2";

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
      draftCourse: null,

      checkInstructorAuth: async () => {
        set({ isLoading: true });
        try {
          const token = localStorage.getItem("instructor_token");
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
          set({
            instructor: res.data.instructor,
            instructorToken: token,
            isInstructor:
              res.data.instructor.approvalStatus.isInstructorApproved,
          });
          return { success: true, isInstructor: true };
        } catch (error) {
          console.error(
            "Check instructor auth error:",
            error.message,
            error.response?.data
          );
          set({ instructor: null, instructorToken: null, isInstructor: false });
          localStorage.removeItem("instructor_token");
          return { success: false, isInstructor: false };
        } finally {
          set({ isLoading: false });
        }
      },

      createCourse: async (courseData, router) => {
        set({ isLoading: true });
        try {
          const payload = {
            title: courseData.title,
            description: courseData.description,
            learningObjectives: courseData.learningObjectives,
            prerequisites: courseData.prerequisites,
            targetAudience: courseData.targetAudience,
            isFree: courseData.isFree,
            price: courseData.isFree ? 0 : courseData.price,
            categories: courseData.categories,
            tags: courseData.tags,
            level: courseData.level,
            language: courseData.language,
            thumbnail: courseData.thumbnail,
            previewVideo: courseData.previewVideo,
            content: courseData.content,
          };

          const res = await axios.post(
            `${API_BASE_URL}/course/create-course`,
            payload,
            {
              headers: { Authorization: `Bearer ${get().instructorToken}` },
              withCredentials: true,
            }
          );

          set({ draftCourse: null });
          toast.success("Course created successfully");
          router.push("/instructor/courses");
          return { success: true, course: res.data.course };
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
          const payload = {
            title: courseData.title,
            description: courseData.description,
            learningObjectives: courseData.learningObjectives,
            prerequisites: courseData.prerequisites,
            targetAudience: courseData.targetAudience,
            isFree: courseData.isFree,
            price: courseData.isFree ? 0 : courseData.price,
            categories: courseData.categories,
            tags: courseData.tags,
            level: courseData.level,
            language: courseData.language,
            thumbnail: courseData.thumbnail,
            previewVideo: courseData.previewVideo,
            content: courseData.content,
          };

          const res = await axios.put(
            `${API_BASE_URL}/course/update-course/${courseId}`,
            payload,
            {
              headers: { Authorization: `Bearer ${get().instructorToken}` },
              withCredentials: true,
            }
          );

          set({ draftCourse: null });
          toast.success("Course updated successfully");
          return { success: true, course: res.data.course };
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

      uploadLectureVideo: async (courseId, sectionId, lectureData) => {
        set({ isLoading: true });
        try {
          const payload = {
            lectureTitle: lectureData.title,
            videoUrl: lectureData.videoUrl,
            duration: lectureData.duration || 0,
            description: lectureData.description,
          };

          const res = await axios.post(
            `${API_BASE_URL}/course/upload-lecture-video/${courseId}/${sectionId}`,
            payload,
            { headers: { Authorization: `Bearer ${get().instructorToken}` } }
          );

          toast.success("Lecture video uploaded successfully");
          return { success: true, course: res.data.course };
        } catch (error) {
          console.error(
            "Upload lecture video error:",
            error.response?.data || error.message
          );
          toast.error(
            error.response?.data?.message || "Failed to upload lecture video"
          );
          return {
            success: false,
            message: error.response?.data?.message || error.message,
          };
        } finally {
          set({ isLoading: false });
        }
      },

      addLectureResource: async (
        courseId,
        sectionId,
        lectureId,
        resourceData
      ) => {
        set({ isLoading: true });
        try {
          let resourceUrl = resourceData.url;
          if (resourceData.file && resourceData.type !== "Link") {
            const resourceResult = await uploadToCloudinary(
              resourceData.file,
              `courses/${courseId}/resources`,
              resourceData.type === "PDF" ? "raw" : "image"
            );
            resourceUrl = resourceResult.secure_url;
          }

          const payload = {
            title: resourceData.title,
            type: resourceData.type,
            url: resourceUrl,
          };

          const res = await axios.post(
            `${API_BASE_URL}/course/add-lecture-resource/${courseId}/${sectionId}/${lectureId}`,
            payload,
            {
              headers: { Authorization: `Bearer ${get().instructorToken}` },
              withCredentials: true,
            }
          );

          toast.success("Resource added successfully");
          return { success: true, course: res.data.course };
        } catch (error) {
          console.error(
            "Add lecture resource error:",
            error.message,
            error.response?.data
          );
          toast.error(
            error.response?.data?.message ||
              error.message ||
              "Failed to add resource"
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
          await axios.post(
            `${API_BASE_URL}/course/publish-course}/${courseId}`,
            {},
            { headers: { Authorization: `Bearer ${get().instructorToken}` } }
          );
          toast.success("Course submitted for review");
          router.push("/instructor/courses");
          return { success: true };
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

      autosaveDraft: async (courseId, courseData) => {
        try {
          if (courseId) {
            await axios.post(
              `${API_BASE_URL}/course/save-draft/${courseId}`,
              courseData,
              { headers: { Authorization: `Bearer ${get().instructorToken}` } }
            );
          }
          set({ draftCourse: courseData });
          console.info("Draft saved:", {
            courseId: courseData.title?.en || courseId,
          });
        } catch (error) {
          console.error(
            "Autosave draft error:",
            error.response?.data || error.message
          );
        }
      },

      fetchSuggestedCategoriesTags: async () => {
        try {
          const res = await axios.get(
            `${API_BASE_URL}/course/suggested-categories-tags`,
            {
              headers: { Authorization: `Bearer ${get().instructorToken}` },
            }
          );
          return res.data;
        } catch (error) {
          console.error(
            "Fetch suggested categories error:",
            error.response?.data || error.message
          );
          return { success: false, categories: [], tags: [] };
        }
      },

      clearDraft: () => {
        set({ draftCourse: null });
        console.info("Draft cleared");
      },

      fetchCourses: async (params = {}) => {
        set({ isLoading: true });
        try {
          const res = await axios.get(
            `${API_BASE_URL}/course/get-instructor-courses`,
            {
              params,
              headers: { Authorization: `Bearer ${get().instructorToken}` },
              withCredentials: true,
            }
          );
          set({
            courses: res.data.courses || [],
            totalCourses: res.data.total || 0,
          });
          return { success: true, courses: res.data.courses || [] };
        } catch (error) {
          console.error(
            "Fetch courses error:",
            error.message,
            error.response?.data
          );
          const message =
            error.response?.data?.message || "Failed to fetch courses";
          toast.error(message);
          return { success: false, message, courses: [] };
        } finally {
          set({ isLoading: false });
        }
      },

      deleteCourse: async (courseId) => {
        set({ isLoading: true });
        try {
          const res = await axios.delete(
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

      loadDashboardAnalytics: async (instructorId) => {
        set({ isLoading: true });
        try {
          const res = await axios.get(
            `${API_BASE_URL}/analytics/instructor-dashboard/${instructorId}`,
            {
              headers: { Authorization: `Bearer ${get().instructorToken}` },
              withCredentials: true,
            }
          );
          set({ dashboardStats: res.data.stats || {} });
          return { success: true, stats: res.data.stats || {} };
        } catch (error) {
          console.error(
            "Load dashboard analytics error:",
            error.message,
            error.response?.data
          );
          const message =
            error.response?.data?.message || "Failed to load analytics";
          toast.error(message);
          return { success: false, message };
        } finally {
          set({ isLoading: false });
        }
      },

      createWithdrawal: async (amount, withdrawMethod) => {
        set({ isLoading: true });
        try {
          const res = await axios.post(
            `${API_BASE_URL}/instructor-withdraw/create-instructor-withdraw-request`,
            { amount, withdrawMethod },
            {
              headers: { Authorization: `Bearer ${get().instructorToken}` },
              withCredentials: true,
            }
          );
          set((state) => ({
            withdrawals: [res.data.withdraw, ...state.withdrawals],
          }));
          toast.success("Withdrawal request created successfully!");
          return { success: true, withdraw: res.data.withdraw };
        } catch (error) {
          console.error(
            "Create withdrawal error:",
            error.message,
            error.response?.data
          );
          const message =
            error.response?.data?.message || "Failed to create withdrawal";
          toast.error(message);
          return { success: false, message };
        } finally {
          set({ isLoading: false });
        }
      },

      fetchWithdrawals: async (params = {}) => {
        set({ isLoading: true });
        try {
          const res = await axios.get(
            `${API_BASE_URL}/instructor-withdraw/get-my-instructor-withdrawals`,
            {
              params,
              headers: { Authorization: `Bearer ${get().instructorToken}` },
              withCredentials: true,
            }
          );
          set({
            withdrawals: res.data.withdrawals || [],
            totalWithdrawals: res.data.total || 0,
          });
          return { success: true, withdrawals: res.data.withdrawals || [] };
        } catch (error) {
          console.error(
            "Fetch withdrawals error:",
            error.message,
            error.response?.data
          );
          const message =
            error.response?.data?.message || "Failed to fetch withdrawals";
          toast.error(message);
          return { success: false, message, withdrawals: [] };
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
          localStorage.setItem("instructor_token", token);
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
          toast.error(message);
          return { success: false, message };
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
          const { instructor, token } = res.data;
          set({
            instructor,
            instructorToken: token,
            isInstructor: instructor.approvalStatus.isInstructorApproved,
          });
          localStorage.setItem("instructor_token", token);
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
            error.response?.data?.message || "Instructor login failed.";
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
          set({
            instructor: null,
            instructorToken: null,
            isInstructor: false,
            dashboardStats: null,
            withdrawals: [],
            courses: [],
            totalCourses: 0,
            draftCourse: null,
          });
          localStorage.removeItem("instructor_token");
          toast.success("Instructor logged out successfully!");
          router.push("/instructor/login");
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

      loadInstructor: async () => {
        set({ isLoading: true });
        try {
          const currentToken =
            get().instructorToken || localStorage.getItem("instructor_token");
          if (!currentToken) {
            set({
              instructor: null,
              instructorToken: null,
              isInstructor: false,
            });
            return { success: false, message: "No instructor token available" };
          }
          const res = await axios.get(
            `${API_BASE_URL}/instructor/get-instructor`,
            {
              headers: { Authorization: `Bearer ${currentToken}` },
              withCredentials: true,
            }
          );
          set({
            instructor: res.data.instructor,
            instructorToken: currentToken,
            isInstructor:
              res.data.instructor.approvalStatus.isInstructorApproved,
          });
          localStorage.setItem("instructor_token", currentToken);
          return { success: true, instructor: res.data.instructor };
        } catch (error) {
          console.error(
            "Load instructor error:",
            error.message,
            error.response?.data
          );
          if (
            error.response?.status === 401 ||
            error.response?.status === 404
          ) {
            set({
              instructor: null,
              instructorToken: null,
              isInstructor: false,
            });
            localStorage.removeItem("instructor_token");
          }
          return {
            success: false,
            message:
              error.response?.data?.message || "Failed to load instructor",
          };
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
          const res = await axios.post(
            `${API_BASE_URL}/instructor/reset-password`,
            { email, otp, password },
            { withCredentials: true }
          );
          toast.success(res.data.message);
          router.push("/instructor/login");
          return { success: true };
        } catch (error) {
          console.error(
            "Instructor reset password error:",
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

      updateInstructor: async (instructorData) => {
        set({ isLoading: true });
        try {
          if (instructorData.fullname) {
            const requiredFields = ["firstName", "lastName"];
            const missingFields = requiredFields.filter(
              (field) => !instructorData.fullname[field]
            );
            if (missingFields.length > 0) {
              throw new Error(
                `Missing required fields: ${missingFields.join(", ")}`
              );
            }
          }

          const formData = new FormData();
          if (instructorData.fullname)
            formData.append(
              "fullname",
              JSON.stringify(instructorData.fullname)
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
                url: avatarResult.secure_url,
                public_id: avatarResult.public_id,
              })
            );
          }

          const res = await axios.put(
            `${API_BASE_URL}/instructor/update-instructor`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${get().instructorToken}`,
              },
              withCredentials: true,
            }
          );

          set({ instructor: res.data.instructor });
          toast.success("Profile updated successfully!");
          return { success: true, instructor: res.data.instructor };
        } catch (error) {
          console.error(
            "Update instructor error:",
            error.message,
            error.response?.data
          );
          const message =
            error.response?.data?.message || "Failed to update profile.";
          toast.error(message);
          return { success: false, message };
        } finally {
          set({ isLoading: false });
        }
      },

      refreshInstructorToken: async () => {
        set({ isLoading: true });
        try {
          const currentToken = get().instructorToken;
          if (!currentToken) {
            set({
              instructor: null,
              instructorToken: null,
              isInstructor: false,
            });
            return { success: false, message: "No instructor token available" };
          }
          const res = await axios.post(
            `${API_BASE_URL}/instructor/refresh-token`,
            {},
            {
              headers: { Authorization: `Bearer ${currentToken}` },
              withCredentials: true,
            }
          );
          const { token } = res.data;
          set({ instructorToken: token });
          localStorage.setItem("instructor_token", token);
          return { success: true, token };
        } catch (error) {
          console.error(
            "Refresh instructor token error:",
            error.message,
            error.response?.data
          );
          if (
            error.response?.status === 401 ||
            error.response?.status === 403
          ) {
            set({
              instructor: null,
              instructorToken: null,
              isInstructor: false,
            });
            localStorage.removeItem("instructor_token");
          }
          return {
            success: false,
            message:
              error.response?.data?.message || "Failed to refresh token.",
          };
        } finally {
          set({ isLoading: false });
        }
      },

      checkInstructorApproval: async () => {
        set({ isLoading: true });
        try {
          const currentToken = get().instructorToken;
          if (!currentToken) {
            return {
              success: false,
              message: "No instructor token available",
              isApproved: false,
            };
          }
          const res = await axios.get(
            `${API_BASE_URL}/instructor/get-instructor`,
            {
              headers: { Authorization: `Bearer ${currentToken}` },
              withCredentials: true,
            }
          );
          const isApproved =
            res.data.instructor.approvalStatus.isInstructorApproved;
          set({ instructor: res.data.instructor, isInstructor: isApproved });
          return { success: true, isApproved };
        } catch (error) {
          console.error(
            "Check instructor approval error:",
            error.message,
            error.response?.data
          );
          return {
            success: false,
            message:
              error.response?.data?.message ||
              "Failed to check approval status.",
            isApproved: false,
          };
        } finally {
          set({ isLoading: false });
        }
      },

      fetchInstructorCoupons: async () => {
        set({ isLoading: true });
        try {
          const { instructorToken, instructor } = get();
          if (!instructorToken || !instructor) {
            throw new Error("Instructor not authenticated");
          }
          const res = await axios.get(
            `${API_BASE_URL}/coupon/get-coupon/${instructor._id}`,
            {
              headers: { Authorization: `Bearer ${instructorToken}` },
              withCredentials: true,
            }
          );
          return { success: true, coupons: res.data.couponCodes || [] };
        } catch (error) {
          console.error(
            "Fetch instructor coupons error:",
            error.message,
            error.response?.data
          );
          const message =
            error.response?.data?.message || "Failed to fetch coupons.";
          toast.error(message);
          return { success: false, coupons: [], message };
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "instructor-auth",
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

export default useInstructorStore;
