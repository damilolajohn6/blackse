"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import useAuthStore from "@/store/authStore";
import { toast } from "react-toastify";

export default function InstructorAuthProvider({ children }) {
  const { isInstructor, checkInstructorAuth, isLoading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const isMounted = useRef(false);
  const [authError, setAuthError] = useState(null);

  // Define public routes that don't require authentication
  const publicRoutes = [
    "/instructor/login",
    "/instructor/register",
    "/instructor/register/activation",
    "/instructor/forgot-password",
    "/instructor/reset-password",
  ];

  useEffect(() => {
    if (isMounted.current) return;
    isMounted.current = true;

    // Skip authentication check for public routes
    if (publicRoutes.some((route) => pathname.startsWith(route))) {
      return;
    }

    const verifyAuth = async () => {
      try {
        console.log(
          "InstructorAuthProvider: Checking cookies",
          document.cookie
        );
        // Add timeout to API call (10 seconds)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const result = await checkInstructorAuth({ signal: controller.signal });
        clearTimeout(timeoutId);

        if (!result.success) {
          setAuthError(
            result.message || "Failed to authenticate. Please log in again."
          );
          toast.error("Please log in to access this page", {
            toastId: "auth-error",
          });
          router.push("/instructor/login");
        }
      } catch (error) {
        console.error("InstructorAuthProvider: Authentication error", {
          message: error.message,
          cookies: document.cookie ? "present" : "missing",
          stack: error.stack,
        });
        if (error.name === "AbortError") {
          setAuthError("Authentication request timed out. Please try again.");
          toast.error("Authentication timed out. Please try again.", {
            toastId: "auth-error",
          });
        } else {
          setAuthError("Failed to authenticate. Please log in again.");
          toast.error("Authentication failed. Please log in again.", {
            toastId: "auth-error",
          });
        }
        router.push("/instructor/login");
      }
    };

    verifyAuth();
  }, [checkInstructorAuth, router, pathname]);

  if (isLoading && !publicRoutes.some((route) => pathname.startsWith(route))) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  if (authError && !publicRoutes.some((route) => pathname.startsWith(route))) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-600 text-center">
          <p>{authError}</p>
          <a href="/instructor/login" className="text-blue-600 underline">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
