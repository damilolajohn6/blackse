"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import useAuthStore from "@/store/authStore";
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
  const { user, token, isAuthenticated, isLoading, fetchProfile } =
    useAuthStore();
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [profile, setProfile] = useState(null);
  const [commentContent, setCommentContent] = useState({});
  const [isFetching, setIsFetching] = useState(false);

  const loadProfile = async () => {
    if (!id) return;
    setIsFetching(true);
    const { success, profile, message } = await fetchProfile(id);
    if (success) {
      setProfile(profile);
    } else {
      toast.error(message);
    }
    setIsFetching(false);
  };

  const handleFollowToggle = async () => {
    const action = isFollowing() ? "unfollow" : "follow";
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/social/${action}/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      toast.success(data.message);
      loadProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${action} user`);
    }
  };

  const handleLikeToggle = async (postId, liked) => {
    const action = liked ? "unlike-post" : "like-post";
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/social/${action}/${postId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      toast.success(data.message);
      loadProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${action} post`);
    }
  };

  const handleComment = async (postId) => {
    const content = commentContent[postId]?.trim();
    if (!content) return toast.error("Comment content is required");

    try {
      await axios.post(
        `${API_BASE_URL}/social/comment-post/${postId}`,
        { content },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      toast.success("Comment added");
      setCommentContent((prev) => ({ ...prev, [postId]: "" }));
      loadProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add comment");
    }
  };

  const isFollowing = () =>
    profile?.followers?.some((f) => f.follower?._id === user?._id);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error("Please log in to view profiles");
      router.push("/login");
    } else if (id) {
      loadProfile();
    }
  }, [id, isAuthenticated, isLoading, token]);

  if (isLoading || isFetching)
    return <div className="text-center py-12">Loading...</div>;
  if (!profile)
    return <div className="text-center py-12">Profile not found</div>;

  return (
    <Box className="w-full p-6 md:p-8">
      <Typography variant="h4" className="font-semibold mb-6">
        {`${profile.fullname?.firstName || "User"} ${
          profile.fullname?.lastName || ""
        }'s Profile`}
      </Typography>

      {/* Profile Info */}
      <Paper className="p-4 mb-6">
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar
            src={profile.avatar?.url || ""}
            sx={{ width: 80, height: 80 }}
          />
          <Box ml={2}>
            <Typography variant="h6">{`${
              profile.fullname?.firstName || "User"
            } ${profile.fullname?.lastName || ""}`}</Typography>
            <Typography variant="body2">
              {profile.email || "No email"}
            </Typography>
            <Typography variant="body2">
              Followers: {profile.followers?.length || 0} | Following:{" "}
              {profile.following?.length || 0}
            </Typography>
          </Box>
        </Box>
        {user?._id !== id && (
          <Button
            variant="contained"
            color={isFollowing() ? "secondary" : "primary"}
            onClick={handleFollowToggle}
          >
            {isFollowing() ? "Unfollow" : "Follow"}
          </Button>
        )}
      </Paper>

      {/* Posts */}
      <Paper className="p-4 mb-6">
        <Typography variant="h6" mb={2}>
          Posts
        </Typography>
        {profile.posts?.length > 0 ? (
          <List>
            {profile.posts.map((post, index) => {
              const liked = post.likes?.includes(user?._id);
              return (
                <Box key={post._id || `post-${index}`}>
                  <ListItem>
                    <ListItemText
                      primary={`${profile.fullname?.firstName || "User"} ${
                        profile.fullname?.lastName || ""
                      } - ${format(
                        new Date(post.createdAt || Date.now()),
                        "yyyy-MM-dd HH:mm"
                      )}`}
                      secondary={post.content || ""}
                    />
                    <Box>
                      <IconButton
                        onClick={() => handleLikeToggle(post._id, liked)}
                        disabled={!post._id}
                      >
                        {liked ? (
                          <Favorite color="error" />
                        ) : (
                          <FavoriteBorder />
                        )}
                      </IconButton>
                      <Typography variant="caption">
                        {post.likes?.length || 0} likes
                      </Typography>
                    </Box>
                  </ListItem>

                  {/* Comment Field */}
                  <Box pl={4} pr={4} pb={2}>
                    <TextField
                      label="Add a comment"
                      value={commentContent[post._id] || ""}
                      onChange={(e) =>
                        setCommentContent((prev) => ({
                          ...prev,
                          [post._id]: e.target.value,
                        }))
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
                      disabled={!post._id}
                    >
                      Comment
                    </Button>
                    {post.comments?.length > 0 && (
                      <List dense>
                        {post.comments.map((comment, i) => (
                          <ListItem key={comment._id || `comment-${i}`}>
                            <ListItemText
                              primary={`${
                                comment.user?.fullname?.firstName || "Unknown"
                              } ${
                                comment.user?.fullname?.lastName || ""
                              } - ${format(
                                new Date(comment.createdAt || Date.now()),
                                "yyyy-MM-dd HH:mm"
                              )}`}
                              secondary={comment.content || ""}
                            />
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </Box>
                  {index < profile.posts.length - 1 && <Divider />}
                </Box>
              );
            })}
          </List>
        ) : (
          <Typography>No posts yet</Typography>
        )}
      </Paper>

      {/* Followers & Following */}
      <Paper className="p-4">
        <Typography variant="h6" mb={2}>
          Followers
        </Typography>
        <List>
          {profile.followers?.length > 0 ? (
            profile.followers.map((f, i) => (
              <ListItem key={f.follower?._id || `follower-${i}`}>
                <ListItemAvatar>
                  <Avatar src={f.follower?.avatar?.url || ""} />
                </ListItemAvatar>
                <ListItemText
                  primary={`${f.follower?.fullname?.firstName || "Unknown"} ${
                    f.follower?.fullname?.lastName || ""
                  }`}
                />
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
          {profile.following?.length > 0 ? (
            profile.following.map((f, i) => (
              <ListItem key={f.followed?._id || `following-${i}`}>
                <ListItemAvatar>
                  <Avatar src={f.followed?.avatar?.url || ""} />
                </ListItemAvatar>
                <ListItemText
                  primary={`${f.followed?.fullname?.firstName || "Unknown"} ${
                    f.followed?.fullname?.lastName || ""
                  }`}
                />
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
