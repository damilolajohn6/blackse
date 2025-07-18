"use client";
import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AiOutlineArrowRight, AiOutlineSend } from "react-icons/ai";
import { TfiGallery } from "react-icons/tfi";
import { format } from "timeago.js";
import io from "socket.io-client";
import useAuthStore from "@/store/authStore";
import styles from "@/styles/styles";
import { useRouter } from "next/navigation";

const ENDPOINT = process.env.NEXT_SOCKET_URL_SERVER || "http://localhost:8000";
const socket = io(ENDPOINT, { transports: ["websocket"] });

const DashboardMessages = () => {
  const { seller, sellerToken, isLoading } = useAuthStore();
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [userData, setUserData] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [activeStatus, setActiveStatus] = useState(false);
  const [images, setImages] = useState(null);
  const [open, setOpen] = useState(false);
  const scrollRef = useRef(null);
  const router = useRouter();

  // Initialize socket connection
  useEffect(() => {
    if (seller) {
      socket.emit("addUser", `shop_${seller._id}`);
      socket.on("getUsers", (data) => {
        setOnlineUsers(data.map((user) => user.userId));
      });

      socket.on("newMessage", (message) => {
        if (currentChat?.members.includes(message.senderId.toString())) {
          setMessages((prev) => [...prev, message]);
        }
      });

      socket.on("messageSent", (message) => {
        if (currentChat?._id === message.conversationId) {
          setMessages((prev) => [...prev, message]);
        }
      });

      return () => {
        socket.off("getUsers");
        socket.off("newMessage");
        socket.off("messageSent");
      };
    }
  }, [seller, currentChat]);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      if (!seller) return;
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER}/shop/get-conversations`,
          {
            headers: { Authorization: `Bearer ${sellerToken}` },
            withCredentials: true,
          }
        );
        setConversations(response.data.conversations);
      } catch (error) {
        toast.error("Failed to load conversations");
        console.error("Fetch conversations error:", error);
      }
    };
    fetchConversations();
  }, [seller, sellerToken, messages]);

  // Fetch messages for the selected conversation
  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentChat) return;
      try {
        const userId = currentChat.members.find(
          (member) => member !== seller._id
        );
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER}/shop/get-messages-with-user/${userId}`,
          {
            headers: { Authorization: `Bearer ${sellerToken}` },
            withCredentials: true,
          }
        );
        setMessages(response.data.messages);
      } catch (error) {
        toast.error("Failed to load messages");
        console.error("Fetch messages error:", error);
      }
    };
    fetchMessages();
  }, [currentChat, seller, sellerToken]);

  // Auto-scroll to the latest message
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending a text message
  const sendMessageHandler = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !images) return;

    const userId = currentChat.members.find((member) => member !== seller._id);
    try {
      const payload = {
        content: newMessage,
        media: images ? [{ type: "image", data: images }] : [],
      };
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER}/shop/reply-to-user/${userId}`,
        payload,
        {
          headers: { Authorization: `Bearer ${sellerToken}` },
          withCredentials: true,
        }
      );
      setMessages((prev) => [...prev, response.data.message]);
      setNewMessage("");
      setImages(null);
    } catch (error) {
      toast.error("Failed to send message");
      console.error("Send message error:", error);
    }
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImages(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Check online status
  const onlineCheck = (chat) => {
    const chatMember = chat.members.find((member) => member !== seller._id);
    return onlineUsers.includes(chatMember);
  };

  // Handle conversation selection
  const handleConversationClick = async (conversation) => {
    setCurrentChat(conversation);
    setOpen(true);
    const userId = conversation.members.find((member) => member !== seller._id);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER}/user/user-info/${userId}`,
        {
          headers: { Authorization: `Bearer ${sellerToken}` },
          withCredentials: true,
        }
      );
      setUserData(response.data.user);
      setActiveStatus(onlineCheck(conversation));
    } catch (error) {
      toast.error("Failed to load user data");
      console.error("Fetch user data error:", error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (!seller) {
    return <div className="text-center py-10">Please log in as a seller</div>;
  }

  return (
    <div className="w-[90%] bg-white m-5 h-[85vh] overflow-y-scroll rounded">
      {!open ? (
        <>
          <h1 className="text-center text-[30px] py-3 font-Poppins">
            All Messages
          </h1>
          {conversations.map((conversation, index) => (
            <ConversationList
              key={conversation._id}
              conversation={conversation}
              index={index}
              sellerId={seller._id}
              setOpen={setOpen}
              handleConversationClick={() =>
                handleConversationClick(conversation)
              }
              online={onlineCheck(conversation)}
            />
          ))}
        </>
      ) : (
        <SellerInbox
          setOpen={setOpen}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          sendMessageHandler={sendMessageHandler}
          messages={messages}
          sellerId={seller._id}
          userData={userData}
          activeStatus={activeStatus}
          scrollRef={scrollRef}
          handleImageUpload={handleImageUpload}
        />
      )}
    </div>
  );
};

const ConversationList = ({
  conversation,
  index,
  sellerId,
  handleConversationClick,
  online,
}) => {
  const [user, setUser] = useState(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const userId = conversation.members.find((member) => member !== sellerId);
    const fetchUser = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER}/user/user-info/${userId}`,
          {
            withCredentials: true,
          }
        );
        setUser(response.data.user);
      } catch (error) {
        console.error("Fetch user error:", error);
      }
    };
    fetchUser();
  }, [conversation, sellerId]);

  return (
    <div
      className={`w-full flex p-3 px-3 ${
        active ? "bg-[#00000010]" : "bg-transparent"
      } cursor-pointer`}
      onClick={() => {
        setActive(true);
        handleConversationClick();
      }}
    >
      <div className="relative">
        <img
          src={user?.avatar?.url || "/default-avatar.png"}
          alt=""
          className="w-[50px] h-[50px] rounded-full"
        />
        <div
          className={`w-[12px] h-[12px] rounded-full absolute top-[2px] right-[2px] ${
            online ? "bg-green-400" : "bg-[#c7b9b9]"
          }`}
        />
      </div>
      <div className="pl-3">
        <h1 className="text-[18px]">{user?.username}</h1>
        <p className="text-[16px] text-[#000c]">
          {conversation.lastMessageId !== sellerId
            ? "You: "
            : `${user?.username?.split(" ")[0]}: `}
          {conversation.lastMessage}
        </p>
      </div>
    </div>
  );
};

const SellerInbox = ({
  setOpen,
  newMessage,
  setNewMessage,
  sendMessageHandler,
  messages,
  sellerId,
  userData,
  activeStatus,
  scrollRef,
  handleImageUpload,
}) => {
  return (
    <div className="w-full min-h-full flex flex-col justify-between">
      {/* Header */}
      <div className="w-full flex p-3 items-center justify-between bg-slate-200">
        <div className="flex">
          <img
            src={userData?.avatar?.url || "/default-avatar.png"}
            alt=""
            className="w-[60px] h-[60px] rounded-full"
          />
          <div className="pl-3">
            <h1 className="text-[18px] font-[600]">{userData?.username}</h1>
            <h1>{activeStatus ? "Active Now" : "Offline"}</h1>
          </div>
        </div>
        <AiOutlineArrowRight
          size={20}
          className="cursor-pointer"
          onClick={() => setOpen(false)}
        />
      </div>

      {/* Messages */}
      <div className="px-3 h-[65vh] py-3 overflow-y-scroll">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex w-full my-2 ${
              message.senderId._id === sellerId
                ? "justify-end"
                : "justify-start"
            }`}
            ref={scrollRef}
          >
            {message.senderId._id !== sellerId && (
              <img
                src={userData?.avatar?.url || "/default-avatar.png"}
                className="w-[40px] h-[40px] rounded-full mr-3"
                alt=""
              />
            )}
            {message.media?.length > 0 && (
              <img
                src={message.media[0].url}
                className="w-[300px] h-[300px] object-cover rounded-[10px] mr-2"
                alt=""
              />
            )}
            {message.content && (
              <div>
                <div
                  className={`w-max p-2 rounded ${
                    message.senderId._id === sellerId
                      ? "bg-[#000]"
                      : "bg-[#38c776]"
                  } text-[#fff] h-min`}
                >
                  <p>{message.content}</p>
                </div>
                <p className="text-[12px] text-[#000000d3] pt-1">
                  {format(message.createdAt)}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Message Input */}
      <form
        className="p-3 relative w-full flex justify-between items-center"
        onSubmit={sendMessageHandler}
      >
        <div className="w-[30px]">
          <input
            type="file"
            id="image"
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
          />
          <label htmlFor="image">
            <TfiGallery className="cursor-pointer" size={20} />
          </label>
        </div>
        <div className="w-full">
          <input
            type="text"
            placeholder="Enter your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className={`${styles.input}`}
          />
          <input type="submit" value="Send" className="hidden" id="send" />
          <label htmlFor="send">
            <AiOutlineSend
              size={20}
              className="absolute right-4 top-5 cursor-pointer"
            />
          </label>
        </div>
      </form>
    </div>
  );
};

export default DashboardMessages;
