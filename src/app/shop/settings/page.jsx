"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useShopStore from "@/store/shopStore";
import { toast } from "react-toastify";
import Image from "next/image";
import ShopDashboardSideBar from "@/components/shop/ShopDashboardSidebar";

export default function Settings() {
  const { seller, sellerToken, isSeller, loadShop, isLoading } = useShopStore();
  const router = useRouter();

  // Initialize form state with seller data
  const [formData, setFormData] = useState({
    fullname: { firstName: "", lastName: "" },
    name: "",
    description: "",
    address: "",
    phoneNumber: { countryCode: "", number: "" },
    zipCode: "",
    avatar: null,
  });
  const [withdrawMethod, setWithdrawMethod] = useState({
    type: "BankTransfer",
    details: {
      accountName: "",
      bankName: "",
      institutionNumber: "",
      accountNumber: "",
    },
  });
  const [previewAvatar, setPreviewAvatar] = useState(null);

  // Load seller data on mount
  useEffect(() => {
    if (!isSeller) {
      router.push("/shop/login");
      toast.error("Please log in as a seller");
      return;
    }

    const fetchShop = async () => {
      const result = await loadShop();
      if (result.success && result.seller) {
        setFormData({
          fullname: result.seller.fullname || { firstName: "", lastName: "" },
          name: result.seller.name || "",
          description: result.seller.description || "",
          address: result.seller.address || "",
          phoneNumber: result.seller.phoneNumber || {
            countryCode: "",
            number: "",
          },
          zipCode: result.seller.zipCode || "",
          avatar: null,
        });
        setWithdrawMethod(
          result.seller.withdrawMethod || {
            type: "BankTransfer",
            details: {
              accountName: "",
              bankName: "",
              institutionNumber: "",
              accountNumber: "",
            },
          }
        );
        setPreviewAvatar(result.seller.avatar?.url || null);
      } else {
        toast.error("Failed to load shop data");
      }
    };

    fetchShop();
  }, [isSeller, loadShop, router]);

  // Handle input changes for text fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("fullname.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        fullname: { ...prev.fullname, [key]: value },
      }));
    } else if (name.startsWith("phoneNumber.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        phoneNumber: { ...prev.phoneNumber, [key]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle avatar file input
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Only image files are allowed");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setFormData((prev) => ({ ...prev, avatar: file }));
      setPreviewAvatar(URL.createObjectURL(file));
    }
  };

  // Handle withdrawal method changes
  const handleWithdrawMethodChange = (e) => {
    const { name, value } = e.target;
    setWithdrawMethod((prev) => ({
      ...prev,
      details: { ...prev.details, [name]: value },
    }));
  };

  // Submit shop info updates
  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullname.firstName || !formData.fullname.lastName) {
      toast.error("First and last name are required");
      return;
    }
    if (!formData.name || !formData.address || !formData.zipCode) {
      toast.error("Shop name, address, and zip code are required");
      return;
    }
    if (formData.phoneNumber.countryCode && !formData.phoneNumber.number) {
      toast.error("Phone number is required if country code is provided");
      return;
    }
    if (formData.phoneNumber.number && !formData.phoneNumber.countryCode) {
      toast.error("Country code is required if phone number is provided");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER}/shop/update-seller-info`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sellerToken}`,
          },
          credentials: "include",
          body: JSON.stringify({
            fullname: formData.fullname,
            name: formData.name,
            description: formData.description,
            address: formData.address,
            phoneNumber:
              formData.phoneNumber.countryCode && formData.phoneNumber.number
                ? formData.phoneNumber
                : undefined,
            zipCode: formData.zipCode,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success("Shop information updated successfully!");
        await loadShop(); // Refresh seller data
      } else {
        toast.error(data.message || "Failed to update shop information");
      }
    } catch (error) {
      console.error("Update shop info error:", error);
      toast.error("Failed to update shop information");
    }
  };

  // Submit avatar update
  const handleAvatarSubmit = async (e) => {
    e.preventDefault();
    if (!formData.avatar) {
      toast.error("Please select an avatar image");
      return;
    }

    const avatarFormData = new FormData();
    avatarFormData.append("avatar", formData.avatar);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER}/shop/update-shop-avatar`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${sellerToken}`,
          },
          credentials: "include",
          body: avatarFormData,
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success("Shop avatar updated successfully!");
        setFormData((prev) => ({ ...prev, avatar: null }));
        setPreviewAvatar(data.seller.avatar.url);
        await loadShop(); // Refresh seller data
      } else {
        toast.error(data.message || "Failed to update avatar");
      }
    } catch (error) {
      console.error("Update avatar error:", error);
      toast.error("Failed to update avatar");
    }
  };

  // Submit withdrawal method update
  const handleWithdrawMethodSubmit = async (e) => {
    e.preventDefault();
    if (!Object.values(withdrawMethod.details).every((v) => v.trim())) {
      toast.error("All bank details are required");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER}/shop/update-payment-methods`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sellerToken}`,
          },
          credentials: "include",
          body: JSON.stringify({ withdrawMethod }),
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success("Default bank details updated successfully!");
        await loadShop(); // Refresh seller data
      } else {
        toast.error(data.message || "Failed to update bank details");
      }
    } catch (error) {
      console.error("Update bank details error:", error);
      toast.error("Failed to update bank details");
    }
  };

  // Delete withdrawal method
  const handleDeleteWithdrawMethod = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER}/shop/delete-withdraw-method`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${sellerToken}`,
          },
          credentials: "include",
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success("Default bank details deleted successfully!");
        setWithdrawMethod({
          type: "BankTransfer",
          details: {
            accountName: "",
            bankName: "",
            institutionNumber: "",
            accountNumber: "",
          },
        });
        await loadShop(); // Refresh seller data
      } else {
        toast.error(data.message || "Failed to delete bank details");
      }
    } catch (error) {
      console.error("Delete bank details error:", error);
      toast.error("Failed to delete bank details");
    }
  };

  if (!isSeller) {
    return null; // Render nothing while redirecting
  }

  return (
    <div className="">
      <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
        <div className="w-[80px] 800px:w-[330px]">
          <ShopDashboardSideBar active={9} />
        </div>
        <main className="flex-1 p-4 sm:p-6 lg:p-10 space-y-8">
          <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">

            {/* Shop Information Form */}
            <form onSubmit={handleInfoSubmit} className="space-y-6 mb-8">
              <h2 className="text-2xl font-semibold">Shop Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="fullname.firstName"
                    value={formData.fullname.firstName}
                    onChange={handleInputChange}
                    className="mt-1 w-full p-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="fullname.lastName"
                    value={formData.fullname.lastName}
                    onChange={handleInputChange}
                    className="mt-1 w-full p-2 border rounded-md"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Shop Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="mt-1 w-full p-2 border rounded-md"
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="mt-1 w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Country Code
                  </label>
                  <input
                    type="text"
                    name="phoneNumber.countryCode"
                    value={formData.phoneNumber.countryCode}
                    onChange={handleInputChange}
                    className="mt-1 w-full p-2 border rounded-md"
                    placeholder="+1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phoneNumber.number"
                    value={formData.phoneNumber.number}
                    onChange={handleInputChange}
                    className="mt-1 w-full p-2 border rounded-md"
                    placeholder="1234567890"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Zip Code
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  className="mt-1 w-full p-2 border rounded-md"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
              >
                {isLoading ? "Updating..." : "Update Shop Info"}
              </button>
            </form>

            {/* Avatar Update Form */}
            <form onSubmit={handleAvatarSubmit} className="space-y-6 mb-8">
              <h2 className="text-2xl font-semibold">Shop Avatar</h2>
              {previewAvatar && (
                <div className="mb-4">
                  <Image
                    src={previewAvatar}
                    alt="Shop Avatar Preview"
                    width={150}
                    height={150}
                    className="rounded-full object-cover"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Upload New Avatar
                </label>
                <input
                  type="file"
                  name="avatar"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="mt-1 w-full p-2 border rounded-md"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !formData.avatar}
                className="w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
              >
                {isLoading ? "Uploading..." : "Update Avatar"}
              </button>
            </form>

            {/* Default Bank Details Form */}
            <form onSubmit={handleWithdrawMethodSubmit} className="space-y-6">
              <h2 className="text-2xl font-semibold">Default Bank Details</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Account Name
                </label>
                <input
                  type="text"
                  name="accountName"
                  value={withdrawMethod.details.accountName}
                  onChange={handleWithdrawMethodChange}
                  className="mt-1 w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Bank Name
                </label>
                <input
                  type="text"
                  name="bankName"
                  value={withdrawMethod.details.bankName}
                  onChange={handleWithdrawMethodChange}
                  className="mt-1 w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Institution Number
                </label>
                <input
                  type="text"
                  name="institutionNumber"
                  value={withdrawMethod.details.institutionNumber}
                  onChange={handleWithdrawMethodChange}
                  className="mt-1 w-full p-2 border rounded-md"
                  required
                  maxLength={9}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Account Number
                </label>
                <input
                  type="text"
                  name="accountNumber"
                  value={withdrawMethod.details.accountNumber}
                  onChange={handleWithdrawMethodChange}
                  className="mt-1 w-full p-2 border rounded-md"
                  required
                  maxLength={17}
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
                >
                  {isLoading ? "Updating..." : "Update Bank Details"}
                </button>
                {withdrawMethod.details.accountName && (
                  <button
                    type="button"
                    onClick={handleDeleteWithdrawMethod}
                    disabled={isLoading}
                    className="w-full p-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-400"
                  >
                    {isLoading ? "Deleting..." : "Delete Bank Details"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
