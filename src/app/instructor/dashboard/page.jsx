"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress, Typography } from "@mui/material";
import { Badge } from "@/components/ui/badge";
import useInstructorStore from "@/store/instructorStore";
import { toast } from "react-toastify";
import Link from "next/link";
import { Poppins, Jost } from "next/font/google";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table as TABLE,
  TableBody as TABLEBODY,
  TableCell as TABLECELL,
  TableHead as TABLEHEAD,
  TableHeader,
  TableRow as TABLEROW,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Card as CARD,
  CardContent as CARDCONTENT,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  BookOpen,
  Users,
  DollarSign,
  Star,
  PlayCircle,
  AlertTriangle,
  Edit,
  Wallet,
  Clock,
  TrendingUp,
  Calendar,
  Eye,
  BarChart3,
} from "lucide-react";
import { FaSync, FaRefresh } from "react-icons/fa";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
});

const enrollmentTrendsData = [
  { month: "Jan", enrollments: 45 },
  { month: "Feb", enrollments: 67 },
  { month: "Mar", enrollments: 89 },
  { month: "Apr", enrollments: 123 },
  { month: "May", enrollments: 156 },
  { month: "Jun", enrollments: 189 },
];

export default function InstructorDashboardPage() {
  const router = useRouter();

  // State management
  const [withdrawalForm, setWithdrawalForm] = useState({
    amount: "",
    withdrawMethod: { type: "PayPal", details: "" },
  });
  const [courseFilter, setCourseFilter] = useState("All");
  const [errors, setErrors] = useState({});
  const [dataLoadingError, setDataLoadingError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const maxRetries = 3;
  const initializationTimeoutRef = useRef(null);
  const isInitializingRef = useRef(false);

  // Store state
  const {
    instructor,
    isInstructor,
    isLoading,
    dashboardStats,
    withdrawals,
    courses,
    totalCourses,
    loadDashboardAnalytics,
    getInstructorStats,
    fetchWithdrawals,
    fetchCourses,
    createWithdrawal,
    getWithdrawalStats,
    instructorToken,
  } = useInstructorStore();

  // Stats configuration
  const stats = [
    {
      title: "Total Courses",
      value: dashboardStats?.totalCourses || 0,
      subValue: `Published: ${dashboardStats?.publishedCourses || 0}`,
      icon: BookOpen,
      color: "bg-blue-500",
    },
    {
      title: "Total Enrollments",
      value: dashboardStats?.totalEnrollments || 0,
      subValue: `This Month: ${dashboardStats?.monthlyEnrollments || 0}`,
      icon: Users,
      color: "bg-green-500",
    },
    {
      title: "Average Rating",
      value: dashboardStats?.averageRating?.toFixed(1) || "0.0",
      subValue: `${dashboardStats?.totalReviews || 0} Reviews`,
      icon: Star,
      color: "bg-yellow-500",
    },
    {
      title: "Account Balance",
      value: `$${dashboardStats?.accountBalance?.toFixed(2) || "0.00"}`,
      subValue: "Available Balance",
      icon: DollarSign,
      color: "bg-purple-500",
    },
  ];

  // Initialize dashboard data
  const initializeDashboard = async (forceRefresh = false) => {
    if (isInitialized && !forceRefresh) {
      console.log("Dashboard already initialized, skipping");
      return;
    }

    if (isDataLoading || isInitializingRef.current) {
      console.log("Dashboard data already loading, skipping");
      return;
    }

    if (!instructorToken) {
      console.log("Waiting for instructor token to be available");
      return;
    }

    if (!instructor) {
      console.log("Waiting for instructor data to be available");
      return;
    }

    try {
      console.log("Initializing dashboard for instructor:", instructor?._id);
      console.log("Dashboard initialization with token:", !!instructorToken);
      console.log("Instructor object:", instructor);
      setIsDataLoading(true);
      setDataLoadingError(null);

      if (!forceRefresh) {
        setIsInitialized(true);
      }

      // Load all dashboard data concurrently
      const promises = [
        loadDashboardAnalytics("30d"),
        getInstructorStats(),
        fetchWithdrawals({ page: 1, limit: 5 }),
        fetchCourses({ page: 1, limit: 10 }),
        getWithdrawalStats(),
      ];

      const results = await Promise.allSettled(promises);

      // Check results and log any failures
      results.forEach((result, index) => {
        if (result.status === "rejected") {
          const operationNames = ["Analytics", "Instructor Stats", "Withdrawals", "Courses", "Withdrawal Stats"];
          console.warn(`${operationNames[index]} failed to load:`, result.reason);
        }
      });

      setRetryCount(0);
      console.log("Dashboard data loaded successfully");
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      setDataLoadingError("Failed to load dashboard data");

      if (retryCount < maxRetries) {
        setRetryCount((prev) => prev + 1);
        if (!forceRefresh) {
          setIsInitialized(false);
        }

        // Retry with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
        setTimeout(() => {
          initializeDashboard(forceRefresh);
        }, delay);
      } else {
        toast.error("Failed to load dashboard data after multiple attempts");
      }
    } finally {
      setIsDataLoading(false);
    }
  };

  // Effect that runs when instructor data becomes available
  useEffect(() => {
    // Only initialize if we have all required data and haven't initialized yet
    if (instructorToken && instructor && !isInitialized && !isLoading && !isDataLoading && !isInitializingRef.current) {
      console.log("Starting dashboard initialization from useEffect");
      isInitializingRef.current = true;
      
      // Clear any existing timeout
      if (initializationTimeoutRef.current) {
        clearTimeout(initializationTimeoutRef.current);
      }
      
      // Debounce the initialization to prevent multiple calls
      initializationTimeoutRef.current = setTimeout(() => {
        // Double-check conditions before initializing
        if (instructorToken && instructor && !isInitialized && !isLoading && !isDataLoading) {
          initializeDashboard().finally(() => {
            isInitializingRef.current = false;
          });
        } else {
          isInitializingRef.current = false;
        }
      }, 100);
    }
    
    // Cleanup timeout on unmount
    return () => {
      if (initializationTimeoutRef.current) {
        clearTimeout(initializationTimeoutRef.current);
      }
      isInitializingRef.current = false;
    };
  }, [instructorToken, instructor, isInitialized, isLoading, isDataLoading]);

  // Handle course filter changes
  const handleCourseFilter = async (value) => {
    setCourseFilter(value);
    if (value !== "All") {
      try {
        await fetchCourses({
          status: value === "All" ? "" : value,
          page: 1,
          limit: 10,
        });
      } catch (error) {
        console.error("Failed to filter courses:", error);
        toast.error("Failed to filter courses");
      }
    }
  };

  // Handle withdrawal form changes
  const handleWithdrawalChange = (e) => {
    const { name, value } = e.target;

    if (name === "amount") {
      setWithdrawalForm((prev) => ({ ...prev, amount: value }));
    } else if (name === "methodDetails") {
      setWithdrawalForm((prev) => ({
        ...prev,
        withdrawMethod: { ...prev.withdrawMethod, details: value },
      }));
    }

    // Clear error for this field
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Handle withdrawal method selection
  const handleMethodChange = (value) => {
    setWithdrawalForm((prev) => ({
      ...prev,
      withdrawMethod: { ...prev.withdrawMethod, type: value, details: "" },
    }));
    setErrors((prev) => ({ ...prev, methodType: "", methodDetails: "" }));
  };

  // Handle withdrawal form submission
  const handleWithdrawalSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const newErrors = {};
    const amount = parseFloat(withdrawalForm.amount);

    if (!withdrawalForm.amount || isNaN(amount) || amount <= 0) {
      newErrors.amount = "Please enter a valid withdrawal amount";
    } else if (amount < 10) {
      newErrors.amount = "Minimum withdrawal amount is $10";
    } else if (amount > 10000) {
      newErrors.amount = "Maximum withdrawal amount is $10,000";
    }

    if (!withdrawalForm.withdrawMethod.type) {
      newErrors.methodType = "Withdrawal method is required";
    }

    if (!withdrawalForm.withdrawMethod.details) {
      newErrors.methodDetails = "Method details are required";
    }

    // Check if amount exceeds available balance
    const availableBalance = dashboardStats?.accountBalance || 0;
    if (amount > availableBalance) {
      newErrors.amount = `Amount exceeds available balance (${availableBalance.toFixed(
        2
      )})`;
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fix the form errors");
      return;
    }

    try {
      const result = await createWithdrawal(
        amount,
        withdrawalForm.withdrawMethod
      );

      if (result.success) {
        setWithdrawalForm({
          amount: "",
          withdrawMethod: { type: "PayPal", details: "" },
        });
        setErrors({});

        // Refresh dashboard stats to reflect new balance
        await loadDashboardAnalytics("30d");
        await getWithdrawalStats();
      }
    } catch (error) {
      console.error("Withdrawal submission error:", error);
      toast.error("Failed to process withdrawal request");
    }
  };

  // Handle refresh button click
  const handleRefresh = () => {
    if (instructorToken && instructor) {
      initializeDashboard(true);
    }
  };

  // Loading state for initial load
  if (!instructor || !instructorToken) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#f8fafc",
        }}
      >
        <CircularProgress size={60} sx={{ color: "#3b82f6" }} />
        <Typography
          variant="h6"
          sx={{
            mt: 2,
            color: "#64748b",
            fontFamily: "Poppins, sans-serif",
          }}
        >
          Loading Dashboard...
        </Typography>
        {dataLoadingError && (
          <Typography
            variant="body2"
            sx={{
              mt: 1,
              color: "#dc2626",
              fontFamily: "Poppins, sans-serif",
              textAlign: "center",
            }}
          >
            {dataLoadingError}
          </Typography>
        )}
      </Box>
    );
  }

  // Error state with retry options
  if (dataLoadingError && retryCount >= maxRetries) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <CARD className="max-w-md w-full mx-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Dashboard Error
            </CardTitle>
          </CardHeader>
          <CARDCONTENT className="space-y-4">
            <Alert className="border-red-200 bg-red-50 text-red-800">
              <AlertDescription>{dataLoadingError}</AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setRetryCount(0);
                  setDataLoadingError(null);
                  setIsInitialized(false);
                  initializeDashboard();
                }}
                className="flex-1"
              >
                <FaSync className="h-4 w-4 mr-2" />
                Retry
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="flex-1"
              >
                Refresh Page
              </Button>
            </div>
          </CARDCONTENT>
        </CARD>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1
            className={`text-3xl font-bold text-gray-900 ${poppins.className}`}
          >
            Welcome back,{" "}
            {instructor?.fullname
              ? `${instructor.fullname.firstName} ${instructor.fullname.lastName}`
              : "Instructor"}
            !
          </h1>
          <p className={`text-gray-600 mt-1 ${jost.className}`}>
            Here's what's happening with your courses today.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isDataLoading}
            className="flex items-center gap-2"
          >
            <FaSync
              className={`h-4 w-4 ${isDataLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>

          <Link href="/instructor/dashboard/courses/create">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <PlayCircle className="mr-2 h-4 w-4" />
              Create New Course
            </Button>
          </Link>
        </div>
      </div>

      {/* Approval Status Alert */}
      {instructor?.approvalStatus?.isInstructorApproved ? (
        <Alert className="border-green-200 bg-green-50">
          <div className="flex items-center">
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-800 mr-3"
            >
              ✓ Approved
            </Badge>
            <span className={`text-green-800 ${jost.className}`}>
              Your instructor account is approved and active.
            </span>
          </div>
        </Alert>
      ) : (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center">
              <Badge
                variant="secondary"
                className="bg-yellow-100 text-yellow-800 mr-3"
              >
                ⏳ Pending
              </Badge>
              <div>
                <strong>Approval Status: Under Review</strong>
                {instructor?.approvalStatus?.approvalReason && (
                  <p className="text-sm mt-1">
                    Reason: {instructor.approvalStatus.approvalReason}
                  </p>
                )}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <CARD
              key={index}
              className="bg-white shadow-sm hover:shadow-md transition-all duration-200 border-0"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle
                  className={`text-sm font-medium text-gray-600 ${jost.className}`}
                >
                  {stat.title}
                </CardTitle>
                <div className={`rounded-lg p-2 ${stat.color} bg-opacity-10`}>
                  <Icon className={`h-4 w-4 text-gray-700`} />
                </div>
              </CardHeader>
              <CARDCONTENT>
                <div
                  className={`text-2xl font-bold text-gray-900 ${poppins.className}`}
                >
                  {isDataLoading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                  ) : (
                    stat.value
                  )}
                </div>
                <p className={`text-xs text-gray-500 mt-1 ${jost.className}`}>
                  {stat.subValue}
                </p>
                {stat.title === "Account Balance" && (
                  <div className="mt-2">
                    <Button
                      variant="link"
                      className="p-0 h-auto text-blue-600 text-sm"
                    >
                      <Wallet className="h-3 w-3 mr-1" />
                      Withdraw Money
                    </Button>
                  </div>
                )}
              </CARDCONTENT>
            </CARD>
          );
        })}
      </div>

      {/* Enrollment Trends Chart */}
      <CARD className="bg-white shadow-sm border-0">
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${poppins.className}`}>
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Enrollment Trends
          </CardTitle>
          <CardDescription className={jost.className}>
            Monthly enrollment statistics for your courses
          </CardDescription>
        </CardHeader>
        <CARDCONTENT>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={enrollmentTrendsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                />
                <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="enrollments"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CARDCONTENT>
      </CARD>

      {/* Courses Section */}
      <CARD className="bg-white shadow-sm border-0">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle
                className={`flex items-center gap-2 ${poppins.className}`}
              >
                <BookOpen className="h-5 w-5 text-blue-600" />
                Your Courses
              </CardTitle>
              <CardDescription className={jost.className}>
                Manage and track your course performance
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Select value={courseFilter} onValueChange={handleCourseFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Courses</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Published">Published</SelectItem>
                  <SelectItem value="Archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CARDCONTENT>
          <div className="overflow-x-auto">
            <TABLE>
              <TableHeader>
                <TABLEROW className="border-gray-200">
                  <TABLEHEAD className={`font-medium ${jost.className}`}>
                    Course
                  </TABLEHEAD>
                  <TABLEHEAD className={`font-medium ${jost.className}`}>
                    Status
                  </TABLEHEAD>
                  <TABLEHEAD className={`font-medium ${jost.className}`}>
                    Enrollments
                  </TABLEHEAD>
                  <TABLEHEAD className={`font-medium ${jost.className}`}>
                    Revenue
                  </TABLEHEAD>
                  <TABLEHEAD className={`font-medium ${jost.className}`}>
                    Actions
                  </TABLEHEAD>
                </TABLEROW>
              </TableHeader>
              <TABLEBODY>
                {Array.isArray(courses) && courses.length > 0 ? (
                  courses.map((course) => (
                    <TABLEROW
                      key={course._id}
                      className="border-gray-100 hover:bg-gray-50"
                    >
                      <TABLECELL className="py-4">
                        <div>
                          <p
                            className={`font-medium text-gray-900 ${jost.className}`}
                          >
                            {course.title && course.title.length > 40
                              ? `${course.title.slice(0, 40)}...`
                              : course.title || "Untitled Course"}
                          </p>
                          {course.createdAt && (
                            <p className="text-sm text-gray-500">
                              Created{" "}
                              {new Date(course.createdAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </TABLECELL>
                      <TABLECELL>
                        <Badge
                          variant={
                            course.status === "Published"
                              ? "default"
                              : "secondary"
                          }
                          className={
                            course.status === "Published"
                              ? "bg-green-100 text-green-800 border-green-200"
                              : course.status === "Draft"
                              ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                              : "bg-gray-100 text-gray-800 border-gray-200"
                          }
                        >
                          {course.status || "Draft"}
                        </Badge>
                      </TABLECELL>
                      <TABLECELL>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className={jost.className}>
                            {course.enrollmentCount || 0}
                          </span>
                        </div>
                      </TABLECELL>
                      <TABLECELL>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <span className={jost.className}>
                            {course.revenue
                              ? `${course.revenue.toFixed(2)}`
                              : "$0.00"}
                          </span>
                        </div>
                      </TABLECELL>
                      <TABLECELL>
                        <div className="flex gap-2">
                          <Link
                            href={`/instructor/dashboard/courses/edit/${course._id}`}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </TABLECELL>
                    </TABLEROW>
                  ))
                ) : (
                  <TABLEROW>
                    <TABLECELL colSpan={5} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <BookOpen className="h-12 w-12 text-gray-400" />
                        <div>
                          <p
                            className={`text-gray-600 font-medium ${jost.className}`}
                          >
                            {isDataLoading
                              ? "Loading courses..."
                              : "No courses found"}
                          </p>
                          {!isDataLoading && (
                            <p
                              className={`text-sm text-gray-500 ${jost.className}`}
                            >
                              Create your first course to get started
                            </p>
                          )}
                        </div>
                        {!isDataLoading && (
                          <Link href="/instructor/dashboard/courses/create">
                            <Button size="sm">
                              <PlayCircle className="h-4 w-4 mr-2" />
                              Create Course
                            </Button>
                          </Link>
                        )}
                      </div>
                    </TABLECELL>
                  </TABLEROW>
                )}
              </TABLEBODY>
            </TABLE>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className={`text-sm text-gray-500 ${jost.className}`}>
              Total Courses: {courses?.length || 0}
            </p>
            {courses?.length > 10 && (
              <Button variant="outline" size="sm">
                View All Courses
              </Button>
            )}
          </div>
        </CARDCONTENT>
      </CARD>

      {/* Withdrawal Section */}
      <CARD className="bg-white shadow-sm border-0">
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${poppins.className}`}>
            <Wallet className="h-5 w-5 text-blue-600" />
            Withdraw Earnings
          </CardTitle>
          <CardDescription className={jost.className}>
            Request a withdrawal of your available balance ($
            {dashboardStats?.accountBalance?.toFixed(2) || "0.00"} available)
          </CardDescription>
        </CardHeader>
        <CARDCONTENT className="space-y-6">
          <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="amount"
                  className={`text-sm font-medium ${jost.className}`}
                >
                  Amount ($)
                </Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="10"
                  max="10000"
                  placeholder="0.00"
                  value={withdrawalForm.amount}
                  onChange={handleWithdrawalChange}
                  className={errors.amount ? "border-red-300" : ""}
                />
                {errors.amount && (
                  <p className="text-red-500 text-sm">{errors.amount}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="methodType"
                  className={`text-sm font-medium ${jost.className}`}
                >
                  Withdrawal Method
                </Label>
                <Select
                  value={withdrawalForm.withdrawMethod.type}
                  onValueChange={handleMethodChange}
                >
                  <SelectTrigger
                    className={errors.methodType ? "border-red-300" : ""}
                  >
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PayPal">PayPal</SelectItem>
                    <SelectItem value="BankTransfer">Bank Transfer</SelectItem>
                    <SelectItem value="Stripe">Stripe</SelectItem>
                    <SelectItem value="Crypto">Cryptocurrency</SelectItem>
                  </SelectContent>
                </Select>
                {errors.methodType && (
                  <p className="text-red-500 text-sm">{errors.methodType}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="methodDetails"
                  className={`text-sm font-medium ${jost.className}`}
                >
                  Account Details
                </Label>
                <Input
                  id="methodDetails"
                  name="methodDetails"
                  placeholder={
                    withdrawalForm.withdrawMethod.type === "PayPal"
                      ? "PayPal email address"
                      : withdrawalForm.withdrawMethod.type === "BankTransfer"
                      ? "Account number"
                      : withdrawalForm.withdrawMethod.type === "Stripe"
                      ? "Stripe account details"
                      : withdrawalForm.withdrawMethod.type === "Crypto"
                      ? "Cryptocurrency wallet address"
                      : "Account details"
                  }
                  value={withdrawalForm.withdrawMethod.details}
                  onChange={handleWithdrawalChange}
                  className={errors.methodDetails ? "border-red-300" : ""}
                />
                {errors.methodDetails && (
                  <p className="text-red-500 text-sm">{errors.methodDetails}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  "Request Withdrawal"
                )}
              </Button>

              <div className={`text-sm text-gray-600 ${jost.className}`}>
                Processing time: 3-5 business days
              </div>
            </div>
          </form>

          {/* Recent Withdrawals */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3
                className={`text-lg font-semibold text-gray-900 ${poppins.className}`}
              >
                Recent Withdrawals
              </h3>
              <Link href="/instructor/dashboard/withdrawals">
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                View All
              </Button>
              </Link>
            </div>

            <div className="overflow-x-auto">
              <TABLE>
                <TableHeader>
                  <TABLEROW className="border-gray-200">
                    <TABLEHEAD className={`font-medium ${jost.className}`}>
                      Amount
                    </TABLEHEAD>
                    <TABLEHEAD className={`font-medium ${jost.className}`}>
                      Method
                    </TABLEHEAD>
                    <TABLEHEAD className={`font-medium ${jost.className}`}>
                      Status
                    </TABLEHEAD>
                    <TABLEHEAD className={`font-medium ${jost.className}`}>
                      Date
                    </TABLEHEAD>
                    <TABLEHEAD className={`font-medium ${jost.className}`}>
                      Reference
                    </TABLEHEAD>
                  </TABLEROW>
                </TableHeader>
                <TABLEBODY>
                  {Array.isArray(withdrawals) && withdrawals.length > 0 ? (
                    withdrawals.map((withdrawal) => (
                      <TABLEROW
                        key={withdrawal._id}
                        className="border-gray-100"
                      >
                        <TABLECELL className={`font-medium ${jost.className}`}>
                          ${withdrawal.amount?.toFixed(2) || "0.00"}
                        </TABLECELL>
                        <TABLECELL className={jost.className}>
                          {withdrawal.withdrawMethod?.type || "N/A"}
                        </TABLECELL>
                        <TABLECELL>
                          <Badge
                            variant={
                              withdrawal.status === "Succeeded" ||
                              withdrawal.status === "Completed"
                                ? "default"
                                : withdrawal.status === "Processing" ||
                                  withdrawal.status === "Pending"
                                ? "secondary"
                                : "destructive"
                            }
                            className={
                              withdrawal.status === "Succeeded" ||
                              withdrawal.status === "Completed"
                                ? "bg-green-100 text-green-800 border-green-200"
                                : withdrawal.status === "Processing" ||
                                  withdrawal.status === "Pending"
                                ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                : "bg-red-100 text-red-800 border-red-200"
                            }
                          >
                            {withdrawal.status || "Pending"}
                          </Badge>
                        </TABLECELL>
                        <TABLECELL className={jost.className}>
                          {withdrawal.createdAt
                            ? new Date(withdrawal.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )
                            : "N/A"}
                        </TABLECELL>
                        <TABLECELL
                          className={`text-sm text-gray-500 ${jost.className}`}
                        >
                          #{withdrawal._id?.slice(-8) || "N/A"}
                        </TABLECELL>
                      </TABLEROW>
                    ))
                  ) : (
                    <TABLEROW>
                      <TABLECELL colSpan={5} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <Wallet className="h-8 w-8 text-gray-400" />
                          <p className={`text-gray-600 ${jost.className}`}>
                            {isDataLoading
                              ? "Loading withdrawals..."
                              : "No withdrawal requests yet"}
                          </p>
                          {!isDataLoading && (
                            <p
                              className={`text-sm text-gray-500 ${jost.className}`}
                            >
                              Your withdrawal history will appear here
                            </p>
                          )}
                        </div>
                      </TABLECELL>
                    </TABLEROW>
                  )}
                </TABLEBODY>
              </TABLE>
            </div>
          </div>
        </CARDCONTENT>
      </CARD>
    </div>
  );
}

