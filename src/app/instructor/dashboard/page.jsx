"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Chip,
  Alert,
  useMediaQuery,
  useTheme,
  Drawer,
  IconButton,
} from "@mui/material";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import axios from "axios";
import useInstructorStore from "@/store/instructorStore";
import { toast } from "react-toastify";
import Link from "next/link";
import InstructorDashboardSideBar from "@/components/Instructor/InstructorDashboardSideBar";
import { AiOutlineMoneyCollect } from "react-icons/ai";
import MenuIcon from "@mui/icons-material/Menu";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function InstructorDashboardPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const {
    instructor,
    isInstructor,
    isLoading,
    dashboardStats,
    withdrawals,
    courses,
    totalCourses,
    loadDashboardAnalytics,
    fetchWithdrawals,
    fetchCourses,
    createWithdrawal,
    logoutInstructor,
    instructorToken,
  } = useInstructorStore();
  const router = useRouter();
  const [withdrawalForm, setWithdrawalForm] = useState({
    amount: "",
    withdrawMethod: { type: "PayPal", details: "" },
  });
  const [courseFilter, setCourseFilter] = useState("");
  const [errors, setErrors] = useState({});
  const [dataLoadingError, setDataLoadingError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  useEffect(() => {
    const initializeDashboard = async () => {
      if (!isInstructor || !instructor?._id) {
        setDataLoadingError("Instructor data not loaded");
        return;
      }

      try {
        await Promise.all([
          loadDashboardAnalytics(instructor._id),
          fetchWithdrawals({ page: 1, limit: 5 }),
          fetchCourses({ page: 1, limit: 10 }),
        ]);
        setDataLoadingError(null);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        if (retryCount < maxRetries) {
          setRetryCount((prev) => prev + 1);
          toast.info(
            `Retrying to load dashboard data (${retryCount + 1}/${maxRetries})`
          );
        } else {
          setDataLoadingError("Failed to load dashboard data after retries.");
          toast.error("Failed to load dashboard data");
        }
      }
    };

    initializeDashboard();
  }, [
    isInstructor,
    instructor,
    loadDashboardAnalytics,
    fetchWithdrawals,
    fetchCourses,
    retryCount,
  ]);

  const availableBalance = instructor?.availableBalance?.toFixed(2) || "0.00";

  const handleWithdrawalChange = (e) => {
    const { name, value } = e.target;
    if (name === "amount") {
      setWithdrawalForm((prev) => ({ ...prev, amount: value }));
    } else if (name === "methodType") {
      setWithdrawalForm((prev) => ({
        ...prev,
        withdrawMethod: { ...prev.withdrawMethod, type: value },
      }));
    } else if (name === "methodDetails") {
      setWithdrawalForm((prev) => ({
        ...prev,
        withdrawMethod: { ...prev.withdrawMethod, details: value },
      }));
    }
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleWithdrawalSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!withdrawalForm.amount || withdrawalForm.amount < 10) {
      newErrors.amount = "Minimum withdrawal amount is $10";
    } else if (withdrawalForm.amount > 10000) {
      newErrors.amount = "Maximum withdrawal amount is $10,000";
    }
    if (!withdrawalForm.withdrawMethod.type) {
      newErrors.methodType = "Withdrawal method is required";
    }
    if (!withdrawalForm.withdrawMethod.details) {
      newErrors.methodDetails = "Method details are required";
    }
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fix the form errors");
      return;
    }

    const result = await createWithdrawal(
      Number(withdrawalForm.amount),
      withdrawalForm.withdrawMethod
    );
    if (result.success) {
      setWithdrawalForm({
        amount: "",
        withdrawMethod: { type: "PayPal", details: "" },
      });
    }
  };

  const handleLogout = async () => {
    await logoutInstructor(router);
  };

  const chartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Enrollments",
        data: [50, 70, 90, 60, 80, dashboardStats?.totalEnrollments || 100],
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
      },
    ],
  };

  if (isLoading && !dataLoadingError) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (dataLoadingError) {
    return (
      <Box sx={{ maxWidth: "100%", mx: "auto", mt: 4, p: 3 }}>
        <Alert severity="error">{dataLoadingError}</Alert>
        <Button
          variant="contained"
          onClick={() => router.push("/instructor/login")}
          sx={{ mt: 2 }}
        >
          Go to Login
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            setRetryCount(0);
            setDataLoadingError(null);
          }}
          sx={{ mt: 2, ml: 2 }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <div className="flex flex-col md:flex-row">
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 240,
          },
        }}
      >
        <InstructorDashboardSideBar active={1} onClose={handleDrawerToggle} />
      </Drawer>

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <InstructorDashboardSideBar active={1} />
      </div>

      <Box sx={{ width: "100%", p: { xs: 2, md: 3 } }}>
        {/* Mobile Header */}
        {isMobile && (
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6">Instructor Dashboard</Typography>
          </Box>
        )}

        <Typography
          variant="h4"
          gutterBottom
          sx={{ display: { xs: "none", md: "block" } }}
        >
          Instructor Dashboard
        </Typography>

        {instructor?.approvalStatus?.isInstructorApproved ? (
          <Chip label="Approved" color="success" sx={{ mb: 2 }} />
        ) : (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Approval Status: Pending
            {instructor?.approvalStatus?.approvalReason
              ? ` (Reason: ${instructor.approvalStatus.approvalReason})`
              : ""}
          </Alert>
        )}

        <Grid container spacing={2} sx={{ mb: 4 }}>
          {[
            {
              title: "Total Courses",
              value: dashboardStats?.totalCourses || 0,
              subValue: `Published: ${dashboardStats?.publishedCourses || 0}`,
            },
            {
              title: "Total Enrollments",
              value: dashboardStats?.totalEnrollments || 0,
              subValue: `Completed: ${
                dashboardStats?.completedEnrollments || 0
              }`,
            },
            {
              title: "Average Rating",
              value: dashboardStats?.averageRating?.toFixed(1) || 0,
              subValue: `Reviews: ${dashboardStats?.totalReviews || 0}`,
            },
            // {
            //   title: "Unanswered Questions",
            //   value: dashboardStats?.unansweredQuestions || 0,
            //   subValue: `Total: ${dashboardStats?.totalQuestions || 0}`,
            // },
          ].map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Typography variant="h6">{stat.title}</Typography>
                  <Typography variant="h4">{stat.value}</Typography>
                  <Typography color="textSecondary">{stat.subValue}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <div className="bg-white hover:shadow-lg transition-shadow">
                  <div className="flex items-center">
                    <AiOutlineMoneyCollect
                      size={30}
                      className="mr-2 text-gray-600"
                    />
                    <div>
                      <h3 className="text-lg font-medium text-gray-700">
                        Account Balance
                      </h3>
                      <span className="text-sm text-gray-500">
                        (with 10% service charge)
                      </span>
                    </div>
                  </div>
                  <h5 className="mt-2 text-2xl font-semibold text-gray-900">
                    ${availableBalance}
                  </h5>
                  <Link
                    href="/shop/withdraw-money"
                    className="text-blue-600 mt-2 block hover:underline"
                  >
                    Withdraw Money
                  </Link>
                </div>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Enrollment Trends
          </Typography>
          <Paper sx={{ p: 2, overflowX: "auto" }}>
            <Box sx={{ minWidth: "300px", height: "300px" }}>
              <Line
                data={chartData}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            </Box>
          </Paper>
        </Box>

        <Box sx={{ mb: 4, overflowX: "auto" }}>
          <Typography variant="h6" gutterBottom>
            Your Courses
          </Typography>
          <TextField
            select
            label="Filter by Status"
            value={courseFilter}
            onChange={(e) => {
              setCourseFilter(e.target.value);
              fetchCourses({ status: e.target.value, page: 1, limit: 10 });
            }}
            sx={{ mb: 2, minWidth: 200 }}
            size="small"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Draft">Draft</MenuItem>
            <MenuItem value="Published">Published</MenuItem>
            <MenuItem value="Archived">Archived</MenuItem>
          </TextField>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="courses table">
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Enrollments</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(courses) && courses.length > 0 ? (
                  courses.map((course) => (
                    <TableRow key={course?._id || Math.random()}>
                      <TableCell sx={{ wordBreak: "break-word" }}>
                        {typeof course?.title === "string"
                          ? course.title.length > 30
                            ? `${course.title.slice(0, 30)}...`
                            : course.title
                          : "Untitled"}
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={course?.status || "Unknown"}
                          color={
                            course?.status === "Published"
                              ? "success"
                              : course?.status === "Draft"
                              ? "warning"
                              : "default"
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {typeof course?.enrollmentCount === "number"
                          ? course.enrollmentCount
                          : 0}
                      </TableCell>
                      <TableCell>
                        <Button
                          component={Link}
                          href={`/instructor/courses/edit/${course?._id || ""}`}
                          size="small"
                          sx={{ mr: 1, mb: { xs: 1, sm: 0 } }}
                          disabled={!course?._id}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No courses found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography sx={{ mt: 2 }}>Total Courses: {totalCourses}</Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Withdraw Earnings
          </Typography>
          <Box
            component="form"
            onSubmit={handleWithdrawalSubmit}
            sx={{ mb: 4 }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Amount ($)"
                  name="amount"
                  type="number"
                  value={withdrawalForm.amount}
                  onChange={handleWithdrawalChange}
                  error={!!errors.amount}
                  helperText={errors.amount}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  select
                  label="Method"
                  name="methodType"
                  value={withdrawalForm.withdrawMethod.type}
                  onChange={handleWithdrawalChange}
                  error={!!errors.methodType}
                  helperText={errors.methodType}
                  size="small"
                >
                  <MenuItem value="PayPal">PayPal</MenuItem>
                  <MenuItem value="BankTransfer">Bank Transfer</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Method Details"
                  name="methodDetails"
                  value={withdrawalForm.withdrawMethod.details}
                  onChange={handleWithdrawalChange}
                  error={!!errors.methodDetails}
                  helperText={errors.methodDetails}
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isLoading}
                  startIcon={isLoading ? <CircularProgress size={20} /> : null}
                >
                  Request Withdrawal
                </Button>
              </Grid>
            </Grid>
          </Box>
          <Typography variant="h6" gutterBottom>
            Recent Withdrawals
          </Typography>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="withdrawals table">
              <TableHead>
                <TableRow>
                  <TableCell>Amount</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {withdrawals.map((withdrawal) => (
                  <TableRow key={withdrawal._id}>
                    <TableCell>${withdrawal.amount}</TableCell>
                    <TableCell>{withdrawal.withdrawMethod.type}</TableCell>
                    <TableCell>
                      <Chip
                        label={withdrawal.status}
                        color={
                          withdrawal.status === "Succeeded"
                            ? "success"
                            : withdrawal.status === "Processing"
                            ? "warning"
                            : "error"
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(withdrawal.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </div>
  );
}
