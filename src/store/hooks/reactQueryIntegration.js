import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import useServiceProviderStore from "../serviceStore";

// Query keys for consistent caching
export const QUERY_KEYS = {
  SERVICE_PROVIDER: "serviceProvider",
  BOOKINGS: "bookings",
  CONVERSATIONS: "conversations",
  MESSAGES: "messages",
  REVIEWS: "reviews",
  SERVICES: "services",
  DASHBOARD_STATS: "dashboardStats",
  NOTIFICATIONS: "notifications",
};

// ===== AUTHENTICATION QUERIES =====
export const useServiceProviderQuery = () => {
  const loadServiceProvider = useServiceProviderStore(
    (state) => state.loadServiceProvider
  );
  const serviceProvider = useServiceProviderStore(
    (state) => state.serviceProvider
  );
  const isAuthenticated = useServiceProviderStore(
    (state) => state.isAuthenticated
  );

  return useQuery({
    queryKey: [QUERY_KEYS.SERVICE_PROVIDER],
    queryFn: loadServiceProvider,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    refetchOnWindowFocus: false,
    initialData: serviceProvider,
  });
};

export const useLoginMutation = () => {
  const queryClient = useQueryClient();
  const login = useServiceProviderStore((state) => state.login);

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      queryClient.setQueryData(
        [QUERY_KEYS.SERVICE_PROVIDER],
        data.serviceProvider
      );
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SERVICE_PROVIDER],
      });
    },
    onError: (error) => {
      console.error("Login failed:", error);
    },
  });
};

export const useLogoutMutation = () => {
  const queryClient = useQueryClient();
  const logout = useServiceProviderStore((state) => state.logout);

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear();
    },
    onError: (error) => {
      console.error("Logout failed:", error);
    },
  });
};

// ===== BOOKING QUERIES =====
export const useBookingsQuery = (filters = {}) => {
  const fetchBookings = useServiceProviderStore((state) => state.fetchBookings);
  const bookings = useServiceProviderStore((state) => state.bookings);
  const isAuthenticated = useServiceProviderStore(
    (state) => state.isAuthenticated
  );

  return useQuery({
    queryKey: [QUERY_KEYS.BOOKINGS, filters],
    queryFn: () => fetchBookings(filters),
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for real-time updates
    initialData: bookings,
  });
};

export const useBookingStatusMutation = () => {
  const queryClient = useQueryClient();
  const updateBookingStatus = useServiceProviderStore(
    (state) => state.updateBookingStatus
  );

  return useMutation({
    mutationFn: ({ bookingId, status, cancellationReason }) =>
      updateBookingStatus(bookingId, status, cancellationReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BOOKINGS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD_STATS] });
    },
    onError: (error) => {
      console.error("Booking status update failed:", error);
    },
  });
};

// ===== MESSAGING QUERIES =====
export const useConversationsQuery = (filters = {}) => {
  const fetchConversations = useServiceProviderStore(
    (state) => state.fetchConversations
  );
  const conversations = useServiceProviderStore((state) => state.conversations);
  const isAuthenticated = useServiceProviderStore(
    (state) => state.isAuthenticated
  );

  return useQuery({
    queryKey: [QUERY_KEYS.CONVERSATIONS, filters],
    queryFn: () => fetchConversations(filters),
    enabled: isAuthenticated,
    staleTime: 1 * 60 * 1000, // 1 minute
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 1000, // Refetch every 10 seconds
    initialData: conversations,
  });
};

export const useMessagesQuery = (userId, page = 1, limit = 20) => {
  const fetchMessages = useServiceProviderStore((state) => state.fetchMessages);
  const messages = useServiceProviderStore((state) => state.messages);
  const isAuthenticated = useServiceProviderStore(
    (state) => state.isAuthenticated
  );

  return useQuery({
    queryKey: [QUERY_KEYS.MESSAGES, userId, page, limit],
    queryFn: () => fetchMessages(userId, page, limit),
    enabled: isAuthenticated && !!userId,
    staleTime: 30 * 1000, // 30 seconds
    cacheTime: 5 * 60 * 1000, // 5 minutes
    initialData: messages[userId] || [],
  });
};

export const useSendMessageMutation = () => {
  const queryClient = useQueryClient();
  const sendMessage = useServiceProviderStore((state) => state.sendMessage);

  return useMutation({
    mutationFn: ({ userId, messageData }) => sendMessage(userId, messageData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.MESSAGES, variables.userId],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.CONVERSATIONS],
      });
    },
    onError: (error) => {
      console.error("Send message failed:", error);
    },
  });
};

export const useDeleteMessageMutation = () => {
  const queryClient = useQueryClient();
  const deleteMessage = useServiceProviderStore((state) => state.deleteMessage);

  return useMutation({
    mutationFn: deleteMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MESSAGES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CONVERSATIONS] });
    },
    onError: (error) => {
      console.error("Delete message failed:", error);
    },
  });
};

// ===== SERVICES QUERIES =====
export const useServicesQuery = () => {
  const fetchServicesOffered = useServiceProviderStore(
    (state) => state.fetchServicesOffered
  );
  const servicesOffered = useServiceProviderStore(
    (state) => state.servicesOffered
  );
  const isAuthenticated = useServiceProviderStore(
    (state) => state.isAuthenticated
  );

  return useQuery({
    queryKey: [QUERY_KEYS.SERVICES],
    queryFn: fetchServicesOffered,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    initialData: servicesOffered,
  });
};

export const useAddServiceMutation = () => {
  const queryClient = useQueryClient();
  const addService = useServiceProviderStore((state) => state.addService);

  return useMutation({
    mutationFn: addService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SERVICES] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SERVICE_PROVIDER],
      });
    },
    onError: (error) => {
      console.error("Add service failed:", error);
    },
  });
};

export const useUpdateServiceMutation = () => {
  const queryClient = useQueryClient();
  const updateService = useServiceProviderStore((state) => state.updateService);

  return useMutation({
    mutationFn: ({ serviceId, serviceData }) =>
      updateService(serviceId, serviceData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SERVICES] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SERVICE_PROVIDER],
      });
    },
    onError: (error) => {
      console.error("Update service failed:", error);
    },
  });
};

export const useDeleteServiceMutation = () => {
  const queryClient = useQueryClient();
  const deleteService = useServiceProviderStore((state) => state.deleteService);

  return useMutation({
    mutationFn: deleteService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SERVICES] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SERVICE_PROVIDER],
      });
    },
    onError: (error) => {
      console.error("Delete service failed:", error);
    },
  });
};

// ===== REVIEWS QUERIES =====
export const useReviewsQuery = (page = 1, limit = 10) => {
  const fetchReviews = useServiceProviderStore((state) => state.fetchReviews);
  const reviews = useServiceProviderStore((state) => state.reviews);
  const isAuthenticated = useServiceProviderStore(
    (state) => state.isAuthenticated
  );

  return useQuery({
    queryKey: [QUERY_KEYS.REVIEWS, page, limit],
    queryFn: () => fetchReviews(page, limit),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    initialData: reviews,
  });
};

// ===== DASHBOARD QUERIES =====
export const useDashboardStatsQuery = (startDate, endDate) => {
  const fetchDashboardStats = useServiceProviderStore(
    (state) => state.fetchDashboardStats
  );
  const dashboardStats = useServiceProviderStore(
    (state) => state.dashboardStats
  );
  const isAuthenticated = useServiceProviderStore(
    (state) => state.isAuthenticated
  );

  return useQuery({
    queryKey: [QUERY_KEYS.DASHBOARD_STATS, startDate, endDate],
    queryFn: () => fetchDashboardStats(startDate, endDate),
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // Refetch every minute
    initialData: dashboardStats,
  });
};

// ===== PROFILE MUTATIONS =====
export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();
  const updateProfile = useServiceProviderStore((state) => state.updateProfile);

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(
        [QUERY_KEYS.SERVICE_PROVIDER],
        data.serviceProvider
      );
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SERVICE_PROVIDER],
      });
    },
    onError: (error) => {
      console.error("Update profile failed:", error);
    },
  });
};

export const useUpdateAvatarMutation = () => {
  const queryClient = useQueryClient();
  const updateAvatar = useServiceProviderStore((state) => state.updateAvatar);

  return useMutation({
    mutationFn: updateAvatar,
    onSuccess: (data) => {
      queryClient.setQueryData(
        [QUERY_KEYS.SERVICE_PROVIDER],
        data.serviceProvider
      );
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SERVICE_PROVIDER],
      });
    },
    onError: (error) => {
      console.error("Update avatar failed:", error);
    },
  });
};

export const useUpdateNotificationPreferencesMutation = () => {
  const queryClient = useQueryClient();
  const updateNotificationPreferences = useServiceProviderStore(
    (state) => state.updateNotificationPreferences
  );

  return useMutation({
    mutationFn: updateNotificationPreferences,
    onSuccess: (data) => {
      queryClient.setQueryData(
        [QUERY_KEYS.SERVICE_PROVIDER],
        data.serviceProvider
      );
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.SERVICE_PROVIDER],
      });
    },
    onError: (error) => {
      console.error("Update notification preferences failed:", error);
    },
  });
};

// ===== ADVANCED QUERY HOOKS =====
export const useInfiniteMessages = (userId) => {
  const fetchMessages = useServiceProviderStore((state) => state.fetchMessages);
  const isAuthenticated = useServiceProviderStore(
    (state) => state.isAuthenticated
  );

  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.MESSAGES, userId, "infinite"],
    queryFn: ({ pageParam = 1 }) => fetchMessages(userId, pageParam, 20),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.totalPages > allPages.length
        ? allPages.length + 1
        : undefined;
    },
    enabled: isAuthenticated && !!userId,
    staleTime: 30 * 1000, // 30 seconds
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useInfiniteBookings = (filters = {}) => {
  const fetchBookings = useServiceProviderStore((state) => state.fetchBookings);
  const isAuthenticated = useServiceProviderStore(
    (state) => state.isAuthenticated
  );

  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.BOOKINGS, filters, "infinite"],
    queryFn: ({ pageParam = 1 }) =>
      fetchBookings({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.totalPages > allPages.length
        ? allPages.length + 1
        : undefined;
    },
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });
};

// ===== OPTIMISTIC UPDATE HOOKS =====
export const useOptimisticBookingUpdate = () => {
  const queryClient = useQueryClient();
  const updateBookingStatus = useServiceProviderStore(
    (state) => state.updateBookingStatus
  );

  return useMutation({
    mutationFn: ({ bookingId, status, cancellationReason }) =>
      updateBookingStatus(bookingId, status, cancellationReason),
    onMutate: async ({ bookingId, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.BOOKINGS] });

      // Snapshot the previous value
      const previousBookings = queryClient.getQueryData([QUERY_KEYS.BOOKINGS]);

      // Optimistically update
      queryClient.setQueryData([QUERY_KEYS.BOOKINGS], (old) => {
        if (!old) return old;
        return {
          ...old,
          bookings: old.bookings.map((booking) =>
            booking._id === bookingId ? { ...booking, status } : booking
          ),
        };
      });

      return { previousBookings };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousBookings) {
        queryClient.setQueryData(
          [QUERY_KEYS.BOOKINGS],
          context.previousBookings
        );
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BOOKINGS] });
    },
  });
};

// ===== PREFETCHING HOOKS =====
export const usePrefetchData = () => {
  const queryClient = useQueryClient();
  const isAuthenticated = useServiceProviderStore(
    (state) => state.isAuthenticated
  );

  const prefetchBookings = useCallback(
    (filters = {}) => {
      if (!isAuthenticated) return;

      queryClient.prefetchQuery({
        queryKey: [QUERY_KEYS.BOOKINGS, filters],
        queryFn: () =>
          useServiceProviderStore.getState().fetchBookings(filters),
        staleTime: 2 * 60 * 1000,
      });
    },
    [queryClient, isAuthenticated]
  );

  const prefetchConversations = useCallback(
    (filters = {}) => {
      if (!isAuthenticated) return;

      queryClient.prefetchQuery({
        queryKey: [QUERY_KEYS.CONVERSATIONS, filters],
        queryFn: () =>
          useServiceProviderStore.getState().fetchConversations(filters),
        staleTime: 1 * 60 * 1000,
      });
    },
    [queryClient, isAuthenticated]
  );

  const prefetchMessages = useCallback(
    (userId) => {
      if (!isAuthenticated || !userId) return;

      queryClient.prefetchQuery({
        queryKey: [QUERY_KEYS.MESSAGES, userId, 1, 20],
        queryFn: () =>
          useServiceProviderStore.getState().fetchMessages(userId, 1, 20),
        staleTime: 30 * 1000,
      });
    },
    [queryClient, isAuthenticated]
  );

  return {
    prefetchBookings,
    prefetchConversations,
    prefetchMessages,
  };
};

// ===== BACKGROUND SYNC HOOKS =====
export const useBackgroundSync = () => {
  const queryClient = useQueryClient();
  const isAuthenticated = useServiceProviderStore(
    (state) => state.isAuthenticated
  );

  const syncAllData = useCallback(async () => {
    if (!isAuthenticated) return;

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BOOKINGS] }),
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CONVERSATIONS] }),
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DASHBOARD_STATS] }),
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.REVIEWS] }),
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SERVICES] }),
    ]);
  }, [queryClient, isAuthenticated]);

  return { syncAllData };
};

// ===== CACHE MANAGEMENT HOOKS =====
export const useCacheManager = () => {
  const queryClient = useQueryClient();

  const clearAllCache = useCallback(() => {
    queryClient.clear();
  }, [queryClient]);

  const clearSpecificCache = useCallback(
    (queryKey) => {
      queryClient.removeQueries({ queryKey });
    },
    [queryClient]
  );

  const refreshCache = useCallback(
    async (queryKey) => {
      await queryClient.invalidateQueries({ queryKey });
    },
    [queryClient]
  );

  const getCacheSize = useCallback(() => {
    return queryClient.getQueryCache().getAll().length;
  }, [queryClient]);

  return {
    clearAllCache,
    clearSpecificCache,
    refreshCache,
    getCacheSize,
  };
};

// ===== CUSTOM QUERY HOOKS WITH ADVANCED FEATURES =====
export const useRealtimeBookings = (filters = {}) => {
  const bookingsQuery = useBookingsQuery(filters);
  const queryClient = useQueryClient();

  // Set up real-time updates via WebSocket
  useEffect(() => {
    const handleBookingUpdate = (booking) => {
      queryClient.setQueryData([QUERY_KEYS.BOOKINGS, filters], (old) => {
        if (!old) return old;

        const bookingIndex = old.bookings.findIndex(
          (b) => b._id === booking._id
        );
        if (bookingIndex >= 0) {
          old.bookings[bookingIndex] = booking;
        } else {
          old.bookings.unshift(booking);
        }

        return { ...old };
      });
    };

    // Subscribe to real-time updates (assuming socket connection)
    const socket = window.socket;
    if (socket) {
      socket.on("bookingUpdate", handleBookingUpdate);
      return () => socket.off("bookingUpdate", handleBookingUpdate);
    }
  }, [queryClient, filters]);

  return bookingsQuery;
};

// ===== ERROR BOUNDARY INTEGRATION =====
export const useQueryErrorHandler = () => {
  const setError = useServiceProviderStore((state) => state.setError);

  return useCallback(
    (error) => {
      console.error("Query error:", error);
      setError(error.message || "Something went wrong");
    },
    [setError]
  );
};

// ===== PERSISTENCE HOOKS =====
export const usePersistentQueries = () => {
  const queryClient = useQueryClient();

  const saveQueriesState = useCallback(() => {
    const queries = queryClient.getQueryCache().getAll();
    const serializedQueries = queries.map((query) => ({
      queryKey: query.queryKey,
      queryHash: query.queryHash,
      data: query.state.data,
      dataUpdatedAt: query.state.dataUpdatedAt,
    }));

    localStorage.setItem("queryCache", JSON.stringify(serializedQueries));
  }, [queryClient]);

  const loadQueriesState = useCallback(() => {
    const cached = localStorage.getItem("queryCache");
    if (cached) {
      try {
        const queries = JSON.parse(cached);
        queries.forEach((query) => {
          queryClient.setQueryData(query.queryKey, query.data);
        });
      } catch (error) {
        console.error("Failed to load cached queries:", error);
      }
    }
  }, [queryClient]);

  return {
    saveQueriesState,
    loadQueriesState,
  };
};
