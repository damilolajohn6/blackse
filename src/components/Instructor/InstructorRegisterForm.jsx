"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import useInstructorStore from "@/store/instructorStore";

const InstructorRegisterForm = () => {
  const { isInstructor, signupInstructor } = useInstructorStore();
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullname: { firstName: "", lastName: "", middleName: "" },
    email: "",
    password: "",
    phone: { countryCode: "", number: "" },
    bio: "",
    expertise: [],
    socialLinks: { website: "", linkedin: "", twitter: "" },
    avatar: null,
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isInstructor) {
      toast.info("You are already registered as an instructor");
      router.push("/instructor/dashboard");
    }
  }, [isInstructor, router]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullname.firstName)
      newErrors.firstName = "First name is required";
    if (!formData.fullname.lastName)
      newErrors.lastName = "Last name is required";
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Valid email is required";
    }
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (
      !formData.phone.countryCode ||
      !/^\+\d{1,3}$/.test(formData.phone.countryCode)
    ) {
      newErrors.countryCode = "Valid country code is required (e.g., +1, +44)";
    }
    if (!formData.phone.number || !/^\d{7,15}$/.test(formData.phone.number)) {
      newErrors.number = "Phone number must be 7-15 digits";
    }
    if (formData.bio && formData.bio.length > 1000) {
      newErrors.bio = "Bio cannot exceed 1000 characters";
    }
    if (formData.expertise.some((item) => item.length > 50)) {
      newErrors.expertise = "Expertise items cannot exceed 50 characters";
    }
    if (
      formData.socialLinks.website &&
      !/^https?:\/\/[^\s$.?#].[^\s]*$/.test(formData.socialLinks.website)
    ) {
      newErrors.website = "Invalid website URL";
    }
    if (
      formData.socialLinks.linkedin &&
      !/^https?:\/\/[^\s$.?#].[^\s]*$/.test(formData.socialLinks.linkedin)
    ) {
      newErrors.linkedin = "Invalid LinkedIn URL";
    }
    if (
      formData.socialLinks.twitter &&
      !/^https?:\/\/[^\s$.?#].[^\s]*$/.test(formData.socialLinks.twitter)
    ) {
      newErrors.twitter = "Invalid Twitter URL";
    }
    if (!formData.avatar) newErrors.avatar = "Avatar is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (
      name.includes("fullname.") ||
      name.includes("phone.") ||
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
    }
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
      setFormData((prev) => ({ ...prev, avatar: file }));
      setErrors((prev) => ({ ...prev, avatar: "" }));
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
      let avatarData = {};
      if (formData.avatar) {
        const formDataToUpload = new FormData();
        formDataToUpload.append("file", formData.avatar);
        formDataToUpload.append("upload_preset", "gdmugccy");
        formDataToUpload.append(
          "cloud_name",
          process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
        );
        formDataToUpload.append("folder", "instructor_avatars");

        const cloudinaryRes = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: "POST", body: formDataToUpload }
        );
        const cloudinaryData = await cloudinaryRes.json();
        if (!cloudinaryData.secure_url) {
          throw new Error("Failed to upload avatar");
        }
        avatarData = {
          public_id: cloudinaryData.public_id,
          url: cloudinaryData.secure_url,
        };
      }

      const instructorData = {
        fullname: {
          firstName: formData.fullname.firstName,
          lastName: formData.fullname.lastName,
          middleName: formData.fullname.middleName || undefined,
        },
        email: formData.email,
        password: formData.password,
        phoneNumber: {
          countryCode: formData.phone.countryCode,
          number: formData.phone.number,
        },
        bio: formData.bio || undefined,
        expertise:
          formData.expertise.length > 0 ? formData.expertise : undefined,
        socialLinks: {
          website: formData.socialLinks.website || undefined,
          linkedin: formData.socialLinks.linkedin || undefined,
          twitter: formData.socialLinks.twitter || undefined,
        },
        avatar: avatarData.public_id && avatarData.url ? avatarData : undefined,
      };

      // Debug instructorData before sending
      console.debug("Instructor data to send:", instructorData);

      const result = await signupInstructor(instructorData, router);
      if (result.success) {
        toast.success("Instructor account created! Check your email for OTP.");
      }
    } catch (error) {
      console.error("Create instructor error:", error);
      toast.error(error.message || "Failed to create instructor account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Become an Instructor
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
            required
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
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          {errors.number && (
            <p className="text-red-500 text-xs mt-1">{errors.number}</p>
          )}
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
            htmlFor="socialLinks.twitter"
            className="block text-sm font-medium text-gray-700"
          >
            Twitter (Optional)
          </label>
          <input
            type="text"
            name="socialLinks.twitter"
            value={formData.socialLinks.twitter}
            onChange={handleInputChange}
            placeholder="https://x.com/yourhandle"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          {errors.twitter && (
            <p className="text-red-500 text-xs mt-1">{errors.twitter}</p>
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
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            isLoading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
        >
          {isLoading
            ? "Creating Instructor Account..."
            : "Create Instructor Account"}
        </button>
      </form>
    </div>
  );
};

export default InstructorRegisterForm;
