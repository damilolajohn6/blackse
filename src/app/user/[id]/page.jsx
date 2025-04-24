"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import useAuthStore from "@/store/authStore";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Box,
  Typography,
  Avatar,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Paper,
  Divider,
  IconButton,
  TextField,
} from "@mui/material";
import { Favorite, FavoriteBorder, Comment } from "@mui/icons-material";
import { format } from "date-fns";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_SERVER || "http://localhost:8000/api/v2";

const UserProfile = () => {
  const { user, token, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();
  const { id } = router.query;
  const [profile, setProfile] = useState(null);
  const [commentContent, setCommentContent] = useState({});
  const [isFetching, setIsFetching] = useState(false);

  const fetchProfile = async () => {
    if (!id) return;
    setIsFetching(true);
    try {
      const { data } = await axios.get(`${API_BASE_URL}/social/profile/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setProfile(data.user);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch profile");
    } finally {
      setIsFetching(false);
    }
  };

  const handleFollow = async () => {
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/social/follow/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      toast.success(data.message);
      fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to follow user");
    }
  };

  const handleUnfollow = async () => {
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/social/unfollow/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      toast.success(data.message);
      fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to unfollow user");
    }
  };

  const handleLike = async (postId) => {
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/social/like-post/${id}/${postId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      toast.success(data.message);
      fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to like post");
    }
  };

  const handleUnlike = async (postId) => {
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/social/unlike-post/${id}/${postId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      toast.success(data.message);
      fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to unlike post");
    }
  };

  const handleComment = async (postId) => {
    if (!commentContent[postId]) {
      toast.error("Comment content is required");
      return;
    }
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/social/comment-post/${id}/${postId}`,
        { content: commentContent[postId] },
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      toast.success("Comment added");
      setCommentContent({ ...commentContent, [postId]: "" });
      fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add comment");
    }
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error("Please log in to view profiles");
      router.push("/login");
    } else {
      fetchProfile();
    }
  }, [id, isAuthenticated, isLoading, router, token]);

  if (isLoading || isFetching) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!profile) {
    return <div className="text-center py-12">Profile not found</div>;
  }

  const isFollowing = profile.followers.some(
    (f) => f.user._id.toString() === user?._id
  );

  return (
    <Box className="w-full p-6 md:p-8">
      <Typography variant="h4" className="font-semibold mb-6">
        {profile.name}'s Profile
      </Typography>
      <Paper className="p-4 mb-6">
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar src={profile.avatar?.url} sx={{ width: 80, height: 80 }} />
          <Box ml={2}>
            <Typography variant="h6">{profile.name}</Typography>
            <Typography variant="body2">{profile.email}</Typography>
            <Typography variant="body2">
              Followers: {profile.followers.length} | Following:{" "}
              {profile.following.length}
            </Typography>
          </Box>
        </Box>
        {user?._id !== id && (
          <Button
            variant="contained"
            color={isFollowing ? "secondary" : "primary"}
            onClick={isFollowing ? handleUnfollow : handleFollow}
          >
            {isFollowing ? "Unfollow" : "Follow"}
          </Button>
        )}
      </Paper>
      <Paper className="p-4 mb-6">
        <Typography variant="h6" mb={2}>
          Posts
        </Typography>
        {profile.posts.length > 0 ? (
          <List>
            {profile.posts.map((post, index) => (
              <Box key={post._id}>
                <ListItem>
                  <ListItemText
                    primary={`${profile.name} - ${format(
                      new Date(post.createdAt),
                      "yyyy-MM-dd HH:mm"
                    )}`}
                    secondary={post.content}
                  />
                  <Box>
                    <IconButton
                      onClick={() =>
                        post.likes.includes(user?._id)
                          ? handleUnlike(post._id)
                          : handleLike(post._id)
                      }
                    >
                      {post.likes.includes(user?._id) ? (
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
                      setCommentContent({
                        ...commentContent,
                        [post._id]: e.target.value,
                      })
                    }
                    fullWidth
                    size="small"
                    inputProps={{ maxLength: 280 }}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Comment />}
                    onClick={() => handleComment(post._id)}
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
                {index < profile.posts.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        ) : (
          <Typography>No posts yet</Typography>
        )}
      </Paper>
      <Paper className="p-4">
        <Typography variant="h6" mb={2}>
          Followers
        </Typography>
        <List>
          {profile.followers.length > 0 ? (
            profile.followers.map((f) => (
              <ListItem key={f.user._id}>
                <ListItemAvatar>
                  <Avatar src={f.user.avatar?.url} />
                </ListItemAvatar>
                <ListItemText primary={f.user.name} />
              </ListItem>
            ))
          ) : (
            <Typography>No followers</Typography>
          )}
        </List>
        <Typography variant="h6" mt={2} mb={2}>
          Following
        </Typography>
        <List>
          {profile.following.length > 0 ? (
            profile.following.map((f) => (
              <ListItem key={f.user._id}>
                <ListItemAvatar>
                  <Avatar src={f.user.avatar?.url} />
                </ListItemAvatar>
                <ListItemText primary={f.user.name} />
              </ListItem>
            ))
          ) : (
            <Typography>Not following anyone</Typography>
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default UserProfile;
