"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useShopStore from "@/store/shopStore";
import { toast } from "react-toastify";
import Loading from "@/app/loading";

export default function ShopAuthProvider({ children }) {
  const { loadShop, isSeller, seller } = useShopStore();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initializeShop = async () => {
      try {
        console.log("ShopAuthProvider: Checking cookies", document.cookie);
        await loadShop();
      } catch (error) {
        console.error("ShopAuthProvider: Failed to load shop", {
          message: error.message,
          cookies: document.cookie ? "present" : "missing",
        });
        toast.error("Please log in to access your shop", {
          toastId: "auth-error",
        });
        router.push("/shop/login");
      } finally {
        setIsLoading(false);
      }
    };
    initializeShop();
  }, [loadShop, router]);

  if (isLoading) {
    return <div className="grid place-content-center min-h-screen">
      <Loading />
    </div>;
  }

  return <>{children}</>;
}
