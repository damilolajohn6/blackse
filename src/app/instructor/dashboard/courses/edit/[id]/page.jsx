"use client";
import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Box, Typography, CircularProgress } from "@mui/material";
import useInstructorStore from "@/store/instructorStore";
import CourseCreationWizard from "@/components/Instructor/CourseCreationWizard";

const EditCoursePage = () => {
  const router = useRouter();
  const { id } = useParams();
  const { instructor, isInstructor, isLoading, checkInstructorAuth } = useInstructorStore();

  useEffect(() => {
    const verifyInstructor = async () => {
      const { success, isInstructor: isAuthInstructor } =
        await checkInstructorAuth();
      if (!success || !isAuthInstructor) {
        router.push("/instructor/auth/login");
      }
    };
    verifyInstructor();
  }, [checkInstructorAuth, router]);

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
        <CircularProgress />
      </Box>
    );
  }

  if (!instructor || !isInstructor) {
    return null;
  }

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <CourseCreationWizard courseId={id} />
    </Box>
  );
};

export default EditCoursePage;
