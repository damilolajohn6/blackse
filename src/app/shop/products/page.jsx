"use client";

import ListProducts from "@/components/shop/ListProduct";
import ShopDashboardSideBar from "@/components/shop/ShopDashboardSidebar";
import React from "react";

const ProductsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col md:flex-row w-full">
        {/* Sidebar */}
        <div className="w-full md:w-[100px] lg:w-[100px] border-b md:border-b-0 md:border-r border-gray-200">
          <ShopDashboardSideBar active={3} />
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 sm:p-6">
          <ListProducts />
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
