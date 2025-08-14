"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import useShopStore from "@/store/shopStore";
import { toast } from "react-toastify";
import axios from "axios";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Check, ChevronsUpDown, X } from 'lucide-react'; 7
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Jost } from "next/font/google";

const jost = Jost(
  { 
    subsets: ["latin"], 
    weight: ["100", "200", "300", "400", "500", "600", "700", "800"]
  }, 
)


const API_BASE_URL =
  process.env.NEXT_PUBLIC_SERVER || "http://localhost:8000/api/v2";

const CreateProductForm = () => {
  const { seller, isSeller, sellerToken } = useShopStore();
  const router = useRouter();
  const params = useParams();
  const productId = params?.id;
  const isEditing = !!productId;

  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [errors, setErrors] = useState({});
  const [open, setOpen] = useState(false)

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
    videos: [],
    variations: [

    ],
  };

  const [formData, setFormData] = useState(initialFormData);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [videos, setVideos] = useState([]);
  const [videoPreviews, setVideoPreviews] = useState([]);
  const [variations, setVariations] = useState([]);
  const [newVariation, setNewVariation] = useState({
    name: "",
    options: "",
    price: "",
    stock: "",
    image: null,
    imagePreview: "",
    imageUploading: false,
  });
  const [categories, setCategories] = useState({ primary: [], cultural: [] });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(
          `${API_BASE_URL}/product/get-categories`
        );
        setCategories(data.categories || { primary: [], cultural: [] });
      } catch (error) {
        console.error("Fetch categories error:", error.message);
        toast.error("Failed to load categories");
        setCategories({ primary: [], cultural: [] });
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
            tags: Array.isArray(product.tags) ? product.tags.join(", ") : "",
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
            videos: product.videos || [],
          });

          setImages(product.images || []);
          setImagePreviews(product.images?.map((img) => img.url) || []);
          setVideos(product.videos || []);
          setVideoPreviews(product.videos?.map((vid) => vid.url) || []);
          setVariations(product.variations || []);
        } catch (error) {
          console.error("Fetch product error:", {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            productId,
          });
          const errorMessage =
            error.response?.data?.message ||
            `Failed to load product data (Status: ${error.response?.status || "unknown"
            })`;
          setFetchError(errorMessage);
          toast.error(errorMessage, { toastId: "fetch-error" });
        } finally {
          setIsLoading(false);
        }
      };
      fetchProduct();
    }
  }, [isSeller, seller, sellerToken, router, isEditing, productId]);

  const validateForm = () => {
    const newErrors = {};

    // Basic validation
    if (!formData.name?.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length > 100) {
      newErrors.name = "Name must be 100 characters or less";
    } else if (formData.name.length < 5) {
      newErrors.name = "Name must be at least 5 characters";
    }

    if (!formData.description?.trim()) {
      newErrors.description = "Description is required";
    }

    if (
      !Array.isArray(formData.categories) ||
      formData.categories.length === 0
    ) {
      newErrors.categories = "At least one category is required";
    }

    const price = parseFloat(formData.price);
    if (!formData.price || isNaN(price) || price <= 0) {
      newErrors.price = "Price must be positive";
    }

    if (formData.priceDiscount) {
      const discount = parseFloat(formData.priceDiscount);
      if (isNaN(discount) || discount >= price) {
        newErrors.priceDiscount = "Discount must be less than price";
      }
    }

    const stock = parseInt(formData.stock);
    if (!formData.stock || isNaN(stock) || stock < 0) {
      newErrors.stock = "Stock cannot be negative";
    }

    if (!Array.isArray(images) || images.length === 0) {
      newErrors.images = "At least one image is required";
    }

    // Flash sale validation
    if (formData.flashSale.isActive) {
      if (
        !formData.flashSale.discountPrice ||
        !formData.flashSale.startDate ||
        !formData.flashSale.endDate ||
        !formData.flashSale.stockLimit
      ) {
        newErrors.flashSale = "All flash sale fields are required when active";
      }

      if (formData.flashSale.discountPrice) {
        const flashPrice = parseFloat(formData.flashSale.discountPrice);
        if (isNaN(flashPrice) || flashPrice >= price) {
          newErrors.flashSaleDiscountPrice =
            "Flash sale price must be less than regular price";
        }
      }

      if (formData.flashSale.startDate && formData.flashSale.endDate) {
        const startDate = new Date(formData.flashSale.startDate);
        const endDate = new Date(formData.flashSale.endDate);
        if (startDate >= endDate) {
          newErrors.flashSaleDates = "End date must be after start date";
        }
      }
    }

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

    // Clear error for this field
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // const handleCategoryChange = (e) => {
  //   const { options } = e.target;
  //   const selectedCategories = Array.from(options)
  //     .filter((option) => option.selected)
  //     .map((option) => option.value);
  //   setFormData((prev) => ({
  //     ...prev,
  //     categories: selectedCategories,
  //   }));
  //   setErrors((prev) => ({ ...prev, categories: "" }));
  // };

  const handleCategoryToggle = (category) => {
    const newCategories = formData.categories.includes(category)
      ? formData.categories.filter(cat => cat !== category)
      : [...formData.categories, category];

    setFormData({ ...formData, categories: newCategories });
  };

  const removeCategory = (categoryToRemove) => {
    const newCategories = formData.categories.filter(cat => cat !== categoryToRemove);
    setFormData({ ...formData, categories: newCategories });
  };

  const clearAllCategories = () => {
    setFormData({ ...formData, categories: [] });
  };

  const handleCulturalCategoryChange = (selected) => {
    setFormData({ ...formData, culturalCategory: selected });
  };

  // const handleCulturalCategoryChange = (e) => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     culturalCategory: e.target.value,
  //   }));
  // };

  const handleVariationChange = (e) => {
    const { name, value } = e.target;
    setNewVariation((prev) => ({ ...prev, [name]: value }));
  };

  const handleVariationImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setNewVariation((prev) => ({ ...prev, imageUploading: true }));

    try {
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

      setNewVariation((prev) => ({
        ...prev,
        image: { url: data.secure_url, public_id: data.public_id },
        imagePreview: data.secure_url,
        imageUploading: false,
      }));

      toast.success("Variation image uploaded successfully");
    } catch (error) {
      console.error("Variation image upload error:", error);
      toast.error("Failed to upload variation image");
      setNewVariation((prev) => ({ ...prev, imageUploading: false }));
    }
  };

  const removeVariationImage = async () => {
    if (newVariation.image?.public_id) {
      try {
        await axios.post(
          `${API_BASE_URL}/product/delete-image`,
          { public_id: newVariation.image.public_id },
          {
            withCredentials: true,
            headers: {
              Authorization: sellerToken ? `Bearer ${sellerToken}` : undefined,
            },
          }
        );
      } catch (error) {
        console.error("Delete variation image error:", error);
        toast.error("Failed to delete image from cloud storage");
      }
    }

    setNewVariation((prev) => ({
      ...prev,
      image: null,
      imagePreview: "",
    }));
    toast.success("Variation image removed");
  };

  const addVariation = () => {
    if (
      !newVariation.name?.trim() ||
      !newVariation.options?.trim() ||
      !newVariation.price ||
      !newVariation.stock
    ) {
      toast.error("Please fill all required variation fields");
      return;
    }

    const price = parseFloat(newVariation.price);
    const stock = parseInt(newVariation.stock);

    if (isNaN(price) || price < 0) {
      toast.error("Please enter a valid price");
      return;
    }

    if (isNaN(stock) || stock < 0) {
      toast.error("Please enter a valid stock number");
      return;
    }

    const variation = {
      name: newVariation.name.trim(),
      options: newVariation.options
        .split(",")
        .map((opt) => opt.trim())
        .filter((opt) => opt),
      price: price,
      stock: stock,
    };

    // Add image if provided
    if (newVariation.image) {
      variation.image = newVariation.image;
    }

    setVariations((prev) => [...prev, variation]);
    setNewVariation({
      name: "",
      options: "",
      price: "",
      stock: "",
      image: null,
      imagePreview: "",
      imageUploading: false,
    });
    toast.success("Variation added successfully");
  };

  const removeVariation = async (index) => {
    const variation = variations[index];

    // Delete variation image from cloud if it exists
    if (variation.image?.public_id) {
      try {
        await axios.post(
          `${API_BASE_URL}/product/delete-image`,
          { public_id: variation.image.public_id },
          {
            withCredentials: true,
            headers: {
              Authorization: sellerToken ? `Bearer ${sellerToken}` : undefined,
            },
          }
        );
      } catch (error) {
        console.error("Delete variation image error:", error);
        toast.error("Failed to delete variation image from cloud storage");
      }
    }

    setVariations((prev) => prev.filter((_, i) => i !== index));
    toast.success("Variation removed successfully");
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    setIsLoading(true);
    const newImages = [];
    const newPreviews = [];

    try {
      for (const file of files) {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not an image file`);
          continue;
        }

        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} is too large. Maximum size is 10MB`);
          continue;
        }

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
          throw new Error(`Image upload failed for ${file.name}`);
        }
        newImages.push({ url: data.secure_url, public_id: data.public_id });
        newPreviews.push(data.secure_url);
      }

      if (newImages.length > 0) {
        setImages((prev) => [...prev, ...newImages]);
        setImagePreviews((prev) => [...prev, ...newPreviews]);
        setErrors((prev) => ({ ...prev, images: "" }));
        toast.success(`${newImages.length} image(s) uploaded successfully`);
      }
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error(error.message || "Failed to upload images");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVideoChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (videos.length + files.length > 3) {
      toast.error("Maximum 3 videos allowed");
      return;
    }

    // Supported video formats
    const supportedFormats = ["video/mp4", "video/webm", "video/ogg"];
    setIsLoading(true);
    const newVideos = [];
    const newVideoPreviews = [];

    try {
      for (const file of files) {
        // Validate file type
        if (!supportedFormats.includes(file.type)) {
          toast.error(
            `${file.name} is not a supported video format (MP4, WebM, Ogg)`
          );
          continue;
        }

        // Validate file size (100MB limit)
        if (file.size > 100 * 1024 * 1024) {
          toast.error(`${file.name} exceeds 100MB limit`);
          continue;
        }

        const formDataToUpload = new FormData();
        formDataToUpload.append("file", file);
        formDataToUpload.append("upload_preset", "gdmugccy");
        formDataToUpload.append(
          "cloud_name",
          process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
        );
        // Optimize video for streaming
        formDataToUpload.append("resource_type", "video");

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload`,
          {
            method: "POST",
            body: formDataToUpload,
          }
        );
        const data = await res.json();
        if (!data.secure_url) {
          throw new Error(`Video upload failed for ${file.name}`);
        }
        newVideos.push({ url: data.secure_url, public_id: data.public_id });
        newVideoPreviews.push(data.secure_url);
      }

      if (newVideos.length > 0) {
        setVideos((prev) => [...prev, ...newVideos]);
        setVideoPreviews((prev) => [...prev, ...newVideoPreviews]);
        toast.success(`${newVideos.length} video(s) uploaded successfully`);
      }
    } catch (error) {
      console.error("Video upload error:", error);
      toast.error(error.message || "Failed to upload videos");
    } finally {
      setIsLoading(false);
    }
  };

  const removeImage = async (index) => {
    const image = images[index];
    if (image?.public_id) {
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
        console.error("Delete image error:", error);
        toast.error("Failed to delete image from cloud storage");
      }
    }
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    toast.success("Image deleted successfully");
  };

  const removeVideo = async (index) => {
    const video = videos[index];
    if (video?.public_id) {
      try {
        await axios.post(
          `${API_BASE_URL}/product/delete-video`,
          { public_id: video.public_id },
          {
            withCredentials: true,
            headers: {
              Authorization: sellerToken ? `Bearer ${sellerToken}` : undefined,
            },
          }
        );
      } catch (error) {
        console.error("Delete video error:", error);
        toast.error("Failed to delete video from cloud storage");
      }
    }
    setVideos((prev) => prev.filter((_, i) => i !== index));
    setVideoPreviews((prev) => prev.filter((_, i) => i !== index));
    toast.success("Video deleted successfully");
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
        videos: videos.map((vid) => ({
          url: vid.url,
          public_id: vid.public_id,
        })),
        tags: formData.tags
          ? formData.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag)
          : [],
        culturalCategories: formData.culturalCategory
          ? [formData.culturalCategory]
          : [],
        price: parseFloat(formData.price),
        priceDiscount: formData.priceDiscount
          ? parseFloat(formData.priceDiscount)
          : undefined,
        stock: parseInt(formData.stock),
        shipping: {
          ...formData.shipping,
          weight: formData.shipping.weight
            ? parseFloat(formData.shipping.weight)
            : undefined,
          dimensions: {
            length: formData.shipping.dimensions.length
              ? parseFloat(formData.shipping.dimensions.length)
              : undefined,
            width: formData.shipping.dimensions.width
              ? parseFloat(formData.shipping.dimensions.width)
              : undefined,
            height: formData.shipping.dimensions.height
              ? parseFloat(formData.shipping.dimensions.height)
              : undefined,
          },
          cost: formData.shipping.cost
            ? parseFloat(formData.shipping.cost)
            : undefined,
        },
        variations: variations.length > 0 ? variations : undefined,
        flashSale: {
          ...formData.flashSale,
          discountPrice: formData.flashSale.discountPrice
            ? parseFloat(formData.flashSale.discountPrice)
            : undefined,
          stockLimit: formData.flashSale.stockLimit
            ? parseInt(formData.flashSale.stockLimit)
            : undefined,
          startDate: formData.flashSale.startDate
            ? new Date(formData.flashSale.startDate)
            : undefined,
          endDate: formData.flashSale.endDate
            ? new Date(formData.flashSale.endDate)
            : undefined,
        },
      };

      let response;
      if (isEditing) {
        if (!productId || !/^[0-9a-fA-F]{24}$/.test(productId)) {
          throw new Error("Invalid product ID");
        }
        response = await axios.put(
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
        response = await axios.post(
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

      // Reset form
      setFormData(initialFormData);
      setImages([]);
      setImagePreviews([]);
      setVideos([]);
      setVideoPreviews([]);
      setVariations([]);
      setNewVariation({
        name: "",
        options: "",
        price: "",
        stock: "",
        image: null,
        imagePreview: "",
        imageUploading: false,
      });
      setErrors({});
      router.push("/shop/products");
    } catch (error) {
      console.error(`${isEditing ? "Update" : "Create"} product error:`, error);
      const errorMessage =
        error.response?.data?.message ||
        `Failed to ${isEditing ? "update" : "create"} product (Status: ${error.response?.status || "unknown"
        })`;
      toast.error(errorMessage);
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-10">
        <h2 className="text-xl lg:text-3xl font-bold text-blue-600 text-center mb-4 lg:mb-8">
          {isEditing ? "Edit Product" : "Create New Product"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="space-y-6">
            <h3 className="text-sm lg:text-xl font-semibold text-gray-900">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name
                </Label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 ${errors.name
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
                <Label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Categories
                </Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between h-auto min-h-[40px] px-3 py-2"
                    >
                      <div className="flex flex-wra gap-1 flex-1 overflow-hidden">
                        {formData.categories.length === 0 ? (
                          <span className="text-gray-500">Select categories...</span>
                        ) : (
                          formData.categories.map((category) => (
                            <Badge
                              key={category}
                              variant="secondary"
                              className="text-xs"
                            >
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeCategory(category);
                                }}
                                className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))
                        )}
                      </div>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-full p-0" align="start">
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">Categories</h4>
                        {formData.categories.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearAllCategories}
                            className="h-6 px-2 text-xs"
                          >
                            Clear all
                          </Button>
                        )}
                      </div>

                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {categories.primary.map((category) => (
                          <div key={category} className="flex items-center space-x-2">
                            <Checkbox
                              id={category}
                              checked={formData.categories.includes(category)}
                              onCheckedChange={() => handleCategoryToggle(category)}
                            />
                            <label
                              htmlFor={category}
                              className="text-sm font-normal cursor-pointer flex-1"
                            >
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </label>
                          </div>
                        ))}
                      </div>

                      {formData.categories.length > 0 && (
                        <div className="pt-2 border-t">
                          <p className="text-xs text-gray-500">
                            {formData.categories.length} categor{formData.categories.length === 1 ? 'y' : 'ies'} selected
                          </p>
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
                {errors.categories && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.categories}
                  </p>
                )}
              </div>
            </div>
            <div>
              {/* Display selected categories outside the popover */}
              {formData.categories.length > 0 && (
                <div className="mt-4">
                  <p className="font-medium text-sm text-gray-600 mb-2">Selected Categories:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.categories.map((cat) => (
                      <Badge key={cat} variant="outline" className="text-sm">
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        <button
                          onClick={() => removeCategory(cat)}
                          className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">
                Cultural Category
              </Label>
              <Select
                name="culturalCategory"
                value={formData.culturalCategory}
                onValueChange={handleCulturalCategoryChange}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a cultural category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.cultural.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select >
            </div >
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </Label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 ${errors.description
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-300 focus:border-blue-500"
                  } focus:ring-2 focus:ring-blue-200 focus:outline-none`}
                placeholder="Describe your product"
              ></Textarea>
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description}
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-1">
                  Sub-Category
                </Label>
                <Input
                  type="text"
                  name="subCategory"
                  value={formData.subCategory}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
                  placeholder="Enter sub-category"
                />
              </div>
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma-separated)
                </Label>
                <Input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
                  placeholder="e.g., handmade, vintage, eco-friendly"
                />
              </div>
            </div>
          </div >

          {/* Pricing and Stock */}
          < div className="space-y-6" >
            <h3 className="text-xl font-semibold text-gray-900">
              Pricing & Stock
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-1">
                  Price ($)
                </Label>
                <Input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 ${errors.price
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
                <Label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Price ($)
                </Label>
                <Input
                  type="number"
                  name="priceDiscount"
                  value={formData.priceDiscount}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 ${errors.priceDiscount
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
                <Label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock
                </Label>
                <Input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 ${errors.stock
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
          </div >

          {/* Images */}
          < div className="space-y-6" >
            <h3 className="text-xl font-semibold text-gray-900">
              Product Images
            </h3>
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Images (Max 5) *
              </Label>
              <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-all duration-200">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isLoading}
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
              {isLoading && (
                <p className="text-center text-gray-600 mt-2">Uploading...</p>
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
          </div >

          {/* Videos */}
          < div className="space-y-6" >
            <h3 className="text-xl font-semibold text-gray-900">
              Product Videos
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Videos (Max 3, 100MB each)
              </label>
              <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-all duration-200">
                <input
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={handleVideoChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isLoading}
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
                    Drag and drop videos here, or click to select files
                  </p>
                </div>
              </div>
              {isLoading && (
                <p className="text-center text-gray-600 mt-2">Uploading...</p>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {videoPreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <video
                    src={preview}
                    controls
                    className="h-32 w-full object-cover rounded-lg shadow-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeVideo(index)}
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
          </div >

          {/* Variations */}
          < div className="space-y-6" >
            <h3 className="text-xl font-semibold text-gray-900">Variations</h3>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className={"text-lg font-medium text-gray-900 mb-4" + " " + jost.className}>
                Add New Variation
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-1">
                    Variation Name
                  </Label>
                  <Input
                    type="text"
                    name="name"
                    value={newVariation.name}
                    onChange={handleVariationChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
                    placeholder="e.g., Size, Color"
                  />
                </div>
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-1">
                    Options (comma-separated)
                  </Label>
                  <Input
                    type="text"
                    name="options"
                    value={newVariation.options}
                    onChange={handleVariationChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
                    placeholder="e.g., Small, Medium, Large"
                  />
                </div>
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-1">
                    Price
                  </Label>
                  <Input
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
                  <Label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock
                  </Label>
                  <Input
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

              {/* Variation Image Upload */}
              <div className="mb-4">
                <Label className="block text-sm font-medium text-gray-700 mb-1">
                  Variation Image (Optional)
                </Label>
                {!newVariation.imagePreview ? (
                  <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-all duration-200">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleVariationImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={newVariation.imageUploading}
                    />
                    <div className="text-center">
                      <svg
                        className="mx-auto h-8 w-8 text-gray-400"
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
                        {newVariation.imageUploading
                          ? "Uploading..."
                          : "Click to upload variation image"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="relative inline-block">
                    <img
                      src={newVariation.imagePreview}
                      alt="Variation preview"
                      className="h-20 w-20 object-cover rounded-lg shadow-md"
                    />
                    <button
                      type="button"
                      onClick={removeVariationImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors duration-200"
                    >
                      <svg
                        className="h-3 w-3"
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
                )}
              </div>

              <button
                type="button"
                onClick={addVariation}
                disabled={newVariation.imageUploading}
                className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white transition-colors duration-200 ${newVariation.imageUploading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                  }`}
              >
                {newVariation.imageUploading
                  ? "Uploading Image..."
                  : "Add Variation"}
              </button>
            </div>

            {
              variations.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900">
                    Current Variations
                  </h4>
                  {variations.map((variation, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-start py-4 px-6 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-start space-x-4">
                        {variation.image && (
                          <img
                            src={variation.image.url}
                            alt={`${variation.name} variation`}
                            className="h-16 w-16 object-cover rounded-lg shadow-md flex-shrink-0"
                          />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">
                            {variation.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            Options: {variation.options.join(", ")}
                          </p>
                          <p className="text-sm text-gray-600">
                            Price: ${variation.price.toFixed(2)} | Stock:{" "}
                            {variation.stock}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeVariation(index)}
                        className="text-red-500 hover:text-red-700 transition-colors duration-200 flex-shrink-0"
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          ></path>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )
            }
          </div >

          {/* Canadian Certification */}
          <div div className="space-y-6" >
            <h3 className="text-xl font-semibold text-gray-900">
              Canadian Certification
            </h3>
            <div className="flex items-center">
              <Input
                type="checkbox"
                name="isMadeInCanada"
                checked={formData.isMadeInCanada}
                onChange={handleInputChange}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <Label className="ml-3 text-sm font-medium text-gray-700">
                Made in Canada
              </Label>
            </div>
            {
              formData.isMadeInCanada && (
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-1">
                    Canadian Certification *
                  </Label>
                  <Input
                    type="text"
                    name="canadianCertification"
                    value={formData.canadianCertification}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
                    placeholder="Enter certification details"
                  />
                </div>
              )
            }
          </div>

          {/* Shipping */}
          < div className="space-y-6" >
            <h3 className="text-xl font-semibold text-gray-900">
              Shipping Details
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (kg)
                </Label>
                <Input
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
                <Label className="block text-sm font-medium text-gray-700 mb-1">
                  Length (cm)
                </Label>
                <Input
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
                <Label className="block text-sm font-medium text-gray-700 mb-1">
                  Width (cm)
                </Label>
                <Input
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
                <Label className="block text-sm font-medium text-gray-700 mb-1">
                  Height (cm)
                </Label>
                <Input
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
                <Label className="block text-sm font-medium text-gray-700 mb-1">
                  Shipping Cost ($)
                </Label>
                <Input
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
                <Input
                  type="checkbox"
                  name="shipping.isFreeShipping"
                  checked={formData.shipping.isFreeShipping}
                  onChange={handleInputChange}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <Label className="ml-3 text-sm font-medium text-gray-700">
                  Free Shipping
                </Label>
              </div>
            </div>
          </div >

          {/* Flash Sale */}
          < div className="space-y-6" >
            <h3 className="text-xl font-semibold text-gray-900">Flash Sale</h3>
            <div className="flex items-center mb-4">
              <Input
                type="checkbox"
                name="flashSale.isActive"
                checked={formData.flashSale.isActive}
                onChange={handleInputChange}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <Label className="ml-3 text-sm font-medium text-gray-700">
                Enable Flash Sale
              </Label>
            </div>
            {
              formData.flashSale.isActive && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-1">
                      Flash Sale Price ($)
                    </Label>
                    <Input
                      type="number"
                      name="flashSale.discountPrice"
                      value={formData.flashSale.discountPrice}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 ${errors.flashSaleDiscountPrice
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
                    <Label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </Label>
                    <Input
                      type="datetime-local"
                      name="flashSale.startDate"
                      value={formData.flashSale.startDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
                    />
                  </div>
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </Label>
                    <Input
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
                    <Label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock Limit
                    </Label>
                    <Input
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
              )
            }
            {
              errors.flashSale && (
                <p className="text-red-500 text-sm mt-1">{errors.flashSale}</p>
              )
            }
          </div >

          {/* Submit Buttons */}
          < div className="flex justify-end space-x-4 pt-6" >
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
              className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
            >
              {isLoading
                ? "Processing..."
                : isEditing
                  ? "Update Product"
                  : "Create Product"}
            </button>
          </div >
        </form >
      </div >
    </div >
  );
};

export default CreateProductForm;
