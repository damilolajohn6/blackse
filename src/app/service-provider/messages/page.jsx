"use client";
import { useState, useEffect, useRef } from "react";
import {
  Search,
  Send,
  Paperclip,
  MoreVertical,
  Archive,
  Trash2,
  Phone,
  Video,
  Info,
  Smile,
} from "lucide-react";
import DashboardLayout from "@/components/serviceProvider/Layout/DashboardLayout";
import useServiceProviderStore from "@/store/serviceStore";
import { toast } from "react-toastify";
import { Input } from "@/components/ui/input";

const Messages = () => {
  const {
    conversations,
    messages,
    selectedConversation,
    fetchConversations,
    fetchMessages,
    sendMessage,
    markMessageAsRead,
    isLoading,
    error,
    serviceProvider,
  } = useServiceProviderStore();

  const [selectedUserId, setSelectedUserId] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showConversationMenu, setShowConversationMenu] = useState(null);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef(null);

  // Handle client-side mounting to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedUserId]);

  // Debug logging
  useEffect(() => {
    if (mounted) {
      console.log("Messages component state:", {
        conversations: conversations?.length || 0,
        conversationData: conversations,
        selectedUserId,
        currentMessages: selectedUserId
          ? messages[selectedUserId]?.length || 0
          : 0,
        messagesData: messages,
        isLoading,
        error,
        serviceProvider: serviceProvider?._id,
      });
    }
  }, [
    conversations,
    selectedUserId,
    messages,
    isLoading,
    error,
    serviceProvider,
    mounted,
  ]);

  // Fetch conversations on component mount
  useEffect(() => {
    const loadConversations = async () => {
      if (!mounted || !serviceProvider?._id) return;
      try {
        console.log("Fetching conversations...");
        // Use the correct endpoint from your backend
        await fetchConversations({
          page: 1,
          limit: 20,
          search: "",
          archived: false,
        });
        console.log("Conversations fetched successfully");
      } catch (error) {
        console.error("Error fetching conversations:", error);
        toast.error("Failed to load conversations: " + error.message);
      }
    };

    if (serviceProvider?._id) {
      loadConversations();
    } else if (mounted) {
      console.warn("No serviceProvider ID available");
      // Don't show error toast immediately, user might still be loading
    }
  }, [fetchConversations, serviceProvider, mounted]);

  // Fetch messages when a user is selected
  useEffect(() => {
    const loadMessages = async () => {
      if (!mounted || !selectedUserId) return;

      setIsMessagesLoading(true);
      try {
        console.log("Fetching messages for user:", selectedUserId);
        await fetchMessages(selectedUserId);
        console.log("Messages fetched successfully for user:", selectedUserId);
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast.error("Failed to load messages: " + error.message);
      } finally {
        setIsMessagesLoading(false);
      }
    };

    loadMessages();
  }, [selectedUserId, fetchMessages, mounted]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedUserId) {
      toast.error("Please enter a message and select a conversation");
      return;
    }

    try {
      console.log("Sending message:", { selectedUserId, content: messageText });
      await sendMessage(selectedUserId, { content: messageText });
      setMessageText("");
      toast.success("Message sent successfully");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(error.message || "Failed to send message");
    }
  };

  const handleSelectConversation = (userId) => {
    console.log("Selecting conversation with user:", userId);
    setSelectedUserId(userId);
    setShowConversationMenu(null);
  };

  // Helper function to get other user from conversation
  const getOtherUserFromConversation = (conversation) => {
    if (!conversation.members || !Array.isArray(conversation.members)) {
      console.warn("Invalid conversation members:", conversation);
      return null;
    }

    // Handle case where members array has proper user objects
    const otherUser = conversation.members.find((member) => {
      const memberId = member._id || member;
      return (
        memberId !== serviceProvider?._id &&
        memberId.toString() !== serviceProvider?._id
      );
    });

    if (!otherUser) {
      console.warn("No other user found in conversation:", conversation);
      return null;
    }

    return otherUser;
  };

  // Filter conversations based on search term
  const filteredConversations = conversations.filter((conversation) => {
    const otherUser = getOtherUserFromConversation(conversation);
    if (!otherUser) return false;

    const displayName =
      otherUser.username ||
      otherUser.fullname?.firstName ||
      otherUser.email ||
      "Unknown User";

    return displayName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Get current messages for selected user
  const currentMessages = selectedUserId ? messages[selectedUserId] || [] : [];

  // Find selected user info
  const selectedUser = conversations
    .find((conv) => {
      const otherUser = getOtherUserFromConversation(conv);
      return (
        otherUser &&
        (otherUser._id === selectedUserId ||
          otherUser._id?.toString() === selectedUserId)
      );
    })
    ?.members?.find((member) => {
      const memberId = member._id || member;
      return (
        memberId === selectedUserId || memberId?.toString() === selectedUserId
      );
    });

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return null;
  }

  // Show loading state for conversations
  if (isLoading && conversations.length === 0) {
    return (
      <DashboardLayout>
        <div className="h-[calc(100vh-8rem)] bg-white rounded-xl shadow-sm border border-gray-200 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading conversations...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show error state
  if (error && conversations.length === 0) {
    return (
      <DashboardLayout>
        <div className="h-[calc(100vh-8rem)] bg-white rounded-xl shadow-sm border border-gray-200 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-4">
              Error loading conversations: {error}
            </p>
            <button
              onClick={() => fetchConversations()}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
            >
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8rem)] bg-white rounded-xl shadow-sm border border-gray-200 flex">
        {/* Conversations Sidebar */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          {/* Search Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <p>No conversations found</p>
                {conversations.length === 0 && (
                  <p className="text-sm mt-2">
                    Start messaging users to see conversations here
                  </p>
                )}
                {searchTerm && conversations.length > 0 && (
                  <p className="text-sm mt-2">
                    No conversations match your search
                  </p>
                )}
              </div>
            ) : (
              filteredConversations.map((conversation) => {
                const otherUser = getOtherUserFromConversation(conversation);
                if (!otherUser) return null;

                const isSelected =
                  selectedUserId === otherUser._id ||
                  selectedUserId === otherUser._id?.toString();
                const displayName =
                  otherUser.username ||
                  otherUser.fullname?.firstName ||
                  otherUser.email ||
                  "Unknown User";

                // Handle avatar URL with fallback
                const avatarUrl =
                  otherUser.avatar?.url || "/api/placeholder/40/40";

                return (
                  <div
                    key={conversation._id}
                    onClick={() => handleSelectConversation(otherUser._id)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      isSelected
                        ? "bg-indigo-50 border-r-2 border-r-indigo-500"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <img
                            src={avatarUrl}
                            alt={displayName}
                            className="w-10 h-10 rounded-full object-cover bg-gray-200"
                            onError={(e) => {
                              e.target.src = "/api/placeholder/40/40";
                            }}
                          />
                          {/* Online indicator - you can add online status logic here */}
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {displayName}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {conversation.lastMessageId?.content ||
                              conversation.lastMessage ||
                              "No messages yet"}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-gray-400">
                          {conversation.updatedAt
                            ? new Date(conversation.updatedAt).toLocaleString(
                                [],
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )
                            : ""}
                        </span>
                        {conversation.unreadCount > 0 && (
                          <span className="bg-indigo-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center mt-1">
                            {conversation.unreadCount > 99
                              ? "99+"
                              : conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedUserId && selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={selectedUser?.avatar?.url || "/api/placeholder/40/40"}
                    alt={
                      selectedUser?.username ||
                      selectedUser?.fullname?.firstName ||
                      "Unknown User"
                    }
                    className="w-10 h-10 rounded-full object-cover bg-gray-200"
                    onError={(e) => {
                      e.target.src = "/api/placeholder/40/40";
                    }}
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {selectedUser?.username ||
                        selectedUser?.fullname?.firstName ||
                        selectedUser?.email ||
                        "Unknown User"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedUser?.online ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Phone className="h-5 w-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Video className="h-5 w-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Info className="h-5 w-5 text-gray-600" />
                  </button>
                  <div className="relative">
                    <button
                      onClick={() =>
                        setShowConversationMenu(!showConversationMenu)
                      }
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MoreVertical className="h-5 w-5 text-gray-600" />
                    </button>
                    {showConversationMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                        <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                          <Archive className="h-4 w-4 mr-2" />
                          Archive Conversation
                        </button>
                        <button className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Conversation
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isMessagesLoading ? (
                  <div className="text-center text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                    <p>Loading messages...</p>
                  </div>
                ) : currentMessages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  <>
                    {currentMessages.map((message, index) => {
                      const isFromServiceProvider =
                        message.senderModel === "ServiceProvider";
                      const showAvatar =
                        index === 0 ||
                        currentMessages[index - 1]?.senderModel !==
                          message.senderModel;

                      return (
                        <div
                          key={message._id}
                          className={`flex ${
                            isFromServiceProvider
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${
                              isFromServiceProvider
                                ? "flex-row-reverse space-x-reverse"
                                : ""
                            }`}
                          >
                            {showAvatar && !isFromServiceProvider && (
                              <img
                                src={
                                  selectedUser?.avatar?.url ||
                                  "/api/placeholder/32/32"
                                }
                                alt="User"
                                className="w-8 h-8 rounded-full bg-gray-200"
                                onError={(e) => {
                                  e.target.src = "/api/placeholder/32/32";
                                }}
                              />
                            )}
                            <div
                              className={`px-4 py-2 rounded-lg ${
                                isFromServiceProvider
                                  ? "bg-indigo-500 text-white rounded-br-sm"
                                  : "bg-gray-200 text-gray-900 rounded-bl-sm"
                              }`}
                            >
                              {message.content && (
                                <p className="text-sm whitespace-pre-wrap break-words">
                                  {message.content}
                                </p>
                              )}
                              {message.media && message.media.length > 0 && (
                                <div className="mt-2 space-y-2">
                                  {message.media.map((item, mediaIndex) => (
                                    <div key={mediaIndex}>
                                      {item.type === "image" ? (
                                        <img
                                          src={item.url}
                                          alt="Shared media"
                                          className="max-w-full rounded cursor-pointer"
                                          onClick={() =>
                                            window.open(item.url, "_blank")
                                          }
                                        />
                                      ) : (
                                        <video
                                          src={item.url}
                                          controls
                                          className="max-w-full rounded"
                                        />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                              <p
                                className={`text-xs mt-1 ${
                                  isFromServiceProvider
                                    ? "text-indigo-100"
                                    : "text-gray-500"
                                }`}
                              >
                                {new Date(message.createdAt).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                                {isFromServiceProvider && message.isRead && (
                                  <span className="ml-2">✓✓</span>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <form
                  onSubmit={handleSendMessage}
                  className="flex items-center space-x-2"
                >
                  <button
                    type="button"
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
                  >
                    <Paperclip className="h-5 w-5" />
                  </button>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type a message..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      disabled={isLoading || isMessagesLoading}
                    />
                  </div>
                  <button
                    type="button"
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
                  >
                    <Smile className="h-5 w-5" />
                  </button>
                  <button
                    type="submit"
                    disabled={
                      !messageText.trim() || isLoading || isMessagesLoading
                    }
                    className="p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No conversation selected
                </h3>
                <p className="text-gray-600">
                  Choose a conversation from the sidebar to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Messages;
