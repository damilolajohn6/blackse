import { create } from "zustand";
import axios from "axios";
import io from "socket.io-client";
import { toast } from "react-toastify";

const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER
  ? `${process.env.NEXT_PUBLIC_SERVER}`
  : "http://localhost:8000/api/v2";
const SOCKET_URL = process.env.NEXT_SOCKET_URL_SERVER
  ? `${process.env.NEXT_SOCKET_URL_SERVER}`
  : "http://localhost:8000";

const useSocialStore = create((set, get) => ({
  mixedPosts: [],
  users: [],
  messages: [],
  recipientId: "",
  postContent: "",
  messageContent: "",
  commentContent: {},
  isFetching: false,
  socket: null,

  initializeSocket: (token, user) => {
    if (!token || !user) {
      console.warn("initializeSocket: Missing token or user");
      return;
    }

    const socketInstance = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      path: "/socket.io",
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on("connect", () => {
      console.info("socket: Connected to server");
      toast.success("Connected to chat server");
    });

    socketInstance.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      toast.error(`Failed to connect to chat server: ${error.message}`);
    });

    socketInstance.on("receiveMessage", (message) => {
      set((state) => ({
        messages: [...state.messages, message],
      }));
    });

    socketInstance.on("messageSent", (message) => {
      set((state) => ({
        messages: [...state.messages, message],
      }));
    });

    socketInstance.on("newMessage", (message) => {
      set((state) => ({
        messages: [...state.messages, message],
      }));
    });

    socketInstance.on("error", (error) => {
      console.error("Socket error:", error);
      toast.error(error);
    });

    set({ socket: socketInstance });

    return () => {
      socketInstance.disconnect();
    };
  },

  fetchTimeline: async (token) => {
    if (!token) {
      console.warn("fetchTimeline: No token provided");
      return;
    }
    set({ isFetching: true });
    try {
      const { data } = await axios.get(`${API_BASE_URL}/social/timeline`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      set((state) => ({
        mixedPosts: [
          ...state.mixedPosts.filter(
            (p) => !data.posts.some((newP) => newP.post._id === p.post._id)
          ),
          ...(data.posts || []).filter(
            (p) => p.post && p.user && Array.isArray(p.post.comments)
          ),
        ].sort(
          (a, b) =>
            new Date(b.post.createdAt).getTime() -
            new Date(a.post.createdAt).getTime()
        ),
      }));
    } catch (error) {
      console.error("FETCH TIMELINE ERROR:", error.response?.data, error);
      toast.error(error.response?.data?.message || "Failed to fetch timeline");
    } finally {
      set({ isFetching: false });
    }
  },

  fetchRandomPosts: async (token) => {
    if (!token) {
      console.warn("fetchRandomPosts: No token provided");
      return;
    }
    set({ isFetching: true });
    try {
      const { data } = await axios.get(`${API_BASE_URL}/social/random-posts`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      set((state) => ({
        mixedPosts: [
          ...state.mixedPosts.filter(
            (p) => !data.posts.some((newP) => newP.post._id === p.post._id)
          ),
          ...(data.posts || []).filter(
            (p) => p.post && p.user && Array.isArray(p.post.comments)
          ),
        ].sort(
          (a, b) =>
            new Date(b.post.createdAt).getTime() -
            new Date(a.post.createdAt).getTime()
        ),
      }));
    } catch (error) {
      console.error("FETCH RANDOM POSTS ERROR:", error.response?.data, error);
      toast.error(
        error.response?.data?.message || "Failed to fetch random posts"
      );
    } finally {
      set({ isFetching: false });
    }
  },

  fetchUsers: async (token) => {
    if (!token) {
      console.warn("fetchUsers: No token provided");
      return;
    }
    try {
      const { data } = await axios.get(`${API_BASE_URL}/social/users`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      set({ users: data.users || [] });
    } catch (error) {
      console.error("FETCH USERS ERROR:", error.response?.data, error);
      toast.error(error.response?.data?.message || "Failed to fetch users");
    }
  },

  createPost: async (token) => {
    const { postContent } = get();
    if (!postContent) {
      toast.error("Post content is required");
      return;
    }
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/social/create-post`,
        { content: postContent },
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      toast.success("Post created");
      set({ postContent: "" });
      await get().fetchTimeline(token);
    } catch (error) {
      console.error("CREATE POST ERROR:", error.response?.data, error);
      toast.error(error.response?.data?.message || "Failed to create post");
    }
  },

  followUser: async (userId, token) => {
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/social/follow/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      toast.success(data.message);
      await get().fetchUsers(token);
    } catch (error) {
      console.error("FOLLOW USER ERROR:", error.response?.data, error);
      toast.error(error.response?.data?.message || "Failed to follow user");
    }
  },

  unfollowUser: async (userId, token) => {
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/social/unfollow/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      toast.success(data.message);
      await get().fetchUsers(token);
    } catch (error) {
      console.error("UNFOLLOW USER ERROR:", error.response?.data, error);
      toast.error(error.response?.data?.message || "Failed to unfollow user");
    }
  },

  likePost: async (postId, token) => {
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/social/like-post/${postId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      toast.success(data.message);
      await get().fetchTimeline(token);
    } catch (error) {
      console.error("LIKE POST ERROR:", error.response?.data, error);
      toast.error(error.response?.data?.message || "Failed to like post");
    }
  },

  unlikePost: async (postId, token) => {
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/social/unlike-post/${postId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      toast.success(data.message);
      await get().fetchTimeline(token);
    } catch (error) {
      console.error("UNLIKE POST ERROR:", error.response?.data, error);
      toast.error(error.response?.data?.message || "Failed to unlike post");
    }
  },

  commentPost: async (postId, token) => {
    const { commentContent } = get();
    if (!commentContent[postId]) {
      toast.error("Comment content is required");
      return;
    }
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/social/comment-post/${postId}`,
        { content: commentContent[postId] },
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      toast.success("Comment added");
      set((state) => ({
        commentContent: { ...state.commentContent, [postId]: "" },
        mixedPosts: state.mixedPosts.map((p) =>
          p.post._id === postId ? { ...p, post: data.post } : p
        ),
      }));
    } catch (error) {
      console.error("COMMENT POST ERROR:", error.response?.data, error);
      toast.error(error.response?.data?.message || "Failed to add comment");
    }
  },

  likeComment: async (postId, commentId, token) => {
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/social/like-comment/${postId}/${commentId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      toast.success("Comment liked");
      set((state) => ({
        mixedPosts: state.mixedPosts.map((p) =>
          p.post._id === postId
            ? {
                ...p,
                post: {
                  ...data.post,
                  comments: (data.post.comments || []).map((c) => ({
                    ...c,
                    user: c.user || { username: "unknown", avatar: null },
                    replies: (c.replies || []).map((r) => ({
                      ...r,
                      user: r.user || { username: "unknown", avatar: null },
                      replies: (r.replies || []).map((nr) => ({
                        ...nr,
                        user: nr.user || { username: "unknown", avatar: null },
                      })),
                    })),
                  })),
                },
              }
            : p
        ),
      }));
    } catch (error) {
      console.error("LIKE COMMENT ERROR:", error.response?.data, error);
      toast.error(error.response?.data?.message || "Failed to like comment");
    }
  },

  unlikeComment: async (postId, commentId, token) => {
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/social/unlike-comment/${postId}/${commentId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      toast.success("Comment unliked");
      set((state) => ({
        mixedPosts: state.mixedPosts.map((p) =>
          p.post._id === postId
            ? {
                ...p,
                post: {
                  ...data.post,
                  comments: (data.post.comments || []).map((c) => ({
                    ...c,
                    user: c.user || { username: "unknown", avatar: null },
                    replies: (c.replies || []).map((r) => ({
                      ...r,
                      user: r.user || { username: "unknown", avatar: null },
                      replies: (r.replies || []).map((nr) => ({
                        ...nr,
                        user: nr.user || { username: "unknown", avatar: null },
                      })),
                    })),
                  })),
                },
              }
            : p
        ),
      }));
    } catch (error) {
      console.error("UNLIKE COMMENT ERROR:", error.response?.data, error);
      toast.error(error.response?.data?.message || "Failed to unlike comment");
    }
  },

  replyComment: async (postId, commentId, token) => {
    const { commentContent } = get();
    const replyKey = `reply_${postId}_${commentId}`;
    if (!commentContent[replyKey]) {
      toast.error("Reply content is required");
      return;
    }
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/social/reply-comment/${postId}/${commentId}`,
        { content: commentContent[replyKey] },
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      toast.success("Reply added");
      set((state) => ({
        commentContent: { ...state.commentContent, [replyKey]: "" },
        mixedPosts: state.mixedPosts.map((p) =>
          p.post._id === postId
            ? {
                ...p,
                post: {
                  ...data.post,
                  comments: (data.post.comments || []).map((c) => ({
                    ...c,
                    user: c.user || { username: "unknown", avatar: null },
                    replies: (c.replies || []).map((r) => ({
                      ...r,
                      user: r.user || { username: "unknown", avatar: null },
                      replies: (r.replies || []).map((nr) => ({
                        ...nr,
                        user: nr.user || { username: "unknown", avatar: null },
                      })),
                    })),
                  })),
                },
              }
            : p
        ),
      }));
    } catch (error) {
      console.error("REPLY COMMENT ERROR:", error.response?.data, error);
      toast.error(error.response?.data?.message || "Failed to add reply");
    }
  },

  sendMessage: () => {
    const { recipientId, messageContent, socket } = get();
    if (!recipientId || !messageContent) {
      toast.error("Recipient and message content are required");
      return;
    }
    if (socket && socket.connected) {
      socket.emit("sendMessage", { recipientId, content: messageContent });
      set({ messageContent: "" });
    } else {
      toast.error("Socket not connected");
    }
  },

  fetchMessages: async (recipientId, token) => {
    if (!recipientId) return;
    try {
      const { data } = await axios.get(
        `${API_BASE_URL}/social/messages/${recipientId}`,
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      set({ messages: data.messages || [], recipientId });
    } catch (error) {
      console.error("FETCH MESSAGES ERROR:", error.response?.data, error);
      toast.error(error.response?.data?.message || "Failed to fetch messages");
    }
  },

  setPostContent: (content) => set({ postContent: content }),
  setMessageContent: (content) => set({ messageContent: content }),
  setCommentContent: (key, content) =>
    set((state) => ({
      commentContent: { ...state.commentContent, [key]: content },
    })),
  setRecipientId: (id) => set({ recipientId: id }),
}));

export default useSocialStore;
