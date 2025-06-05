"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Box, CircularProgress } from "@mui/material";
import useInstructorStore from "@/store/instructorStore";
import CourseCreationWizard from "@/components/Instructor/CourseCreationWizard";

const CreateCoursePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const { instructor, isInstructor, isLoading, checkInstructorAuth } = useInstructorStore();

  useEffect(() => {
    const verifyInstructor = async () => {
      const { success, isInstructor: isAuthInstructor } =
        await checkInstructorAuth();
      if (!success || !isAuthInstructor) {
        router.push("/instructor/login");
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
    <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh" }}>
      <CourseCreationWizard courseId={courseId} />
    </Box>
  );
};

export default CreateCoursePage;
