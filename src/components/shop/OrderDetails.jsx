"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-toastify";
import useAuthStore from "@/store/authStore";
import useOrderStore from "@/store/orderStore";
import {
  FaSpinner,
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaCheckCircle,
} from "react-icons/fa";

// Valid status transitions aligned with backend
const STATUS_TRANSITIONS = {
  Pending: ["Confirmed", "Cancelled"],
  Confirmed: ["Shipped", "Cancelled"],
  Shipped: ["Delivered"],
  Delivered: ["Refunded"],
  Cancelled: [],
  Refunded: [],
};

const statusOptions = [
  "Pending",
  "Confirmed",
  "Shipped",
  "Delivered",
  "Cancelled",
  "Refunded",
];

export default function OrderDetails() {
  const router = useRouter();
  const params = useParams();
  let orderId = params?.orderId;

  // Fallback to router.query if useParams fails
  if (!orderId && router.isReady) {
    orderId = router.query?.orderId;
  }

  const { seller, isSeller, sellerToken } = useAuthStore();
  const {
    order,
    isLoading,
    error,
    fetchSingleOrder,
    updateOrderStatus,
    approveRefund,
    deleteOrder,
  } = useOrderStore();

  const [newStatus, setNewStatus] = useState("");
  const [reason, setReason] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // "status", "refund", "delete"

  useEffect(() => {
    // Log initial state for debugging
    console.log("OrderDetails: Initial state", {
      orderId,
      isSeller,
      sellerId: seller?._id,
      hasSellerToken: !!sellerToken,
      routerQuery: router.query,
      routerIsReady: router.isReady,
    });

    // Validate orderId
    const isValidObjectId = (id) => {
      if (!id || typeof id !== "string") {
        console.error("OrderDetails: Invalid orderId type or value", { id });
        return false;
      }
      return /^[0-9a-fA-F]{24}$/.test(id);
    };

    if (!orderId || !isValidObjectId(orderId)) {
      console.error("OrderDetails: Invalid orderId detected", { orderId });
      toast.error("Invalid order ID", { toastId: "invalid-order-id" });
      router.push("/shop/orders");
      return;
    }

    if (!isSeller || !seller?._id || !sellerToken) {
      console.error("OrderDetails: Authentication failure", {
        isSeller,
        sellerId: seller?._id,
        hasSellerToken: !!sellerToken,
      });
      toast.error("Please log in to view order details", {
        toastId: "auth-error",
      });
      router.push("/shop/login");
      return;
    }

    const loadOrder = async () => {
      try {
        console.log("OrderDetails: Fetching order", {
          orderId,
          sellerId: seller._id,
        });
        await fetchSingleOrder(orderId, seller._id, sellerToken);
        console.log("OrderDetails: Fetch successful");
      } catch (err) {
        console.error("OrderDetails: Fetch order error", {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
          orderId,
          sellerId: seller._id,
        });
        toast.error(err.response?.data?.message || "Failed to load order", {
          toastId: "fetch-error",
        });
      }
    };

    // Only fetch if router is ready
    if (router.isReady) {
      loadOrder();
    }
  }, [seller, isSeller, sellerToken, orderId, fetchSingleOrder, router]);

  const handleStatusUpdate = async () => {
    if (!newStatus) {
      toast.error("Please select a status", { toastId: "status-error" });
      return;
    }
    try {
      console.log("OrderDetails: Updating status", { orderId, newStatus });
      await updateOrderStatus(orderId, newStatus, reason, sellerToken);
      toast.success("Order status updated successfully");
      setShowModal(false);
      setNewStatus("");
      setReason("");
      await fetchSingleOrder(orderId, seller._id, sellerToken);
    } catch (error) {
      console.error("OrderDetails: Update status error", {
        message: error.message,
        orderId,
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
      console.log("OrderDetails: Approving refund", { orderId });
      await approveRefund(orderId, reason, sellerToken);
      toast.success("Refund approved successfully");
      setShowModal(false);
      setReason("");
      await fetchSingleOrder(orderId, seller._id, sellerToken);
    } catch (error) {
      console.error("OrderDetails: Approve refund error", {
        message: error.message,
        orderId,
      });
      toast.error(error.message || "Failed to approve refund", {
        toastId: "refund-error",
      });
    }
  };

  const handleDeleteOrder = async () => {
    try {
      console.log("OrderDetails: Deleting order", { orderId });
      await deleteOrder(orderId, sellerToken);
      toast.success("Order deleted successfully");
      setShowModal(false);
      router.push("/shop/orders");
    } catch (error) {
      console.error("OrderDetails: Delete order error", {
        message: error.message,
        orderId,
      });
      toast.error(error.message || "Failed to delete order", {
        toastId: "delete-error",
      });
    }
  };

  const openModal = (type, status = "") => {
    setModalType(type);
    setNewStatus(status);
    setReason("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setNewStatus("");
    setReason("");
    setModalType("");
  };

  const getCustomerName = (customer) => {
    if (!customer) return "Unknown";
    if (customer.username) return customer.username;
    if (customer.fullname?.firstName || customer.fullname?.lastName) {
      return `${customer.fullname.firstName || ""} ${
        customer.fullname.lastName || ""
      }`.trim();
    }
    return "Unknown";
  };

  const getRefundReason = (order) => {
    const refundEntry = order?.statusHistory?.find(
      (entry) => entry.status === "Refunded"
    );
    return refundEntry?.reason || "No reason provided";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => fetchSingleOrder(orderId, seller._id, sellerToken)}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4">
        <p className="text-gray-600">Order not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      <button
        onClick={() => router.push("/shop/orders")}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
      >
        <FaArrowLeft className="mr-2" /> Back to Orders
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Order Details</h1>

      <div className="bg-white shadow-md rounded-lg p-6">
        {/* Order Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Order Information
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              <strong>Order ID:</strong> {order._id}
            </p>
            <p className="mt-1 text-sm text-gray-600">
              <strong>Customer:</strong> {getCustomerName(order.customer)} (
              {order.customer?.email || "Unknown"})
            </p>
            <p className="mt-1 text-sm text-gray-600">
              <strong>Status:</strong> {order.status}
            </p>
            <p className="mt-1 text-sm text-gray-600">
              <strong>Total:</strong> ${order.totalAmount?.toFixed(2) || "0.00"}
            </p>
            <p className="mt-1 text-sm text-gray-600">
              <strong>Payment Status:</strong> {order.paymentStatus}
            </p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Shipping Address
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {order.shippingAddress?.address}, {order.shippingAddress?.city},{" "}
              {order.shippingAddress?.country} {order.shippingAddress?.zipCode}
            </p>
          </div>
        </div>

        {/* Items */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Items</h2>
          <div className="mt-2 border-t border-gray-200">
            {order.items?.map((item, index) => (
              <div
                key={index}
                className="py-4 border-b border-gray-200 flex justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {item.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    Quantity: {item.quantity}
                  </p>
                </div>
                <p className="text-sm text-gray-600">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Status History */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Status History
          </h2>
          <div className="mt-2">
            {order.statusHistory?.map((history, index) => (
              <div key={index} className="py-2">
                <p className="text-sm text-gray-900">
                  <strong>{history.status}</strong> -{" "}
                  {new Date(history.updatedAt).toLocaleString()}
                </p>
                {history.reason && (
                  <p className="text-sm text-gray-600">
                    Reason: {history.reason}
                  </p>
                )}
              </div>
            ))}
          </div>
          Tn{" "}
        </div>

        {/* Actions */}
        <div className="flex space-x-4">
          <button
            onClick={() => openModal("status")}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <FaEdit className="mr-2" /> Update Status
          </button>
          {order.status === "Refunded" && (
            <button
              onClick={() => openModal("refund")}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              <FaCheckCircle className="mr-2" /> Approve Refund
            </button>
          )}
          <button
            onClick={() => openModal("delete")}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
          >
            <FaTrash className="mr-2" /> Delete Order
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {modalType === "status"
                ? "Update Order Status"
                : modalType === "refund"
                ? "Approve Refund"
                : "Delete Order"}
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
                    .filter((status) =>
                      STATUS_TRANSITIONS[order.status]?.includes(status)
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
            ) : modalType === "refund" ? (
              <>
                <p className="text-sm text-gray-600 mb-4">
                  Refund Reason: {getRefundReason(order)}
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
            ) : (
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to delete this order? This action cannot
                be undone.
              </p>
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
                    : modalType === "refund"
                    ? handleRefundApprove
                    : handleDeleteOrder
                }
                className={`px-4 py-2 text-white rounded-md text-sm font-medium ${
                  modalType === "delete"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {modalType === "status"
                  ? "Update"
                  : modalType === "refund"
                  ? "Approve Refund"
                  : "Delete Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
