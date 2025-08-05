"use client";
import { useEffect } from "react";
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
  Reply,
} from "@mui/icons-material";
import { toast } from "react-toastify";

const SocialDashboard = () => {
  const { user, token } = useAuthStore();
  const {
    mixedPosts,
    users,
    messages,
    recipientId,
    postContent,
    messageContent,
    commentContent,
    isFetching,
    fetchTimeline,
    fetchRandomPosts,
    fetchUsers,
    createPost,
    followUser,
    unfollowUser,
    likePost,
    unlikePost,
    commentPost,
    likeComment,
    unlikeComment,
    replyComment,
    sendMessage,
    fetchMessages,
    setPostContent,
    setMessageContent,
    setCommentContent,
    setRecipientId,
    initializeSocket,
  } = useSocialStore();

  useEffect(() => {
    if (token && user) {
      console.log("Initializing socket and fetching data for user:", user._id);
      const cleanup = initializeSocket(token, user);
      fetchTimeline(token);
      fetchRandomPosts(token);
      fetchUsers(token);
      return cleanup;
    } else {
      console.warn("Skipping socket init: Missing token or user");
    }
  }, [
    token,
    user,
    fetchTimeline,
    fetchRandomPosts,
    fetchUsers,
    initializeSocket,
  ]);

  const refreshFeed = () => {
    fetchTimeline(token);
    fetchRandomPosts(token);
  };

  const renderComments = (comments, postId, depth = 0) => {
    if (depth > 2) return null;
    if (!Array.isArray(comments)) {
      console.warn("renderComments: Comments is not an array", {
        comments,
        postId,
      });
      return null;
    }
    return comments.map((comment, index) => {
      console.debug("Rendering comment:", {
        commentId: comment._id,
        user: comment.user,
      });
      return (
        <Box key={comment._id || `comment-${index}`} sx={{ ml: depth * 2 }}>
          <ListItem key={comment._id || `comment-item-${index}`}>
            <ListItemAvatar>
              <Avatar src={comment.user?.avatar?.url || ""} />
            </ListItemAvatar>
            <ListItemText
              primary={
                <Link href={`/user/${comment.user?._id || "#"}`}>
                  {comment.user?.username || "unknown"}
                </Link>
              }
              secondary={comment.content || ""}
            />
            <Box display="flex" alignItems="center">
              <IconButton
                onClick={() => {
                  if (!comment._id) {
                    toast.error("Invalid comment ID");
                    return;
                  }
                  comment.likes.includes(user._id)
                    ? unlikeComment(postId, comment._id, token)
                    : likeComment(postId, comment._id, token);
                }}
              >
                {comment.likes.includes(user._id) ? (
                  <Favorite color="error" fontSize="small" />
                ) : (
                  <FavoriteBorder fontSize="small" />
                )}
              </IconButton>
              <Typography variant="caption">
                {comment.likes.length || 0}
              </Typography>
              <IconButton>
                <Reply fontSize="small" />
              </IconButton>
            </Box>
          </ListItem>
          <Box pl={4} pr={4} pb={1}>
            <TextField
              label="Reply"
              value={commentContent[`reply_${postId}_${comment._id}`] || ""}
              onChange={(e) =>
                setCommentContent(
                  `reply_${postId}_${comment._id}`,
                  e.target.value
                )
              }
              fullWidth
              size="small"
              inputProps={{ maxLength: 280 }}
            />
            <Button
              variant="outlined"
              size="small"
              startIcon={<Reply />}
              onClick={() => {
                if (!comment._id) {
                  toast.error("Invalid comment ID");
                  return;
                }
                replyComment(postId, comment._id, token);
              }}
              sx={{ mt: 1 }}
            >
              Reply
            </Button>
          </Box>
          {comment.replies?.length > 0 && (
            <Box pl={2}>
              {renderComments(comment.replies, postId, depth + 1)}
            </Box>
          )}
        </Box>
      );
    });
  };

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
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6">Feed</Typography>
          <Button
            variant="outlined"
            color="primary"
            onClick={refreshFeed}
            disabled={isFetching}
          >
            {isFetching ? "Loading..." : "Refresh Feed"}
          </Button>
        </Box>
        {isFetching ? (
          <Typography>Loading...</Typography>
        ) : mixedPosts.length > 0 ? (
          <List>
            {mixedPosts.map(({ user: postUser, post }, index) => (
              <Box key={post._id}>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar src={postUser.avatar?.url} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Link href={`/user/${postUser._id}`}>
                        {postUser.username || "unknown"}
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
                    <List dense>{renderComments(post.comments, post._id)}</List>
                  )}
                </Box>
                {index < mixedPosts.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        ) : (
          <Typography>
            No posts available. Click "Refresh Feed" to load some.
          </Typography>
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
                primary={
                  <Link href={`/user/${u._id}`}>{u.username || "unknown"}</Link>
                }
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
            Messages with{" "}
            {users.find((u) => u._id === recipientId)?.username || "unknown"}
          </Typography>
          <List>
            {messages.map((msg, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={`${
                    msg.senderId._id === user._id
                      ? "You"
                      : msg.senderId.username || "unknown"
                  }`}
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
