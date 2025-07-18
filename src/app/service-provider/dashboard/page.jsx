"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  DollarSign,
  Star,
  Users,
  CheckCircle,
  MessageSquare,
  Download,
  RefreshCw,
  Activity,
} from "lucide-react";
import DashboardLayout from "@/components/serviceProvider/Layout/DashboardLayout";
import StatsCard from "@/components/serviceProvider/dashboard/StatsCard";
import ChartCard from "@/components/serviceProvider/dashboard/ChartCard";
import RecentActivity from "@/components/serviceProvider/dashboard/RecentActivity";
import UpcomingBookings from "@/components/serviceProvider/dashboard/UpcomingBookings";
import useServiceProviderStore from "@/store/serviceStore";

const DashboardPage = () => {
  const router = useRouter();
  const {
    serviceProvider,
    dashboardStats,
    bookings,
    reviews,
    fetchDashboardStats,
    fetchBookings,
    fetchReviews,
    isLoading,
    error,
  } = useServiceProviderStore();

  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        await Promise.all([
          fetchDashboardStats(dateRange.startDate, dateRange.endDate),
          fetchBookings({ limit: 5, status: "all" }),
          fetchReviews(1, 5),
        ]);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      }
    };

    if (serviceProvider) {
      loadDashboardData();
    }
  }, [
    serviceProvider,
    dateRange,
    fetchDashboardStats,
    fetchBookings,
    fetchReviews,
  ]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchDashboardStats(dateRange.startDate, dateRange.endDate),
        fetchBookings({ limit: 5, status: "all" }),
        fetchReviews(1, 5),
      ]);
    } catch (error) {
      console.error("Failed to refresh data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Calculate performance metrics
  const performanceMetrics = {
    responseRate:
      bookings.length > 0
        ? (
            (bookings.filter((b) => b.status !== "Pending").length /
              bookings.length) *
            100
          ).toFixed(1)
        : 0,
    completionRate:
      bookings.length > 0
        ? (
            (bookings.filter((b) => b.status === "Completed").length /
              bookings.length) *
            100
          ).toFixed(1)
        : 0,
    averageRating: serviceProvider?.ratings || 0,
    totalReviews: serviceProvider?.numOfReviews || 0,
  };

  // Chart data
  const earningsData = [
    { name: "Jan", earnings: 2400, bookings: 24 },
    { name: "Feb", earnings: 1398, bookings: 18 },
    { name: "Mar", earnings: 9800, bookings: 45 },
    { name: "Apr", earnings: 3908, bookings: 32 },
    { name: "May", earnings: 4800, bookings: 38 },
    { name: "Jun", earnings: 3800, bookings: 29 },
  ];

  const bookingStatusData = [
    {
      name: "Completed",
      value: dashboardStats.completedBookings,
      color: "#10b981",
    },
    {
      name: "Pending",
      value: dashboardStats.totalBookings - dashboardStats.completedBookings,
      color: "#f59e0b",
    },
    {
      name: "Cancelled",
      value: Math.floor(dashboardStats.totalBookings * 0.1),
      color: "#ef4444",
    },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {serviceProvider?.fullname?.firstName}! 👋
              </h1>
              <p className="text-gray-600 mt-1">
                Here's what's happening with your services today.
              </p>
            </div>
            <div className="flex items-center space-x-4 mt-4 lg:mt-0">
              {/* Date Range Selector */}
              <div className="flex items-center space-x-2">
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) =>
                    handleDateRangeChange("startDate", e.target.value)
                  }
                  className="form-input text-sm"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) =>
                    handleDateRangeChange("endDate", e.target.value)
                  }
                  className="form-input text-sm"
                />
              </div>

              {/* Action Buttons */}
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="btn btn-outline btn-sm"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${
                    isRefreshing ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </button>

              <button className="btn btn-primary btn-sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Bookings"
            value={dashboardStats.totalBookings}
            icon={Calendar}
            color="blue"
            trend={{
              value: 12,
              direction: "up",
              label: "from last month",
            }}
          />
          <StatsCard
            title="Total Earnings"
            value={`$${dashboardStats.totalEarnings.toLocaleString()}`}
            icon={DollarSign}
            color="green"
            trend={{
              value: 8,
              direction: "up",
              label: "from last month",
            }}
          />
          <StatsCard
            title="Average Rating"
            value={performanceMetrics.averageRating.toFixed(1)}
            icon={Star}
            color="yellow"
            trend={{
              value: 0.2,
              direction: "up",
              label: "from last month",
            }}
          />
          <StatsCard
            title="Response Rate"
            value={`${performanceMetrics.responseRate}%`}
            icon={Activity}
            color="purple"
            trend={{
              value: 5,
              direction: "up",
              label: "from last month",
            }}
          />
        </div>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ChartCard
              title="Earnings & Bookings Overview"
              subtitle="Monthly performance tracking"
              type="line"
              data={earningsData}
              dataKeys={["earnings", "bookings"]}
              colors={["#3b82f6", "#10b981"]}
            />
          </div>
          <div>
            <ChartCard
              title="Booking Status"
              subtitle="Current distribution"
              type="pie"
              data={bookingStatusData}
              dataKeys={["value"]}
              colors={["#10b981", "#f59e0b", "#ef4444"]}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/service-provider/services/new" className="group">
              <div className="p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200">
                      <Calendar className="h-4 w-4 text-indigo-600" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900">
                      Add Service
                    </h3>
                    <p className="text-xs text-gray-500">
                      Create new service offering
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/service-provider/bookings" className="group">
              <div className="p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900">
                      View Bookings
                    </h3>
                    <p className="text-xs text-gray-500">
                      Manage your bookings
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/service-provider/messages" className="group">
              <div className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200">
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900">
                      Messages
                    </h3>
                    <p className="text-xs text-gray-500">Chat with customers</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/service-provider/profile" className="group">
              <div className="p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200">
                      <Users className="h-4 w-4 text-purple-600" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900">
                      Profile
                    </h3>
                    <p className="text-xs text-gray-500">Update your profile</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Activity & Upcoming Bookings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivity />
          <UpcomingBookings />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;

