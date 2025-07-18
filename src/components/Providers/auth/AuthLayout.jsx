"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useServiceProviderStore from "@/store/serviceStore";

const AuthLayout = ({ children }) => {
  const router = useRouter();
  const { isAuthenticated, loadServiceProvider } = useServiceProviderStore();

  useEffect(() => {
    // Try to load service provider from token on mount
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("service_provider_token="))
      ?.split("=")[1];

    if (token && !isAuthenticated) {
      loadServiceProvider().catch(() => {
        // Token is invalid or expired, redirect to login
        router.push("/service-provider/auth/login");
      });
    }
  }, [isAuthenticated, loadServiceProvider, router]);

  return (
    <div className="auth-layout">
      {children}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default AuthLayout;
