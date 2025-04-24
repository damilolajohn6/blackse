"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";
import useSocialStore from "@/store/socialStore";
import {
  Box,
  Button,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Paper,
  Divider,
  IconButton,
  Link,
} from "@mui/material";
import {
  PersonAdd,
  PersonRemove,
  Send,
  Favorite,
  FavoriteBorder,
  Comment,
} from "@mui/icons-material";
import { format } from "date-fns";

const SocialDashboard = () => {
  const { user, token, isAuthenticated, isLoading } = useAuthStore();
  const {
    posts,
    users,
    messages,
    recipientId,
    postContent,
    messageContent,
    commentContent,
    isFetching,
    fetchTimeline,
    fetchUsers,
    createPost,
    followUser,
    unfollowUser,
    likePost,
    unlikePost,
    commentPost,
    sendMessage,
    fetchMessages,
    setPostContent,
    setMessageContent,
    setCommentContent,
    setRecipientId,
    initializeSocket,
  } = useSocialStore();
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    console.log("Auth state:", { isLoading, isAuthenticated, user, token });
    if (!isLoading) {
      setAuthChecked(true);
      if (!isAuthenticated) {
        console.warn("Redirecting to login: User not authenticated");
        router.push("/login");
      }
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (token && user && isAuthenticated) {
      console.log("Initializing socket and fetching data for user:", user._id);
      const cleanup = initializeSocket(token, user);
      fetchTimeline(token);
      fetchUsers(token);
      return cleanup;
    } else {
      console.warn("Skipping socket init: Missing token or user");
    }
  }, [
    token,
    user,
    isAuthenticated,
    fetchTimeline,
    fetchUsers,
    initializeSocket,
  ]);

  if (isLoading || !authChecked) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!user || !isAuthenticated) {
    return null;
  }

  return (
    <Box className="w-full p-6 md:p-8">
      <Typography variant="h4" className="font-semibold mb-6">
        Social Dashboard
      </Typography>
      <Paper className="p-4 mb-6">
        <TextField
          label="What's on your mind?"
          multiline
          rows={3}
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          fullWidth
          inputProps={{ maxLength: 280 }}
          className="mb-4"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={() => createPost(token)}
          disabled={postContent.length === 0}
        >
          Post
        </Button>
      </Paper>
      <Paper className="p-4 mb-6">
        <Typography variant="h6" className="mb-4">
          Timeline
        </Typography>
        {isFetching ? (
          <Typography>Loading...</Typography>
        ) : posts.length > 0 ? (
          <List>
            {posts.map(({ user: postUser, post }, index) => (
              <Box key={post._id}>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar src={postUser.avatar?.url} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Link href={`/user/${postUser._id}`}>
                        {postUser.name} -{" "}
                        {format(new Date(post.createdAt), "yyyy-MM-dd HH:mm")}
                      </Link>
                    }
                    secondary={post.content}
                  />
                  <Box>
                    <IconButton
                      onClick={() =>
                        post.likes.includes(user._id)
                          ? unlikePost(post._id, token)
                          : likePost(post._id, token)
                      }
                    >
                      {post.likes.includes(user._id) ? (
                        <Favorite color="error" />
                      ) : (
                        <FavoriteBorder />
                      )}
                    </IconButton>
                    <Typography variant="caption">
                      {post.likes.length} likes
                    </Typography>
                  </Box>
                </ListItem>
                <Box pl={4} pr={4} pb={2}>
                  <TextField
                    label="Add a comment"
                    value={commentContent[post._id] || ""}
                    onChange={(e) =>
                      setCommentContent(post._id, e.target.value)
                    }
                    fullWidth
                    size="small"
                    inputProps={{ maxLength: 280 }}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Comment />}
                    onClick={() => commentPost(post._id, token)}
                    sx={{ mt: 1 }}
                  >
                    Comment
                  </Button>
                  {post.comments.length > 0 && (
                    <List dense>
                      {post.comments.map((comment, i) => (
                        <ListItem key={i}>
                          <ListItemText
                            primary={`${comment.user.name} - ${format(
                              new Date(comment.createdAt),
                              "yyyy-MM-dd HH:mm"
                            )}`}
                            secondary={comment.content}
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
                {index < posts.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        ) : (
          <Typography>No posts found</Typography>
        )}
      </Paper>
      <Paper className="p-4 mb-6">
        <Typography variant="h6" className="mb-4">
          Users
        </Typography>
        <List>
          {users.map((u) => (
            <ListItem key={u._id}>
              <ListItemAvatar>
                <Avatar src={u.avatar?.url} />
              </ListItemAvatar>
              <ListItemText
                primary={<Link href={`/user/${u._id}`}>{u.name}</Link>}
                secondary={u.email}
              />
              <IconButton
                onClick={() =>
                  u.followedByMe
                    ? unfollowUser(u._id, token)
                    : followUser(u._id, token)
                }
              >
                {u.followedByMe ? <PersonRemove /> : <PersonAdd />}
              </IconButton>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  setRecipientId(u._id);
                  fetchMessages(u._id, token);
                }}
              >
                Message
              </Button>
            </ListItem>
          ))}
        </List>
      </Paper>
      {recipientId && (
        <Paper className="p-4">
          <Typography variant="h6" className="mb-4">
            Messages with {users.find((u) => u._id === recipientId)?.name}
          </Typography>
          <List>
            {messages.map((msg, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={`${
                    msg.senderId._id === user._id ? "You" : msg.senderId.name
                  } - ${format(new Date(msg.createdAt), "yyyy-MM-dd HH:mm")}`}
                  secondary={msg.content}
                />
              </ListItem>
            ))}
          </List>
          <TextField
            label="Type a message"
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            fullWidth
            className="mb-4"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={sendMessage}
            startIcon={<Send />}
            disabled={!messageContent}
          >
            Send
          </Button>
        </Paper>
      )}
    </Box>
  );
};

export default SocialDashboard;
