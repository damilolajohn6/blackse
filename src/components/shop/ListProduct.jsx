"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-toastify";
import useAuthStore from "@/store/authStore";
import useProductStore from "@/store/productStore";
import { FaPlus, FaEdit, FaTrash, FaEye } from "react-icons/fa";
import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_SERVER || "http://localhost:8000/api/v2";

export default function ListProducts() {
  const router = useRouter();
  const { seller, isSeller, sellerToken } = useAuthStore();
  const { products, isLoading, error, fetchShopProducts } = useProductStore();

  useEffect(() => {
    if (!isSeller || !seller?._id) {
      toast.error("Please log in to view your products", {
        toastId: "auth-error",
      });
      router.push("/shop/login");
      return;
    }

    const loadProducts = async () => {
      try {
        await fetchShopProducts(seller._id, sellerToken);
      } catch (err) {
        console.error("Load products error:", err);
        toast.error(err.response?.data?.message || "Failed to load products", {
          toastId: "fetch-error",
        });
      }
    };

    loadProducts();
  }, [seller, isSeller, sellerToken, fetchShopProducts, router]);

  const handleDelete = async (productId) => {
    if (!productId || !/^[0-9a-fA-F]{24}$/.test(productId)) {
      toast.error("Invalid product ID", { toastId: "delete-error" });
      return;
    }

    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await axios.delete(
        `${API_BASE_URL}/product/delete-shop-product/${productId}`,
        {
          withCredentials: true,
          headers: {
            Authorization: sellerToken ? `Bearer ${sellerToken}` : undefined,
          },
        }
      );
      toast.success(response.data.message || "Product deleted successfully!");
      await fetchShopProducts(seller._id, sellerToken);
    } catch (error) {
      console.error("Delete product error:", error);
      const errorMessage =
        error.response?.status === 403
          ? "You are not authorized to delete this product"
          : error.response?.status === 404
          ? "Product not found"
          : error.response?.data?.message ||
            `Failed to delete product (Status: ${
              error.response?.status || "unknown"
            })`;
      toast.error(errorMessage, { toastId: "delete-error" });
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900 text-center sm:text-left">
          Your Products
        </h1>
        <Link
          href="/shop/products/create"
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base"
        >
          <FaPlus className="h-5 w-5" />
          <span>Create Product</span>
        </Link>
      </div>

      {isLoading ? (
        <p className="text-center text-gray-600">Loading...</p>
      ) : error ? (
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => fetchShopProducts(seller._id, sellerToken)}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      ) : products.length === 0 ? (
        <p className="text-center text-gray-600">
          No products found. Create one to get started!
        </p>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
            >
              <div className="relative w-full h-48 sm:h-52 md:h-56">
                {product.images && product.images[0]?.url ? (
                  <Image
                    src={product.images[0].url}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="100vw"
                    priority
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">No Image</span>
                  </div>
                )}
              </div>
              <div className="p-4 flex flex-col justify-between flex-1">
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                    {product.name}
                  </h2>
                  <p className="text-sm text-gray-600">{product.category}</p>
                  <p className="text-lg font-bold text-blue-600 mt-2">
                    ${product.price.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Stock: {product.stock}
                  </p>
                </div>
                <div className="flex justify-end space-x-3 mt-4">
                  <Link
                    href={`/shop/products/${product._id}`}
                    className="text-blue-600 hover:text-blue-800"
                    title="View Details"
                  >
                    <FaEye className="h-5 w-5" />
                  </Link>
                  <Link
                    href={`/shop/products/edit/${product._id}`}
                    className="text-green-600 hover:text-green-800"
                    title="Edit"
                  >
                    <FaEdit className="h-5 w-5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="text-red-600 hover:text-red-800"
                    title="Delete"
                  >
                    <FaTrash className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
