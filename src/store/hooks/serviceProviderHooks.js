import { useEffect, useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import useServiceProviderStore from "../serviceStore";

// ===== AUTHENTICATION HOOKS =====
export const useAuth = () => {
  return useServiceProviderStore(
    useShallow((state) => ({
      serviceProvider: state.serviceProvider,
      isAuthenticated: state.isAuthenticated,
      isLoading: state.isLoading,
      error: state.error,
      login: state.login,
      register: state.register,
      activateAccount: state.activateAccount,
      logout: state.logout,
      loadServiceProvider: state.loadServiceProvider,
      clearError: state.clearError,
    }))
  );
};

// ===== BOOKING HOOKS =====
export const useBookings = () => {
  return useServiceProviderStore(
    useShallow((state) => ({
      bookings: state.bookings,
      totalBookings: state.totalBookings,
      bookingStats: state.bookingStats,
      selectedBooking: state.selectedBooking,
      bookingFilters: state.bookingFilters,
      bookingsPagination: state.bookingsPagination,
      isLoading: state.isLoading,
      error: state.error,
      fetchBookings: state.fetchBookings,
      updateBookingStatus: state.updateBookingStatus,
      setBookingFilters: state.setBookingFilters,
      selectBooking: state.selectBooking,
    }))
  );
};

// Custom hook for booking management with automatic refresh
export const useBookingManager = () => {
  const bookings = useBookings();

  useEffect(() => {
    // Auto-fetch bookings on mount
    bookings.fetchBookings();
  }, [bookings]);

  const updateStatusAndRefresh = useCallback(
    async (bookingId, status, cancellationReason) => {
      try {
        await bookings.updateBookingStatus(
          bookingId,
          status,
          cancellationReason
        );
        // Refresh bookings after status update
        await bookings.fetchBookings();
      } catch (error) {
        console.error("Failed to update booking status:", error);
      }
    },
    [bookings]
  );

  return {
    ...bookings,
    updateStatusAndRefresh,
  };
};

// ===== MESSAGING HOOKS =====
export const useMessaging = () => {
  return useServiceProviderStore(
    useShallow((state) => ({
      conversations: state.conversations,
      messages: state.messages,
      selectedConversation: state.selectedConversation,
      unreadCount: state.unreadCount,
      messageFilters: state.messageFilters,
      onlineUsers: state.onlineUsers,
      isLoading: state.isLoading,
      error: state.error,
      fetchConversations: state.fetchConversations,
      fetchMessages: state.fetchMessages,
      sendMessage: state.sendMessage,
      markMessageAsRead: state.markMessageAsRead,
      deleteMessage: state.deleteMessage,
      archiveConversation: state.archiveConversation,
      blockUser: state.blockUser,
      unblockUser: state.unblockUser,
    }))
  );
};

// Custom hook for real-time messaging with socket integration
export const useMessagingWithSocket = (socket) => {
  const messaging = useMessaging();
  const handleNewMessage = useServiceProviderStore(
    (state) => state.handleNewMessage
  );
  const handleMessageRead = useServiceProviderStore(
    (state) => state.handleMessageRead
  );
  const updateOnlineUsers = useServiceProviderStore(
    (state) => state.updateOnlineUsers
  );

  useEffect(() => {
    if (!socket) return;

    // Socket event listeners
    socket.on("newMessage", handleNewMessage);
    socket.on("messageRead", ({ messageId }) => handleMessageRead(messageId));
    socket.on("userOnline", (users) => updateOnlineUsers(users));
    socket.on("userOffline", (users) => updateOnlineUsers(users));

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messageRead", handleMessageRead);
      socket.off("userOnline", updateOnlineUsers);
      socket.off("userOffline", updateOnlineUsers);
    };
  }, [socket, handleNewMessage, handleMessageRead, updateOnlineUsers]);

  return messaging;
};

// ===== SERVICES HOOKS =====
export const useServices = () => {
  return useServiceProviderStore(
    useShallow((state) => ({
      servicesOffered: state.servicesOffered,
      selectedService: state.selectedService,
      serviceStats: state.serviceStats,
      isLoading: state.isLoading,
      error: state.error,
      fetchServicesOffered: state.fetchServicesOffered,
      addService: state.addService,
      updateService: state.updateService,
      deleteService: state.deleteService,
    }))
  );
};

// ===== REVIEWS HOOKS =====
export const useReviews = () => {
  return useServiceProviderStore(
    useShallow((state) => ({
      reviews: state.reviews,
      reviewStats: state.reviewStats,
      isLoading: state.isLoading,
      error: state.error,
      fetchReviews: state.fetchReviews,
    }))
  );
};

// ===== DASHBOARD HOOKS =====
export const useDashboard = () => {
  return useServiceProviderStore(
    useShallow((state) => ({
      dashboardStats: state.dashboardStats,
      notifications: state.notifications,
      unreadNotifications: state.unreadNotifications,
      isLoading: state.isLoading,
      error: state.error,
      fetchDashboardStats: state.fetchDashboardStats,
      addNotification: state.addNotification,
      markNotificationAsRead: state.markNotificationAsRead,
    }))
  );
};

// Custom hook for dashboard with automatic data fetching
export const useDashboardManager = () => {
  const dashboard = useDashboard();
  const { fetchBookings } = useBookings();
  const { fetchReviews } = useReviews();
  const { fetchServicesOffered } = useServices();
  const { fetchConversations } = useMessaging();

  const refreshDashboard = useCallback(async () => {
    try {
      await Promise.all([
        dashboard.fetchDashboardStats(),
        fetchBookings(),
        fetchReviews(),
        fetchServicesOffered(),
        fetchConversations(),
      ]);
    } catch (error) {
      console.error("Failed to refresh dashboard:", error);
    }
  }, [
    dashboard,
    fetchBookings,
    fetchReviews,
    fetchServicesOffered,
    fetchConversations,
  ]);

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  return {
    ...dashboard,
    refreshDashboard,
  };
};

// ===== PROFILE HOOKS =====
export const useProfile = () => {
  return useServiceProviderStore(
    useShallow((state) => ({
      serviceProvider: state.serviceProvider,
      profileUpdateLoading: state.profileUpdateLoading,
      avatarUpdateLoading: state.avatarUpdateLoading,
      notificationPreferences: state.notificationPreferences,
      error: state.error,
      updateProfile: state.updateProfile,
      updateAvatar: state.updateAvatar,
      updateNotificationPreferences: state.updateNotificationPreferences,
    }))
  );
};

// ===== UI HOOKS =====
export const useUI = () => {
  return useServiceProviderStore(
    useShallow((state) => ({
      sidebarOpen: state.sidebarOpen,
      theme: state.theme,
      activeTab: state.activeTab,
      modals: state.modals,
      toggleSidebar: state.toggleSidebar,
      setActiveTab: state.setActiveTab,
      toggleModal: state.toggleModal,
      setTheme: state.setTheme,
    }))
  );
};

// ===== UTILITY HOOKS =====
export const useAppState = () => {
  return useServiceProviderStore(
    useShallow((state) => ({
      isLoading: state.isLoading,
      error: state.error,
      clearError: state.clearError,
      resetState: state.resetState,
    }))
  );
};

// Custom hook for error handling
export const useErrorHandler = () => {
  const { error, clearError } = useAppState();

  useEffect(() => {
    if (error) {
      // Auto-clear error after 5 seconds
      const timer = setTimeout(() => {
        clearError();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  return { error, clearError };
};

// ===== SOCKET HOOKS =====
export const useSocketHandlers = () => {
  return useServiceProviderStore(
    useShallow((state) => ({
      handleNewMessage: state.handleNewMessage,
      handleMessageRead: state.handleMessageRead,
      handleBookingStatusUpdate: state.handleBookingStatusUpdate,
      updateOnlineUsers: state.updateOnlineUsers,
    }))
  );
};

// Custom hook for socket connection management
export const useSocketManager = (socket) => {
  const handlers = useSocketHandlers();
  const { serviceProvider } = useAuth();

  useEffect(() => {
    if (!socket || !serviceProvider) return;

    // Join service provider room
    socket.emit("joinServiceProviderRoom", serviceProvider._id);

    // Set up all socket event listeners
    socket.on("newMessage", handlers.handleNewMessage);
    socket.on("messageRead", ({ messageId }) =>
      handlers.handleMessageRead(messageId)
    );
    socket.on("bookingStatusUpdated", ({ bookingId, status }) =>
      handlers.handleBookingStatusUpdate(bookingId, status)
    );
    socket.on("userOnline", handlers.updateOnlineUsers);
    socket.on("userOffline", handlers.updateOnlineUsers);
    socket.on("conversationArchived", ({ conversationId }) => {
      console.log("Conversation archived:", conversationId);
    });
    socket.on("conversationUnarchived", ({ conversationId }) => {
      console.log("Conversation unarchived:", conversationId);
    });

    return () => {
      socket.off("newMessage");
      socket.off("messageRead");
      socket.off("bookingStatusUpdated");
      socket.off("userOnline");
      socket.off("userOffline");
      socket.off("conversationArchived");
      socket.off("conversationUnarchived");
    };
  }, [socket, serviceProvider, handlers]);

  return socket;
};

// ===== PAGINATION HOOKS =====
export const usePagination = (initialPage = 1, initialLimit = 10) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const nextPage = useCallback(() => setPage((prev) => prev + 1), []);
  const prevPage = useCallback(
    () => setPage((prev) => Math.max(1, prev - 1)),
    []
  );
  const goToPage = useCallback((newPage) => setPage(newPage), []);
  const changeLimit = useCallback((newLimit) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
  }, []);

  return {
    page,
    limit,
    nextPage,
    prevPage,
    goToPage,
    changeLimit,
    setPage,
    setLimit,
  };
};

// ===== FILTERING HOOKS =====
export const useFilters = (initialFilters = {}) => {
  const [filters, setFilters] = useState(initialFilters);

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  return {
    filters,
    updateFilter,
    updateFilters,
    clearFilters,
  };
};

// ===== SEARCH HOOKS =====
export const useSearch = (searchFunction, debounceMs = 300) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchFunction(searchTerm);
        setSearchResults(results);
      } catch (error) {
        console.error("Search failed:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchTerm, searchFunction, debounceMs]);

  return {
    searchTerm,
    setSearchTerm,
    searchResults,
    isSearching,
  };
};

// ===== FORM HOOKS =====
export const useFormState = (initialState = {}) => {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = useCallback(
    (field, value) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: null }));
      }
    },
    [errors]
  );

  const setFieldError = useCallback((field, error) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialState);
    setErrors({});
    setIsSubmitting(false);
  }, [initialState]);

  return {
    formData,
    errors,
    isSubmitting,
    updateField,
    setFieldError,
    clearErrors,
    resetForm,
    setFormData,
    setIsSubmitting,
  };
};

// ===== ASYNC OPERATION HOOKS =====
export const useAsyncOperation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const executeAsync = useCallback(async (operation) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await operation();
      return result;
    } catch (err) {
      setError(err.message || "An error occurred");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    executeAsync,
    clearError,
  };
};
