export const getAuthToken = () => {
  if (typeof window === "undefined") return null;
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("service_provider_token="))
    ?.split("=")[1];
  return token;
};

export const removeAuthToken = () => {
  if (typeof window === "undefined") return;

  document.cookie =
    "service_provider_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
};

export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};


export const isValidPassword = (password) => {
  return password && password.length >= 6;
};


export const isValidPhoneNumber = (phone) => {
  const phoneRegex = /^\d{7,15}$/;
  return phoneRegex.test(phone);
};


export const validateRegistrationData = (data) => {
  const errors = {};
  // Name validation
  if (!data.fullname?.firstName?.trim()) {
    errors.firstName = "First name is required";
  }
  if (!data.fullname?.lastName?.trim()) {
    errors.lastName = "Last name is required";
  }

  // Email validation
  if (!data.email) {
    errors.email = "Email is required";
  } else if (!isValidEmail(data.email)) {
    errors.email = "Please enter a valid email address";
  }

  // Password validation
  if (!data.password) {
    errors.password = "Password is required";
  } else if (!isValidPassword(data.password)) {
    errors.password = "Password must be at least 6 characters long";
  }

  // Confirm password validation
  if (!data.confirmPassword) {
    errors.confirmPassword = "Please confirm your password";
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  // Service validation
  if (!data.service) {
    errors.service = "Service category is required";
  }

  // Address validation
  if (!data.address?.zipCode) {
    errors.zipCode = "ZIP code is required";
  }

  // Phone validation (optional)
  if (
    data.phoneNumber?.number &&
    !isValidPhoneNumber(data.phoneNumber.number)
  ) {
    errors.phoneNumber = "Please enter a valid phone number";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
