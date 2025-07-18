"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";
import useServiceProviderStore from "@/store/serviceStore";

const AuthGuard = ({ children, requireAuth = true }) => {
  const router = useRouter();
  const { isAuthenticated, isLoading, loadServiceProvider, serviceProvider } =
    useServiceProviderStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        // Check if we have a token in cookies
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("service_provider_token="))
          ?.split("=")[1];

        if (token && !isAuthenticated) {
          await loadServiceProvider();
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        if (requireAuth) {
          router.push("/service-provider/auth/login");
        }
      } finally {
        setIsChecking(false);
      }
    };

    checkAuthentication();
  }, [isAuthenticated, loadServiceProvider, router, requireAuth]);

  useEffect(() => {
    if (!isChecking && !isLoading) {
      if (requireAuth && !isAuthenticated) {
        router.push("/service-provider/auth/login");
      } else if (!requireAuth && isAuthenticated) {
        router.push("/service-provider/dashboard");
      }
    }
  }, [isChecking, isLoading, isAuthenticated, requireAuth, router]);

  // Show loading while checking authentication
  if (isChecking || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <Loader className="h-12 w-12 animate-spin text-indigo-600 mx-auto" />
            <p className="mt-4 text-gray-600 text-lg">
              Checking authentication...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Don't render anything if redirecting
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (!requireAuth && isAuthenticated) {
    return null;
  }

  return children;
};

export default AuthGuard;