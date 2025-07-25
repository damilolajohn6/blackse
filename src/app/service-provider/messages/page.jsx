"use client"
import { useState, useEffect } from "react";
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
  } = useServiceProviderStore();

  const [selectedUserId, setSelectedUserId] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showConversationMenu, setShowConversationMenu] = useState(null);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (selectedUserId) {
      fetchMessages(selectedUserId);
    }
  }, [selectedUserId, fetchMessages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedUserId) return;

    try {
      await sendMessage(selectedUserId, { content: messageText });
      setMessageText("");
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  const handleSelectConversation = (userId) => {
    setSelectedUserId(userId);
    setShowConversationMenu(null);
  };

  const filteredConversations = conversations.filter((conversation) => {
    const otherUser = conversation.members.find(
      (member) => member._id !== conversation.serviceProvider
    );
    return otherUser?.username
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
  });

  const currentMessages = selectedUserId ? messages[selectedUserId] || [] : [];
  const selectedUser = conversations
    .find((conv) =>
      conv.members.some((member) => member._id === selectedUserId)
    )
    ?.members.find((member) => member._id === selectedUserId);

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
              <input
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
              </div>
            ) : (
              filteredConversations.map((conversation) => {
                const otherUser = conversation.members.find(
                  (member) => member._id !== conversation.serviceProvider
                );
                const isSelected = selectedUserId === otherUser._id;

                return (
                  <div
                    key={conversation._id}
                    onClick={() => handleSelectConversation(otherUser._id)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                      isSelected
                        ? "bg-indigo-50 border-r-2 border-r-indigo-500"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={otherUser.avatar?.url || "/default-avatar.png"}
                          alt={otherUser.username}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {otherUser.username}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {conversation.lastMessage}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-gray-400">
                          {new Date(
                            conversation.updatedAt
                          ).toLocaleDateString()}
                        </span>
                        {conversation.unreadCount > 0 && (
                          <span className="bg-indigo-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center mt-1">
                            {conversation.unreadCount}
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
          {selectedUserId ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={selectedUser?.avatar?.url || "/default-avatar.png"}
                    alt={selectedUser?.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {selectedUser?.username}
                    </h3>
                    <p className="text-sm text-gray-500">Online</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <Phone className="h-5 w-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <Video className="h-5 w-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <Info className="h-5 w-5 text-gray-600" />
                  </button>
                  <div className="relative">
                    <button
                      onClick={() =>
                        setShowConversationMenu(!showConversationMenu)
                      }
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <MoreVertical className="h-5 w-5 text-gray-600" />
                    </button>
                    {showConversationMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                        <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <Archive className="h-4 w-4 mr-2" />
                          Archive Conversation
                        </button>
                        <button className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
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
                {currentMessages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  currentMessages.map((message) => (
                    <div
                      key={message._id}
                      className={`flex ${
                        message.senderModel === "ServiceProvider"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.senderModel === "ServiceProvider"
                            ? "bg-indigo-500 text-white"
                            : "bg-gray-200 text-gray-900"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.senderModel === "ServiceProvider"
                              ? "text-indigo-100"
                              : "text-gray-500"
                          }`}
                        >
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
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
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                  >
                    <Paperclip className="h-5 w-5" />
                  </button>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type a message..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <button
                    type="button"
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                  >
                    <Smile className="h-5 w-5" />
                  </button>
                  <button
                    type="submit"
                    disabled={!messageText.trim()}
                    className="p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50"
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
