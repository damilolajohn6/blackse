"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAnalyticsStore from "@/store/analyticsStore";
import useAuthStore from "@/store/shopStore";
import EventAnalytics from "@/components/shop/EventAnalytics";

export default function AnalyticsPage() {
  const router = useRouter();
  const { sellerToken, seller } = useAuthStore();
  const { isLoading, error, getAnalyticsSummary } = useAnalyticsStore();

  useEffect(() => {
    if (sellerToken && seller) {
      getAnalyticsSummary(sellerToken, { shopId: seller._id });
    }
  }, [sellerToken, seller, getAnalyticsSummary]);

  if (!sellerToken || !seller) {
    router.push("/shop/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Event Analytics</h1>
          <p className="mt-2 text-gray-600">
            Track your event performance and sales analytics
          </p>
        </div>

        <EventAnalytics />
      </div>
    </div>
  );
}
