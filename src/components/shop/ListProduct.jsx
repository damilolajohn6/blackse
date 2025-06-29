"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-toastify";
import useAuthStore from "@/store/authStore";
import useProductStore from "@/store/productStore";
import { FaPlus, FaEdit, FaTrash, FaEye, FaBolt } from "react-icons/fa";

const ListProducts = () => {
  const router = useRouter();
  const { seller, isSeller, sellerToken } =
    useAuthStore();
  const {
    shopProducts,
    categories,
    isLoading,
    error,
    fetchShopProducts,
    fetchCategories,
    fetchProductsByCategory,
    categoryProducts,
    addFlashSale,
    removeFlashSale,
  } = useProductStore();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [flashSaleForm, setFlashSaleForm] = useState({
    productId: "",
    discountPrice: "",
    startDate: "",
    endDate: "",
    stockLimit: "",
  });

  useEffect(() => {
    if ( !isSeller) {
      toast.error("Please log in to view your products", {
        toastId: "auth-error",
      });
      router.push("/shop/login");
      return;
    }

    const loadData = async () => {
      try {
        if (isSeller && seller?._id && sellerToken) {
          await fetchShopProducts(seller._id, sellerToken);
        }
        await fetchCategories();
      } catch (err) {
        console.error("Load data error:", err);
        toast.error(err.message || "Failed to load data", {
          toastId: "fetch-error",
        });
      }
    };

    loadData();
  }, [
    isSeller,
    seller?._id,
    sellerToken,
    fetchShopProducts,
    fetchCategories,
    router,
  ]);

  const handleDelete = async (productId) => {
    if (!productId) {
      toast.error("Product ID is missing", { toastId: "delete-error" });
      return;
    }
    if (!/^[0-9a-fA-F]{24}$/.test(productId)) {
      toast.error("Invalid product ID", { toastId: "delete-error" });
      return;
    }

    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const { deleteProduct } = useProductStore.getState();
      await deleteProduct(productId, sellerToken);
      toast.success("Product deleted successfully!");
    } catch (error) {
      const errorMessage =
        error.response?.status === 403
          ? "You are not authorized to delete this product"
          : error.response?.status === 404
          ? "Product not found"
          : error.message || "Failed to delete product";
      toast.error(errorMessage, { toastId: "delete-error" });
    }
  };

  const handleCategoryChange = async (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
    if (category) {
      try {
        // Pass the seller._id as shopId
        await fetchProductsByCategory(seller._id, category, sellerToken);
      } catch (error) {
        toast.error(error.message || "Failed to load category products", {
          toastId: "category-error",
        });
      }
    } else {
      useProductStore.setState({ categoryProducts: [] });
    }
  };

  const handleFlashSaleSubmit = async (e) => {
    e.preventDefault();
    const { productId, discountPrice, startDate, endDate, stockLimit } =
      flashSaleForm;

    if (!productId || !discountPrice || !startDate || !endDate || !stockLimit) {
      toast.error("Please fill all flash sale fields", {
        toastId: "flashsale-error",
      });
      return;
    }

    try {
      await addFlashSale(
        productId,
        {
          discountPrice: Number(discountPrice),
          startDate,
          endDate,
          stockLimit: Number(stockLimit),
        },
        sellerToken
      );
      toast.success("Flash sale added successfully!");
      setFlashSaleForm({
        productId: "",
        discountPrice: "",
        startDate: "",
        endDate: "",
        stockLimit: "",
      });
      if (seller?._id && sellerToken) {
        await fetchShopProducts(seller._id, sellerToken);
      }
    } catch (error) {
      toast.error(error.message || "Failed to add flash sale", {
        toastId: "flashsale-error",
      });
    }
  };

  const handleRemoveFlashSale = async (productId) => {
    if (!confirm("Are you sure you want to remove this flash sale?")) return;

    try {
      await removeFlashSale(productId, sellerToken);
      toast.success("Flash sale removed successfully!");
      if (seller?._id && sellerToken) {
        await fetchShopProducts(seller._id, sellerToken);
      }
    } catch (error) {
      toast.error(error.message || "Failed to remove flash sale", {
        toastId: "flashsale-error",
      });
    }
  };

  const displayedProducts = selectedCategory ? categoryProducts : shopProducts;

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900 text-center sm:text-left">
          {isSeller ? "Your Products" : "Browse Products"}
        </h1>
        <div className="flex flex-col sm:flex-row gap-4">
          {isSeller && (
            <Link
              href="/shop/products/create"
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              <FaPlus className="h-5 w-5" />
              <span>Create Product</span>
            </Link>
          )}
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isSeller && (
        <div className="mb-6 bg-white shadow-md rounded-lg p-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Add Flash Sale
          </h2>
          <form
            onSubmit={handleFlashSaleSubmit}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Product
              </label>
              <select
                value={flashSaleForm.productId}
                onChange={(e) =>
                  setFlashSaleForm({
                    ...flashSaleForm,
                    productId: e.target.value,
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select Product</option>
                {shopProducts.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Discount Price ($)
              </label>
              <input
                type="number"
                value={flashSaleForm.discountPrice}
                onChange={(e) =>
                  setFlashSaleForm({
                    ...flashSaleForm,
                    discountPrice: e.target.value,
                  })
                }
                min="0"
                step="0.01"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Stock Limit
              </label>
              <input
                type="number"
                value={flashSaleForm.stockLimit}
                onChange={(e) =>
                  setFlashSaleForm({
                    ...flashSaleForm,
                    stockLimit: e.target.value,
                  })
                }
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="datetime-local"
                value={flashSaleForm.startDate}
                onChange={(e) =>
                  setFlashSaleForm({
                    ...flashSaleForm,
                    startDate: e.target.value,
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                type="datetime-local"
                value={flashSaleForm.endDate}
                onChange={(e) =>
                  setFlashSaleForm({
                    ...flashSaleForm,
                    endDate: e.target.value,
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Add Flash Sale
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <p className="text-center text-gray-600">Loading...</p>
      ) : error ? (
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() =>
              selectedCategory
                ? fetchProductsByCategory(
                    seller._id,
                    selectedCategory,
                    sellerToken
                  )
                : seller?._id && sellerToken
                ? fetchShopProducts(seller._id, sellerToken)
                : null
            }
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      ) : displayedProducts.length === 0 ? (
        <p className="text-center text-gray-600">
          {selectedCategory
            ? `No products found in ${selectedCategory}`
            : "No products found. Create one to get started!"}
        </p>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {displayedProducts.map((product) => (
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
                {product.flashSale?.isActive && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-md text-xs">
                    Flash Sale
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
                    {product.flashSale?.isActive &&
                    product.flashSale?.discountPrice
                      ? `$${product.flashSale.discountPrice.toFixed(2)}`
                      : `$${product.price.toFixed(2)}`}
                    {product.flashSale?.isActive && (
                      <span className="text-sm text-gray-500 line-through ml-2">
                        ${product.price.toFixed(2)}
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Stock:{" "}
                    {product.flashSale?.isActive
                      ? product.flashSale.stockLimit
                      : product.stock}
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
                  {isSeller && (
                    <>
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
                      {product.flashSale?.isActive ? (
                        <button
                          onClick={() => handleRemoveFlashSale(product._id)}
                          className="text-yellow-600 hover:text-yellow-800"
                          title="Remove Flash Sale"
                        >
                          <FaBolt className="h-5 w-5" />
                        </button>
                      ) : null}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListProducts;
