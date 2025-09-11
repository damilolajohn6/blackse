"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Typography,
  // Button,
  Container,
  Paper,
  CircularProgress,
  Chip,
  IconButton,
  // Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import { toast } from "react-toastify";
import useInstructorStore from "@/store/instructorStore";
import Link from "next/link";
import { Edit, Trash2, Clock, Users, Globe, Star, BookOpen, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import DeleteCourseDialog from "../../components/deleteCourseDialog";

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
    getCourseById,
  } = useInstructorStore();
  const [course, setCourse] = useState(null);
  const [loadingCourse, setLoadingCourse] = useState(true);

  const [courseToDelete, setCourseToDelete] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const verifyInstructor = async () => {
      const { success, isInstructor: isAuthInstructor } =
        await checkInstructorAuth();
      if (!success || !isAuthInstructor) {
        router.push("/instructor/auth/login");
      } else {
        fetchCourseDetails();
      }
    };
    verifyInstructor();
  }, [checkInstructorAuth, router]);

  const fetchCourseDetails = async () => {
    setLoadingCourse(true);
    try {
      const result = await getCourseById(id);
      
      if (result.success) {
        setCourse(result.course);
      } else {
        console.error("Course fetch error:", result.message);
        toast.error(result.message || "Failed to load course details");
        
        // If it's a 403 error, redirect to courses list
        if (result.message?.includes("Unauthorized") || result.message?.includes("Not your course")) {
          toast.error("You don't have permission to view this course");
          router.push("/instructor/dashboard/courses");
        }
      }
    } catch (error) {
      console.error("Fetch course error:", error);
      toast.error("Failed to load course details");
    } finally {
      setLoadingCourse(false);
    }
  };

  const handleEditCourse = () => {
    router.push(`/instructor/dashboard/courses/edit/${id}`);
  };

  const handleDeleteCourse = async () => {
    try {
      const result = await deleteCourse(id);
      if (result.success) {
        toast.success("Course deleted successfully");
        router.push("/instructor/dashboard/courses");
      } else {
        toast.error(result.message || "Failed to delete course");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the course");
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const openDeleteDialog = () => {
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Published":
        return "success"
      case "PendingReview":
        return "warning"
      default:
        return "secondary"
    }
  }

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`
  }

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

  // console.log('course', course)

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
    // <Container maxWidth="lg" sx={{ py: 4 }}>
    //   <Paper sx={{ p: { xs: 2, md: 4 }, boxShadow: 3 }}>
    //     <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
    //       <Typography variant="h4" sx={{ fontWeight: "bold" }}>
    //         {course.title}
    //       </Typography>
    //       <Box>
    //         <Tooltip title="Edit Course">
    //           <IconButton onClick={handleEditCourse} color="secondary">
    //             <Edit />
    //           </IconButton>
    //         </Tooltip>
    //         <Tooltip title="Delete Course">
    //           <IconButton onClick={openDeleteDialog} color="error">
    //             <Delete />
    //           </IconButton>
    //         </Tooltip>
    //       </Box>
    //     </Box>
    //     <Box sx={{ mb: 3 }}>
    //       <img
    //         src={course.thumbnail?.url || "/default-course.jpg"}
    //         alt={course.title}
    //         style={{
    //           width: "100%",
    //           maxHeight: "400px",
    //           objectFit: "cover",
    //           borderRadius: "8px",
    //         }}
    //       />
    //     </Box>
    //     <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
    //       <Typography variant="h5" color="primary">
    //         {course.isFree ? "Free" : `$${course.price}`}
    //       </Typography>
    //       <Chip
    //         label={course.status}
    //         color={
    //           course.status === "Published"
    //             ? "success"
    //             : course.status === "PendingReview"
    //             ? "warning"
    //             : "default"
    //         }
    //         size="small"
    //       />
    //     </Box>
    //     <Typography variant="body1" paragraph sx={{ lineHeight: 1.7 }}>
    //       {course.description}
    //     </Typography>
    //     <Typography variant="h6" sx={{ mt: 2 }}>
    //       Instructor: {course.instructor?.fullname?.firstName}{" "}
    //       {course.instructor?.fullname?.lastName}
    //     </Typography>
    //     <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
    //       Level: {course.level} • Language: {course.language} • Total Duration:{" "}
    //       {course.totalDuration || "N/A"} hours
    //     </Typography>
    //     <Typography variant="h6" sx={{ mt: 3 }}>
    //       Learning Objectives:
    //     </Typography>
    //     <ul style={{ paddingLeft: "20px" }}>
    //       {course.learningObjectives?.map((objective, index) => (
    //         <li key={index}>
    //           <Typography variant="body2">{objective}</Typography>
    //         </li>
    //       ))}
    //     </ul>
    //     <Typography variant="h6" sx={{ mt: 2 }}>
    //       Categories:
    //     </Typography>
    //     <Typography variant="body2" sx={{ mb: 2 }}>
    //       {course.categories?.join(", ")}
    //     </Typography>
    //     <Typography variant="h6" sx={{ mt: 2 }}>
    //       Course Content:
    //     </Typography>
    //     {course.content?.map((section, index) => (
    //       <Box key={index} sx={{ mt: 1, pl: 2 }}>
    //         <Typography variant="subtitle1" sx={{ fontWeight: "medium" }}>
    //           Section {index + 1}: {section.sectionTitle}
    //         </Typography>
    //         <ul style={{ paddingLeft: "20px" }}>
    //           {section.lectures?.map((lecture, lectureIndex) => (
    //             <li key={lectureIndex}>
    //               <Typography variant="body2">
    //                 {lecture.title} ({lecture.duration || "N/A"} min)
    //               </Typography>
    //             </li>
    //           ))}
    //         </ul>
    //       </Box>
    //     ))}
    //     <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
    //       <Button
    //         variant="contained"
    //         color="primary"
    //         onClick={() => router.push("/instructor/dashboard/courses")}
    //       >
    //         Back to Courses
    //       </Button>
    //     </Box>
    //   </Paper>

    //   {/* Delete Confirmation Dialog */}
    //   <Dialog
    //     open={deleteDialogOpen}
    //     onClose={closeDeleteDialog}
    //     aria-labelledby="delete-dialog-title"
    //   >
    //     <DialogTitle id="delete-dialog-title">Delete Course</DialogTitle>
    //     <DialogContent>
    //       <DialogContentText>
    //         Are you sure you want to delete the course "{course.title}"? This action cannot be undone.
    //       </DialogContentText>
    //     </DialogContent>
    //     <DialogActions>
    //       <Button onClick={closeDeleteDialog} color="primary">
    //         Cancel
    //       </Button>
    //       <Button onClick={handleDeleteCourse} color="error" autoFocus>
    //         Delete
    //       </Button>
    //     </DialogActions>
    //   </Dialog>
    // </Container>
    <section>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="relative h-96 bg-gradient-hero overflow-hidden">
          <img
            src={course.thumbnail?.url || "/default-course.jpg"}
            alt={course.title}
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="relative container mx-auto px-4 h-full flex items-end pb-8">
            <div className="text-white max-w-3xl">
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  {course.categories?.[0]}
                </Badge>
                <Badge
                  variant={getStatusColor(course.status)}
                  className="bg-white/20 text-white border-white/30"
                >
                  {course.status}
                </Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{course.title}</h1>
              <div className="flex items-center gap-6 text-white/90">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{course.rating}</span>
                  <span>({course.totalStudents} students)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>{course.totalDuration} hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  <span>{course.language}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Course Info Card */}
              <Card className="shadow-soft bg-gradient-card">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={course.instructor?.avatar} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(
                          course.instructor?.fullname?.firstName,
                          course.instructor?.fullname?.lastName
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm text-muted-foreground">Instructor</p>
                      <p className="font-semibold">
                        {course.instructor?.fullname?.firstName}{" "}
                        {course.instructor?.fullname?.lastName}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="icon" variant="outline" onClick={handleEditCourse}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Edit Course</TooltipContent>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="icon" variant="destructive" onClick={openDeleteDialog}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete Course</TooltipContent>
                      </Tooltip>
                    </Tooltip>
                    <AlertDialog open={isDeleteDialogOpen} onOpenChange={closeDeleteDialog}>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Course</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{course.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteCourse}
                            className="bg-destructive text-white hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{course.description}</p>
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                    <Badge variant="outline">{course.level}</Badge>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{course.totalStudents} students</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* Learning Objectives */}
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    What you'll learn
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {course.learningObjectives?.map((objective, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="h-2 w-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <span className="text-muted-foreground">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              {/* Course Content */}
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="h-5 w-5 text-primary" />
                    Course Content
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {course.content?.map((section, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-3">
                        Section {index + 1}: {section.sectionTitle}
                      </h4>
                      <div className="space-y-2">
                        {section.lectures?.map((lecture, lectureIndex) => (
                          <div
                            key={lectureIndex}
                            className="flex items-center justify-between py-2 px-3 rounded bg-muted/50"
                          >
                            <span className="text-sm">{lecture.title}</span>
                            <span className="text-xs text-muted-foreground">
                              {lecture.duration} min
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Price Card */}
              <Card className="shadow-elegant border-primary/20">
                <CardContent className="p-6 text-center">
                  <div className="mb-4">
                    {course.isFree ? (
                      <span className="text-3xl font-bold text-success">Free</span>
                    ) : (
                      <span className="text-3xl font-bold text-primary">${course.price}</span>
                    )}
                  </div>
                  <Button variant="premium" size="lg" className="w-full mb-4">
                    Enroll Now
                  </Button>
                  <Button variant="outline" size="lg" className="w-full">
                    Preview Course
                  </Button>
                </CardContent>
              </Card>
              {/* Course Info */}
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="text-lg">Course Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">{course.totalDuration} hours</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Level</span>
                    <span className="font-medium">{course.level}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Language</span>
                    <span className="font-medium">{course.language}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Students</span>
                    <span className="font-medium">{course.totalStudents}</span>
                  </div>
                </CardContent>
              </Card>
              {/* Categories */}
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="text-lg">Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {course.categories?.map((category, index) => (
                      <Badge key={index} variant="secondary">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="mt-8 flex gap-4">
            <Link href="/instructor/dashboard/courses">
              <Button variant="outline" onClick={() => window.history.back()}>
                Back to Courses
              </Button>
            </Link>
          </div>
        </div>
      </div>
      {/* 
      <DeleteCourseDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteCourse}
        course={courseToDelete}
        isDeleting={isDeleting}
      /> */}
    </section>
  );
};

export default CourseDetails;