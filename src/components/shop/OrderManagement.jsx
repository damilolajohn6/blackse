"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import useAuthStore from "@/store/authStore";
import useOrderStore from "@/store/orderStore";
import {
  FaSpinner,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import Image from "next/image";

const statusOptions = [
  "Processing",
  "Transferred to delivery partner",
  "Shipped",
  "Delivered",
  "Refund Requested",
  "Refund Success",
  "Cancelled",
];

export default function OrderManagement() {
  const router = useRouter();
  const { seller, isSeller, sellerToken } = useAuthStore();
  const {
    orders,
    isLoading,
    error,
    total,
    page,
    pages,
    fetchSellerOrders,
    updateOrderStatus,
    approveRefund,
  } = useOrderStore();

  const [filterStatus, setFilterStatus] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [reason, setReason] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // "status" or "refund"

  useEffect(() => {
    if (!isSeller || !seller?._id) {
      toast.error("Please log in to manage orders", { toastId: "auth-error" });
      router.push("/shop/login");
      return;
    }

    const loadOrders = async () => {
      try {
        await fetchSellerOrders(seller._id, sellerToken, {
          status: filterStatus,
        });
      } catch (err) {
        console.error("Fetch orders error:", {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
        });
        toast.error(err.response?.data?.message || "Failed to load orders", {
          toastId: "fetch-error",
        });
      }
    };

    loadOrders();
  }, [seller, isSeller, sellerToken, filterStatus, fetchSellerOrders, router]);

  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
  };

  const handleStatusUpdate = async () => {
    if (!newStatus) {
      toast.error("Please select a status", { toastId: "status-error" });
      return;
    }
    try {
      await updateOrderStatus(
        selectedOrder._id,
        newStatus,
        reason,
        sellerToken
      );
      toast.success("Order status updated successfully");
      setShowModal(false);
      setSelectedOrder(null);
      setNewStatus("");
      setReason("");
    } catch (error) {
      console.error("Update status error:", {
        message: error.message,
        orderId: selectedOrder._id,
        status: newStatus,
      });
      toast.error(error.message || "Failed to update status", {
        toastId: "update-error",
      });
    }
  };

  const handleRefundApprove = async () => {
    if (!reason) {
      toast.error("Please provide a reason for the refund", {
        toastId: "refund-error",
      });
      return;
    }
    try {
      await approveRefund(selectedOrder._id, reason, sellerToken);
      toast.success("Refund approved successfully");
      setShowModal(false);
      setSelectedOrder(null);
      setReason("");
    } catch (error) {
      console.error("Approve refund error:", {
        message: error.message,
        orderId: selectedOrder._id,
      });
      toast.error(error.message || "Failed to approve refund", {
        toastId: "refund-error",
      });
    }
  };

  const openModal = (order, type, status = "") => {
    setSelectedOrder(order);
    setModalType(type);
    setNewStatus(status);
    setReason("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
    setNewStatus("");
    setReason("");
  };

  const handlePageChange = async (newPage) => {
    try {
      await fetchSellerOrders(seller._id, sellerToken, {
        page: newPage,
        status: filterStatus,
      });
    } catch (error) {
      toast.error("Failed to load orders", { toastId: "page-error" });
    }
  };

  return (
    <div className="py-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Order Management
      </h1>

      {/* Filter */}
      <div className="mb-6 flex items-center space-x-4">
        <label
          htmlFor="statusFilter"
          className="text-sm font-medium text-gray-700"
        >
          Filter by Status:
        </label>
        <select
          id="statusFilter"
          value={filterStatus}
          onChange={handleFilterChange}
          className="border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <option value="">All</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="text-center">
          <FaSpinner className="animate-spin h-8 w-8 mx-auto text-blue-600" />
          <p className="text-gray-600 mt-2">Loading orders...</p>
        </div>
      ) : error ? (
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() =>
              fetchSellerOrders(seller._id, sellerToken, {
                status: filterStatus,
              })
            }
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      ) : orders.length === 0 ? (
        <p className="text-center text-gray-600">No orders found.</p>
      ) : (
        <>
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order._id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.user.name} ({order.user.email})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${order.totalPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.status}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => openModal(order, "status")}
                        className="text-blue-600 hover:text-blue-800 mr-4"
                      >
                        Update Status
                      </button>
                      {order.status === "Refund Requested" && (
                        <button
                          onClick={() => openModal(order, "refund")}
                          className="text-green-600 hover:text-green-800"
                        >
                          Handle Refund
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex justify-between items-center">
            <p className="text-sm text-gray-700">
              Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, total)} of{" "}
              {total} orders
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <FaChevronLeft />
              </button>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === pages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal for Status Update / Refund */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {modalType === "status" ? "Update Order Status" : "Handle Refund"}
            </h2>
            {modalType === "status" ? (
              <>
                <label
                  htmlFor="newStatus"
                  className="block text-sm font-medium text-gray-700"
                >
                  New Status
                </label>
                <select
                  id="newStatus"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select status</option>
                  {statusOptions
                    .filter(
                      (status) =>
                        selectedOrder &&
                        STATUS_TRANSITIONS[selectedOrder.status]?.includes(
                          status
                        )
                    )
                    .map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                </select>
                <label
                  htmlFor="reason"
                  className="block text-sm font-medium text-gray-700 mt-4"
                >
                  Reason (optional)
                </label>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </>
            ) : (
              <>
                <p className="text-sm text-gray-600 mb-4">
                  Refund Reason: {selectedOrder.refundReason}
                </p>
                <label
                  htmlFor="reason"
                  className="block text-sm font-medium text-gray-700"
                >
                  Approval Reason
                </label>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </>
            )}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={
                  modalType === "status"
                    ? handleStatusUpdate
                    : handleRefundApprove
                }
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                {modalType === "status" ? "Update" : "Approve Refund"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
