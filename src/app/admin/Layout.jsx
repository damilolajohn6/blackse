"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import AdminHeader from "@/components/AdminHeader";
import { Box, CssBaseline } from "@mui/material";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useAdminStore from "@/store/adminStore";

export default function AdminLayout({ children }) {
  const { isAdmin, loadAdmin, isLoading } = useAdminStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAdmin && !isLoading) {
      loadAdmin().catch(() => router.push("/admin/login"));
    }
  }, [isAdmin, isLoading, loadAdmin, router]);

  if (isLoading) {
    return <Box>Loading...</Box>;
  }

  if (!isAdmin) {
    return null; // Redirect handled by useEffect
  }

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AdminSidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <AdminHeader />
        {children}
      </Box>
      <ToastContainer position="top-right" autoClose={3000} />
    </Box>
  );
}
