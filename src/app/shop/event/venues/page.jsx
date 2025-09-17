"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useVenueStore from "@/store/venueStore";
import useAuthStore from "@/store/shopStore";
import VenueManagement from "@/components/shop/VenueManagement";
import ShopDashboardSideBar from "@/components/shop/ShopDashboardSidebar";

export default function VenuesPage() {
  const router = useRouter();
  const { sellerToken, seller } = useAuthStore();
  const { venues, isLoading, error, getMyVenues } = useVenueStore();

  useEffect(() => {
    if (sellerToken && seller) {
      getMyVenues(sellerToken);
    }
  }, [sellerToken, seller, getMyVenues]);

  if (!sellerToken || !seller) {
    router.push("/shop/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <div className="w-[80px] 800px:w-[330px]">
          <ShopDashboardSideBar active={6} />
        </div>
        <div className="flex-1">
          <VenueManagement />
        </div>
      </div>
      {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Venue Management</h1>
          <p className="mt-2 text-gray-600">
            Manage your venues for hosting events
          </p>
        </div>

        <VenueManagement />
      </div> */}
    </div>
  );
}
