"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  CircularProgress,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip,
  Chip,
  Pagination,
} from "@mui/material";
import { Visibility, Edit, Delete } from "@mui/icons-material";
import { toast } from "react-toastify";
import useInstructorStore from "@/store/instructorStore";

const CoursesPage = () => {
  const router = useRouter();
  const {
    instructor,
    isInstructor,
    isLoading,
    courses,
    totalCourses,
    checkInstructorAuth,
    fetchCourses,
    deleteCourse,
  } = useInstructorStore();
  const [page, setPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const limit = 6;

  useEffect(() => {
    const verifyInstructor = async () => {
      const { success, isInstructor: isAuthInstructor } =
        await checkInstructorAuth();
      if (!success || !isAuthInstructor) {
        router.push("/instructor/login");
      } else {
        fetchCourses({ page, limit });
      }
    };
    verifyInstructor();
  }, [checkInstructorAuth, fetchCourses, router, page]);

  const handlePageChange = (event, value) => {
    setPage(value);
    fetchCourses({ page: value, limit });
  };

  const handleViewCourse = (courseId) => {
    router.push(`/instructor/courses/${courseId}`);
  };

  const handleEditCourse = (courseId) => {
    router.push(`/instructor/courses/edit/${courseId}`);
  };

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;

    try {
      const result = await deleteCourse(courseToDelete._id);
      if (result.success) {
        toast.success("Course deleted successfully");
        fetchCourses({ page, limit });
      } else {
        toast.error(result.message || "Failed to delete course");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the course");
    } finally {
      setDeleteDialogOpen(false);
      setCourseToDelete(null);
    }
  };

  const openDeleteDialog = (course) => {
    setCourseToDelete(course);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setCourseToDelete(null);
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!instructor || !isInstructor) return null;

  return (
    <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh", p: { xs: 2, md: 4 } }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: "bold",
          mb: { xs: 3, md: 4 },
          fontSize: { xs: "1.5rem", md: "2rem" },
        }}
      >
        My Courses
      </Typography>

      {courses.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            No courses found. Create your first course!
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => router.push("/instructor/courses/create")}
          >
            Create New Course
          </Button>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {courses.map((course) => (
              <Grid item xs={12} sm={6} md={4} key={course._id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: 3,
                    transition: "transform 0.2s",
                    "&:hover": { transform: "scale(1.02)" },
                  }}
                >
                  <CardMedia
                    component="img"
                    height="180"
                    image={course.thumbnail?.url || "/default-course.jpg"}
                    alt={course.title}
                    sx={{ objectFit: "cover" }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="h6"
                      component="div"
                      noWrap
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      {typeof course.title === "string"
                        ? course.title
                        : "Untitled"}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 1,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {typeof course.description === "string"
                        ? course.description
                        : "No description provided."}
                    </Typography>

                    <Box sx={{ mb: 1 }}>
                      <Chip
                        label={course?.status || "Unknown"}
                        color={
                          course?.status === "Published"
                            ? "success"
                            : course?.status === "PendingReview"
                            ? "warning"
                            : "default"
                        }
                        size="small"
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary">
                      Price:{" "}
                      {course?.isFree
                        ? "Free"
                        : typeof course?.price === "number"
                        ? `$${course.price}`
                        : "N/A"}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      Category:{" "}
                      {Array.isArray(course?.categories)
                        ? course.categories.join(", ")
                        : "Uncategorized"}
                    </Typography>
                  </CardContent>

                  <CardActions
                    sx={{
                      justifyContent: "space-between",
                      px: 2,
                      pb: 2,
                    }}
                  >
                    <Box>
                      <Tooltip title="View Course">
                        <IconButton
                          onClick={() => handleViewCourse(course._id)}
                          color="primary"
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Course">
                        <IconButton
                          onClick={() => handleEditCourse(course._id)}
                          color="secondary"
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Course">
                        <IconButton
                          onClick={() => openDeleteDialog(course)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <Pagination
              count={Math.ceil(totalCourses / limit)}
              page={page}
              onChange={handlePageChange}
              color="primary"
              size="medium"
              siblingCount={1}
              boundaryCount={1}
            />
          </Box>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">Delete Course</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the course "{courseToDelete?.title}
            "? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteCourse} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CoursesPage;
