"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useShopStore from "@/store/shopStore";
import { toast } from "react-toastify";

const ShopCreatePage = () => {
  const { isSeller, createShop } = useShopStore();
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullname: { firstName: "", lastName: "", middleName: "" },
    name: "",
    email: "",
    password: "",
    address: "",
    zipCode: "",
    phone: { countryCode: "", number: "" },
    avatar: null,
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isSeller) {
      toast.info("You already have a shop");
      router.push("/shop/dashboard");
    }
  }, [isSeller, router]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullname.firstName)
      newErrors.firstName = "First name is required";
    if (!formData.fullname.lastName)
      newErrors.lastName = "Last name is required";
    if (!formData.name) newErrors.name = "Shop name is required";
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Valid email is required";
    }
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!formData.address) newErrors.address = "Address is required";
    if (!formData.zipCode || isNaN(formData.zipCode)) {
      newErrors.zipCode = "Zip code must be a number";
    }
    if (
      formData.phone.countryCode &&
      !/^\+\d{1,3}$/.test(formData.phone.countryCode)
    ) {
      newErrors.countryCode = "Invalid country code (e.g., +1, +44)";
    }
    if (formData.phone.number && !/^\d{7,15}$/.test(formData.phone.number)) {
      newErrors.number = "Phone number must be 7-15 digits";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes("fullname.") || name.includes("phone.")) {
      const [parent, key] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [key]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
      setFormData((prev) => ({ ...prev, avatar: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }

    setIsLoading(true);
    try {
      let avatarUrl = "";
      let avatarPublicId = "";
      if (formData.avatar) {
        const formDataToUpload = new FormData();
        formDataToUpload.append("file", formData.avatar);
        formDataToUpload.append("upload_preset", "gdmugccy");
        formDataToUpload.append(
          "cloud_name",
          process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
        );

        console.debug("Uploading avatar to Cloudinary:", {
          cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
          upload_preset: "gdmugccy",
        });

        const cloudinaryRes = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: "POST", body: formDataToUpload }
        );
        const cloudinaryData = await cloudinaryRes.json();
        if (!cloudinaryData.secure_url) {
          throw new Error("Failed to upload avatar to Cloudinary");
        }
        avatarUrl = cloudinaryData.secure_url;
        avatarPublicId = cloudinaryData.public_id;
        console.debug("Avatar uploaded:", { avatarUrl, avatarPublicId });
      }

      const shopData = {
        fullname: {
          firstName: formData.fullname.firstName,
          lastName: formData.fullname.lastName,
          middleName: formData.fullname.middleName || undefined,
        },
        name: formData.name,
        email: formData.email,
        password: formData.password,
        address: formData.address,
        zipCode: formData.zipCode,
        phone:
          formData.phone.countryCode && formData.phone.number
            ? {
                countryCode: formData.phone.countryCode,
                number: formData.phone.number,
              }
            : undefined,
        avatar: avatarUrl
          ? { url: avatarUrl, public_id: avatarPublicId }
          : undefined,
      };

      console.debug("Shop data to send:", shopData);

      const result = await createShop(shopData, router);
      if (result.success) {
        toast.success("Shop created! Check your email for OTP.");
      } else {
        throw new Error(result.message || "Failed to create shop");
      }
    } catch (error) {
      console.error("Create shop error:", {
        message: error.message,
        response: error.response?.data,
      });
      toast.error(error.message || "Failed to create shop");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Create Your Shop
      </h2>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-gray-700"
          >
            First Name
          </label>
          <input
            type="text"
            name="fullname.firstName"
            value={formData.fullname.firstName}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          {errors.firstName && (
            <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-gray-700"
          >
            Last Name
          </label>
          <input
            type="text"
            name="fullname.lastName"
            value={formData.fullname.lastName}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          {errors.lastName && (
            <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="middleName"
            className="block text-sm font-medium text-gray-700"
          >
            Middle Name (Optional)
          </label>
          <input
            type="text"
            name="fullname.middleName"
            value={formData.fullname.middleName}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Shop Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-700"
          >
            Address
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          {errors.address && (
            <p className="text-red-500 text-xs mt-1">{errors.address}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="zipCode"
            className="block text-sm font-medium text-gray-700"
          >
            Zip Code
          </label>
          <input
            type="text"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          {errors.zipCode && (
            <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="phone.countryCode"
            className="block text-sm font-medium text-gray-700"
          >
            Phone Country Code
          </label>
          <input
            type="text"
            name="phone.countryCode"
            value={formData.phone.countryCode}
            onChange={handleInputChange}
            placeholder="+1"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          {errors.countryCode && (
            <p className="text-red-500 text-xs mt-1">{errors.countryCode}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="phone.number"
            className="block text-sm font-medium text-gray-700"
          >
            Phone Number
          </label>
          <input
            type="text"
            name="phone.number"
            value={formData.phone.number}
            onChange={handleInputChange}
            placeholder="1234567890"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          {errors.number && (
            <p className="text-red-500 text-xs mt-1">{errors.number}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="avatar"
            className="block text-sm font-medium text-gray-700"
          >
            Shop Avatar
          </label>
          <input
            type="file"
            name="avatar"
            accept="image/*"
            onChange={handleAvatarChange}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {avatarPreview && (
            <img
              src={avatarPreview}
              alt="Avatar Preview"
              className="mt-2 h-20 w-20 object-cover rounded-full"
            />
          )}
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            isLoading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
        >
          {isLoading ? "Creating Shop..." : "Create Shop"}
        </button>
      </form>
    </div>
  );
};

export default ShopCreatePage;
