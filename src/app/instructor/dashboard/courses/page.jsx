"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  CircularProgress,
  Pagination
} from "@mui/material";
import { Search, Plus, Filter, LayoutGrid, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, Edit, Trash2, Star, Users, Clock, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import DeleteCourseDialog from "../components/deleteCourseDialog";
import { toast } from "react-toastify";
import useInstructorStore from "@/store/instructorStore";
import { Poppins, Jost } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
const poppins = Poppins(
  {
    subsets: ["latin"],
    weight: ["100", "200", "300", "400", "500", "600", "700", "800"]
  },
)
const jost = Jost(
  {
    subsets: ["latin"],
    weight: ["100", "200", "300", "400", "500", "600", "700", "800"]
  },
)

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
  const limit = 6;
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'published':
        return 'bg-green-500 text-white';
      case 'pendingreview':
        return 'bg-warning text-warning-foreground';
      case 'draft':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const handleStatusFilter = (value) => {
    setStatusFilter(value);
  };

  useEffect(() => {
    const verifyInstructor = async () => {
      const { success, isInstructor: isAuthInstructor } =
        await checkInstructorAuth();
      if (!success || !isAuthInstructor) {
        router.push("/instructor/auth/login");
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
    router.push(`/instructor/dashboard/courses/${courseId}`);
  };

  const handleEditCourse = (courseId) => {
    router.push(`/instructor/dashboard/courses/edit/${courseId}`);
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;
    setIsDeleting(true);
    try {
      const result = await deleteCourse(courseToDelete._id);
      if (result.success) {
        toast.success("Course deleted successfully");
        setIsDeleting(false);
        fetchCourses({ page, limit });
      } else {
        toast.error(result.message || "Failed to delete course");
        setIsDeleting(false);
      }
    } catch (error) {
      toast.error("An error occurred while deleting the course");
      setIsDeleting(false);
    } finally {
      setDeleteDialogOpen(false);
      setCourseToDelete(null);
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const openDeleteDialog = (course) => {
    setCourseToDelete(course);
    setDeleteDialogOpen(true);
  };

  const formatPrice = (price, isFree) => {
    if (isFree) return 'Free';
    return price ? `$${price}` : 'N/A';
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

  console.log("courses", courses);

  console.log('isInstructor', isInstructor, 'instructor', instructor);

  if (!instructor) return null;

  return (
    // <Box sx={{ minHeight: "100vh", p: { xs: 2, md: 4 } }}>
    //   <Typography
    //     variant="h4"
    //     sx={{
    //       fontWeight: "bold",
    //       mb: { xs: 3, md: 4 },
    //       fontSize: { xs: "1.5rem", md: "2rem" },
    //     }}
    //     style={{ fontFamily: poppins.style.fontFamily }}
    //   >
    //     My Courses
    //   </Typography>

    //   {courses.length === 0 ? (
    //     <Box sx={{ textAlign: "center", py: 8 }}>
    //       <Typography className={jost.className} variant="h6" color="text.secondary" sx={{ mb: 2 }}>
    //         No courses found. Create your first course!
    //       </Typography>
    //       <Button
    //         variant="contained"
    //         color="primary"
    //         size="large"
    //         onClick={() => router.push("/instructor/dashboard/courses/create")}
    //       >
    //         Create New Course
    //       </Button>
    //     </Box>
    //   ) : (
    //     <>
    //       <Grid container spacing={3}>
    //         {courses.map((course) => (
    //           <Grid item xs={12} sm={6} md={4} key={course._id}>
    //             <Card
    //               sx={{
    //                 height: "100%",
    //                 display: "flex",
    //                 flexDirection: "column",
    //                 boxShadow: 3,
    //                 transition: "transform 0.2s",
    //                 "&:hover": { transform: "scale(1.02)" },
    //               }}
    //             >
    //               <CardMedia
    //                 component="img"
    //                 height="180"
    //                 image={course.thumbnail?.url || "/default-course.jpg"}
    //                 alt={course.title}
    //                 sx={{ objectFit: "cover" }}
    //               />
    //               <CardContent sx={{ flexGrow: 1 }}>
    //                 <Typography
    //                   variant="h6"
    //                   component="div"
    //                   noWrap
    //                   sx={{ fontWeight: 600, mb: 1 }}
    //                 >
    //                   {typeof course.title === "string"
    //                     ? course.title
    //                     : "Untitled"}
    //                 </Typography>

    //                 <Typography
    //                   variant="body2"
    //                   color="text.secondary"
    //                   sx={{
    //                     mb: 1,
    //                     display: "-webkit-box",
    //                     WebkitLineClamp: 2,
    //                     WebkitBoxOrient: "vertical",
    //                     overflow: "hidden",
    //                   }}
    //                 >
    //                   {typeof course.description === "string"
    //                     ? course.description
    //                     : "No description provided."}
    //                 </Typography>

    //                 <Box sx={{ mb: 1 }}>
    //                   <Chip
    //                     label={course?.status || "Unknown"}
    //                     color={
    //                       course?.status === "Published"
    //                         ? "success"
    //                         : course?.status === "PendingReview"
    //                           ? "warning"
    //                           : "default"
    //                     }
    //                     size="small"
    //                   />
    //                 </Box>

    //                 <Typography variant="body2" color="text.secondary">
    //                   Price:{" "}
    //                   {course?.isFree
    //                     ? "Free"
    //                     : typeof course?.price === "number"
    //                       ? `$${course.price}`
    //                       : "N/A"}
    //                 </Typography>

    //                 <Typography variant="body2" color="text.secondary">
    //                   Category:{" "}
    //                   {Array.isArray(course?.categories)
    //                     ? course.categories.join(", ")
    //                     : "Uncategorized"}
    //                 </Typography>
    //               </CardContent>

    //               <CardActions
    //                 sx={{
    //                   justifyContent: "space-between",
    //                   px: 2,
    //                   pb: 2,
    //                 }}
    //               >
    //                 <Box>
    //                   <Tooltip title="View Course">
    //                     <IconButton
    //                       onClick={() => handleViewCourse(course._id)}
    //                       color="primary"
    //                     >
    //                       <Visibility />
    //                     </IconButton>
    //                   </Tooltip>
    //                   <Tooltip title="Edit Course">
    //                     <IconButton
    //                       onClick={() => handleEditCourse(course._id)}
    //                       color="secondary"
    //                     >
    //                       <Edit />
    //                     </IconButton>
    //                   </Tooltip>
    //                   <Tooltip title="Delete Course">
    //                     <IconButton
    //                       onClick={() => openDeleteDialog(course)}
    //                       color="error"
    //                     >
    //                       <Delete />
    //                     </IconButton>
    //                   </Tooltip>
    //                 </Box>
    //               </CardActions>
    //             </Card>
    //           </Grid>
    //         ))}
    //       </Grid>

    //       <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
    //         <Pagination
    //           count={Math.ceil(totalCourses / limit)}
    //           page={page}
    //           onChange={handlePageChange}
    //           color="primary"
    //           size="medium"
    //           siblingCount={1}
    //           boundaryCount={1}
    //         />
    //       </Box>
    //     </>
    //   )}
    // </Box>
    <section>
      <div className="min-h-screen bg-background pb-10">
        {/* Header Section */}
        <div className="bg-gradient-hero relative overflow-hidden">
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-3xl lg:text-4xl font-display font-bold text-primary-foreground mb-4">
                  My Courses
                </h1>
                <p className={"text-primary-foreground/90 text-base max-w-2xl " + jost.className}>
                  Manage your course portfolio and track your teaching success
                </p>
              </div>

              <Link href="/instructor/dashboard/courses/create">
                <Button
                  size="lg"
                  className="cursor-pointer bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 transition-all duration-300 font-medium px-8 py-3 h-auto"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create New Course
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters and Search */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 bg-card border-border/50 focus:border-primary/50"
              />
            </div>

            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={handleStatusFilter}>
                <SelectTrigger className="w-40 bg-card border-border/50">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pendingreview">Pending Review</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex bg-card rounded-lg border border-border/50">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8 w-8 p-0"
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8 w-8 p-0"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className={`grid gap-6 ${viewMode === 'grid'
            ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
            : 'grid-cols-1'
            }`}>
            {courses.map((course, id) => (
              <Card key={id} className="group py-0 relative overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
                <div className="relative overflow-hidden">
                  <div className="aspect-video w-full bg-gradient-primary">
                    {course.thumbnail?.url ? (
                      <Image
                        width={500}
                        height={500}
                        src={course.thumbnail.url}
                        alt={course.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-primary-foreground/80" />
                      </div>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <Badge className={`${getStatusColor(course.status)} font-medium`}>
                      {course.status || 'Unknown'}
                    </Badge>
                  </div>

                  {/* Rating */}
                  {course.rating && (
                    <div className="absolute top-3 left-3 bg-black/20 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="text-white text-xs font-medium">{course.rating}</span>
                    </div>
                  )}
                </div>

                <CardContent className="p-4">
                  {/* Title */}
                  <h3 className="font-display font-semibold text-lg text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {course.title || 'Untitled Course'}
                  </h3>

                  {/* Description */}
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-1 leading-relaxed">
                    {course.description || 'No description provided.'}
                  </p>

                  {/* Course Stats */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {course.enrollmentCount !== undefined && (
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{course.enrollmentCount} students</span>
                      </div>
                    )}
                    {course.duration && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{course.duration}</span>
                      </div>
                    )}
                  </div>

                  {/* Categories */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {course.categories?.slice(0, 2).map((category) => (
                      <Badge
                        key={category}
                        variant="secondary"
                        className="text-xs px-2 py-1"
                      >
                        {category}
                      </Badge>
                    ))}
                    {course.categories?.length > 2 && (
                      <Badge variant="secondary" className="text-xs px-2 py-1">
                        +{course.categories.length - 2}
                      </Badge>
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-semibold text-primary">
                      {formatPrice(course.price, course.isFree)}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="px-6 pb-4 pt-0 flex items- justify-between">
                  <TooltipProvider>
                    <div className="flex gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 w-9 p-0 border-primary/20 hover:border-primary hover:bg-primary/10"
                            onClick={() => handleViewCourse(course._id)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View Course</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 w-9 p-0 border-primary/20 hover:border-primary hover:bg-primary/10"
                            onClick={() => handleEditCourse(course._id)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit Course</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 w-9 p-0 border-destructive/20 hover:border-destructive hover:bg-destructive/10 text-destructive"
                            onClick={() => { setIsDeleteDialogOpen(true); setCourseToDelete(course); }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete Course</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Delete Dialog */}
          <DeleteCourseDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => setIsDeleteDialogOpen(false)}
            onConfirm={handleDeleteCourse}
            course={courseToDelete}
            isDeleting={isDeleting}
          />
        </div>

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
      </div>

    </section>

  );
};

export default CoursesPage;
