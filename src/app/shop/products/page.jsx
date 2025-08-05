"use client";

import ListProducts from "@/components/shop/ListProduct";
import ShopDashboardSideBar from "@/components/shop/ShopDashboardSidebar";
import React from "react";

const ProductsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="grid grid-cols-12 w-full">
        {/* Sidebar */}
        <div className="lg:col-span-1 col-span-full bg-white border-b md:border-b-0 md:border-r border-gray-200">
          <ShopDashboardSideBar active={3} />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-11 col-span-full p-4">
          <ListProducts />
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
