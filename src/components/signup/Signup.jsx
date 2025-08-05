"use client";
import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import Link from "next/link";
import { RxAvatar } from "react-icons/rx";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import styles from "@/styles/styles";
import useAuthStore from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, EyeOff, Upload, User } from "lucide-react";

import { Inter } from "next/font/google";
const inter = Inter(
  {
    subsets: ["latin"],
  },
)

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
    // <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    //   <div className="sm:mx-auto sm:w-full sm:max-w-md">
    //     <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
    //       {showOtpInput ? "Verify Your Account" : "Register as a new user"}
    //     </h2>
    //   </div>
    //   <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
    //     <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
    //       {!showOtpInput ? (
    //         <form className="space-y-6" onSubmit={handleSubmit}>
    //           <div>
    //             <Label
    //               htmlFor="firstName"
    //               className="block text-sm font-medium text-gray-700"
    //             >
    //               First Name
    //             </Label>
    //             <Input
    //               type="text"
    //               name="fullname.firstName"
    //               autoComplete="given-name"
    //               required
    //               value={formData.fullname.firstName}
    //               onChange={handleInputChange}
    //               className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
    //             />
    //             {errors.firstName && (
    //               <p className="text-red-500 text-xs mt-1">
    //                 {errors.firstName}
    //               </p>
    //             )}
    //           </div>
    //           <div>
    //             <Label
    //               htmlFor="lastName"
    //               className="block text-sm font-medium text-gray-700"
    //             >
    //               Last Name
    //             </Label>
    //             <Input
    //               type="text"
    //               name="fullname.lastName"
    //               autoComplete="family-name"
    //               required
    //               value={formData.fullname.lastName}
    //               onChange={handleInputChange}
    //               className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
    //             />
    //             {errors.lastName && (
    //               <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
    //             )}
    //           </div>
    //           <div>
    //             <Label
    //               htmlFor="middleName"
    //               className="block text-sm font-medium text-gray-700"
    //             >
    //               Middle Name (Optional)
    //             </Label>
    //             <Input
    //               type="text"
    //               name="fullname.middleName"
    //               value={formData.fullname.middleName}
    //               onChange={handleInputChange}
    //               className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
    //             />
    //           </div>
    //           <div>
    //             <Label
    //               htmlFor="username"
    //               className="block text-sm font-medium text-gray-700"
    //             >
    //               Username
    //             </Label>
    //             <Input
    //               type="text"
    //               name="username"
    //               autoComplete="username"
    //               required
    //               value={formData.username}
    //               onChange={handleInputChange}
    //               className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
    //             />
    //             {errors.username && (
    //               <p className="text-red-500 text-xs mt-1">{errors.username}</p>
    //             )}
    //           </div>
    //           <div>
    //             <Label
    //               htmlFor="email"
    //               className="block text-sm font-medium text-gray-700"
    //             >
    //               Email address
    //             </Label>
    //             <Input
    //               type="email"
    //               name="email"
    //               autoComplete="email"
    //               required
    //               value={formData.email}
    //               onChange={handleInputChange}
    //               className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
    //             />
    //             {errors.email && (
    //               <p className="text-red-500 text-xs mt-1">{errors.email}</p>
    //             )}
    //           </div>
    //           <div>
    //             <Label
    //               htmlFor="password"
    //               className="block text-sm font-medium text-gray-700"
    //             >
    //               Password
    //             </Label>
    //             <div className="mt-1 relative">
    //               <Input
    //                 type={visible ? "text" : "password"}
    //                 name="password"
    //                 autoComplete="new-password"
    //                 required
    //                 value={formData.password}
    //                 onChange={handleInputChange}
    //                 className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
    //               />
    //               {visible ? (
    //                 <AiOutlineEye
    //                   className="absolute right-2 top-2 cursor-pointer"
    //                   size={25}
    //                   onClick={() => setVisible(false)}
    //                 />
    //               ) : (
    //                 <AiOutlineEyeInvisible
    //                   className="absolute right-2 top-2 cursor-pointer"
    //                   size={25}
    //                   onClick={() => setVisible(true)}
    //                 />
    //               )}
    //             </div>
    //             {errors.password && (
    //               <p className="text-red-500 text-xs mt-1">{errors.password}</p>
    //             )}
    //           </div>
    //           <div>
    //             <Label
    //               htmlFor="phoneCountryCode"
    //               className="block text-sm font-medium text-gray-700"
    //             >
    //               Phone Number
    //             </Label>
    //             <div className="mt-1 flex space-x-2">
    //               <Input
    //                 type="text"
    //                 name="phone.countryCode"
    //                 placeholder="+1"
    //                 value={formData.phone.countryCode}
    //                 onChange={handleInputChange}
    //                 className="appearance-none w-1/4 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
    //               />
    //               <Input
    //                 type="text"
    //                 name="phone.number"
    //                 placeholder="1234567890"
    //                 value={formData.phone.number}
    //                 onChange={handleInputChange}
    //                 className="appearance-none w-3/4 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
    //               />
    //             </div>
    //             {errors.countryCode && (
    //               <p className="text-red-500 text-xs mt-1">
    //                 {errors.countryCode}
    //               </p>
    //             )}
    //             {errors.number && (
    //               <p className="text-red-500 text-xs mt-1">{errors.number}</p>
    //             )}
    //           </div>
    //           <div>
    //             <Label
    //               htmlFor="avatar"
    //               className="block text-sm font-medium text-gray-700"
    //             >
    //               Avatar
    //             </Label>
    //             <div className="mt-2 flex items-center">
    //               <span className="inline-block h-8 w-8 rounded-full overflow-hidden">
    //                 {avatarPreview ? (
    //                   <img
    //                     src={avatarPreview}
    //                     alt="Avatar"
    //                     className="h-full w-full object-cover rounded-full"
    //                   />
    //                 ) : (
    //                   <RxAvatar className="h-8 w-8" />
    //                 )}
    //               </span>
    //               <Label
    //                 htmlFor="file-input"
    //                 className="ml-5 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
    //               >
    //                 <span>Upload a file</span>
    //                 <Input
    //                   type="file"
    //                   name="avatar"
    //                   id="file-input"
    //                   accept="image/jpeg,image/png"
    //                   onChange={handleFileInputChange}
    //                   className="sr-only"
    //                 />
    //               </Label>
    //             </div>
    //             {errors.avatar && (
    //               <p className="text-red-500 text-xs mt-1">{errors.avatar}</p>
    //             )}
    //           </div>
    //           <div>
    //             <button
    //               type="submit"
    //               disabled={isLoading}
    //               className={`group relative w-full h-[40px] flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
    //                 isLoading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
    //               }`}
    //             >
    //               {isLoading ? "Submitting..." : "Submit"}
    //             </button>
    //           </div>
    //           <div className={`${styles.normalFlex} w-full`}>
    //             <h4>Already have an account?</h4>
    //             <Link href="/login" className="text-blue-600 pl-2">
    //               Sign In
    //             </Link>
    //           </div>
    //         </form>
    //       ) : (
    //         <form className="space-y-6" onSubmit={handleOtpSubmit}>
    //           <div>
    //             <Label
    //               htmlFor="otp"
    //               className="block text-sm font-medium text-gray-700"
    //             >
    //               Enter OTP
    //             </Label>
    //             <div className="mt-1">
    //               <Input
    //                 type="text"
    //                 name="otp"
    //                 required
    //                 value={otp}
    //                 onChange={(e) => setOtp(e.target.value)}
    //                 placeholder="Enter 6-digit OTP"
    //                 className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
    //               />
    //             </div>
    //           </div>
    //           <div>
    //             <button
    //               type="submit"
    //               disabled={isLoading}
    //               className={`group relative w-full h-[40px] flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
    //                 isLoading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
    //               }`}
    //             >
    //               {isLoading ? "Verifying..." : "Verify OTP"}
    //             </button>
    //           </div>
    //           <div className="text-center">
    //             <button
    //               type="button"
    //               onClick={handleResendOtp}
    //               disabled={isLoading}
    //               className={`text-sm text-blue-600 hover:text-blue-800 ${
    //                 isLoading ? "opacity-50 cursor-not-allowed" : ""
    //               }`}
    //             >
    //               {isLoading ? "Sending..." : "Resend OTP"}
    //             </button>
    //           </div>
    //         </form>
    //       )}
    //     </div>
    //   </div>
    // </div>

    <Card className="w-full lg:max-w-lg mx-auto shadow-elegant py-3">
      <CardHeader className="text-center py-2">
        <CardTitle className={`${inter.className} py-0 text-2xl text-black`}>
          {showOtpInput ? "Verify Your Account" : "Register as a new user"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center space-y-2">
            <Avatar className="w-16 h-16">
              <AvatarImage src={avatarPreview || undefined} />
              <AvatarFallback>
                <User className="w-8 h-8" />
              </AvatarFallback>
            </Avatar>
            <Label htmlFor="avatar" className="cursor-pointer">
              <div className="flex items-center space-x-2 text-sm text-primary hover:text-primary/80 transition-colors">
                <Upload className="w-4 h-4" />
                <span>Upload Avatar</span>
              </div>
              <Input
                type="file"
                name="avatar"
                id="file-input"
                accept="image/jpeg,image/png"
                onChange={handleFileInputChange}
                className="sr-only hidden"
              />
            </Label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="John"
                value={formData.fullname.firstName}
                // onChange={(e) => handleInputChange('fullname.firstName', e.target.value)}
                onChange={handleInputChange}
                className={errors.firstName ? "border-destructive" : ""}
              />
              {errors.firstName && (
                <p className="text-xs text-destructive">{errors.firstName}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                value={formData.fullname.lastName}
                onChange={handleInputChange}
                // onChange={(e) => handleInputChange('fullname.lastName', e.target.value)}
                className={errors.lastName ? "border-destructive" : ""}
              />
              {errors.lastName && (
                <p className="text-xs text-destructive">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Middle Name */}
          <div className="space-y-1">
            <Label htmlFor="middleName">Middle Name (Optional)</Label>
            <Input
              id="middleName"
              placeholder="Middle name"
              value={formData.fullname.middleName}
              onChange={handleInputChange}
              // onChange={(e) => handleInputChange('fullname.middleName', e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="johndoe"
              value={formData.username}
              // onChange={(e) => handleInputChange('username', e.target.value)}
              onChange={handleInputChange}
              className={errors.username ? "border-destructive" : ""}
            />
            {errors.username && (
              <p className="text-xs text-destructive">{errors.username}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              // onChange={(e) => handleInputChange('email', e.target.value)}
               onChange={handleInputChange}
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={visible ? "text" : "password"}
                placeholder="Create a secure password"
                value={formData.password}
                // onChange={(e) => handleInputChange('password', e.target.value)}
                 onChange={handleInputChange}
                className={`pr-10 ${errors.password ? "border-destructive" : ""}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setVisible(!showPassword)}
              >
                {visible ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password}</p>
            )}
          </div>

          {/* Phone Number */}
          <div className="space-y-1">
            <Label htmlFor="phoneCountryCode">Phone Number</Label>
            <div className="flex space-x-2">
              <Input
                placeholder="+1"
                value={formData.phone.countryCode}
                // onChange={(e) => handleInputChange('phone.countryCode', e.target.value)}
                 onChange={handleInputChange}
                className={`w-20 ${errors.countryCode ? "border-destructive" : ""}`}
              />
              <Input
                placeholder="1234567890"
                value={formData.phone.number}
                // onChange={(e) => handleInputChange('phone.number', e.target.value)}
                 onChange={handleInputChange}
                className={`flex-1 ${errors.phoneNumber ? "border-destructive" : ""}`}
              />
            </div>
            {(errors.countryCode || errors.phoneNumber) && (
              <p className="text-xs text-destructive">
                {errors.countryCode || errors.phoneNumber}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link href="/login" className="text-primary hover:text-primary/80 font-medium">
              Sign In
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default Signup;
