"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import useAuthStore from "@/store/authStore";
import { toast } from "react-toastify";
import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_SERVER || "http://localhost:8000/api/v2";

const CreateProductForm = () => {
  const { seller, isSeller, sellerToken } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const productId = params.id;
  const isEditing = !!productId;

  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [errors, setErrors] = useState({});

  const initialFormData = {
    name: "",
    description: "",
    categories: [],
    culturalCategory: "",
    subCategory: "",
    price: "",
    priceDiscount: "",
    stock: "",
    tags: "",
    isMadeInCanada: false,
    canadianCertification: "",
    shipping: {
      weight: "",
      dimensions: { length: "", width: "", height: "" },
      isFreeShipping: false,
      cost: "",
    },
    flashSale: {
      isActive: false,
      discountPrice: "",
      startDate: "",
      endDate: "",
      stockLimit: "",
    },
  };

  const [formData, setFormData] = useState(initialFormData);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [variations, setVariations] = useState([]);
  const [newVariation, setNewVariation] = useState({
    name: "",
    options: "",
    price: "",
    stock: "",
  });
  const [categories, setCategories] = useState({ primary: [], cultural: [] });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(
          `${API_BASE_URL}/product/get-categories`
        );
        setCategories(data.categories);
      } catch (error) {
        console.error("Fetch categories error:", error.message);
        toast.error("Failed to load categories");
      }
    };
    fetchCategories();

    if (!isSeller || !seller?._id) {
      toast.error("Please login to your shop", { toastId: "auth-error" });
      router.push("/shop/login");
      return;
    }

    if (isEditing) {
      if (!productId || !/^[0-9a-fA-F]{24}$/.test(productId)) {
        console.error("Invalid product ID", { productId });
        setFetchError("Invalid product ID");
        toast.error("Invalid product ID", { toastId: "fetch-error" });
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
                Authorization: sellerToken
                  ? `Bearer ${sellerToken}`
                  : undefined,
              },
            }
          );
          const product = data.product;

          setFormData({
            name: product.name || "",
            description: product.description || "",
            categories: product.categories || [],
            culturalCategory: product.culturalCategories?.[0] || "",
            subCategory: product.subCategory || "",
            price: product.price?.toString() || "",
            priceDiscount: product.priceDiscount?.toString() || "",
            stock: product.stock?.toString() || "",
            tags: product.tags?.join(", ") || "",
            isMadeInCanada: product.isMadeInCanada || false,
            canadianCertification: product.canadianCertification || "",
            shipping: {
              weight: product.shipping?.weight?.toString() || "",
              dimensions: {
                length: product.shipping?.dimensions?.length?.toString() || "",
                width: product.shipping?.dimensions?.width?.toString() || "",
                height: product.shipping?.dimensions?.height?.toString() || "",
              },
              isFreeShipping: product.shipping?.isFreeShipping || false,
              cost: product.shipping?.cost?.toString() || "",
            },
            flashSale: {
              isActive: product.flashSale?.isActive || false,
              discountPrice: product.flashSale?.discountPrice?.toString() || "",
              startDate: product.flashSale?.startDate
                ? new Date(product.flashSale.startDate)
                    .toISOString()
                    .slice(0, 16)
                : "",
              endDate: product.flashSale?.endDate
                ? new Date(product.flashSale.endDate).toISOString().slice(0, 16)
                : "",
              stockLimit: product.flashSale?.stockLimit?.toString() || "",
            },
          });

          setImages(product.images || []);
          setImagePreviews(product.images?.map((img) => img.url) || []);
          setVariations(product.variations || []);
        } catch (error) {
          console.error("Fetch product error:", {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            productId,
          });
          setFetchError(
            error.response?.data?.message ||
              `Failed to load product data (Status: ${
                error.response?.status || "unknown"
              })`
          );
          toast.error(
            error.response?.data?.message ||
              `Failed to load product data (Status: ${
                error.response?.status || "unknown"
              })`,
            { toastId: "fetch-error" }
          );
        } finally {
          setIsLoading(false);
        }
      };
      fetchProduct();
    }
  }, [isSeller, seller, sellerToken, router, isEditing, productId]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (formData.name.length > 100)
      newErrors.name = "Name must be 100 characters or less";
    if (formData.name.length < 5 && formData.name)
      newErrors.name = "Name must be at least 5 characters";
    if (!formData.description)
      newErrors.description = "Description is required";
    if (formData.categories.length === 0)
      newErrors.categories = "At least one category is required";
    if (!formData.price || Number(formData.price) <= 0)
      newErrors.price = "Price must be positive";
    if (
      formData.priceDiscount &&
      Number(formData.priceDiscount) >= Number(formData.price)
    )
      newErrors.priceDiscount = "Discount must be less than price";
    if (!formData.stock || Number(formData.stock) < 0)
      newErrors.stock = "Stock cannot be negative";
    if (images.length === 0)
      newErrors.images = "At least one image is required";
    if (
      formData.flashSale.isActive &&
      (!formData.flashSale.discountPrice ||
        !formData.flashSale.startDate ||
        !formData.flashSale.endDate ||
        !formData.flashSale.stockLimit)
    )
      newErrors.flashSale = "All flash sale fields are required when active";
    if (
      formData.flashSale.discountPrice &&
      Number(formData.flashSale.discountPrice) >= Number(formData.price)
    )
      newErrors.flashSaleDiscountPrice =
        "Flash sale price must be less than regular price";
    if (
      formData.flashSale.startDate &&
      formData.flashSale.endDate &&
      new Date(formData.flashSale.startDate) >=
        new Date(formData.flashSale.endDate)
    )
      newErrors.flashSaleDates = "End date must be after start date";
    return newErrors;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes("shipping.")) {
      const [parent, field] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        shipping: {
          ...prev.shipping,
          [field]: type === "checkbox" ? checked : value,
        },
      }));
    } else if (name.includes("dimensions.")) {
      const [, field] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        shipping: {
          ...prev.shipping,
          dimensions: { ...prev.shipping.dimensions, [field]: value },
        },
      }));
    } else if (name.includes("flashSale.")) {
      const [, field] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        flashSale: {
          ...prev.flashSale,
          [field]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleCategoryChange = (e) => {
    const { options } = e.target;
    const selectedCategories = Array.from(options)
      .filter((option) => option.selected)
      .map((option) => option.value);
    setFormData((prev) => ({
      ...prev,
      categories: selectedCategories,
    }));
    setErrors((prev) => ({ ...prev, categories: "" }));
  };

  const handleCulturalCategoryChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      culturalCategory: e.target.value,
    }));
  };

  const handleVariationChange = (e) => {
    const { name, value } = e.target;
    setNewVariation((prev) => ({ ...prev, [name]: value }));
  };

  const addVariation = () => {
    if (
      !newVariation.name ||
      !newVariation.options ||
      !newVariation.price ||
      !newVariation.stock
    ) {
      toast.error("Please fill all variation fields");
      return;
    }
    setVariations((prev) => [
      ...prev,
      {
        name: newVariation.name,
        options: newVariation.options.split(",").map((opt) => opt.trim()),
        price: Number(newVariation.price),
        stock: Number(newVariation.stock),
      },
    ]);
    setNewVariation({ name: "", options: "", price: "", stock: "" });
  };

  const removeVariation = (index) => {
    setVariations((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    setIsLoading(true);
    const newImages = [];
    const newPreviews = [];

    try {
      for (const file of files) {
        const formDataToUpload = new FormData();
        formDataToUpload.append("file", file);
        formDataToUpload.append("upload_preset", "gdmugccy");
        formDataToUpload.append(
          "cloud_name",
          process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
        );

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: formDataToUpload,
          }
        );
        const data = await res.json();
        if (!data.secure_url) {
          throw new Error("Image upload failed");
        }
        newImages.push({ url: data.secure_url, public_id: data.public_id });
        newPreviews.push(URL.createObjectURL(file));
      }

      setImages((prev) => [...prev, ...newImages]);
      setImagePreviews((prev) => [...prev, ...newPreviews]);
      setErrors((prev) => ({ ...prev, images: "" }));
    } catch (error) {
      console.error("Image upload error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      toast.error(error.message || "Failed to upload images");
    } finally {
      setIsLoading(false);
    }
  };

  const removeImage = async (index) => {
    const image = images[index];
    if (image.public_id) {
      try {
        await axios.post(
          `${API_BASE_URL}/product/delete-image`,
          { public_id: image.public_id },
          {
            withCredentials: true,
            headers: {
              Authorization: sellerToken ? `Bearer ${sellerToken}` : undefined,
            },
          }
        );
      } catch (error) {
        console.error("Delete image error:", {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          public_id: image.public_id,
        });
        toast.error(
          error.response?.data?.message ||
            "Failed to delete image from Cloudinary"
        );
      }
    }
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!seller?._id || !sellerToken) {
      toast.error("Please log in as a seller", { toastId: "auth-error" });
      router.push("/shop/login");
      return;
    }

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix the form errors");
      return;
    }

    setIsLoading(true);

    try {
      const productData = {
        ...formData,
        shopId: seller._id,
        images: images.map((img) => ({
          url: img.url,
          public_id: img.public_id,
        })),
        tags: formData.tags
          ? formData.tags.split(",").map((tag) => tag.trim())
          : [],
        culturalCategories: formData.culturalCategory
          ? [formData.culturalCategory]
          : [],
        price: Number(formData.price),
        priceDiscount: formData.priceDiscount
          ? Number(formData.priceDiscount)
          : undefined,
        stock: Number(formData.stock),
        shipping: {
          ...formData.shipping,
          weight: formData.shipping.weight
            ? Number(formData.shipping.weight)
            : undefined,
          dimensions: {
            length: formData.shipping.dimensions.length
              ? Number(formData.shipping.dimensions.length)
              : undefined,
            width: formData.shipping.dimensions.width
              ? Number(formData.shipping.dimensions.width)
              : undefined,
            height: formData.shipping.dimensions.height
              ? Number(formData.shipping.dimensions.height)
              : undefined,
          },
          cost: formData.shipping.cost
            ? Number(formData.shipping.cost)
            : undefined,
        },
        variations: variations.length > 0 ? variations : undefined,
        flashSale: {
          ...formData.flashSale,
          discountPrice: formData.flashSale.discountPrice
            ? Number(formData.flashSale.discountPrice)
            : undefined,
          stockLimit: formData.flashSale.stockLimit
            ? Number(formData.flashSale.stockLimit)
            : undefined,
          startDate: formData.flashSale.startDate
            ? new Date(formData.flashSale.startDate)
            : undefined,
          endDate: formData.flashSale.endDate
            ? new Date(formData.flashSale.endDate)
            : undefined,
        },
      };

      if (isEditing) {
        if (!productId || !/^[0-9a-fA-F]{24}$/.test(productId)) {
          throw new Error("Invalid product ID");
        }
        const response = await axios.put(
          `${API_BASE_URL}/product/update-product/${productId}`,
          productData,
          {
            withCredentials: true,
            headers: {
              Authorization: sellerToken ? `Bearer ${sellerToken}` : undefined,
            },
          }
        );
        toast.success(response.data.message || "Product updated successfully!");
      } else {
        const response = await axios.post(
          `${API_BASE_URL}/product/create-product`,
          productData,
          {
            withCredentials: true,
            headers: {
              Authorization: sellerToken ? `Bearer ${sellerToken}` : undefined,
            },
          }
        );
        toast.success(response.data.message || "Product created successfully!");
      }

      setFormData(initialFormData);
      setImages([]);
      setImagePreviews([]);
      setVariations([]);
      setErrors({});
      router.push("/shop/products");
    } catch (error) {
      console.error(`${isEditing ? "Update" : "Create"} product error:`, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        productId: isEditing ? productId : undefined,
      });
      toast.error(
        error.response?.data?.message ||
          `Failed to ${isEditing ? "update" : "create"} product (Status: ${
            error.response?.status || "unknown"
          })`
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isEditing && fetchError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-xl shadow-2xl">
          <h2 className="text-3xl font-bold text-red-600 text-center">
            Error Loading Product
          </h2>
          <p className="text-center text-gray-600">{fetchError}</p>
          <div className="flex justify-center">
            <button
              onClick={() => router.push("/shop/products")}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors duration-200"
            >
              Back to Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading && isEditing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-xl shadow-2xl">
          <div className="flex justify-center">
            <svg
              className="animate-spin h-8 w-8 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
          <p className="text-center text-gray-600 text-lg">
            Loading product data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-10">
        <h2 className="text-3xl font-bold text-blue-600 text-center mb-8">
          {isEditing ? "Edit Product" : "Create New Product"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                    errors.name
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-blue-500"
                  } focus:ring-2 focus:ring-blue-200 focus:outline-none`}
                  placeholder="Enter product name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Categories *
                </label>
                <select
                  name="categories"
                  multiple
                  value={formData.categories}
                  onChange={handleCategoryChange}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                    errors.categories
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-blue-500"
                  } focus:ring-2 focus:ring-blue-200 focus:outline-none h-32`}
                >
                  {categories.primary.map((cat) => (
                    <option key={cat} value={cat} className="py-1">
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
                {errors.categories && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.categories}
                  </p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cultural Category *
              </label>
              <select
                name="culturalCategory"
                value={formData.culturalCategory}
                onChange={handleCulturalCategoryChange}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
              >
                <option value="">Select a cultural category</option>
                {categories.cultural.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                  errors.description
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 focus:border-blue-500"
                } focus:ring-2 focus:ring-blue-200 focus:outline-none`}
                placeholder="Describe your product"
              ></textarea>
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description}
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sub-Category
                </label>
                <input
                  type="text"
                  name="subCategory"
                  value={formData.subCategory}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
                  placeholder="Enter sub-category"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
                  placeholder="e.g., handmade, vintage, eco-friendly"
                />
              </div>
            </div>
          </div>

          {/* Pricing and Stock */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Pricing & Stock
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price ($) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                    errors.price
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-blue-500"
                  } focus:ring-2 focus:ring-blue-200 focus:outline-none`}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
                {errors.price && (
                  <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Price ($)
                </label>
                <input
                  type="number"
                  name="priceDiscount"
                  value={formData.priceDiscount}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                    errors.priceDiscount
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-blue-500"
                  } focus:ring-2 focus:ring-blue-200 focus:outline-none`}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
                {errors.priceDiscount && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.priceDiscount}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                    errors.stock
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-blue-500"
                  } focus:ring-2 focus:ring-blue-200 focus:outline-none`}
                  min="0"
                  placeholder="0"
                />
                {errors.stock && (
                  <p className="text-red-500 text-sm mt-1">{errors.stock}</p>
                )}
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Product Images
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Images (Max 5) *
              </label>
              <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-all duration-200">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <p className="mt-1 text-sm text-gray-600">
                    Drag and drop images here, or click to select files
                  </p>
                </div>
              </div>
              {errors.images && (
                <p className="text-red-500 text-sm mt-1">{errors.images}</p>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="h-32 w-full object-cover rounded-lg shadow-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      ></path>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Variations */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Variations</h3>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Variation Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={newVariation.name}
                  onChange={handleVariationChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
                  placeholder="e.g., Size, Color"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Options (comma-separated)
                </label>
                <input
                  type="text"
                  name="options"
                  value={newVariation.options}
                  onChange={handleVariationChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
                  placeholder="e.g., Small, Medium, Large"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price
                </label>
                <input
                  type="number"
                  name="price"
                  value={newVariation.price}
                  onChange={handleVariationChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock
                </label>
                <input
                  type="number"
                  name="stock"
                  value={newVariation.stock}
                  onChange={handleVariationChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
                  min="0"
                  placeholder="0"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={addVariation}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
            >
              Add Variation
            </button>
            {variations.length > 0 && (
              <div className="mt-4 space-y-2">
                {variations.map((variation, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg"
                  >
                    <p className="text-sm text-gray-700">
                      {variation.name}: {variation.options.join(", ")} - $
                      {variation.price.toFixed(2)}, Stock: {variation.stock}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeVariation(index)}
                      className="text-red-500 hover:text-red-700 transition-colors duration-200"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Canadian Certification */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Canadian Certification
            </h3>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isMadeInCanada"
                checked={formData.isMadeInCanada}
                onChange={handleInputChange}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-3 text-sm font-medium text-gray-700">
                Made in Canada
              </label>
            </div>
            {formData.isMadeInCanada && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Canadian Certification *
                </label>
                <input
                  type="text"
                  name="canadianCertification"
                  value={formData.canadianCertification}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
                  placeholder="Enter certification details"
                />
              </div>
            )}
          </div>

          {/* Shipping */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Shipping Details
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  name="shipping.weight"
                  value={formData.shipping.weight}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Length (cm)
                </label>
                <input
                  type="number"
                  name="dimensions.length"
                  value={formData.shipping.dimensions.length}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Width (cm)
                </label>
                <input
                  type="number"
                  name="dimensions.width"
                  value={formData.shipping.dimensions.width}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height (cm)
                </label>
                <input
                  type="number"
                  name="dimensions.height"
                  value={formData.shipping.dimensions.height}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shipping Cost ($)
                </label>
                <input
                  type="number"
                  name="shipping.cost"
                  value={formData.shipping.cost}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="shipping.isFreeShipping"
                  checked={formData.shipping.isFreeShipping}
                  onChange={handleInputChange}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-3 text-sm font-medium text-gray-700">
                  Free Shipping
                </label>
              </div>
            </div>
          </div>

          {/* Flash Sale */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Flash Sale</h3>
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                name="flashSale.isActive"
                checked={formData.flashSale.isActive}
                onChange={handleInputChange}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-3 text-sm font-medium text-gray-700">
                Enable Flash Sale
              </label>
            </div>
            {formData.flashSale.isActive && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Flash Sale Price ($)
                  </label>
                  <input
                    type="number"
                    name="flashSale.discountPrice"
                    value={formData.flashSale.discountPrice}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                      errors.flashSaleDiscountPrice
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-300 focus:border-blue-500"
                    } focus:ring-2 focus:ring-blue-200 focus:outline-none`}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                  {errors.flashSaleDiscountPrice && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.flashSaleDiscountPrice}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="datetime-local"
                    name="flashSale.startDate"
                    value={formData.flashSale.startDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="datetime-local"
                    name="flashSale.endDate"
                    value={formData.flashSale.endDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
                  />
                  {errors.flashSaleDates && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.flashSaleDates}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Limit
                  </label>
                  <input
                    type="number"
                    name="flashSale.stockLimit"
                    value={formData.flashSale.stockLimit}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
                    min="0"
                    placeholder="0"
                  />
                </div>
              </div>
            )}
            {errors.flashSale && (
              <p className="text-red-500 text-sm mt-1">{errors.flashSale}</p>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={() => router.push("/shop/products")}
              className="inline-flex items-center px-6 py-3 border-2 border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isLoading
                ? "Processing..."
                : isEditing
                ? "Update Product"
                : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProductForm;
