// SocialPage.jsx
"use client";

import Header from "@/components/Layout/Header";
import Footer from "@/components/Footer";
import SocialDashboard from "@/components/Social/SocialDashboard";
import useAuthStore from "@/store/authStore";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const SocialPage = () => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.warn("SocialPage: Redirecting to login");
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
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
