"use client";

import { useState, useEffect } from "react";
import { 
  BarChart3, 
  Calendar, 
  Star, 
  DollarSign, 
  Users 
} from "lucide-react";
import DashboardLayout from "@/components/serviceProvider/Layout/DashboardLayout";
import useServiceProviderStore from "@/store/serviceStore";
import { toast } from "react-toastify";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

const AnalyticsPage = () => {
  const { 
    dashboardStats, 
    fetchDashboardStats, 
    isLoading, 
    error 
  } = useServiceProviderStore();

  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        await fetchDashboardStats(dateRange.startDate, dateRange.endDate);
      } catch (err) {
        toast.error("Failed to fetch analytics data");
      }
    };
    fetchStats();
  }, [dateRange, fetchDashboardStats]);

  const handleDateChange = (field, value) => {
    setDateRange((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleResetFilters = () => {
    setDateRange({ startDate: "", endDate: "" });
  };

  // Sample data for charts (replace with actual data from dashboardStats)
  const monthlyEarningsData = dashboardStats?.monthlyEarnings || [
    { name: "Jan", earnings: 1200 },
    { name: "Feb", earnings: 1900 },
    { name: "Mar", earnings: 1500 },
    { name: "Apr", earnings: 2200 },
    { name: "May", earnings: 1800 },
    { name: "Jun", earnings: 2500 },
  ];

  const bookingTrendsData = dashboardStats?.bookingTrends || [
    { name: "Jan", bookings: 20 },
    { name: "Feb", bookings: 30 },
    { name: "Mar", bookings: 25 },
    { name: "Apr", bookings: 40 },
    { name: "May", bookings: 35 },
    { name: "Jun", bookings: 50 },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">View your performance metrics and trends</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Date Range
          </h2>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => handleDateChange("startDate", e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => handleDateChange("endDate", e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="sm:col-span-2">
              <button
                onClick={handleResetFilters}
                className="btn btn-outline px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Performance Overview
          </h2>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 flex items-center space-x-4">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-xl font-semibold text-gray-900">
                  {dashboardStats?.totalBookings || 127}
                </p>
              </div>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 flex items-center space-x-4">
              <Star className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-xl font-semibold text-gray-900">
                  {dashboardStats?.averageRating || 4.9}
                </p>
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200 flex items-center space-x-4">
              <Users className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Bookings</p>
                <p className="text-xl font-semibold text-gray-900">
                  {dashboardStats?.completedBookings || 100}
                </p>
              </div>
            </div>
            <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200 flex items-center space-x-4">
              <DollarSign className="h-8 w-8 text-indigo-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-xl font-semibold text-gray-900">
                  ${dashboardStats?.totalEarnings || 12450}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Monthly Earnings
          </h2>
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyEarningsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="earnings" stroke="#4f46e5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Booking Trends
          </h2>
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bookingTrendsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="bookings" fill="#4f46e5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;