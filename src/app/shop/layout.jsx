"use client";
import "react-toastify/dist/ReactToastify.css";
import ShopAuthProvider from "@/components/Providers/ShopAuthProvider";
import useShopStore from "@/store/shopStore";
import Image from "next/image";
import Link from "next/link";
import { FaStore, FaBox, FaCog, FaSignOutAlt } from "react-icons/fa";

export default function ShopLayout({ children }) {
  const { seller, isSeller, logoutShop } = useShopStore();

  const handleLogout = async () => {
    await logoutShop();
  };

  return (
    <ShopAuthProvider>
      <div className="min-h-screen bg-gray-100">
        {/* Shop Header */}
        <header className="bg-white fixed top-0 left-0 w-full z-20">
          <div className="max-w-7xl mx-auto py-4 flex justify-between items-center">
            {/* Logo & Shop Name */}
            <Link
              href={isSeller ? "/shop" : "/"}
              className="flex items-center space-x-3"
            >
              <Image
                src={seller?.avatar?.url || "/blacknsell.png"}
                alt={seller?.name || "BlacknSell Shop"}
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover"
              />
              <span className="text-lg font-semibold text-gray-900">
                {seller?.name || "My Shop"}
              </span>
            </Link>

            {/* Navigation */}
            {isSeller && (
              <nav className="hidden lg:flex items-center space-x-6">
                <Link
                  href="/shop/dashboard"
                  className="flex items-center space-x-1 text-gray-600 hover:text-blue-600"
                >
                  <FaStore className="h-5 w-5" />
                  <span className="text-sm font-medium">Dashboard</span>
                </Link>
                <Link
                  href="/shop/products"
                  className="flex items-center space-x-1 text-gray-600 hover:text-blue-600"
                >
                  <FaBox className="h-5 w-5" />
                  <span className="text-sm font-medium">Products</span>
                </Link>
                <Link
                  href="/shop/settings"
                  className="flex items-center space-x-1 text-gray-600 hover:text-blue-600"
                >
                  <FaCog className="h-5 w-5" />
                  <span className="text-sm font-medium">Settings</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-600 hover:text-red-600"
                >
                  <FaSignOutAlt className="h-5 w-5" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </nav>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="min-h-screen pt-18">
          {children}
        </main>

        <footer className="bg-blue-600 text-white mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center">
            <p suppressHydrationWarning={true}>
              © {new Date().getFullYear()} BlackandSell. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </ShopAuthProvider>
  );
}
