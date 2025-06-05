import React from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Box,
} from "@mui/material";
import { useRouter } from "next/navigation";

const CourseCard = ({ course }) => {
  const router = useRouter();

  const handleViewDetails = () => {
    router.push(`/courses/${course._id}`);
  };

  return (
    <Card sx={{ maxWidth: 345, m: 2 }}>
      <CardMedia
        component="img"
        height="140"
        image={course.thumbnail?.url || "/placeholder.jpg"}
        alt={course.title}
      />
      <CardContent>
        <Typography variant="h6" component="div" noWrap>
          {course.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {course.instructor?.fullname?.firstName}{" "}
          {course.instructor?.fullname?.lastName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {course.level} • {course.language}
        </Typography>
        <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
          {course.isFree ? "Free" : `$${course.price}`}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" onClick={handleViewDetails}>
            View Details
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CourseCard;
