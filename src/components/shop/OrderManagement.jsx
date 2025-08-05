"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";
import useShopStore from "@/store/shopStore";
import useOrderStore from "@/store/orderStore";
import {
  FaSpinner,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
  FaEye,
  FaSearch,
  FaDownload,
  FaSync,
  FaSort,
  FaSortUp,
  FaSortDown,
} from "react-icons/fa";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const STATUS_TRANSITIONS = {
  Pending: ["Confirmed", "Cancelled"],
  Confirmed: ["Shipped", "Cancelled"],
  Shipped: ["Delivered"],
  Delivered: ["Refund Requested"],
  "Refund Requested": ["Refund Success"],
  "Refund Success": [],
  Cancelled: [],
};

const STATUS_COLORS = {
  Pending: "bg-yellow-100 text-yellow-800",
  Confirmed: "bg-blue-100 text-blue-800",
  Shipped: "bg-purple-100 text-purple-800",
  Delivered: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
  "Refund Requested": "bg-orange-100 text-orange-800",
  "Refund Success": "bg-gray-100 text-gray-800",
};

const statusOptions = [
  "Pending",
  "Confirmed",
  "Shipped",
  "Delivered",
  "Cancelled",
  "Refund Requested",
  "Refund Success",
];

// Updated courier options to match backend SUPPORTED_COURIERS
const courierOptions = [
  { name: "FedEx", slug: "fedex" },
  { name: "UPS", slug: "ups" },
  { name: "DHL Express", slug: "dhl-express" },
  { name: "USPS", slug: "usps" },
  { name: "Canada Post", slug: "canada-post" },
  { name: "Royal Mail", slug: "royal-mail" },
  { name: "OnTrac", slug: "ontrac" },
  { name: "Purolator", slug: "purolator" },
  { name: "Canpar", slug: "canpar" },
  { name: "Loomis Express", slug: "loomis-express" },
  { name: "Nationex", slug: "nationex" },
  { name: "Dicom", slug: "dicom" },
  { name: "DPD", slug: "dpd" },
  { name: "Hermes", slug: "hermes" },
  { name: "TNT", slug: "tnt" },
  { name: "GLS", slug: "gls" },
  { name: "Other", slug: "other" },
];

const OrderManagement = () => {
  const router = useRouter();
  const { user, token, seller } = useShopStore();
  const {
    orders,
    isLoading,
    error,
    total,
    page,
    pages,
    stats,
    fetchSellerOrders,
    updateOrderStatus,
    approveRefund,
    fetchShopStats,
  } = useOrderStore();

  const [filters, setFilters] = useState({
    status: "",
    startDate: "",
    endDate: "",
    search: "",
  });
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [reason, setReason] = useState("");
  const [courier, setCourier] = useState("");
  const [courierSlug, setCourierSlug] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundReason, setRefundReason] = useState("");

  // Debounced search
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (debouncedSearchTerm !== filters.search) {
      setFilters((prev) => ({ ...prev, search: debouncedSearchTerm }));
    }
  }, [debouncedSearchTerm, filters.search]);

  const fetchOrders = useCallback(
    (pageNum = page) => {
      if (seller?._id && token) {
        fetchSellerOrders(seller._id, token, {
          page: pageNum,
          limit,
          sortBy,
          sortOrder,
          ...filters,
        });
      }
    },
    [seller, token, page, limit, sortBy, sortOrder, filters, fetchSellerOrders]
  );

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (seller?._id && token) {
      fetchShopStats(seller._id, token);
    }
  }, [seller, token, fetchShopStats]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pages) {
      fetchOrders(newPage);
    }
  };

  const handleRefresh = () => {
    fetchOrders();
    if (seller?._id && token) {
      fetchShopStats(seller._id, token);
    }
  };

  const exportOrders = () => {
    const csvContent = [
      ["Order ID", "Customer", "Total", "Status", "Date", "Items"].join(","),
      ...orders.map((order) =>
        [
          order._id,
          order.customer?.username || "N/A",
          order.totalAmount.toFixed(2),
          order.status,
          formatDate(order.createdAt),
          order.items.length,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const openStatusModal = (order) => {
    setSelectedOrder(order);
    setNewStatus("");
    setReason("");
    setCourier("");
    setCourierSlug("");
    setTrackingNumber("");
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openRefundModal = (order) => {
    setSelectedOrder(order);
    setRefundReason("");
    setIsRefundModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!newStatus) {
      errors.status = "Please select a status";
    }
    if (newStatus === "Shipped") {
      if (!courier.trim()) {
        errors.courier = "Courier is required";
      } else if (courier.length < 2 || courier.length > 100) {
        errors.courier = "Courier name must be between 2 and 100 characters";
      }
      if (!courierSlug.trim()) {
        errors.courierSlug = "Courier slug is required";
      }
      if (!trackingNumber.trim()) {
        errors.trackingNumber = "Tracking number is required";
      } else if (trackingNumber.length < 5 || trackingNumber.length > 50) {
        errors.trackingNumber =
          "Tracking number must be between 5 and 50 characters";
      }
    }
    if (reason && reason.length > 500) {
      errors.reason = "Reason must not exceed 500 characters";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleStatusUpdate = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await updateOrderStatus(
        selectedOrder._id,
        newStatus,
        reason,
        newStatus === "Shipped" ? courier : undefined,
        newStatus === "Shipped" ? courierSlug : undefined,
        newStatus === "Shipped" ? trackingNumber : undefined,
        token
      );
      toast.success("Order status updated successfully");
      setIsModalOpen(false);
      fetchOrders();
    } catch (error) {
      toast.error(error.message || "Failed to update order status");
    }
  };

  const handleCourierChange = (selectedCourier) => {
    if (selectedCourier.slug === "other") {
      // For "Other" option, clear courier name so user can enter custom
      setCourier("");
      setCourierSlug("other");
    } else {
      setCourier(selectedCourier.name);
      setCourierSlug(selectedCourier.slug);
    }
  };

  const handleCustomCourierChange = (e) => {
    const courierName = e.target.value;
    setCourier(courierName);
    // Keep the slug as "other" for custom couriers
    setCourierSlug("other");
  };

  const handleRefundApproval = async () => {
    if (!refundReason.trim()) {
      toast.error("Please provide a reason for the refund");
      return;
    }

    try {
      await approveRefund(selectedOrder._id, refundReason, token);
      toast.success("Refund approved successfully");
      setIsRefundModalOpen(false);
      fetchOrders();
    } catch (error) {
      toast.error(error.message || "Failed to approve refund");
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return <FaSort className="text-gray-400" />;
    return sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />;
  };

  if (!seller) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-10">
          <h1 className="text-2xl font-bold text-red-600">
            Unauthorized Access
          </h1>
          <p className="text-gray-600 mt-2">
            You must be logged in as a seller to view this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Order Management</h1>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaSync />
            Refresh
          </button>
          <button
            onClick={exportOrders}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FaDownload />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
          <p className="text-2xl font-bold text-gray-900">
            {stats.totalOrders}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Pending Orders</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {stats.pendingOrders}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Total Sales</h3>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(stats.totalSales)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Recent Orders</h3>
          <p className="text-2xl font-bold text-blue-600">
            {stats.recentOrders}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Search Orders
            </Label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by order ID, customer..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </Label>
            <Select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </Label>
            <Input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <Input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Items per page
            </Label>
            <Select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={10}>10</SelectItem>
                <SelectItem value={25}>25</SelectItem>
                <SelectItem value={50}>50</SelectItem>
                <SelectItem value={100}>100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Error and Loading States */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      {isLoading && (
        <div className="text-center py-10">
          <FaSpinner className="animate-spin text-4xl text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading orders...</p>
        </div>
      )}

      {/* Orders Table */}
      {!isLoading && orders.length === 0 && (
        <div className="text-center py-10 bg-white rounded-lg shadow-sm border">
          <p className="text-gray-600">No orders found</p>
        </div>
      )}

      {!isLoading && orders.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("_id")}
                  >
                    <div className="flex items-center gap-2">
                      Order ID
                      {getSortIcon("_id")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("customer")}
                  >
                    <div className="flex items-center gap-2">
                      Customer
                      {getSortIcon("customer")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("totalAmount")}
                  >
                    <div className="flex items-center gap-2">
                      Total
                      {getSortIcon("totalAmount")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center gap-2">
                      Status
                      {getSortIcon("status")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("createdAt")}
                  >
                    <div className="flex items-center gap-2">
                      Date
                      {getSortIcon("createdAt")}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order._id.slice(-8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.customer?.username || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          STATUS_COLORS[order.status]
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.items.length} item(s)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/shop/orders/${order._id}`}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors"
                        >
                          <FaEye />
                        </Link>
                        {STATUS_TRANSITIONS[order.status]?.length > 0 && (
                          <button
                            onClick={() => openStatusModal(order)}
                            className="text-blue-600 hover:text-blue-900 ml-2 text-xs px-2 py-1 border border-blue-200 rounded hover:bg-blue-50 transition-colors"
                          >
                            Update
                          </button>
                        )}
                        {order.status === "Refund Requested" && (
                          <button
                            onClick={() => openRefundModal(order)}
                            className="text-green-600 hover:text-green-900 ml-2 text-xs px-2 py-1 border border-green-200 rounded hover:bg-green-50 transition-colors"
                          >
                            Approve Refund
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-between items-center mt-6 bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-sm text-gray-700">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)}{" "}
            of {total} orders
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="px-3 py-2 bg-gray-200 rounded-md disabled:opacity-50 hover:bg-gray-300 transition-colors"
            >
              <FaChevronLeft />
            </button>
            <span className="px-4 py-2 text-sm font-medium">
              Page {page} of {pages}
            </span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === pages}
              className="px-3 py-2 bg-gray-200 rounded-md disabled:opacity-50 hover:bg-gray-300 transition-colors"
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">Update Order Status</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Select status</option>
                {STATUS_TRANSITIONS[selectedOrder.status]?.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              {formErrors.status && (
                <p className="text-red-500 text-sm mt-1">{formErrors.status}</p>
              )}
            </div>
            {newStatus === "Shipped" && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Courier
                  </label>
                  <select
                    value={courier}
                    onChange={(e) => {
                      const selectedOption = courierOptions.find(
                        (option) => option.name === e.target.value
                      );
                      if (selectedOption) {
                        handleCourierChange(selectedOption);
                      }
                    }}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">Select a courier</option>
                    {courierOptions.map((option) => (
                      <option key={option.slug} value={option.name}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                  {/* Show custom input when "Other" is selected */}
                  {courierSlug === "other" && (
                    <input
                      type="text"
                      placeholder="Enter custom courier name"
                      value={courier}
                      onChange={handleCustomCourierChange}
                      className="mt-2 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  )}
                  {formErrors.courier && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.courier}
                    </p>
                  )}
                </div>

                {/* Remove the courier slug input field since it's handled automatically */}

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tracking Number
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Enter tracking number"
                  />
                  {formErrors.trackingNumber && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.trackingNumber}
                    </p>
                  )}
                </div>
              </>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason (Optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows="3"
                placeholder="Enter reason for status change"
              />
              {formErrors.reason && (
                <p className="text-red-500 text-sm mt-1">{formErrors.reason}</p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? <FaSpinner className="animate-spin" /> : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {isRefundModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">Approve Refund</h2>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Order ID: {selectedOrder._id}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Amount: {formatCurrency(selectedOrder.totalAmount)}
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Refund Reason
              </label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows="3"
                placeholder="Enter reason for approving this refund"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsRefundModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRefundApproval}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  "Approve Refund"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
