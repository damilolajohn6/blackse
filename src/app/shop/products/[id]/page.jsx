"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { toast } from "react-toastify";
import useAuthStore from "@/store/authStore";
import useProductStore from "@/store/productStore";
import Link from "next/link";

const ProductDetailsPage = () => {
  const router = useRouter();
  const params = useParams();
  const productId = params.id;
  const { seller, isSeller, sellerToken } =
    useAuthStore();
  const { product, isLoading, error, fetchSingleProduct } = useProductStore();

  useEffect(() => {
    if (!isSeller ) {
      toast.error("Please log in to view product details", {
        toastId: "auth-error",
      });
      router.push("/shop/login");
      return;
    }

    if (!productId || !/^[0-9a-fA-F]{24}$/.test(productId)) {
      console.error("Invalid product ID", { productId });
      toast.error("Invalid product ID", { toastId: "fetch-error" });
      return;
    }

    const fetchProduct = async () => {
      try {
        await fetchSingleProduct(
          productId,
          isSeller
        );
      } catch (error) {
        console.error("Fetch product error:", {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          productId,
        });
        toast.error(error.message || "Failed to load product details", {
          toastId: "fetch-error",
        });
      }
    };

    fetchProduct();
  }, [
    isSeller,
    seller,
    productId,
    router,
    fetchSingleProduct,
  ]);

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
            <p className="text-gray-600">
              {product.flashSale?.isActive && product.flashSale?.discountPrice
                ? `$${product.flashSale.discountPrice.toFixed(2)}`
                : `$${product.price.toFixed(2)}`}
              {product.flashSale?.isActive && (
                <span className="text-sm text-gray-500 line-through ml-2">
                  ${product.price.toFixed(2)}
                </span>
              )}
            </p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-700">Stock</h2>
            <p className="text-gray-600">
              {product.flashSale?.isActive
                ? product.flashSale.stockLimit
                : product.stock}
            </p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-700">Tags</h2>
            <p className="text-gray-600">
              {product.tags?.length > 0 ? product.tags.join(", ") : "None"}
            </p>
          </div>
          {product.flashSale?.isActive && (
            <div>
              <h2 className="text-lg font-semibold text-gray-700">
                Flash Sale
              </h2>
              <p className="text-gray-600">
                Ends: {new Date(product.flashSale.endDate).toLocaleString()}
              </p>
            </div>
          )}
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
          {isSeller && (
            <Link
              href={`/shop/products/edit/${product._id}`}
              className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Edit Product
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
