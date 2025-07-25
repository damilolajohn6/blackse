"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useShopStore from "@/store/shopStore";
import { toast } from "react-toastify";

const ShopInfo = () => {
  const { seller, isSeller, isLoading } = useShopStore();
  const router = useRouter();

  useEffect(() => {
    if (!isSeller && !isLoading) {
      toast.error("Please login to your shop");
      router.push("/shop/login");
    }
  }, [isSeller, isLoading, router]);

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!seller) {
    return null;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between">
        <div>
          <h3 className="text-2xl font-bold text-blue-600 mb-6">
            Welcome, {seller?.name}
          </h3>
        </div>
      </div>
      <div className="space-y-4">
        <p>
          <strong>Email:</strong> {seller.email}
        </p>
        <p>
          <strong>Address:</strong> {seller.address}, {seller.zipCode}
        </p>
        {seller.phone?.number && (
          <p>
            <strong>Phone:</strong> {seller.phone.countryCode}
            {seller.phone.number}
          </p>
        )}
        {seller.avatar?.url && (
          <div>
            <strong>Avatar:</strong>
            <img
              src={seller.avatar.url}
              alt="Shop Avatar"
              className="mt-2 h-16 w-16 rounded-full object-cover"
            />
          </div>
        )}
      </div>
      <div className="mt-6">
        <button
          onClick={() => router.push("/shop/settings/edit")}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Edit Shop Settings
        </button>
      </div>
    </div>
  );
};

export default ShopInfo;
