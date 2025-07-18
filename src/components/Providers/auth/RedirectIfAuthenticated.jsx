
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useServiceProviderStore from "@/store/serviceStore";

const RedirectIfAuthenticated = ({ children }) => {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useServiceProviderStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/service-provider/dashboard");
    }
  }, [isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return children;
};

export default RedirectIfAuthenticated;
