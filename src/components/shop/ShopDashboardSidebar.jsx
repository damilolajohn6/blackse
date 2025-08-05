import React from "react";
import Link from "next/link";
import { AiOutlineFolderAdd, AiOutlineGift } from "react-icons/ai";
import { FiPackage, FiShoppingBag } from "react-icons/fi";
import { MdOutlineLocalOffer } from "react-icons/md";
import { RxDashboard } from "react-icons/rx";
import { VscNewFile } from "react-icons/vsc";
import { CiMoneyBill, CiSettings } from "react-icons/ci";
import { BiMessageSquareDetail } from "react-icons/bi";
import { HiOutlineReceiptRefund } from "react-icons/hi";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

const ShopDashboardSideBar = ({ active }) => {
  return (
    <div className="w-full overflow-x-scroll lg:overflow-x-hidden bg-white shadow-sm sticky top-18 bottom-0 lg:min-h-screen left-0 z-10 flex lg:flex-col items-center justify-center">
      <SidebarItem
        href="/shop/dashboard"
        icon={<RxDashboard size={30} />}
        label="Dashboard"
        active={active === 1}
      />
      <SidebarItem
        href="/shop/orders"
        icon={<FiShoppingBag size={30} />}
        label="All Orders"
        active={active === 2}
      />
      <SidebarItem
        href="/shop/products"
        icon={<FiPackage size={30} />}
        label="All Products"
        active={active === 3}
      />
      <SidebarItem
        href="/shop/products/create"
        icon={<AiOutlineFolderAdd size={30} />}
        label="Create Product"
        active={active === 4}
      />
      <SidebarItem
        href="/shop/event"
        icon={<MdOutlineLocalOffer size={30} />}
        label="All Events"
        active={active === 5}
      />
      <SidebarItem
        href="/shop/event/create"
        icon={<VscNewFile size={30} />}
        label="Create Event"
        active={active === 6}
      />
      <SidebarItem
        href="/shop/withdraw-money"
        icon={<CiMoneyBill size={30} />}
        label="Withdraw Money"
        active={active === 7}
      />
      <SidebarItem
        href="/shop/messages"
        icon={<BiMessageSquareDetail size={30} />}
        label="Shop Inbox"
        active={active === 8}
      />
      {/* <SidebarItem
        href="/shop/coupons"
        icon={<AiOutlineGift size={30} />}
        label="Discount Codes"
        active={active === 9}
      /> */}
      {/* <SidebarItem
        href="/dashboard-refunds"
        icon={<HiOutlineReceiptRefund size={30} />}
        label="Refunds"
        active={active === 10}
      /> */}
      <SidebarItem
        href="/shop/settings"
        icon={<CiSettings size={30} />}
        label="Settings"
        active={active === 9}
      />
    </div>
  );
};

const SidebarItem = ({ href, icon, label, active }) => {
  return (
    <div className="w-full flex items-center p-4">
      <Link href={href} className="w-full flex items-center justify-center">
        {React.cloneElement(icon, {
          color: active ? "crimson" : "#555",
        })}
        <h5
          className={`hidden 800px:block pl-2 text-[18px] font-[400] ${
            active ? "text-[crimson]" : "text-[#555]"
          }`}
        >
          {label}
        </h5>
      </Link>
    </div>
  );
};

export default ShopDashboardSideBar;
