"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useServiceProviderStore from "../store/serviceProviderStore";

export const useAuth = () => {
  const router = useRouter();
  const {
    serviceProvider,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    loadServiceProvider,
    clearError,
  } = useServiceProviderStore();

  const [authState, setAuthState] = useState({
    isLoading: false,
    error: null,
  });

  // Login with error handling
  const handleLogin = async (credentials) => {
    setAuthState({ isLoading: true, error: null });
    try {
      await login(credentials);
      router.push("/service-provider/dashboard");
    } catch (error) {
      setAuthState({ isLoading: false, error: error.message });
      throw error;
    }
  };

  // Register with error handling
  const handleRegister = async (data) => {
    setAuthState({ isLoading: true, error: null });
    try {
      await register(data);
      router.push(
        `/service-provider/auth/activate?email=${encodeURIComponent(
          data.email
        )}`
      );
    } catch (error) {
      setAuthState({ isLoading: false, error: error.message });
      throw error;
    }
  };

  // Logout with redirect
  const handleLogout = async () => {
    try {
      await logout();
      router.push("/service-provider/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Force redirect even if logout fails
      router.push("/service-provider/auth/login");
    }
  };

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated) {
        try {
          await loadServiceProvider();
        } catch (error) {
          console.error("Auth check failed:", error);
        }
      }
    };

    checkAuth();
  }, [isAuthenticated, loadServiceProvider]);

  return {
    serviceProvider,
    isAuthenticated,
    isLoading: isLoading || authState.isLoading,
    error: error || authState.error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    clearError,
  };
};
