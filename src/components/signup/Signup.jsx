"use client";

import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import Link from "next/link";
import { RxAvatar } from "react-icons/rx";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import styles from "@/styles/styles";
import useAuthStore from "@/store/authStore";

const Signup = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullname: { firstName: "", lastName: "", middleName: "" },
    username: "",
    email: "",
    password: "",
    phone: { countryCode: "", number: "" },
    avatar: null,
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [visible, setVisible] = useState(false);
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [errors, setErrors] = useState({});
  const { signup, verifyOtp, resendOtp, isLoading } = useAuthStore();

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullname.firstName)
      newErrors.firstName = "First name is required";
    if (!formData.fullname.lastName)
      newErrors.lastName = "Last name is required";
    if (!formData.username) {
      newErrors.username = "Username is required";
    } else if (!/^[a-zA-Z0-9_]{3,30}$/.test(formData.username)) {
      newErrors.username =
        "Username must be 3-30 characters, letters, numbers, or underscores";
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Valid email is required";
    }
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
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
    if (formData.avatar && formData.avatar.size > 5 * 1024 * 1024) {
      newErrors.avatar = "Avatar must be less than 5MB";
    }
    if (formData.avatar && !formData.avatar.type.startsWith("image/")) {
      newErrors.avatar = "Avatar must be an image (JPG, PNG, etc.)";
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

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file (JPG, PNG, etc.).");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB.");
        return;
      }
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

    const userData = {
      fullname: {
        firstName: formData.fullname.firstName,
        lastName: formData.fullname.lastName,
        middleName: formData.fullname.middleName || undefined,
      },
      username: formData.username,
      email: formData.email,
      password: formData.password,
      phone:
        formData.phone.countryCode && formData.phone.number
          ? {
              countryCode: formData.phone.countryCode,
              number: formData.phone.number,
            }
          : undefined,
      avatar: formData.avatar,
      role: "user", // Default role
    };

    const result = await signup(userData);
    if (result.success) {
      setShowOtpInput(true);
      setAvatarPreview(null); // Clear avatar preview
      setFormData((prev) => ({ ...prev, avatar: null })); // Clear avatar file
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      toast.error("OTP must be a 6-digit number");
      return;
    }

    const result = await verifyOtp(formData.email, otp, router);
    if (!result.success) {
      // Error handled by toast in store
      return;
    }
  };

  const handleResendOtp = async () => {
    const result = await resendOtp(formData.email);
    if (!result.success) {
      // Error handled by toast in store
      return;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {showOtpInput ? "Verify Your Account" : "Register as a new user"}
        </h2>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {!showOtpInput ? (
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
                  autoComplete="given-name"
                  required
                  value={formData.fullname.firstName}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.firstName}
                  </p>
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
                  autoComplete="family-name"
                  required
                  value={formData.fullname.lastName}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700"
                >
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  autoComplete="username"
                  required
                  value={formData.username}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {errors.username && (
                  <p className="text-red-500 text-xs mt-1">{errors.username}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                <div className="mt-1 relative">
                  <input
                    type={visible ? "text" : "password"}
                    name="password"
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  {visible ? (
                    <AiOutlineEye
                      className="absolute right-2 top-2 cursor-pointer"
                      size={25}
                      onClick={() => setVisible(false)}
                    />
                  ) : (
                    <AiOutlineEyeInvisible
                      className="absolute right-2 top-2 cursor-pointer"
                      size={25}
                      onClick={() => setVisible(true)}
                    />
                  )}
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="phoneCountryCode"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone Number
                </label>
                <div className="mt-1 flex space-x-2">
                  <input
                    type="text"
                    name="phone.countryCode"
                    placeholder="+1"
                    value={formData.phone.countryCode}
                    onChange={handleInputChange}
                    className="appearance-none w-1/4 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <input
                    type="text"
                    name="phone.number"
                    placeholder="1234567890"
                    value={formData.phone.number}
                    onChange={handleInputChange}
                    className="appearance-none w-3/4 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                {errors.countryCode && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.countryCode}
                  </p>
                )}
                {errors.number && (
                  <p className="text-red-500 text-xs mt-1">{errors.number}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="avatar"
                  className="block text-sm font-medium text-gray-700"
                >
                  Avatar
                </label>
                <div className="mt-2 flex items-center">
                  <span className="inline-block h-8 w-8 rounded-full overflow-hidden">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar"
                        className="h-full w-full object-cover rounded-full"
                      />
                    ) : (
                      <RxAvatar className="h-8 w-8" />
                    )}
                  </span>
                  <label
                    htmlFor="file-input"
                    className="ml-5 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                  >
                    <span>Upload a file</span>
                    <input
                      type="file"
                      name="avatar"
                      id="file-input"
                      accept="image/jpeg,image/png"
                      onChange={handleFileInputChange}
                      className="sr-only"
                    />
                  </label>
                </div>
                {errors.avatar && (
                  <p className="text-red-500 text-xs mt-1">{errors.avatar}</p>
                )}
              </div>
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`group relative w-full h-[40px] flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                    isLoading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isLoading ? "Submitting..." : "Submit"}
                </button>
              </div>
              <div className={`${styles.normalFlex} w-full`}>
                <h4>Already have an account?</h4>
                <Link href="/login" className="text-blue-600 pl-2">
                  Sign In
                </Link>
              </div>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleOtpSubmit}>
              <div>
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-gray-700"
                >
                  Enter OTP
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="otp"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`group relative w-full h-[40px] flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                    isLoading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isLoading ? "Verifying..." : "Verify OTP"}
                </button>
              </div>
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isLoading}
                  className={`text-sm text-blue-600 hover:text-blue-800 ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? "Sending..." : "Resend OTP"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Signup;
