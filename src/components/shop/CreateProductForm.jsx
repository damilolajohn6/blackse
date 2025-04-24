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
    category: "",
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

  useEffect(() => {
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
            category: product.category || "",
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
    if (!formData.category) newErrors.category = "Category is required";
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
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
    setErrors((prev) => ({ ...prev, [name]: "" }));
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
      <div className="py-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold text-red-600 text-center mb-6">
          Error Loading Product
        </h2>
        <p className="text-center text-gray-600">{fetchError}</p>
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

  if (isLoading && isEditing) {
    return (
      <div className="py-6 max-w-4xl mx-auto">
        <p className="text-center text-gray-600">Loading product data...</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-xl p-4 sm:p-6 mx-auto max-w-4xl">
      <h2 className="text-2xl sm:text-3xl font-semibold text-blue-600 text-center mb-6">
        {isEditing ? "Edit Product" : "Create New Product"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors.name ? "border-red-500" : ""
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors.category ? "border-red-500" : ""
              }`}
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">{errors.category}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="4"
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
              errors.description ? "border-red-500" : ""
            }`}
          ></textarea>
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Sub-Category
            </label>
            <input
              type="text"
              name="subCategory"
              value={formData.subCategory}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., tech, new, sale"
            />
          </div>
        </div>

        {/* Pricing and Stock */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Price ($) *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors.price ? "border-red-500" : ""
              }`}
            />
            {errors.price && (
              <p className="text-red-500 text-sm mt-1">{errors.price}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Discount Price ($)
            </label>
            <input
              type="number"
              name="priceDiscount"
              value={formData.priceDiscount}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors.priceDiscount ? "border-red-500" : ""
              }`}
            />
            {errors.priceDiscount && (
              <p className="text-red-500 text-sm mt-1">
                {errors.priceDiscount}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Stock *
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleInputChange}
              min="0"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors.stock ? "border-red-500" : ""
              }`}
            />
            {errors.stock && (
              <p className="text-red-500 text-sm mt-1">{errors.stock}</p>
            )}
          </div>
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Images (Max 5) *
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {errors.images && (
            <p className="text-red-500 text-sm mt-1">{errors.images}</p>
          )}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative group">
                <img
                  src={preview}
                  alt={`Preview ${index}`}
                  className="w-full h-32 object-cover rounded-md border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Variations */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold text-blue-600 mb-4">
            Variations
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Variation Name
              </label>
              <input
                type="text"
                name="name"
                value={newVariation.name}
                onChange={handleVariationChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., Color"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Options
              </label>
              <input
                type="text"
                name="options"
                value={newVariation.options}
                onChange={handleVariationChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., Red, Blue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Price ($)
              </label>
              <input
                type="number"
                name="price"
                value={newVariation.price}
                onChange={handleVariationChange}
                min="0"
                step="0.01"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Stock
              </label>
              <input
                type="number"
                name="stock"
                value={newVariation.stock}
                onChange={handleVariationChange}
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={addVariation}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            Add Variation
          </button>
          {variations.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700">
                Added Variations
              </h4>
              <ul className="mt-2 space-y-2">
                {variations.map((varItem, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between bg-gray-50 p-2 rounded-md"
                  >
                    <span>
                      {varItem.name}: {varItem.options.join(", ")} (Price: $
                      {varItem.price}, Stock: {varItem.stock})
                    </span>
                    <button
                      type="button"
                      onClick={() => removeVariation(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Canadian Origin */}
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="isMadeInCanada"
              checked={formData.isMadeInCanada}
              onChange={handleInputChange}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Made in Canada</span>
          </label>
          {formData.isMadeInCanada && (
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">
                Certification
              </label>
              <input
                type="text"
                name="canadianCertification"
                value={formData.canadianCertification}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        {/* Shipping */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold text-blue-600 mb-4">
            Shipping Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Weight (kg)
              </label>
              <input
                type="number"
                name="shipping.weight"
                value={formData.shipping.weight}
                onChange={handleInputChange}
                min="0"
                step="0.1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Shipping Cost ($)
              </label>
              <input
                type="number"
                name="shipping.cost"
                value={formData.shipping.cost}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Length (cm)
              </label>
              <input
                type="number"
                name="shipping.dimensions.length"
                value={formData.shipping.dimensions.length}
                onChange={handleInputChange}
                min="0"
                step="0.1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Width (cm)
              </label>
              <input
                type="number"
                name="shipping.dimensions.width"
                value={formData.shipping.dimensions.width}
                onChange={handleInputChange}
                min="0"
                step="0.1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Height (cm)
              </label>
              <input
                type="number"
                name="shipping.dimensions.height"
                value={formData.shipping.dimensions.height}
                onChange={handleInputChange}
                min="0"
                step="0.1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
          <label className="flex items-center mt-4">
            <input
              type="checkbox"
              name="shipping.isFreeShipping"
              checked={formData.shipping.isFreeShipping}
              onChange={handleInputChange}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Free Shipping</span>
          </label>
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push("/shop/products")}
            className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading
              ? isEditing
                ? "Updating..."
                : "Creating..."
              : isEditing
              ? "Update Product"
              : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProductForm;
