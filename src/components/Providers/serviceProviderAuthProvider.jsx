import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import useServiceProviderStore from "@/store/serviceStore";

const AuthContext = createContext(null);

export const ServiceProviderAuthProvider = ({ children }) => {
  const router = useRouter();
  const {
    serviceProvider,
    isAuthenticated,
    isLoading,
    error,
    loadServiceProvider,
    logout,
    clearError,
  } = useServiceProviderStore();

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated && !isLoading) {
        try {
          await loadServiceProvider();
        } catch (err) {
          // Redirect to login if not authenticated and not on public routes
          if (!["/login", "/register", "/activate"].includes(router.pathname)) {
            router.push("/login");
          }
        }
      }
    };

    checkAuth();
  }, [isAuthenticated, isLoading, loadServiceProvider, router]);

  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }, [logout, router]);

  // Clear error after a delay
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const authContextValue = {
    serviceProvider,
    isAuthenticated,
    isLoading,
    error,
    logout: handleLogout,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Higher-order component for protected routes
export const withAuth = (Component) => {
  return (props) => {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push("/login");
      }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
      return null;
    }

    return <Component {...props} />;
  };
};
