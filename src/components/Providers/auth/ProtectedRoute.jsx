"use client"
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";
import useServiceProviderStore from "@/store/serviceStore";

const ProtectedRoute = ({ children }) => {
  const router = useRouter();
  const { isAuthenticated, isLoading, loadServiceProvider } =
    useServiceProviderStore();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await loadServiceProvider();
      } catch (error) {
        router.push("/service-provider/auth/login");
      }
    };

    if (!isAuthenticated) {
      checkAuth();
    }
  }, [isAuthenticated, loadServiceProvider, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-indigo-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return children;
};

export default ProtectedRoute;
