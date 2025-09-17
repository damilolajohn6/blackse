"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import useInstructorStore from "@/store/instructorStore";
import { toast } from "react-toastify";
import { Box, CircularProgress, Typography } from "@mui/material";

// Helper function to get cookie value
const getCookie = (name) => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

export default function InstructorAuthProvider({ children }) {
  const { 
    loadInstructor, 
    checkInstructorAuth, 
    isInstructor, 
    instructor, 
    instructorToken,
    isLoading,
    isTokenValid,
    refreshToken,
    clearInstructorData
  } = useInstructorStore();
  
  const [isInitializing, setIsInitializing] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const authInitialized = useRef(false);
  const initializationPromise = useRef(null);

  // Define public routes that don't require authentication
  const publicRoutes = [
    '/instructor/auth/login',
    '/instructor/auth/register',
    '/instructor/auth/forgot-password',
    '/instructor/auth/reset-password',
    '/instructor/auth/activation'
  ];

  // Define routes that require authentication but allow non-approved instructors
  const pendingApprovalRoutes = [
    '/instructor/pending-approval',
    '/instructor/register/activation'
  ];

  // Check if current route is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  // Check if current route allows pending approval
  const isPendingApprovalRoute = pendingApprovalRoutes.some(route => pathname.startsWith(route));

  // Set client-side state to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Enhanced authentication initialization with proper error handling
  const initializeAuth = useCallback(async () => {
    // Skip authentication for public routes
    if (isPublicRoute) {
      console.log("Public route detected, skipping authentication");
      setIsInitializing(false);
      authInitialized.current = true;
      return { success: true };
    }

    // Prevent multiple simultaneous initializations
    if (initializationPromise.current) {
      console.log("Authentication already in progress, waiting...");
      return initializationPromise.current;
    }

    // If already authenticated and approved, skip re-authentication
    if (authInitialized.current && isInstructor && instructor?.approvalStatus?.isInstructorApproved) {
      console.log("Already authenticated and approved, skipping");
      setIsInitializing(false);
      return { success: true };
    }

    // If we have instructor data and token, don't re-authenticate
    if (instructor && instructorToken && !authError) {
      console.log("Already have instructor data, skipping re-authentication");
      setIsInitializing(false);
      authInitialized.current = true;
      return { success: true };
    }

    // If we're on dashboard route and have token but no instructor data, let DashboardLayout handle it
    if (pathname.startsWith('/instructor/dashboard') && instructorToken && !instructor) {
      console.log("Dashboard route with token but no instructor data, letting DashboardLayout handle it");
      setIsInitializing(false);
      return { success: false, message: "Let DashboardLayout handle authentication" };
    }

    // Create initialization promise to prevent concurrent calls
    initializationPromise.current = (async () => {
      try {
        setIsInitializing(true);
        setAuthError(null);

        // Check for token
        const token = instructorToken || localStorage.getItem("instructor_token") || getCookie("instructor_token");
        
        console.log("Token check:", { 
          hasToken: !!token,
          storeToken: !!instructorToken,
          localStorage: !!localStorage.getItem("instructor_token"),
          cookie: !!getCookie("instructor_token")
        });
        
        if (!token) {
          console.log("No token found");
          if (!isPendingApprovalRoute) {
            router.push("/instructor/auth/login");
          }
          return { success: false, message: "No token found" };
        }

        // Validate and refresh token if needed
        if (!isTokenValid()) {
          console.log("Token invalid, attempting refresh");
          const refreshResult = await refreshToken();
          if (!refreshResult.success) {
            console.log("Token refresh failed, clearing data");
            clearInstructorData();
            if (!isPendingApprovalRoute) {
              router.push("/instructor/auth/login");
            }
            return { success: false, message: "Token refresh failed" };
          }
        }

        // Load instructor data
        const result = await loadInstructor();
        
        if (!result.success) {
          console.log("Failed to load instructor data:", result.message);
          // Only clear data and redirect for auth errors, not network errors
          if (result.message?.includes('401') || result.message?.includes('403') || result.message?.includes('unauthorized') || result.message?.includes('Invalid') || result.message?.includes('expired') || result.message?.includes('not found') || result.message?.includes('Authentication failed')) {
            clearInstructorData();
            if (!isPendingApprovalRoute) {
              router.push("/instructor/auth/login");
            }
          } else if (result.message?.includes('Network error') || result.message?.includes('Network Error') || result.message?.includes('CONNECTION_REFUSED')) {
            // For network errors, show error but don't redirect
            setAuthError("Unable to connect to server. Please check your internet connection and try again.");
          } else {
            // For other errors, show error but don't redirect
            setAuthError(result.message || "Failed to load instructor data");
          }
          return result;
        }

        const loadedInstructor = result.instructor;
        
        // Handle approval status routing
        if (loadedInstructor && !loadedInstructor.approvalStatus?.isInstructorApproved) {
          console.log("Instructor not approved, checking route");
          if (!isPendingApprovalRoute) {
            router.push("/instructor/pending-approval");
          }
          return { success: true, approved: false };
        }

        // If on pending approval page but instructor is approved, redirect to dashboard
        if (isPendingApprovalRoute && loadedInstructor?.approvalStatus?.isInstructorApproved) {
          console.log("Instructor is approved, redirecting to dashboard");
          router.push("/instructor/dashboard");
          return { success: true, approved: true };
        }

        console.log("Authentication successful");
        authInitialized.current = true;
        return { success: true, approved: true };
        
      } catch (error) {
        console.error("Authentication initialization error:", error);
        setAuthError(error.message);
        
        // Only clear data and redirect for certain types of errors
        if (error.response?.status === 401 || error.response?.status === 403 || error.message?.includes('Invalid') || error.message?.includes('expired')) {
          clearInstructorData();
          if (!isPendingApprovalRoute) {
            toast.error("Authentication failed. Please log in again.");
            router.push("/instructor/auth/login");
          }
        }
        
        return { success: false, message: error.message };
      } finally {
        setIsInitializing(false);
        initializationPromise.current = null;
      }
    })();

    return initializationPromise.current;
  }, [
    isPublicRoute, 
    isPendingApprovalRoute, 
    isInstructor, 
    instructor, 
    instructorToken, 
    isTokenValid, 
    refreshToken, 
    clearInstructorData, 
    loadInstructor, 
    router,
    pathname,
    authError
  ]);

  // Initialize authentication on mount and route changes
  useEffect(() => {
    if (isClient) {
      // Reset auth state on route change to protected routes
      if (!isPublicRoute) {
        authInitialized.current = false;
      }
      
      // Only initialize if not already authenticated
      if (!authInitialized.current && !isInitializing) {
        initializeAuth();
      }
    }
  }, [isClient, pathname]);

  // Handle token expiration check
  useEffect(() => {
    if (!instructorToken || isPublicRoute) return;

    const checkTokenExpiration = async () => {
      if (!isTokenValid()) {
        console.log("Token expired, attempting refresh");
        const result = await refreshToken();
        if (!result.success) {
          console.log("Token refresh failed, logging out");
          clearInstructorData();
          if (!isPublicRoute && !isPendingApprovalRoute) {
            toast.error("Session expired. Please log in again.");
            router.push("/instructor/auth/login");
          }
        }
      }
    };

    // Check immediately and then every 5 minutes
    checkTokenExpiration();
    const interval = setInterval(checkTokenExpiration, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [instructorToken, isTokenValid, refreshToken, clearInstructorData, router, isPublicRoute]);

  // Show loading spinner during initialization (but not for public routes and only on client)
  // Only show if we don't have instructor data yet to avoid conflicts with DashboardLayout
  if (isClient && isInitializing && !isPublicRoute && !instructor) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#f8fafc",
        }}
      >
        <CircularProgress size={60} sx={{ color: "#3b82f6" }} />
        <Typography 
          variant="h6" 
          sx={{ 
            mt: 2, 
            color: "#64748b",
            fontFamily: "Poppins, sans-serif"
          }}
        >
          Authenticating...
        </Typography>
      </Box>
    );
  }

  // Show error state if authentication failed (only on client)
  if (isClient && authError && !isPublicRoute) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#fef2f2",
          padding: 3,
        }}
      >
        <Typography 
          variant="h5" 
          sx={{ 
            color: "#dc2626",
            fontFamily: "Poppins, sans-serif",
            mb: 2
          }}
        >
          Authentication Error
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: "#7f1d1d",
            fontFamily: "Poppins, sans-serif",
            textAlign: "center",
            mb: 3
          }}
        >
          {authError}
        </Typography>
        <button
          onClick={() => {
            setAuthError(null);
            authInitialized.current = false;
            initializeAuth();
          }}
          style={{
            padding: "12px 24px",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontFamily: "Poppins, sans-serif",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Try Again
        </button>
      </Box>
    );
  }

  // Render children if authenticated or on public route
  return <>{children}</>;
}
