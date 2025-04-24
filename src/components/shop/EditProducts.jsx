"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-toastify";
import useAuthStore from "@/store/authStore";
import useProductStore from "@/store/productStore";
import { FaSpinner, FaArrowLeft, FaTrash } from "react-icons/fa";
import Link from "next/link";


const API_BASE_URL =
  process.env.NEXT_PUBLIC_SERVER || "http://localhost:8000/api/v2";

const categories = [
  "electronics",
  "clothing",
  "home",
  "books",
  "toys",
  "food",
  "digital",
  "other",
];

export default function EditProduct() {
  const router = useRouter();
  const { id } = useParams();
  const { seller, isSeller, sellerToken } = useAuthStore();
  const { product, isLoading, error, fetchSingleProduct, updateProduct } =
    useProductStore();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    subCategory: "",
    price: 0,
    priceDiscount: "",
    stock: 0,
    tags: [],
    isMadeInCanada: false,
    canadianCertification: "",
    images: [],
    shipping: { isFreeShipping: false, cost: 0 },
  });
  const [newImages, setNewImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isSeller || !seller?._id) {
      toast.error("Please log in to edit products", { toastId: "auth-error" });
      router.push("/shop/login");
      return;
    }

    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      toast.error("Invalid product ID", { toastId: "invalid-id" });
      router.push("/shop/products");
      return;
    }

    const loadProduct = async () => {
      try {
        await fetchSingleProduct(id, sellerToken);
      } catch (err) {
        console.error("Fetch product error:", {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
        });
        toast.error(err.response?.data?.message || "Failed to load product", {
          toastId: "fetch-error",
        });
      }
    };

    loadProduct();
  }, [id, isSeller, seller, sellerToken, fetchSingleProduct, router]);

  useEffect(() => {
    if (product && product._id === id) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        category: product.category || "",
        subCategory: product.subCategory || "",
        price: product.price || 0,
        priceDiscount: product.priceDiscount || "",
        stock: product.stock || 0,
        tags: product.tags || [],
        isMadeInCanada: product.isMadeInCanada || false,
        canadianCertification: product.canadianCertification || "",
        images: product.images || [],
        shipping: {
          isFreeShipping: product.shipping?.isFreeShipping || false,
          cost: product.shipping?.cost || 0,
        },
      });
    }
  }, [product, id]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "isFreeShipping") {
      setFormData((prev) => ({
        ...prev,
        shipping: { ...prev.shipping, isFreeShipping: checked },
      }));
    } else if (name === "shippingCost") {
      setFormData((prev) => ({
        ...prev,
        shipping: { ...prev.shipping, cost: value },
      }));
    } else if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleTagsChange = (e) => {
    const tags = e.target.value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    setFormData((prev) => ({ ...prev, tags }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImageUrls = files.map((file) => ({
      public_id: `temp_${Date.now()}_${Math.random()}`, // Temporary ID
      url: URL.createObjectURL(file),
      file, // Store file for upload
    }));
    setNewImages((prev) => [...prev, ...newImageUrls]);
  };

  const handleRemoveImage = async (image, isNew = false) => {
    if (isNew) {
      setNewImages((prev) =>
        prev.filter((img) => img.public_id !== image.public_id)
      );
    } else {
      try {
        const response = await fetch(`${API_BASE_URL}/product/delete-image`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sellerToken}`,
          },
          credentials: "include",
          body: JSON.stringify({ public_id: image.public_id }),
        });
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.message || "Failed to delete image");
        setFormData((prev) => ({
          ...prev,
          images: prev.images.filter(
            (img) => img.public_id !== image.public_id
          ),
        }));
        toast.success("Image deleted successfully");
      } catch (error) {
        console.error("Delete image error:", error);
        toast.error(error.message || "Failed to delete image");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Basic validation
    if (
      !formData.name ||
      formData.name.length < 5 ||
      formData.name.length > 100
    ) {
      toast.error("Name must be between 5 and 100 characters", {
        toastId: "validation-error",
      });
      setIsSubmitting(false);
      return;
    }
    if (!formData.description) {
      toast.error("Description is required", { toastId: "validation-error" });
      setIsSubmitting(false);
      return;
    }
    if (!formData.category) {
      toast.error("Category is required", { toastId: "validation-error" });
      setIsSubmitting(false);
      return;
    }
    if (!formData.price || formData.price <= 0) {
      toast.error("Price must be greater than 0", {
        toastId: "validation-error",
      });
      setIsSubmitting(false);
      return;
    }
    if (formData.stock === undefined || formData.stock < 0) {
      toast.error("Stock must be 0 or greater", {
        toastId: "validation-error",
      });
      setIsSubmitting(false);
      return;
    }
    if (formData.images.length + newImages.length === 0) {
      toast.error("At least one image is required", {
        toastId: "validation-error",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Simulate image upload (replace with Cloudinary upload logic)
      const uploadedImages = await Promise.all(
        newImages.map(async (img) => {
          // Placeholder: Replace with actual Cloudinary upload
          return {
            public_id: img.public_id,
            url: img.url, // In reality, this would be the Cloudinary URL
          };
        })
      );

      const updatedFormData = {
        ...formData,
        images: [...formData.images, ...uploadedImages],
        price: Number(formData.price),
        priceDiscount: formData.priceDiscount
          ? Number(formData.priceDiscount)
          : undefined,
        stock: Number(formData.stock),
        shipping: {
          isFreeShipping: formData.shipping.isFreeShipping,
          cost: formData.shipping.isFreeShipping
            ? 0
            : Number(formData.shipping.cost),
        },
      };

      await updateProduct(id, updatedFormData, sellerToken);
      toast.success("Product updated successfully!");
      router.push("/shop/products");
    } catch (error) {
      console.error("Update product error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      const errorMessage =
        error.response?.status === 403
          ? "You are not authorized to update this product"
          : error.response?.status === 404
          ? "Product not found"
          : error.response?.data?.message || "Failed to update product";
      toast.error(errorMessage, { toastId: "update-error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
        <Link
          href="/shop/products"
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
        >
          <FaArrowLeft className="h-5 w-5" />
          <span>Back to Products</span>
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center">
          <FaSpinner className="animate-spin h-8 w-8 mx-auto text-blue-600" />
          <p className="text-gray-600 mt-2">Loading product...</p>
        </div>
      ) : error ? (
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => fetchSingleProduct(id, sellerToken)}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white p-6 rounded-lg shadow-md"
        >
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Product Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700"
            >
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* SubCategory */}
          <div>
            <label
              htmlFor="subCategory"
              className="block text-sm font-medium text-gray-700"
            >
              SubCategory (optional)
            </label>
            <input
              type="text"
              id="subCategory"
              name="subCategory"
              value={formData.subCategory}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {/* Price */}
          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700"
            >
              Price ($)
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>

          {/* Price Discount */}
          <div>
            <label
              htmlFor="priceDiscount"
              className="block text-sm font-medium text-gray-700"
            >
              Discount Price ($) (optional)
            </label>
            <input
              type="number"
              id="priceDiscount"
              name="priceDiscount"
              value={formData.priceDiscount}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {/* Stock */}
          <div>
            <label
              htmlFor="stock"
              className="block text-sm font-medium text-gray-700"
            >
              Stock Quantity
            </label>
            <input
              type="number"
              id="stock"
              name="stock"
              value={formData.stock}
              onChange={handleInputChange}
              min="0"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>

          {/* Tags */}
          <div>
            <label
              htmlFor="tags"
              className="block text-sm font-medium text-gray-700"
            >
              Tags (comma-separated, optional)
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags.join(", ")}
              onChange={handleTagsChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {/* Images */}
          <div>
            <label
              htmlFor="images"
              className="block text-sm font-medium text-gray-700"
            >
              Images
            </label>
            <input
              type="file"
              id="images"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {formData.images.map((image) => (
                <div key={image.public_id} className="relative">
                  <img
                    src={image.url}
                    alt="Product"
                    className="h-24 w-full object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(image, false)}
                    className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full"
                  >
                    <FaTrash className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {newImages.map((image) => (
                <div key={image.public_id} className="relative">
                  <img
                    src={image.url}
                    alt="New Product"
                    className="h-24 w-full object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(image, true)}
                    className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full"
                  >
                    <FaTrash className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isFreeShipping"
                checked={formData.shipping.isFreeShipping}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Free Shipping</span>
            </label>
            {!formData.shipping.isFreeShipping && (
              <div className="mt-2">
                <label
                  htmlFor="shippingCost"
                  className="block text-sm font-medium text-gray-700"
                >
                  Shipping Cost ($)
                </label>
                <input
                  type="number"
                  id="shippingCost"
                  name="shippingCost"
                  value={formData.shipping.cost}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            )}
          </div>

          {/* Made in Canada */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isMadeInCanada"
                checked={formData.isMadeInCanada}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Made in Canada</span>
            </label>
            {formData.isMadeInCanada && (
              <div className="mt-2">
                <label
                  htmlFor="canadianCertification"
                  className="block text-sm font-medium text-gray-700"
                >
                  Canadian Certification (optional)
                </label>
                <input
                  type="text"
                  id="canadianCertification"
                  name="canadianCertification"
                  value={formData.canadianCertification}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed ${
                isSubmitting ? "flex items-center" : ""
              }`}
            >
              {isSubmitting && (
                <FaSpinner className="animate-spin h-5 w-5 mr-2" />
              )}
              {isSubmitting ? "Updating..." : "Update Product"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
