"use client";

import Header from "@/components/Layout/Header";
import Footer from "@/components/Footer";
import SocialDashboard from "@/components/Social/SocialDashboard";
import useAuthStore from "@/store/authStore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const SocialPage = () => {
  const { isAuthenticated, isLoading, token, checkAuth } = useAuthStore();
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const verifyAuth = async () => {
      if (!isLoading && !authChecked) {
        if (!token) {
          console.warn("SocialPage: No token, redirecting to login");
          router.push("/login");
          return;
        }

        const { success } = await checkAuth();
        if (!success || !isAuthenticated) {
          console.warn(
            "SocialPage: Invalid token or not authenticated, redirecting to login"
          );
          router.push("/login");
        }
        setAuthChecked(true);
      }
    };

    verifyAuth();
  }, [isAuthenticated, isLoading, token, checkAuth, router, authChecked]);

  if (isLoading || !authChecked || !isAuthenticated) {
    return <div className="text-center py-12">Loading...</div>;
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
