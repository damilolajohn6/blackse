//"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { io } from "socket.io-client";
import { useAuth } from "@/store/hooks/serviceProviderHooks";
import useServiceProviderStore from "@/store/serviceStore";

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const { serviceProvider, isAuthenticated } = useAuth();

  // Socket event handlers from store
  const handleNewMessage = useServiceProviderStore(
    (state) => state.handleNewMessage
  );
  const handleMessageRead = useServiceProviderStore(
    (state) => state.handleMessageRead
  );
  const handleBookingStatusUpdate = useServiceProviderStore(
    (state) => state.handleBookingStatusUpdate
  );
  const updateOnlineUsers = useServiceProviderStore(
    (state) => state.updateOnlineUsers
  );
  const addNotification = useServiceProviderStore(
    (state) => state.addNotification
  );

  // Socket connection management
  const connectSocket = useCallback(() => {
    if (!serviceProvider || socket) return;

    const newSocket = io(
      process.env.REACT_APP_SOCKET_URL || "http://localhost:8000",
      {
        auth: {
          token: localStorage.getItem("service_provider_token"),
          userId: serviceProvider._id,
          userType: "ServiceProvider",
        },
        transports: ["websocket"],
        autoConnect: true,
      }
    );

    // Connection event listeners
    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
      setIsConnected(true);
      setConnectionError(null);

      // Join service provider room
      newSocket.emit("joinServiceProviderRoom", serviceProvider._id);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      setIsConnected(false);

      // Auto-reconnect if disconnected unexpectedly
      if (
        reason === "io server disconnect" ||
        reason === "io client disconnect"
      ) {
        setTimeout(() => {
          newSocket.connect();
        }, 1000);
      }
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setConnectionError(error.message);
      setIsConnected(false);
    });

    // Message event listeners
    newSocket.on("newMessage", (message) => {
      console.log("New message received:", message);
      handleNewMessage(message);

      // Show notification if message is from another user
      if (message.senderModel === "User") {
        addNotification({
          id: Date.now(),
          type: "message",
          title: "New Message",
          message: `You have a new message from ${message.senderId.username || "User"
            }`,
          timestamp: new Date(),
          read: false,
        });
      }
    });

    newSocket.on("messageRead", ({ messageId }) => {
      console.log("Message read:", messageId);
      handleMessageRead(messageId);
    });

    newSocket.on("messageSent", (message) => {
      console.log("Message sent confirmation:", message);
      // Could add message sent confirmation UI here
    });

    newSocket.on("messageDeleted", ({ messageId }) => {
      console.log("Message deleted:", messageId);
      // Handle message deletion in UI
    });

    // Booking event listeners
    newSocket.on("bookingStatusUpdated", ({ bookingId, status }) => {
      console.log("Booking status updated:", bookingId, status);
      handleBookingStatusUpdate(bookingId, status);

      addNotification({
        id: Date.now(),
        type: "booking",
        title: "Booking Updated",
        message: `Booking status changed to ${status}`,
        timestamp: new Date(),
        read: false,
      });
    });

    newSocket.on("newBooking", (booking) => {
      console.log("New booking received:", booking);
      addNotification({
        id: Date.now(),
        type: "booking",
        title: "New Booking",
        message: `You have a new booking from ${booking.user.username}`,
        timestamp: new Date(),
        read: false,
      });
    });

    // User status event listeners
    newSocket.on("userOnline", (users) => {
      console.log("Users online:", users);
      updateOnlineUsers(users);
    });

    newSocket.on("userOffline", (users) => {
      console.log("Users offline:", users);
      updateOnlineUsers(users);
    });

    // Conversation event listeners
    newSocket.on("conversationArchived", ({ conversationId }) => {
      console.log("Conversation archived:", conversationId);
      addNotification({
        id: Date.now(),
        type: "conversation",
        title: "Conversation Archived",
        message: "A conversation has been archived",
        timestamp: new Date(),
        read: false,
      });
    });

    newSocket.on("conversationUnarchived", ({ conversationId }) => {
      console.log("Conversation unarchived:", conversationId);
    });

    // Block/Unblock event listeners
    newSocket.on("blockedByUser", ({ userId }) => {
      console.log("Blocked by user:", userId);
      addNotification({
        id: Date.now(),
        type: "user",
        title: "User Action",
        message: "A user has blocked you",
        timestamp: new Date(),
        read: false,
      });
    });

    newSocket.on("unblockedByUser", ({ userId }) => {
      console.log("Unblocked by user:", userId);
    });

    // Review event listeners
    newSocket.on("newReview", (review) => {
      console.log("New review received:", review);
      addNotification({
        id: Date.now(),
        type: "review",
        title: "New Review",
        message: `You received a new ${review.rating}-star review`,
        timestamp: new Date(),
        read: false,
      });
    });

    // System notifications
    newSocket.on("systemNotification", (notification) => {
      console.log("System notification:", notification);
      addNotification({
        id: Date.now(),
        type: "system",
        title: notification.title,
        message: notification.message,
        timestamp: new Date(),
        read: false,
      });
    });

    // Error handling
    newSocket.on("error", (error) => {
      console.error("Socket error:", error);
      setConnectionError(error.message);
    });

    setSocket(newSocket);
  }, [
    serviceProvider,
    socket,
    handleNewMessage,
    handleMessageRead,
    handleBookingStatusUpdate,
    updateOnlineUsers,
    addNotification,
  ]);

  const disconnectSocket = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  }, [socket]);

  // Socket utility functions
  const emitToSocket = useCallback(
    (event, data) => {
      if (socket && isConnected) {
        socket.emit(event, data);
      } else {
        console.warn("Socket not connected, cannot emit event:", event);
      }
    },
    [socket, isConnected]
  );

  const sendTypingIndicator = useCallback(
    (userId, isTyping) => {
      emitToSocket("typing", { userId, isTyping });
    },
    [emitToSocket]
  );

  const markMessageAsRead = useCallback(
    (messageId) => {
      emitToSocket("markAsRead", { messageId });
    },
    [emitToSocket]
  );

  const joinRoom = useCallback(
    (roomId) => {
      emitToSocket("joinRoom", { roomId });
    },
    [emitToSocket]
  );

  const leaveRoom = useCallback(
    (roomId) => {
      emitToSocket("leaveRoom", { roomId });
    },
    [emitToSocket]
  );

  // Connection lifecycle
  useEffect(() => {
    if (isAuthenticated && serviceProvider) {
      connectSocket();
    } else {
      disconnectSocket();
    }

    return () => {
      disconnectSocket();
    };
  }, [isAuthenticated, serviceProvider, connectSocket, disconnectSocket]);

  // Auto-reconnect logic
  useEffect(() => {
    if (!isConnected && isAuthenticated && serviceProvider) {
      const reconnectTimer = setTimeout(() => {
        console.log("Attempting to reconnect socket...");
        connectSocket();
      }, 3000);

      return () => clearTimeout(reconnectTimer);
    }
  }, [isConnected, isAuthenticated, serviceProvider, connectSocket]);

  const value = {
    socket,
    isConnected,
    connectionError,
    emitToSocket,
    sendTypingIndicator,
    markMessageAsRead,
    joinRoom,
    leaveRoom,
    connectSocket,
    disconnectSocket,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

// Socket connection status component
export const SocketStatus = () => {
  const { isConnected, connectionError } = useSocket();

  if (connectionError) {
    return (
      <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-red-200 rounded-full"></div>
          <span className="text-sm">Connection Error</span>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="fixed top-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-yellow-200 rounded-full animate-pulse"></div>
          <span className="text-sm">Connecting...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity duration-300">
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-green-200 rounded-full"></div>
        <span className="text-sm">Connected</span>
      </div>
    </div>
  );
};

// Typing indicator component
export const TypingIndicator = ({ userId, isVisible }) => {
  const { sendTypingIndicator } = useSocket();
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (isVisible && !isTyping) {
      setIsTyping(true);
      sendTypingIndicator(userId, true);
    } else if (!isVisible && isTyping) {
      setIsTyping(false);
      sendTypingIndicator(userId, false);
    }
  }, [isVisible, isTyping, userId, sendTypingIndicator]);

  useEffect(() => {
    // Clean up typing indicator on unmount
    return () => {
      if (isTyping) {
        sendTypingIndicator(userId, false);
      }
    };
  }, [isTyping, userId, sendTypingIndicator]);

  return null;
};

export default SocketProvider;
