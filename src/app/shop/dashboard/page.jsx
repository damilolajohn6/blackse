"use client";

import ShopDashboardHero from "@/components/shop/ShopDashboardHero";
import ShopDashboardSideBar from "@/components/shop/ShopDashboardSidebar";
import useShopStore from "@/store/shopStore";

export default function ShopDashboard() {
  const { seller } = useShopStore();

  return (
    <>
      <div className="">
        <div className="flex items-start justify-between w-full">
          <div className="w-[80px] 800px:w-[330px]">
            <ShopDashboardSideBar active={1} />
          </div>

          <ShopDashboardHero />
        </div>
      </div>
    </>
  );
}
