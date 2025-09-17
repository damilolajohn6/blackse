"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useNotificationStore from "@/store/notificationStore";
import useAuthStore from "@/store/shopStore";
import NotificationManagement from "@/components/shop/NotificationManagement";

export default function NotificationsPage() {
  const router = useRouter();
  const { sellerToken, seller } = useAuthStore();
  const { isLoading, error, getNotificationHistory } = useNotificationStore();

  useEffect(() => {
    if (sellerToken && seller) {
      getNotificationHistory(null, sellerToken);
    }
  }, [sellerToken, seller, getNotificationHistory]);

  if (!sellerToken || !seller) {
    router.push("/shop/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Notification Management</h1>
          <p className="mt-2 text-gray-600">
            Send notifications to your event attendees and manage communication
          </p>
        </div>

        <NotificationManagement />
      </div>
    </div>
  );
}
