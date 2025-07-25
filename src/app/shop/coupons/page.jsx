"use client"
import React from "react";
import CouponManagement from "@/components/shop/CouponManagement";
import ShopDashboardSideBar from "@/components/shop/ShopDashboardSidebar";
import useShopStore from "@/store/shopStore";
import { Box, CircularProgress } from "@mui/material";

const CouponsPage = () => {
  const { isLoading, isSeller } = useShopStore();

  if (isLoading) {
    return (
      <Box className="flex justify-center items-center h-screen">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div>
      <div className="flex items-start justify-between w-full">
        <div className="w-[80px] 800px:w-[330px]">
          <ShopDashboardSideBar active={9} />
        </div>
        {isSeller ? <CouponManagement /> : null}
      </div>
    </div>
  );
};

export default CouponsPage;
