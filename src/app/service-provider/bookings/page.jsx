"use client"
import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Phone,
  Mail,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical,
  Eye,
  MessageSquare,
} from "lucide-react";
import DashboardLayout from "@/components/serviceProvider/Layout/DashboardLayout";
import useServiceProviderStore from "@/store/serviceStore";
import { toast } from "react-toastify";

const Bookings = () => {
  const {
    bookings,
    bookingStats,
    fetchBookings,
    updateBookingStatus,
    isLoading,
  } = useServiceProviderStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("scheduledAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showStatusMenu, setShowStatusMenu] = useState(null);

  useEffect(() => {
    fetchBookings({
      status: statusFilter !== "all" ? statusFilter : undefined,
      sortBy,
      sortOrder,
    });
  }, [statusFilter, sortBy, sortOrder, fetchBookings]);

  const statusOptions = [
    { value: "all", label: "All Status", count: bookings.length },
    { value: "Pending", label: "Pending", count: bookingStats.pending },
    { value: "Confirmed", label: "Confirmed", count: bookingStats.confirmed },
    {
      value: "InProgress",
      label: "In Progress",
      count: bookingStats.inProgress,
    },
    { value: "Completed", label: "Completed", count: bookingStats.completed },
    { value: "Cancelled", label: "Cancelled", count: bookingStats.cancelled },
    { value: "Declined", label: "Declined", count: bookingStats.declined },
  ];

  const getStatusColor = (status) => {
    const colors = {
      Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Confirmed: "bg-blue-100 text-blue-800 border-blue-200",
      InProgress: "bg-indigo-100 text-indigo-800 border-indigo-200",
      Completed: "bg-green-100 text-green-800 border-green-200",
      Cancelled: "bg-red-100 text-red-800 border-red-200",
      Declined: "bg-gray-100 text-gray-800 border-gray-200",
      NoShow: "bg-orange-100 text-orange-800 border-orange-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusIcon = (status) => {
    const icons = {
      Pending: AlertCircle,
      Confirmed: CheckCircle,
      InProgress: Clock,
      Completed: CheckCircle,
      Cancelled: XCircle,
      Declined: XCircle,
    };
    return icons[status] || AlertCircle;
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await updateBookingStatus(bookingId, newStatus);
      toast.success(`Booking status updated to ${newStatus}`);
      setShowStatusMenu(null);
    } catch (error) {
      toast.error("Failed to update booking status");
    }
  };

  const getAvailableActions = (currentStatus) => {
    const actions = {
      Pending: ["Confirmed", "Declined"],
      Confirmed: ["InProgress", "Cancelled"],
      InProgress: ["Completed", "Cancelled"],
      Completed: [],
      Cancelled: [],
      Declined: [],
    };
    return actions[currentStatus] || [];
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.serviceDetails.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      booking.user?.username?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
              <p className="text-gray-600 mt-1">
                Manage your service bookings and appointments
              </p>
            </div>
            <div className="flex items-center space-x-4 mt-4 lg:mt-0">
              <div className="text-sm text-gray-600">
                Total: <span className="font-semibold">{bookings.length}</span>{" "}
                bookings
              </div>
            </div>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setStatusFilter(option.value)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === option.value
                    ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                    : "text-gray-600 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                <span>{option.label}</span>
                <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                  {option.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="relative flex-1 lg:max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="form-input"
              >
                <option value="scheduledAt">Date</option>
                <option value="serviceDetails.name">Service</option>
                <option value="status">Status</option>
                <option value="payment.amount">Amount</option>
              </select>

              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="form-input"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No bookings found
              </h3>
              <p className="text-gray-600">
                {searchTerm
                  ? "Try adjusting your search criteria"
                  : "No bookings match the selected filters"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredBookings.map((booking) => {
                const StatusIcon = getStatusIcon(booking.status);
                const availableActions = getAvailableActions(booking.status);

                return (
                  <div
                    key={booking._id}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {booking.serviceDetails.name}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {booking.serviceDetails.description}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                                booking.status
                              )}`}
                            >
                              <StatusIcon className="h-4 w-4 mr-1" />
                              {booking.status}
                            </span>
                            {availableActions.length > 0 && (
                              <div className="relative">
                                <button
                                  onClick={() =>
                                    setShowStatusMenu(
                                      showStatusMenu === booking._id
                                        ? null
                                        : booking._id
                                    )
                                  }
                                  className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                                {showStatusMenu === booking._id && (
                                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                                    {availableActions.map((action) => (
                                      <button
                                        key={action}
                                        onClick={() =>
                                          handleStatusUpdate(
                                            booking._id,
                                            action
                                          )
                                        }
                                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                      >
                                        Mark as {action}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2" />
                            {booking.user?.username || "Unknown User"}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            {new Date(booking.scheduledAt).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            {new Date(booking.scheduledAt).toLocaleTimeString()}
                          </div>
                          <div className="flex items-center">
                            <span className="text-lg font-semibold text-green-600">
                              ${booking.payment.amount}
                            </span>
                          </div>
                        </div>

                        {booking.location && (
                          <div className="flex items-center mt-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mr-2" />
                            {booking.location.addressLine1},{" "}
                            {booking.location.city}
                          </div>
                        )}

                        {booking.notes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Notes:</span>{" "}
                              {booking.notes}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center space-x-4">
                            <span className="text-xs text-gray-500">
                              Created:{" "}
                              {new Date(booking.createdAt).toLocaleDateString()}
                            </span>
                            {booking.payment.isPaid && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                Paid
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <button className="btn btn-outline btn-sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </button>
                            <button className="btn btn-outline btn-sm">
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Message
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Bookings;
