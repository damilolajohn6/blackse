export const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatDateTime = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatCurrency = (amount, currency = "USD") => {
  if (!amount) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

export const formatPhoneNumber = (countryCode, number) => {
  if (!number) return "";
  return `${countryCode} ${number}`;
};

export const getInitials = (firstName, lastName) => {
  if (!firstName && !lastName) return "";
  return `${firstName?.charAt(0) || ""}${
    lastName?.charAt(0) || ""
  }`.toUpperCase();
};

export const truncateText = (text, maxLength = 100) => {
  if (!text) return "";
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

export const getStatusColor = (status) => {
  const colors = {
    Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Confirmed: "bg-blue-100 text-blue-800 border-blue-200",
    InProgress: "bg-indigo-100 text-indigo-800 border-indigo-200",
    Completed: "bg-green-100 text-green-800 border-green-200",
    Cancelled: "bg-red-100 text-red-800 border-red-200",
    Declined: "bg-gray-100 text-gray-800 border-gray-200",
    NoShow: "bg-orange-100 text-orange-800 border-orange-200",
    Refunded: "bg-purple-100 text-purple-800 border-purple-200",
  };
  return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validatePhoneNumber = (phone) => {
  const phoneRegex = /^\d{7,15}$/;
  return phoneRegex.test(phone);
};

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};
