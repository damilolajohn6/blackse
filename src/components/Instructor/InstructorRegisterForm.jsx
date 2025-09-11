"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import useInstructorStore from "@/store/instructorStore";
import { Typography } from "@mui/material";
import Link from "next/link";

const InstructorRegisterForm = () => {
  const { isInstructor, signupInstructor, isLoading } = useInstructorStore();
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullname: { firstName: "", lastName: "", middleName: "" },
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: { countryCode: "+1", number: "" },
    bio: "",
    expertise: [],
    socialLinks: { website: "", linkedin: "", twitter: "", youtube: "" },
    avatar: null,
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isInstructor) {
      toast.info("You are already registered as an instructor");
      router.push("/instructor/dashboard");
    }
  }, [isInstructor, router]);

  // Enhanced password strength calculation
  const calculatePasswordStrength = useCallback((password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  }, []);

  // Enhanced form validation
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    // Name validation
    if (!formData.fullname.firstName?.trim()) {
      newErrors.firstName = "First name is required";
    } else if (formData.fullname.firstName.trim().length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    }
    
    if (!formData.fullname.lastName?.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (formData.fullname.lastName.trim().length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    } else if (calculatePasswordStrength(formData.password) < 3) {
      newErrors.password = "Password must contain uppercase, lowercase, and numbers";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Phone validation
    if (!formData.phoneNumber.countryCode?.trim()) {
      newErrors.countryCode = "Country code is required";
    } else if (!/^\+\d{1,3}$/.test(formData.phoneNumber.countryCode)) {
      newErrors.countryCode = "Please enter a valid country code (e.g., +1, +44)";
    }
    
    if (!formData.phoneNumber.number?.trim()) {
      newErrors.number = "Phone number is required";
    } else if (!/^\d{7,15}$/.test(formData.phoneNumber.number)) {
      newErrors.number = "Phone number must be 7-15 digits";
    }

    // Bio validation
    if (formData.bio && formData.bio.length > 1000) {
      newErrors.bio = "Bio cannot exceed 1000 characters";
    }

    // Expertise validation
    if (formData.expertise.some((item) => item.length > 50)) {
      newErrors.expertise = "Expertise items cannot exceed 50 characters";
    }

    // Social links validation
    const urlRegex = /^https?:\/\/[^\s$.?#].[^\s]*$/;
    if (formData.socialLinks.website && !urlRegex.test(formData.socialLinks.website)) {
      newErrors.website = "Please enter a valid website URL";
    }
    if (formData.socialLinks.linkedin && !urlRegex.test(formData.socialLinks.linkedin)) {
      newErrors.linkedin = "Please enter a valid LinkedIn URL";
    }
    if (formData.socialLinks.twitter && !urlRegex.test(formData.socialLinks.twitter)) {
      newErrors.twitter = "Please enter a valid Twitter URL";
    }
    if (formData.socialLinks.youtube && !urlRegex.test(formData.socialLinks.youtube)) {
      newErrors.youtube = "Please enter a valid YouTube URL";
    }

    // Avatar validation
    if (!formData.avatar) {
      newErrors.avatar = "Profile picture is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, calculatePasswordStrength]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (
      name.includes("fullname.") ||
      name.includes("phoneNumber.") ||
      name.includes("socialLinks.")
    ) {
      const [parent, key] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [key]: value },
      }));
    } else if (name === "expertise") {
      setFormData((prev) => ({
        ...prev,
        expertise: value
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      
      // Update password strength when password changes
      if (name === "password") {
        setPasswordStrength(calculatePasswordStrength(value));
      }
    }
    
    // Clear specific error when user starts typing
    const errorKey = name.includes(".") ? name.split(".")[1] : name;
    setErrors((prev) => ({ ...prev, [errorKey]: "" }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select a valid image file");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      
      setAvatarPreview(URL.createObjectURL(file));
      setFormData((prev) => ({ ...prev, avatar: file }));
      setErrors((prev) => ({ ...prev, avatar: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting");
      return;
    }

    setIsSubmitting(true);
    try {
      const instructorData = {
        fullname: {
          firstName: formData.fullname.firstName.trim(),
          lastName: formData.fullname.lastName.trim(),
          middleName: formData.fullname.middleName?.trim() || undefined,
        },
        email: formData.email.trim(),
        password: formData.password,
        phoneNumber: {
          countryCode: formData.phoneNumber.countryCode.trim(),
          number: formData.phoneNumber.number.trim(),
        },
        bio: formData.bio?.trim() || undefined,
        expertise: formData.expertise.length > 0 ? formData.expertise : undefined,
        socialLinks: {
          website: formData.socialLinks.website?.trim() || undefined,
          linkedin: formData.socialLinks.linkedin?.trim() || undefined,
          twitter: formData.socialLinks.twitter?.trim() || undefined,
          youtube: formData.socialLinks.youtube?.trim() || undefined,
        },
        avatar: formData.avatar ? { file: formData.avatar } : undefined,
      };

      const result = await signupInstructor(instructorData, router);
      if (result.success) {
        toast.success("Instructor account created successfully! Please check your email for verification.");
      }
    } catch (error) {
      console.error("Create instructor error:", error);
      toast.error(error.message || "Failed to create instructor account");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Password strength indicator component
  const PasswordStrengthIndicator = () => {
    const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
    const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"];
    
    return (
      <div className="mt-2">
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className={`h-2 flex-1 rounded ${
                level <= passwordStrength ? strengthColors[passwordStrength - 1] : "bg-gray-200"
              }`}
            />
          ))}
        </div>
        {formData.password && (
          <p className={`text-xs mt-1 ${
            passwordStrength < 3 ? "text-red-600" : 
            passwordStrength < 4 ? "text-yellow-600" : "text-green-600"
          }`}>
            Password strength: {strengthLabels[passwordStrength - 1] || "Very Weak"}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8">
            <h2 className="text-3xl font-bold text-white text-center">
              Become an Instructor
            </h2>
            <p className="text-blue-100 text-center mt-2">
              Share your knowledge and start earning today
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="px-6 py-4 bg-gray-50 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= 1 ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"
                }`}>
                  1
                </div>
                <span className="text-sm font-medium text-gray-700">Basic Info</span>
              </div>
              <div className="flex-1 mx-4">
                <div className="h-1 bg-gray-200 rounded">
                  <div className={`h-1 bg-blue-600 rounded transition-all duration-300 ${
                    currentStep >= 2 ? "w-full" : "w-0"
                  }`} />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= 2 ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"
                }`}>
                  2
                </div>
                <span className="text-sm font-medium text-gray-700">Profile</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form className="p-6 space-y-6" onSubmit={handleSubmit}>
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
            Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            placeholder="Enter a strong password"
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm ${
              errors.password ? "border-red-300 focus:border-red-500" : "border-gray-300 focus:border-blue-500"
            }`}
          />
          <PasswordStrengthIndicator />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700"
          >
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
            placeholder="Confirm your password"
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm ${
              errors.confirmPassword ? "border-red-300 focus:border-red-500" : "border-gray-300 focus:border-blue-500"
            }`}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="phoneNumber.countryCode"
              className="block text-sm font-medium text-gray-700"
            >
              Country Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="phoneNumber.countryCode"
              value={formData.phoneNumber.countryCode}
              onChange={handleInputChange}
              placeholder="+1"
              required
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm ${
                errors.countryCode ? "border-red-300 focus:border-red-500" : "border-gray-300 focus:border-blue-500"
              }`}
            />
            {errors.countryCode && (
              <p className="text-red-500 text-xs mt-1">{errors.countryCode}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="phoneNumber.number"
              className="block text-sm font-medium text-gray-700"
            >
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="phoneNumber.number"
              value={formData.phoneNumber.number}
              onChange={handleInputChange}
              placeholder="1234567890"
              required
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm ${
                errors.number ? "border-red-300 focus:border-red-500" : "border-gray-300 focus:border-blue-500"
              }`}
            />
            {errors.number && (
              <p className="text-red-500 text-xs mt-1">{errors.number}</p>
            )}
          </div>
        </div>
        <div>
          <label
            htmlFor="bio"
            className="block text-sm font-medium text-gray-700"
          >
            Bio
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            rows="4"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          {errors.bio && (
            <p className="text-red-500 text-xs mt-1">{errors.bio}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="expertise"
            className="block text-sm font-medium text-gray-700"
          >
            Expertise (comma-separated)
          </label>
          <input
            type="text"
            name="expertise"
            value={formData.expertise.join(", ")}
            onChange={handleInputChange}
            placeholder="e.g., JavaScript, Python, Web Development"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          {errors.expertise && (
            <p className="text-red-500 text-xs mt-1">{errors.expertise}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="socialLinks.website"
            className="block text-sm font-medium text-gray-700"
          >
            Website (Optional)
          </label>
          <input
            type="text"
            name="socialLinks.website"
            value={formData.socialLinks.website}
            onChange={handleInputChange}
            placeholder="https://yourwebsite.com"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          {errors.website && (
            <p className="text-red-500 text-xs mt-1">{errors.website}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="socialLinks.linkedin"
            className="block text-sm font-medium text-gray-700"
          >
            LinkedIn (Optional)
          </label>
          <input
            type="text"
            name="socialLinks.linkedin"
            value={formData.socialLinks.linkedin}
            onChange={handleInputChange}
            placeholder="https://linkedin.com/in/yourprofile"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          {errors.linkedin && (
            <p className="text-red-500 text-xs mt-1">{errors.linkedin}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="socialLinks.youtube"
            className="block text-sm font-medium text-gray-700"
          >
            YouTube Channel (Optional)
          </label>
          <input
            type="text"
            name="socialLinks.youtube"
            value={formData.socialLinks.youtube}
            onChange={handleInputChange}
            placeholder="https://youtube.com/@yourchannel"
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm ${
              errors.youtube ? "border-red-300 focus:border-red-500" : "border-gray-300 focus:border-blue-500"
            }`}
          />
          {errors.youtube && (
            <p className="text-red-500 text-xs mt-1">{errors.youtube}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="avatar"
            className="block text-sm font-medium text-gray-700"
          >
            Instructor Avatar
          </label>
          <input
            type="file"
            name="avatar"
            accept="image/*"
            onChange={handleAvatarChange}
            required
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {avatarPreview && (
            <img
              src={avatarPreview}
              alt="Avatar Preview"
              className="mt-2 h-20 w-20 object-cover rounded-full"
            />
          )}
          {errors.avatar && (
            <p className="text-red-500 text-xs mt-1">{errors.avatar}</p>
          )}
        </div>
        {/* Submit Button */}
        <div className="pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-all duration-200 ${
              isSubmitting || isLoading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105"
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            {isSubmitting || isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Instructor Account...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Instructor Account
              </>
            )}
          </button>
          
          <p className="text-xs text-gray-500 text-center mt-3">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </p>
        <div>
          <Typography style={{ fontFamily: 'poppins'}} align="center" sx={{ mt: 2 }}>
            Already have an account? <Link style={{ fontFamily: 'poppins'}} className="text-blue-500 font-medium underline hover:text-blue-600" href="/instructor/auth/login">Login</Link>
          </Typography>
        </div>
        </div>
      </form>
        </div>
      </div>
    </div>
  );
};

export default InstructorRegisterForm;
