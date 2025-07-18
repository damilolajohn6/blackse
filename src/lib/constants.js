export const AUTH_ROUTES = {
  LOGIN: "/service-provider/auth/login",
  REGISTER: "/service-provider/auth/register",
  ACTIVATE: "/service-provider/auth/activate",
  FORGOT_PASSWORD: "/service-provider/auth/forgot-password",
  RESET_PASSWORD: "/service-provider/auth/reset-password",
};

export const DASHBOARD_ROUTES = {
  DASHBOARD: "/service-provider/dashboard",
  BOOKINGS: "/service-provider/bookings",
  MESSAGES: "/service-provider/messages",
  SERVICES: "/service-provider/services",
  REVIEWS: "/service-provider/reviews",
  PROFILE: "/service-provider/profile",
  SETTINGS: "/service-provider/settings",
  ANALYTICS: "/service-provider/analytics",
};

export const SERVICE_CATEGORIES = [
  "Plumbing",
  "Electrical",
  "Carpentry",
  "Cleaning",
  "Gardening",
  "HVAC",
  "Painting",
  "Appliance Repair",
  "Handyman",
  "Moving",
  "Pet Care",
  "Tutoring",
  "Personal Training",
  "Beauty Services",
  "Automotive",
  "Computer Repair",
  "Photography",
  "Catering",
  "Event Planning",
  "Other",
];

export const COUNTRY_CODES = [
  { code: "+1", country: "US/CA", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+234", country: "Nigeria", flag: "🇳🇬" },
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+86", country: "China", flag: "🇨🇳" },
  { code: "+33", country: "France", flag: "🇫🇷" },
  { code: "+49", country: "Germany", flag: "🇩🇪" },
  { code: "+81", country: "Japan", flag: "🇯🇵" },
  { code: "+82", country: "South Korea", flag: "🇰🇷" },
  { code: "+55", country: "Brazil", flag: "🇧🇷" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
  { code: "+27", country: "South Africa", flag: "🇿🇦" },
];

export const BOOKING_STATUSES = [
  { value: "Pending", label: "Pending", color: "yellow" },
  { value: "Confirmed", label: "Confirmed", color: "blue" },
  { value: "InProgress", label: "In Progress", color: "indigo" },
  { value: "Completed", label: "Completed", color: "green" },
  { value: "Cancelled", label: "Cancelled", color: "red" },
  { value: "Declined", label: "Declined", color: "gray" },
  { value: "NoShow", label: "No Show", color: "orange" },
  { value: "Refunded", label: "Refunded", color: "purple" },
];

export const PRICING_TYPES = [
  { value: "flat", label: "Flat Rate" },
  { value: "hourly", label: "Hourly Rate" },
];
