"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";
import useShopStore from "@/store/shopStore";
import useOrderStore from "@/store/orderStore";
import {
  FaSpinner,
  FaArrowLeft,
  FaUser,
  FaMapMarkerAlt,
  FaCreditCard,
  FaBox,
  FaTruck,
  FaHistory,
  FaEdit,
  FaCheck,
  FaTimes,
  FaDownload,
  FaPhone,
  FaEnvelope,
  FaCalendarAlt,
} from "react-icons/fa";

const STATUS_COLORS = {
  Pending: "bg-yellow-100 text-yellow-800",
  Confirmed: "bg-blue-100 text-blue-800",
  Shipped: "bg-purple-100 text-purple-800",
  Delivered: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
  "Refund Requested": "bg-orange-100 text-orange-800",
  "Refund Success": "bg-gray-100 text-gray-800",
};

const STATUS_TRANSITIONS = {
  Pending: ["Confirmed", "Cancelled"],
  Confirmed: ["Shipped", "Cancelled"],
  Shipped: ["Delivered"],
  Delivered: ["Refund Requested"],
  "Refund Requested": ["Refund Success"],
  "Refund Success": [],
  Cancelled: [],
};

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

const OrderDetails = () => {
  const params = useParams();
  const { user, token, seller } = useShopStore();
  const { updateOrderStatus, approveRefund } = useOrderStore();

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [reason, setReason] = useState("");
  const [courier, setCourier] = useState("");
  const [courierSlug, setCourierSlug] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundReason, setRefundReason] = useState("");

  const orderId = params.id;

  useEffect(() => {
    if (orderId ) {
      fetchOrderDetails();
    }
  }, [orderId, token]);

  const fetchOrderDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_SERVER || "http://localhost:8000/api/v2/"
        }/order/provider/order/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch order details");
      }

      const data = await response.json();
      setOrder(data.order);
    } catch (err) {
      setError(err.message);
      toast.error("Failed to fetch order details");
    } finally {
      setIsLoading(false);
    }
  };

  const openStatusModal = () => {
    setNewStatus("");
    setReason("");
    setCourier("");
    setCourierSlug("");
    setTrackingNumber("");
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openRefundModal = () => {
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
    if (!validateForm()) return;

    try {
      await updateOrderStatus(
        orderId,
        newStatus,
        reason,
        newStatus === "Shipped" ? courier : undefined,
        newStatus === "Shipped" ? courierSlug : undefined,
        newStatus === "Shipped" ? trackingNumber : undefined,
        token
      );
      toast.success("Order status updated successfully");
      setIsModalOpen(false);
      fetchOrderDetails();
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
      await approveRefund(orderId, refundReason, token);
      toast.success("Refund approved successfully");
      setIsRefundModalOpen(false);
      fetchOrderDetails();
    } catch (error) {
      toast.error(error.message || "Failed to approve refund");
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
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

  const generateInvoice = () => {
    const invoiceContent = `
      INVOICE
      Order ID: ${order._id}
      Date: ${formatDate(order.createdAt)}
      
      Customer: ${order.customer?.username || "N/A"}
      Email: ${order.customer?.email || "N/A"}
      
      Items:
      ${order.items
        .map(
          (item) =>
            `${item.name} x${item.quantity} - ${formatCurrency(
              item.price * item.quantity
            )}`
        )
        .join("\n")}
      
      Subtotal: ${formatCurrency(order.totalAmount - order.taxAmount)}
      Tax: ${formatCurrency(order.taxAmount)}
      Total: ${formatCurrency(order.totalAmount)}
      
      Status: ${order.status}
    `;

    const blob = new Blob([invoiceContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${order._id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
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

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-10">
          <FaSpinner className="animate-spin text-4xl text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-10">
          <h1 className="text-2xl font-bold text-red-600">Order Not Found</h1>
          <p className="text-gray-600 mt-2">
            {error || "Order details could not be loaded"}
          </p>
          <Link
            href="/shop/orders"
            className="mt-4 inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800"
          >
            <FaArrowLeft />
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/shop/orders"
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <FaArrowLeft />
            Back to Orders
          </Link>
          <h1 className="text-3xl font-bold">Order Details</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={generateInvoice}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FaDownload />
            Invoice
          </button>
          {STATUS_TRANSITIONS[order.status]?.length > 0 && (
            <button
              onClick={openStatusModal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaEdit />
              Update Status
            </button>
          )}
          {order.status === "Refund Requested" && (
            <button
              onClick={openRefundModal}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <FaCheck />
              Approve Refund
            </button>
          )}
        </div>
      </div>

      {/* Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold">
                  Order #{order._id.slice(-8)}
                </h2>
                <p className="text-gray-600">
                  Created on {formatDate(order.createdAt)}
                </p>
              </div>
              <span
                className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                  STATUS_COLORS[order.status]
                }`}
              >
                {order.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3">
                <FaCalendarAlt className="text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="font-medium">{formatDate(order.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FaBox className="text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Items</p>
                  <p className="font-medium">{order.items.length} item(s)</p>
                </div>
              </div>
              {order.courier && (
                <div className="flex items-center gap-3">
                  <FaTruck className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Courier</p>
                    <p className="font-medium">{order.courier}</p>
                  </div>
                </div>
              )}
              {order.trackingNumber && (
                <div className="flex items-center gap-3">
                  <FaTruck className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Tracking Number</p>
                    <p className="font-medium">{order.trackingNumber}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">Order Items</h3>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-600">
                        Type: {item.itemType} | Quantity: {item.quantity}
                      </p>
                      {item.discountApplied > 0 && (
                        <p className="text-sm text-green-600">
                          Discount: {formatCurrency(item.discountApplied)}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(item.price)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Total */}
            <div className="border-t pt-4 mt-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>
                    {formatCurrency(order.totalAmount - order.taxAmount)}
                  </span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-{formatCurrency(order.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>{formatCurrency(order.taxAmount)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FaUser className="text-gray-400" />
              Customer Information
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">
                  {order.customer?.username || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{order.customer?.email || "N/A"}</p>
              </div>
              {order.customer?.phone && (
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{order.customer.phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaMapMarkerAlt className="text-gray-400" />
                Shipping Address
              </h3>
              <div className="space-y-1">
                <p>{order.shippingAddress.address}</p>
                <p>{order.shippingAddress.city}</p>
                <p>{order.shippingAddress.zipCode}</p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </div>
          )}

          {/* Payment Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FaCreditCard className="text-gray-400" />
              Payment Information
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Payment Status</p>
                <p className="font-medium">
                  {order.paymentInfo?.status || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Type</p>
                <p className="font-medium">
                  {order.paymentInfo?.type || "N/A"}
                </p>
              </div>
              {order.paymentInfo?.id && (
                <div>
                  <p className="text-sm text-gray-600">Transaction ID</p>
                  <p className="font-medium text-xs break-all">
                    {order.paymentInfo.id}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status History */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FaHistory className="text-gray-400" />
          Status History
        </h3>
        <div className="space-y-4">
          {order.statusHistory?.map((status, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex-shrink-0">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    STATUS_COLORS[status.status]
                  }`}
                >
                  {status.status}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-medium">{status.status}</p>
                <p className="text-sm text-gray-600">
                  Updated by {status.updatedBy} ({status.updatedByModel})
                </p>
                {status.reason && (
                  <p className="text-sm text-gray-600 mt-1">
                    Reason: {status.reason}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {formatDate(status.updatedAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Refund History */}
      {order.refundHistory?.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">Refund History</h3>
          <div className="space-y-4">
            {order.refundHistory.map((refund, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Refund ID: {refund.refundId}</p>
                    <p className="text-sm text-gray-600">
                      Amount: {formatCurrency(refund.amount)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Status: {refund.status}
                    </p>
                    {refund.reason && (
                      <p className="text-sm text-gray-600 mt-1">
                        Reason: {refund.reason}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <p>Requested: {formatDate(refund.requestedAt)}</p>
                    {refund.processedAt && (
                      <p>Processed: {formatDate(refund.processedAt)}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {isModalOpen && (
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
                {STATUS_TRANSITIONS[order.status]?.map((status) => (
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
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {isRefundModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">Approve Refund</h2>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Order ID: {order._id.slice(-8)}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Amount: {formatCurrency(order.totalAmount)}
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
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Approve Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
