"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { toast } from "react-toastify";
import useInstructorStore from "@/store/instructorStore";

const CourseDetails = () => {
  const router = useRouter();
  const { id } = useParams(); // Get dynamic course ID from URL
  const {
    instructor,
    isInstructor,
    isLoading,
    checkInstructorAuth,
    deleteCourse,
    fetchCourses,
  } = useInstructorStore();
  const [course, setCourse] = useState(null);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const verifyInstructor = async () => {
      const { success, isInstructor: isAuthInstructor } =
        await checkInstructorAuth();
      if (!success || !isAuthInstructor) {
        router.push("/instructor/login");
      } else {
        fetchCourseDetails();
      }
    };
    verifyInstructor();
  }, [checkInstructorAuth, router]);

  const fetchCourseDetails = async () => {
    setLoadingCourse(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER || "http://localhost:8000/api/v2"}/course/get-course/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("instructor_token")}`,
          },
          credentials: "include",
        }
      );
      const data = await response.json();
      if (data.success) {
        setCourse(data.course);
      } else {
        toast.error(data.message || "Failed to load course details");
      }
    } catch (error) {
      console.error("Fetch course error:", error);
      toast.error("Failed to load course details");
    } finally {
      setLoadingCourse(false);
    }
  };

  const handleEditCourse = () => {
    router.push(`/instructor/courses/edit/${id}`);
  };

  const handleDeleteCourse = async () => {
    try {
      const result = await deleteCourse(id);
      if (result.success) {
        toast.success("Course deleted successfully");
        router.push("/instructor/courses");
      } else {
        toast.error(result.message || "Failed to delete course");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the course");
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const openDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  if (isLoading || loadingCourse) {
    return (
      <Box
        sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!instructor || !isInstructor) {
    return null; // Redirect handled by useEffect
  }

  if (!course) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h6" align="center">
          Course not found
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 4 }, boxShadow: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            {course.title}
          </Typography>
          <Box>
            <Tooltip title="Edit Course">
              <IconButton onClick={handleEditCourse} color="secondary">
                <Edit />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Course">
              <IconButton onClick={openDeleteDialog} color="error">
                <Delete />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Box sx={{ mb: 3 }}>
          <img
            src={course.thumbnail?.url || "/default-course.jpg"}
            alt={course.title}
            style={{
              width: "100%",
              maxHeight: "400px",
              objectFit: "cover",
              borderRadius: "8px",
            }}
          />
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Typography variant="h5" color="primary">
            {course.isFree ? "Free" : `$${course.price}`}
          </Typography>
          <Chip
            label={course.status}
            color={
              course.status === "Published"
                ? "success"
                : course.status === "PendingReview"
                ? "warning"
                : "default"
            }
            size="small"
          />
        </Box>
        <Typography variant="body1" paragraph sx={{ lineHeight: 1.7 }}>
          {course.description}
        </Typography>
        <Typography variant="h6" sx={{ mt: 2 }}>
          Instructor: {course.instructor?.fullname?.firstName}{" "}
          {course.instructor?.fullname?.lastName}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Level: {course.level} • Language: {course.language} • Total Duration:{" "}
          {course.totalDuration || "N/A"} hours
        </Typography>
        <Typography variant="h6" sx={{ mt: 3 }}>
          Learning Objectives:
        </Typography>
        <ul style={{ paddingLeft: "20px" }}>
          {course.learningObjectives?.map((objective, index) => (
            <li key={index}>
              <Typography variant="body2">{objective}</Typography>
            </li>
          ))}
        </ul>
        <Typography variant="h6" sx={{ mt: 2 }}>
          Categories:
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {course.categories?.join(", ")}
        </Typography>
        <Typography variant="h6" sx={{ mt: 2 }}>
          Course Content:
        </Typography>
        {course.content?.map((section, index) => (
          <Box key={index} sx={{ mt: 1, pl: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "medium" }}>
              Section {index + 1}: {section.sectionTitle}
            </Typography>
            <ul style={{ paddingLeft: "20px" }}>
              {section.lectures?.map((lecture, lectureIndex) => (
                <li key={lectureIndex}>
                  <Typography variant="body2">
                    {lecture.title} ({lecture.duration || "N/A"} min)
                  </Typography>
                </li>
              ))}
            </ul>
          </Box>
        ))}
        <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => router.push("/instructor/courses")}
          >
            Back to Courses
          </Button>
        </Box>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">Delete Course</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the course "{course.title}"? This action cannot be undone.
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
    </Container>
  );
};

export default CourseDetails;