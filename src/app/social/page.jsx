"use client";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Footer";
import SocialDashboard from "@/components/Social/SocialDashboard";
import useAuthStore from "@/store/authStore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "../social-loader.css";

const SocialPage = () => {
  const { isAuthenticated, isLoading, token, checkAuth } = useAuthStore();
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const verifyAuth = async () => {
      if (!isLoading && !authChecked) {
        console.log("TOKEN", token)
        if (!token) {
          console.warn("SocialPage: No token, redirecting to login");
          router.push("/login");
          return;
        }

        const { success } = await checkAuth();
        if (!success) {
          console.warn("SocialPage: Invalid token, redirecting to login");
          router.push("/login");
        }

        setAuthChecked(true);
      }
    };

    verifyAuth();
  }, [isLoading, token, checkAuth, router, authChecked]);

  if (isLoading || !authChecked || !isAuthenticated) {
    return <div className="social-loader min-h-screen grid place-content-center">
      <svg viewBox="25 25 50 50">
        <circle r="20" cy="50" cx="50"></circle>
      </svg>
    </div>;
  }

  return (
    <div>
      <Header />
      <SocialDashboard />
      <Footer />
    </div>
  );
};

export default SocialPage;
