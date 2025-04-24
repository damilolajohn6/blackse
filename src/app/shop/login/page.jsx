"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";
import { toast } from "react-toastify";
import Link from "next/link";

const ShopLogin = () => {
  const {isSeller, loginShop } = useAuthStore();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already a seller
  useEffect(() => {
    if (isSeller) {
      router.push("/shop");
    }
  }, [ isSeller, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await loginShop(
        formData.email,
        formData.password,
        router
      );
      if (success) {
        toast.success("Shop login successful!");
      }
    } catch (error) {
      console.error("Shop login error:", error);
      toast.error(error.message || "Failed to login to shop");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Shop Login</h2>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div className="text-sm">
          <Link
            href="/shop/forgot-password"
            className="text-blue-600 hover:text-blue-800"
          >
            Forgot your password?
          </Link>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            isLoading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
        >
          {isLoading ? "Logging in..." : "Login to Shop"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        Don’t have a shop?{" "}
        <Link href="/shop/create" className="text-blue-600 hover:text-blue-800">
          Create one
        </Link>
      </p>
    </div>
  );
};

export default ShopLogin;
