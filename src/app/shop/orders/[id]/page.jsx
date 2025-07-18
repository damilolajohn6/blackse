"use client";
import React from 'react'
import OrderDetails from '@/components/shop/OrderDetails';
import ShopDashboardSideBar from '@/components/shop/ShopDashboardSidebar';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";

const OrderDetailsPage = () => {

    const router = useRouter();
    const { seller} = useAuthStore();

    useEffect(() => {
      if (!seller) {
        router.push("/shop/login");
      }
    }, [seller, router]);

    if (!seller) {
      return <div>Loading...</div>;
    }

  return (
    <div>
      <div className="min-h-screen bg-gray-50">
        <div className="flex w-full">
          <div className="w-[80px] 800px:w-[330px]">
            <ShopDashboardSideBar active={2} />
          </div>
          <div className="flex-1 flex justify-center p-4">
           <OrderDetails />
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetailsPage
