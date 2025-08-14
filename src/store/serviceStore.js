/* eslint-disable no-unused-vars */
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import axios from "axios";
import { toast } from "react-toastify";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_SERVER || "http://localhost:8000/api/v2";

// After successful login, set the cookie
const setAuthCookie = (token) => {
  document.cookie = `service_provider_token=${token}; path=/; samesite=None; secure; max-age=86400`;
  console.log("Set cookie:", document.cookie); // Debug: Log cookie to verify
};

// Clear the authentication cookie
const clearAuthCookie = () => {
  document.cookie = `service_provider_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = options.token || useServiceProviderStore.getState().token;

  // Debug: Log token and cookies before the request
  console.log("API Call - Token from store:", token);
  console.log("API Call - All cookies:", document.cookie);

  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      Accept: "*/*",
      Authorization: token ? `Bearer ${token}` : "",
    },
    credentials: "include",
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    const data = await response.json();

    console.log("API Response:", data);

    if (!response.ok) {
      throw new Error(data.message || "Request failed");
    }

    return data;
  } catch (error) {
    console.error("API call failed:", error);
    console.log("error-messageconsole.log();", error.message)
    // if (error.message.includes("Please login to access this resource")) {
      // Handle unauthorized error (e.g., redirect to login)
      // useServiceProviderStore.getState().logout();
    //   toast.error("Session expired. Please log in again.");
    // }
    throw error;
  }
};

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

// Create the main store
const useServiceProviderStore = create(
  devtools(
    persist(
      immer((set, get) => ({
        // ===== AUTHENTICATION STATE =====
        serviceProvider: null,
        token: null,
        isLoading: false,
        error: null,

        // ===== BOOKINGS STATE =====
        bookings: [],
        totalBookings: 0,
        bookingStats: {
          pending: 0,
          confirmed: 0,
          inProgress: 0,
          completed: 0,
          cancelled: 0,
          declined: 0,
          noShow: 0,
          totalEarnings: 0,
        },
        selectedBooking: null,
        bookingFilters: {
          status: "all",
          dateRange: { start: null, end: null },
          page: 1,
          limit: 10,
          sortBy: "createdAt",
          sortOrder: "desc",
        },
        bookingsPagination: {
          currentPage: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
        // ===== MESSAGING STATE =====
        conversations: [],
        messages: {},
        selectedConversation: null,
        unreadCount: 0,
        messageFilters: {
          search: "",
          archived: false,
          page: 1,
          limit: 20,
        },
        onlineUsers: new Set(),

        // ===== SERVICES STATE =====
        servicesOffered: [],
        selectedService: null,
        serviceStats: {
          totalServices: 0,
          popularServices: [],
          averageRating: 0,
        },

        // ===== REVIEWS STATE =====
        reviews: [],
        reviewStats: {
          totalReviews: 0,
          averageRating: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        },

        // ===== DASHBOARD STATE =====
        dashboardStats: {
          totalBookings: 0,
          completedBookings: 0,
          totalEarnings: 0,
          averageRating: 0,
          totalReviews: 0,
          monthlyEarnings: [],
          bookingTrends: [],
        },
        notifications: [],
        unreadNotifications: 0,

        // ===== PROFILE STATE =====
        profileUpdateLoading: false,
        avatarUpdateLoading: false,
        notificationPreferences: {
          receiveMessageEmails: true,
          receiveBookingNotifications: true,
          receiveReviewNotifications: true,
        },

        // ===== UI STATE =====
        sidebarOpen: true,
        theme: "light",
        activeTab: "dashboard",
        modals: {
          bookingDetails: false,
          serviceForm: false,
          messageCompose: false,
          profileEdit: false,
        },

        // ===== AUTHENTICATION ACTIONS =====
        login: async (credentials) => {
          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            const data = await apiCall(
              "/service-provider/login-service-provider",
              {
                method: "POST",
                body: JSON.stringify(credentials),
              }
            );

            setAuthCookie(data.token);

            set((state) => {
              state.serviceProvider = data.serviceProvider;
              state.token = data.token;
              state.isAuthenticated = true;
              state.isLoading = false;
              state.error = null;
            });

            return { success: true, data };
          } catch (error) {
            set((state) => {
              state.error = error.message;
              state.isLoading = false;
            });
            throw error;
          }
        },

        register: async (registrationData) => {
          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            const data = await apiCall(
              "/service-provider/create-service-provider",
              {
                method: "POST",
                body: JSON.stringify(registrationData),
              }
            );

            set((state) => {
              state.isLoading = false;
            });

            return { success: true, data };
          } catch (error) {
            set((state) => {
              state.error = error.message;
              state.isLoading = false;
            });
            throw error;
          }
        },

        activateAccount: async (activationData) => {
          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            const data = await apiCall("/service-provider/activation", {
              method: "POST",
              body: JSON.stringify(activationData),
            });

            set((state) => {
              state.serviceProvider = data.serviceProvider;
              state.token = data.token;
              state.isAuthenticated = true;
              state.isLoading = false;
            });

            return { success: true, data };
          } catch (error) {
            set((state) => {
              state.error = error.message;
              state.isLoading = false;
            });
            throw error;
          }
        },

        loadServiceProvider: async () => {
          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            const data = await apiCall(
              "/service-provider/get-service-provider"
            );

            set((state) => {
              state.serviceProvider = data.serviceProvider;
              state.token = data.token;
              state.isAuthenticated = true;
              state.isLoading = false;
            });

            return { success: true, data };
          } catch (error) {
            set((state) => {
              state.error = error.message;
              state.isLoading = false;
              state.isAuthenticated = false;
              state.serviceProvider = null;
              state.token = null;
            });
            throw error;
          }
        },

        logout: async () => {
          try {
            await apiCall("/service-provider/logout");
          } catch (error) {
            console.error("Logout API call failed:", error);
          } finally {
            // clearAuthCookie();
            set((state) => {
              state.serviceProvider = null;
              state.token = null;
              state.isAuthenticated = false;
              state.bookings = [];
              state.conversations = [];
              state.messages = {};
              state.notifications = [];
              state.reviews = [];
              state.servicesOffered = [];
            });
          }
        },

        // ===== BOOKING ACTIONS =====
        fetchBookings: async (filters = {}) => {
          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            const { serviceProvider } = get();
            if (!serviceProvider) throw new Error("Service provider not found");

            const queryParams = new URLSearchParams({
              ...get().bookingFilters,
              ...filters,
            });

            const data = await apiCall(
              `/service-provider/get-service-provider-bookings/${serviceProvider._id}?${queryParams}`
            );

            set((state) => {
              state.bookings = data.bookings;
              state.totalBookings = data.totalBookings;
              state.bookingsPagination = {
                currentPage: data.page,
                totalPages: data.pages,
                hasNext: data.page < data.pages,
                hasPrev: data.page > 1,
              };
              state.isLoading = false;
              state.error = null;

              // Update booking stats
              const stats = {
                pending: 0,
                confirmed: 0,
                inProgress: 0,
                completed: 0,
                cancelled: 0,
                declined: 0,
                noShow: 0,
                totalEarnings: 0,
              };
              data.bookings.forEach((booking) => {
                stats[booking.status.toLowerCase()] =
                  (stats[booking.status.toLowerCase()] || 0) + 1;
                if (booking.status === "Completed") {
                  stats.totalEarnings += booking.payment.amount;
                }
              });
              state.bookingStats = stats;
            });

            return { success: true, data };
          } catch (error) {
            set((state) => {
              state.error = error.message;
              state.isLoading = false;
            });
            throw error;
          }
        },

        updateBookingStatus: async (
          bookingId,
          status,
          cancellationReason = null
        ) => {
          try {
            const data = await apiCall(
              `/service-provider/update-booking-status/${bookingId}`,
              {
                method: "PUT",
                body: JSON.stringify({ status, cancellationReason }),
              }
            );

            set((state) => {
              const bookingIndex = state.bookings.findIndex(
                (b) => b._id === bookingId
              );
              if (bookingIndex !== -1) {
                state.bookings[bookingIndex] = data.booking;
              }
            });

            return { success: true, data };
          } catch (error) {
            set((state) => {
              state.error = error.message;
            });
            throw error;
          }
        },

        setBookingFilters: (filters) => {
          set((state) => {
            state.bookingFilters = { ...state.bookingFilters, ...filters };
          });
        },

        selectBooking: (booking) => {
          set((state) => {
            state.selectedBooking = booking;
          });
        },

        // ===== MESSAGING ACTIONS =====
        fetchConversations: async (filters = {}) => {
          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            const queryParams = new URLSearchParams({
              page: filters.page?.toString() || "1",
              limit: filters.limit?.toString() || "20",
              search: filters.search || "",
              archived: filters.archived?.toString() || "false",
            });

            console.log(
              "Fetching conversations with params:",
              queryParams.toString()
            );

            // Use the correct endpoint that matches your backend
            const data = await apiCall(
              `/service-provider/get-conversations?${queryParams}`
            );

            console.log("Conversations API response:", data);

            set((state) => {
              // Handle the response structure from your backend
              const conversationsArray = Array.isArray(data.conversations)
                ? data.conversations
                : [];

              state.conversations = conversationsArray.map((conv) => {
                // Ensure proper structure for each conversation
                const processedConv = {
                  ...conv,
                  unreadCount: conv.unreadCount || 0,
                  lastMessage: conv.lastMessage || "No messages yet",
                  members: Array.isArray(conv.members) ? conv.members : [],
                };

                // Debug log each conversation
                console.log("Processing conversation:", processedConv);

                return processedConv;
              });

              // Calculate total unread messages
              state.unreadCount = state.conversations.reduce(
                (total, conv) => total + (conv.unreadCount || 0),
                0
              );

              state.isLoading = false;
              state.error = null;
            });

            console.log("Conversations set in state:", get().conversations);

            return { success: true, data };
          } catch (error) {
            console.error("Error marking message as read:", error);
            set((state) => {
              state.error = error.message || "Failed to mark message as read";
              state.isLoading = false;
            });
            throw error;
          }
        },

        fetchMessages: async (userId, page = 1, limit = 20) => {
          try {
            console.log("Fetching messages for userId:", userId);

            const data = await apiCall(
              `/service-provider/get-messages-with-user/${userId}?page=${page}&limit=${limit}`
            );

            console.log("Messages API response:", data);

            set((state) => {
              // Ensure messages array exists and sort by creation time
              const messagesArray = Array.isArray(data.messages)
                ? data.messages
                : [];

              // Sort messages by creation time (oldest first for proper display)
              const sortedMessages = messagesArray.sort(
                (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
              );

              state.messages[userId] = sortedMessages;
              state.isLoading = false;
              state.error = null;
            });

            console.log(
              "Messages set in state for userId:",
              userId,
              get().messages[userId]
            );

            return { success: true, data };
          } catch (error) {
            console.error("Error fetching messages:", error);
            set((state) => {
              state.error = error.message;
              state.isLoading = false;
            });
            throw error;
          }
        },

        sendMessage: async (userId, messageData) => {
          try {
            console.log(
              "Sending message to userId:",
              userId,
              "with data:",
              messageData
            );

            const data = await apiCall(
              `/service-provider/reply-to-user/${userId}`,
              {
                method: "POST",
                body: JSON.stringify(messageData),
              }
            );

            console.log("Send message API response:", data);

            set((state) => {
              // Initialize messages array if it doesn't exist
              if (!state.messages[userId]) {
                state.messages[userId] = [];
              }

              // Add the new message to the messages array
              if (data.message) {
                state.messages[userId].push(data.message);
              }

              // Update the conversation's last message
              state.conversations = state.conversations.map((conv) => {
                // Check if this conversation includes the user we're messaging
                const isConversationWithUser = conv.members.some((member) => {
                  const memberId = member._id || member;
                  return memberId === userId || memberId.toString() === userId;
                });

                if (isConversationWithUser) {
                  return {
                    ...conv,
                    lastMessage: data.message?.content || "Media message",
                    lastMessageId: data.message?._id,
                    updatedAt:
                      data.message?.createdAt || new Date().toISOString(),
                  };
                }
                return conv;
              });

              state.isLoading = false;
              state.error = null;
            });

            console.log(
              "Message added to state. Current messages:",
              get().messages[userId]
            );

            return { success: true, data };
          } catch (error) {
            console.error("Error sending message:", error);
            set((state) => {
              state.error = error.message;
              state.isLoading = false;
            });
            throw error;
          }
        },

        markMessageAsRead: async (messageId) => {
          try {
            console.log("Marking message as read:", messageId);

            const data = await apiCall(
              `/service-provider/mark-message-read/${messageId}`,
              {
                method: "PUT",
              }
            );

            console.log("Mark message read API response:", data);

            set((state) => {
              // Update message read status across all conversations
              Object.keys(state.messages).forEach((userId) => {
                const messages = state.messages[userId] || [];
                const messageIndex = messages.findIndex(
                  (m) => m._id === messageId
                );
                if (messageIndex !== -1) {
                  state.messages[userId][messageIndex].isRead = true;
                }
              });
              state.error = null;
            });

            return { success: true, data };
          } catch (error) {
            console.error("Error marking message as read:", error);
            set((state) => {
              state.error = error.message;
            });
            throw error;
          }
        },

        deleteMessage: async (messageId) => {
          try {
            console.log("Deleting message:", messageId);

            const data = await apiCall(
              `/service-provider/delete-message/${messageId}`,
              {
                method: "DELETE",
              }
            );

            console.log("Delete message API response:", data);

            set((state) => {
              // Remove message from all conversations
              Object.keys(state.messages).forEach((userId) => {
                state.messages[userId] = (state.messages[userId] || []).filter(
                  (m) => m._id !== messageId
                );
              });
              state.error = null;
            });

            return { success: true, data };
          } catch (error) {
            console.error("Error deleting message:", error);
            set((state) => {
              state.error = error.message;
            });
            throw error;
          }
        },

        archiveConversation: async (conversationId) => {
          try {
            console.log("Archiving conversation:", conversationId);

            const data = await apiCall(
              `/service-provider/archive-conversation/${conversationId}`,
              {
                method: "PUT",
              }
            );

            console.log("Archive conversation API response:", data);

            set((state) => {
              state.conversations = state.conversations.filter(
                (conv) => conv._id !== conversationId
              );
              state.error = null;
            });

            return { success: true, data };
          } catch (error) {
            console.error("Error archiving conversation:", error);
            set((state) => {
              state.error = error.message;
            });
            throw error;
          }
        },

        blockUser: async (userId) => {
          try {
            console.log("Blocking user:", userId);

            const data = await apiCall(
              `/service-provider/block-user/${userId}`,
              {
                method: "POST",
              }
            );

            console.log("Block user API response:", data);

            set((state) => {
              if (state.serviceProvider) {
                state.serviceProvider.blockedUsers =
                  state.serviceProvider.blockedUsers || [];
                if (!state.serviceProvider.blockedUsers.includes(userId)) {
                  state.serviceProvider.blockedUsers.push(userId);
                }
              }

              // Remove conversation with blocked user
              state.conversations = state.conversations.filter(
                (conv) =>
                  !conv.members.some((member) => {
                    const memberId = member._id || member;
                    return (
                      memberId === userId || memberId.toString() === userId
                    );
                  })
              );

              state.error = null;
            });

            return { success: true, data };
          } catch (error) {
            console.error("Error blocking user:", error);
            set((state) => {
              state.error = error.message;
            });
            throw error;
          }
        },

        unblockUser: async (userId) => {
          try {
            console.log("Unblocking user:", userId);

            const data = await apiCall(
              `/service-provider/unblock-user/${userId}`,
              {
                method: "POST",
              }
            );

            console.log("Unblock user API response:", data);

            set((state) => {
              if (state.serviceProvider && state.serviceProvider.blockedUsers) {
                state.serviceProvider.blockedUsers =
                  state.serviceProvider.blockedUsers.filter(
                    (id) => id !== userId && id?.toString() !== userId
                  );
              }
              state.error = null;
            });

            return { success: true, data };
          } catch (error) {
            console.error("Error unblocking user:", error);
            set((state) => {
              state.error = error.message;
            });
            throw error;
          }
        },

        // ===== SERVICES ACTIONS =====
        fetchServicesOffered: async () => {
          try {
            const { serviceProvider } = get();
            if (!serviceProvider) throw new Error("Service provider not found");

            set((state) => {
              state.servicesOffered = serviceProvider.servicesOffered || [];
              state.serviceStats.totalServices =
                serviceProvider.servicesOffered?.length || 0;
            });

            return { success: true };
          } catch (error) {
            set((state) => {
              state.error = error.message;
            });
            throw error;
          }
        },

        addService: async (serviceData) => {
          try {
            const data = await apiCall(
              "/service-provider/add-service-offered",
              {
                method: "POST",
                body: JSON.stringify(serviceData),
              }
            );

            set((state) => {
              state.servicesOffered.push(data.service);
              state.serviceStats.totalServices += 1;
            });

            return { success: true, data };
          } catch (error) {
            set((state) => {
              state.error = error.message;
            });
            throw error;
          }
        },

        updateService: async (serviceId, serviceData) => {
          try {
            const data = await apiCall(
              `/service-provider/update-service-offered/${serviceId}`,
              {
                method: "PUT",
                body: JSON.stringify(serviceData),
              }
            );

            set((state) => {
              const serviceIndex = state.servicesOffered.findIndex(
                (s) => s._id === serviceId
              );
              if (serviceIndex !== -1) {
                state.servicesOffered[serviceIndex] = data.service;
              }
            });

            return { success: true, data };
          } catch (error) {
            set((state) => {
              state.error = error.message;
            });
            throw error;
          }
        },

        deleteService: async (serviceId) => {
          try {
            const data = await apiCall(
              `/service-provider/delete-service-offered/${serviceId}`,
              {
                method: "DELETE",
              }
            );

            set((state) => {
              state.servicesOffered = state.servicesOffered.filter(
                (s) => s._id !== serviceId
              );
              state.serviceStats.totalServices -= 1;
            });

            return { success: true, data };
          } catch (error) {
            set((state) => {
              state.error = error.message;
            });
            throw error;
          }
        },

        // ===== REVIEWS ACTIONS =====
        fetchReviews: async (page = 1, limit = 10) => {
          try {
            const { serviceProvider } = get();
            if (!serviceProvider) throw new Error("Service provider not found");

            const data = await apiCall(
              `/service-provider/get-service-provider-reviews/${serviceProvider._id}?page=${page}&limit=${limit}`
            );

            set((state) => {
              state.reviews = data.reviews;
              state.reviewStats = {
                totalReviews: data.totalReviews,
                averageRating: serviceProvider.ratings || 0,
                ratingDistribution: data.ratingDistribution || {
                  1: 0,
                  2: 0,
                  3: 0,
                  4: 0,
                  5: 0,
                },
              };
              state.isLoading = false;
              state.error = null;
            });

            return { success: true, data };
          } catch (error) {
            set((state) => {
              state.error = error.message;
            });
            throw error;
          }
        },

        // ===== DASHBOARD ACTIONS =====
        fetchDashboardStats: async (startDate, endDate) => {
          try {
            const queryParams = new URLSearchParams();
            if (startDate) queryParams.append("startDate", startDate);
            if (endDate) queryParams.append("endDate", endDate);

            const data = await apiCall(
              `/service-provider/stats?${queryParams}`
            );

            console.log(data);

            set((state) => {
              state.dashboardStats = {
                ...state.dashboardStats,
                ...data.stats,
              };
              // Clear any previous errors on successful fetch
              state.error = null;
            });

            return { success: true, data };
          } catch (error) {
            set((state) => {
              state.error = error.message;
            });
            throw error;
          }
        },

        // ===== PROFILE ACTIONS =====
        updateProfile: async (profileData) => {
          set((state) => {
            state.profileUpdateLoading = true;
            state.error = null;
          });

          try {
            const data = await apiCall(
              "/service-provider/update-service-provider-info",
              {
                method: "PUT",
                body: JSON.stringify(profileData),
              }
            );

            set((state) => {
              state.serviceProvider = data.serviceProvider;
              state.profileUpdateLoading = false;
            });

            return { success: true, data };
          } catch (error) {
            set((state) => {
              state.error = error.message;
              state.profileUpdateLoading = false;
            });
            throw error;
          }
        },

        updateAvatar: async (avatarData) => {
          set((state) => {
            state.avatarUpdateLoading = true;
            state.error = null;
          });

          try {
            const data = await apiCall(
              "/service-provider/update-service-provider-avatar",
              {
                method: "PUT",
                body: JSON.stringify({ avatar: avatarData }),
              }
            );

            set((state) => {
              state.serviceProvider = data.serviceProvider;
              state.avatarUpdateLoading = false;
            });

            return { success: true, data };
          } catch (error) {
            set((state) => {
              state.error = error.message;
              state.avatarUpdateLoading = false;
            });
            throw error;
          }
        },

        updateNotificationPreferences: async (preferences) => {
          try {
            const data = await apiCall(
              "/service-provider/update-notification-preferences",
              {
                method: "PUT",
                body: JSON.stringify(preferences),
              }
            );

            set((state) => {
              state.serviceProvider = data.serviceProvider;
              state.notificationPreferences = {
                ...state.notificationPreferences,
                ...preferences,
              };
            });

            return { success: true, data };
          } catch (error) {
            set((state) => {
              state.error = error.message;
            });
            throw error;
          }
        },

        // ===== UI ACTIONS =====
        toggleSidebar: () => {
          set((state) => {
            state.sidebarOpen = !state.sidebarOpen;
          });
        },

        setActiveTab: (tab) => {
          set((state) => {
            state.activeTab = tab;
          });
        },

        toggleModal: (modalName, isOpen) => {
          set((state) => {
            state.modals[modalName] = isOpen;
          });
        },

        setTheme: (theme) => {
          set((state) => {
            state.theme = theme;
          });
        },

        // ===== UTILITY ACTIONS =====
        clearError: () => {
          set((state) => {
            state.error = null;
          });
        },

        resetState: () => {
          set((state) => {
            state.serviceProvider = null;
            state.isAuthenticated = false;
            state.token = null;
            state.bookings = [];
            state.conversations = [];
            state.messages = {};
            state.notifications = [];
            state.reviews = [];
            state.servicesOffered = [];
            state.error = null;
            state.isLoading = false;
          });
        },

        // ===== SOCKET ACTIONS =====
        handleNewMessage: (message) => {
          set((state) => {
            const senderId = message.senderId._id || message.senderId;
            if (!state.messages[senderId]) {
              state.messages[senderId] = [];
            }
            state.messages[senderId].unshift(message);
            state.unreadCount += 1;
          });
        },

        handleMessageRead: (messageId) => {
          set((state) => {
            Object.keys(state.messages).forEach((userId) => {
              const messageIndex = state.messages[userId].findIndex(
                (m) => m._id === messageId
              );
              if (messageIndex !== -1) {
                state.messages[userId][messageIndex].isRead = true;
              }
            });
          });
        },

        handleBookingStatusUpdate: (bookingId, status) => {
          set((state) => {
            const bookingIndex = state.bookings.findIndex(
              (b) => b._id === bookingId
            );
            if (bookingIndex !== -1) {
              state.bookings[bookingIndex].status = status;
            }
          });
        },

        updateOnlineUsers: (users) => {
          set((state) => {
            state.onlineUsers = new Set(users);
          });
        },

        addNotification: (notification) => {
          set((state) => {
            state.notifications.unshift(notification);
            state.unreadNotifications += 1;
          });
        },

        markNotificationAsRead: (notificationId) => {
          set((state) => {
            const notification = state.notifications.find(
              (n) => n._id === notificationId
            );
            if (notification && !notification.read) {
              notification.read = true;
              state.unreadNotifications -= 1;
            }
          });
        },
      })),
      {
        name: "service-provider-store",
        partialize: (state) => ({
          serviceProvider: state.serviceProvider,
          isAuthenticated: state.isAuthenticated,
          token: state.token,
          theme: state.theme,
          sidebarOpen: state.sidebarOpen,
          notificationPreferences: state.notificationPreferences,
        }),
      }
    ),
    {
      name: "service-provider-store",
    }
  )
);

export default useServiceProviderStore;
