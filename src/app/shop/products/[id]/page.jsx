"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { toast } from "react-toastify";
import useAuthStore from "@/store/authStore";
import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_SERVER || "http://localhost:8000/api/v2";

export default function ProductDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id;
  const { seller, isSeller, sellerToken } = useAuthStore();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isSeller || !seller?._id) {
      toast.error("Please log in to view product details", {
        toastId: "auth-error",
      });
      router.push("/shop/login");
      return;
    }

    if (!productId || !/^[0-9a-fA-F]{24}$/.test(productId)) {
      console.error("Invalid product ID", { productId });
      setError("Invalid product ID");
      toast.error("Invalid product ID", { toastId: "fetch-error" });
      setIsLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const { data } = await axios.get(
          `${API_BASE_URL}/product/get-product/${productId}`,
          {
            withCredentials: true,
            headers: {
              Authorization: sellerToken ? `Bearer ${sellerToken}` : undefined,
            },
          }
        );
        setProduct(data.product);
      } catch (error) {
        console.error("Fetch product error:", {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          productId,
        });
        setError(
          error.response?.data?.message ||
            `Failed to load product details (Status: ${
              error.response?.status || "unknown"
            })`
        );
        toast.error(
          error.response?.data?.message ||
            `Failed to load product details (Status: ${
              error.response?.status || "unknown"
            })`,
          { toastId: "fetch-error" }
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [seller, isSeller, sellerToken, productId, router]);

  if (isLoading) {
    return <p className="text-center text-gray-600 py-6">Loading...</p>;
  }

  if (error) {
    return (
      <div className="py-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold text-red-600 text-center mb-6">
          Error Loading Product
        </h2>
        <p className="text-center text-gray-600">{error}</p>
        <div className="flex justify-center mt-4">
          <button
            onClick={() => router.push("/shop/products")}
            className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-6 max-w-4xl mx-auto">
        <p className="text-center text-red-600 py-6">Product not found</p>
        <div className="flex justify-center">
          <button
            onClick={() => router.push("/shop/products")}
            className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{product.name}</h1>
      <div className="bg-white shadow-lg rounded-xl p-6">
        {/* Images */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {product.images?.length > 0 ? (
            product.images.map((image, index) => (
              <div key={index} className="relative h-64">
                <Image
                  src={image.url}
                  alt={`${product.name} ${index + 1}`}
                  fill
                  className="object-cover rounded-md"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority={index === 0}
                />
              </div>
            ))
          ) : (
            <p className="text-gray-600">No images available</p>
          )}
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-700">Category</h2>
            <p className="text-gray-600">{product.category}</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-700">
              Sub-Category
            </h2>
            <p className="text-gray-600">{product.subCategory || "N/A"}</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-700">Price</h2>
            <p className="text-gray-600">${product.price.toFixed(2)}</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-700">
              Discount Price
            </h2>
            <p className="text-gray-600">
              {product.priceDiscount
                ? `$${product.priceDiscount.toFixed(2)}`
                : "N/A"}
            </p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-700">Stock</h2>
            <p className="text-gray-600">{product.stock}</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-700">Tags</h2>
            <p className="text-gray-600">
              {product.tags?.length > 0 ? product.tags.join(", ") : "None"}
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700">Description</h2>
          <p className="text-gray-600 whitespace-pre-wrap">
            {product.description}
          </p>
        </div>

        {/* Variations */}
        {product.variations?.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700">Variations</h2>
            <ul className="mt-2 space-y-2">
              {product.variations.map((variation, index) => (
                <li
                  key={index}
                  className="bg-gray-50 p-2 rounded-md flex justify-between"
                >
                  <span>
                    {variation.name}: {variation.options.join(", ")} (Price: $
                    {variation.price.toFixed(2)}, Stock: {variation.stock})
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Canadian Origin */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700">
            Made in Canada
          </h2>
          <p className="text-gray-600">
            {product.isMadeInCanada ? "Yes" : "No"}
            {product.isMadeInCanada && product.canadianCertification
              ? ` (Certification: ${product.canadianCertification})`
              : ""}
          </p>
        </div>

        {/* Shipping */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700">
            Shipping Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">
                <strong>Weight:</strong>{" "}
                {product.shipping?.weight
                  ? `${product.shipping.weight} kg`
                  : "N/A"}
              </p>
              <p className="text-gray-600">
                <strong>Cost:</strong>{" "}
                {product.shipping?.cost
                  ? `$${product.shipping.cost.toFixed(2)}`
                  : product.shipping?.isFreeShipping
                  ? "Free"
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-gray-600">
                <strong>Dimensions:</strong>{" "}
                {product.shipping?.dimensions?.length &&
                product.shipping.dimensions.width &&
                product.shipping.dimensions.height
                  ? `${product.shipping.dimensions.length} x ${product.shipping.dimensions.width} x ${product.shipping.dimensions.height} cm`
                  : "N/A"}
              </p>
              <p className="text-gray-600">
                <strong>Free Shipping:</strong>{" "}
                {product.shipping?.isFreeShipping ? "Yes" : "No"}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => router.push("/shop/products")}
            className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700"
          >
            Back to Products
          </button>
        </div>
      </div>
    </div>
  );
}
