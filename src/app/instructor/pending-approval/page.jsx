"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Card, CardContent, Typography, Button, CircularProgress, Alert } from "@mui/material";
import { CheckCircle, Clock, Mail, Phone, User, Calendar } from "lucide-react";
import useInstructorStore from "@/store/instructorStore";
import { toast } from "react-toastify";

const PendingApprovalPage = () => {
  const router = useRouter();
  const { instructor, isLoading, logoutInstructor } = useInstructorStore();
  const [checkingStatus, setCheckingStatus] = useState(false);

  useEffect(() => {
    // Redirect if instructor is already approved
    if (instructor?.approvalStatus?.isInstructorApproved) {
      router.push("/instructor/dashboard");
    }
  }, [instructor, router]);

  const handleLogout = async () => {
    try {
      await logoutInstructor(router);
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  const handleCheckStatus = async () => {
    setCheckingStatus(true);
    try {
      // Refresh instructor data to check approval status
      const result = await useInstructorStore.getState().loadInstructor();
      if (result.success && instructor?.approvalStatus?.isInstructorApproved) {
        toast.success("Congratulations! Your account has been approved!");
        router.push("/instructor/dashboard");
      } else {
        toast.info("Your account is still pending approval");
      }
    } catch (error) {
      console.error("Error checking status:", error);
      toast.error("Failed to check approval status");
    } finally {
      setCheckingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#f8fafc",
        }}
      >
        <CircularProgress size={60} sx={{ color: "#3b82f6" }} />
      </Box>
    );
  }

  if (!instructor) {
    return (
      <Box sx={{ maxWidth: "100%", mx: "auto", p: 3 }}>
        <Alert severity="error">
          <Typography variant="h6">Access Denied</Typography>
          <Typography>Please log in to access this page.</Typography>
          <Button
            variant="contained"
            onClick={() => router.push("/instructor/auth/login")}
            sx={{ mt: 2 }}
          >
            Go to Login
          </Button>
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
      }}
    >
      <Card
        sx={{
          maxWidth: 600,
          width: "100%",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            p: 4,
            textAlign: "center",
          }}
        >
          <Clock size={48} style={{ marginBottom: 16 }} />
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Account Pending Approval
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Your instructor account is currently under review
          </Typography>
        </Box>

        <CardContent sx={{ p: 4 }}>
          {/* Status Alert */}
          <Alert
            severity="info"
            sx={{
              mb: 3,
              borderRadius: 2,
              "& .MuiAlert-icon": {
                fontSize: "1.5rem",
              },
            }}
          >
            <Typography variant="body1" fontWeight="medium">
              Your instructor application is being reviewed by our admin team. 
              This process typically takes 24-48 hours.
            </Typography>
          </Alert>

          {/* Instructor Information */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
              Your Application Details
            </Typography>
            
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <User size={20} color="#6b7280" />
                <Typography variant="body1">
                  <strong>Name:</strong> {instructor.fullname?.firstName} {instructor.fullname?.lastName}
                </Typography>
              </Box>
              
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Mail size={20} color="#6b7280" />
                <Typography variant="body1">
                  <strong>Email:</strong> {instructor.email}
                </Typography>
              </Box>
              
              {instructor.phoneNumber && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Phone size={20} color="#6b7280" />
                  <Typography variant="body1">
                    <strong>Phone:</strong> {instructor.phoneNumber.countryCode} {instructor.phoneNumber.number}
                  </Typography>
                </Box>
              )}
              
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Calendar size={20} color="#6b7280" />
                <Typography variant="body1">
                  <strong>Applied:</strong> {new Date(instructor.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Bio Section */}
          {instructor.bio && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                About You
              </Typography>
              <Typography variant="body1" sx={{ color: "#6b7280", lineHeight: 1.6 }}>
                {instructor.bio}
              </Typography>
            </Box>
          )}

          {/* Expertise Section */}
          {instructor.expertise && instructor.expertise.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Areas of Expertise
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {instructor.expertise.map((skill, index) => (
                  <Box
                    key={index}
                    sx={{
                      backgroundColor: "#e0e7ff",
                      color: "#3730a3",
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      fontSize: "0.875rem",
                      fontWeight: "medium",
                    }}
                  >
                    {skill}
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* What Happens Next */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              What Happens Next?
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                <CheckCircle size={20} color="#10b981" style={{ marginTop: 2 }} />
                <Typography variant="body2" sx={{ color: "#6b7280" }}>
                  Our admin team will review your application and credentials
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                <CheckCircle size={20} color="#10b981" style={{ marginTop: 2 }} />
                <Typography variant="body2" sx={{ color: "#6b7280" }}>
                  You'll receive an email notification once your account is approved
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                <CheckCircle size={20} color="#10b981" style={{ marginTop: 2 }} />
                <Typography variant="body2" sx={{ color: "#6b7280" }}>
                  Once approved, you can start creating and publishing courses
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
            <Button
              variant="contained"
              onClick={handleCheckStatus}
              disabled={checkingStatus}
              startIcon={checkingStatus ? <CircularProgress size={20} /> : <CheckCircle size={20} />}
              sx={{
                flex: 1,
                py: 1.5,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                "&:hover": {
                  background: "linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)",
                },
              }}
            >
              {checkingStatus ? "Checking..." : "Check Approval Status"}
            </Button>
            
            <Button
              variant="outlined"
              onClick={handleLogout}
              sx={{
                flex: 1,
                py: 1.5,
                borderColor: "#d1d5db",
                color: "#6b7280",
                "&:hover": {
                  borderColor: "#9ca3af",
                  backgroundColor: "#f9fafb",
                },
              }}
            >
              Logout
            </Button>
          </Box>

          {/* Contact Information */}
          <Box sx={{ mt: 4, p: 3, backgroundColor: "#f9fafb", borderRadius: 2 }}>
            <Typography variant="body2" sx={{ color: "#6b7280", textAlign: "center" }}>
              Need help? Contact our support team at{" "}
              <Typography
                component="span"
                sx={{ color: "#3b82f6", fontWeight: "medium" }}
              >
                blackandsell@gmail.com
              </Typography>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PendingApprovalPage;
