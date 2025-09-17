// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_SERVER || "http://localhost:8000/api/v2",
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
};

// Cloudinary Configuration
export const CLOUDINARY_CONFIG = {
  CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "your_cloud_name",
  UPLOAD_PRESET: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "your_upload_preset",
};

// Development Configuration
export const DEV_CONFIG = {
  NODE_ENV: process.env.NODE_ENV || "development",
  DEBUG: process.env.NODE_ENV === "development",
};
