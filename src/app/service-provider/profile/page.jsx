"use client";
import { useState, useRef } from "react";
import { 
  Camera, 
  Edit3, 
  Save, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  Star,
  Award,
  Clock,
  DollarSign,
  Users,
  Shield,
  Tag,
  X
} from "lucide-react";
import DashboardLayout from "@/components/serviceProvider/Layout/DashboardLayout";
import useServiceProviderStore from "@/store/serviceStore";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { toast } from "react-toastify";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Jost } from "next/font/google";

const jost = Jost(
  { 
    subsets: ["latin"], 
    weight: ["100", "200", "300", "400", "500", "600", "700", "800"]
  }, 
)

const ProfilePage = () => {
  const {
    serviceProvider,
    updateProfile,
    updateAvatar,
    updateNotificationPreferences,
    profileUpdateLoading,
    avatarUpdateLoading
  } = useServiceProviderStore();

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [formData, setFormData] = useState({
    fullname: {
      firstName: serviceProvider?.fullname?.firstName || "",
      lastName: serviceProvider?.fullname?.lastName || "",
      middleName: serviceProvider?.fullname?.middleName || "",
    },
    description: serviceProvider?.description || "",
    phoneNumber: {
      countryCode: serviceProvider?.phoneNumber?.countryCode || "+1",
      number: serviceProvider?.phoneNumber?.number || "",
    },
    address: {
      street: serviceProvider?.address?.street || "",
      city: serviceProvider?.address?.city || "",
      state: serviceProvider?.address?.state || "",
      country: serviceProvider?.address?.country || "",
      zipCode: serviceProvider?.address?.zipCode || "",
    },
    tags: serviceProvider?.tags || [],
  });
  const [notificationSettings, setNotificationSettings] = useState({
    receiveMessageEmails: serviceProvider?.notificationPreferences?.receiveMessageEmails ?? true,
    receiveBookingNotifications: serviceProvider?.notificationPreferences?.receiveBookingNotifications ?? true,
    receiveReviewNotifications: serviceProvider?.notificationPreferences?.receiveReviewNotifications ?? true,
    receivePromotionalEmails: serviceProvider?.notificationPreferences?.receivePromotionalEmails ?? false,
  });
  const [newTag, setNewTag] = useState("");
  const fileInputRef = useRef(null);

  const tabs = [
    { id: "personal", label: "Personal Info", icon: Users },
    { id: "settings", label: "Notification Settings", icon: Shield },
    { id: "stats", label: "Performance Stats", icon: Award },
  ];

  const stats = [
    { label: "Total Bookings", value: serviceProvider?.dashboardStats?.totalBookings || "127", icon: Calendar, color: "blue" },
    { label: "Average Rating", value: serviceProvider?.dashboardStats?.averageRating || "4.9", icon: Star, color: "yellow" },
    { label: "Response Time", value: serviceProvider?.dashboardStats?.responseTime || "2h", icon: Clock, color: "green" },
    { label: "Total Earnings", value: serviceProvider?.dashboardStats?.totalEarnings || "$12,450", icon: DollarSign, color: "indigo" },
  ];

  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleAddTag = () => {
    if (!newTag.trim()) {
      toast.error("Tag cannot be empty");
      return;
    }
    if (formData.tags.includes(newTag.trim())) {
      toast.error("Tag already exists");
      return;
    }
    if (formData.tags.length >= 10) {
      toast.error("Maximum 10 tags allowed");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      tags: [...prev.tags, newTag.trim()],
    }));
    setNewTag("");
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    try {
      const uploadedImage = await uploadToCloudinary(file, "service-providers/avatars");
      await updateAvatar(uploadedImage.url);
      toast.success("Profile picture updated successfully");
    } catch (error) {
      toast.error("Failed to update profile picture");
    }
  };

  const handleSaveProfile = async () => {
    if (!formData.fullname.firstName.trim() || !formData.fullname.lastName.trim()) {
      toast.error("First name and last name are required");
      return;
    }
    if (formData.phoneNumber.number && !/^\d{10}$/.test(formData.phoneNumber.number)) {
      toast.error("Phone number must be 10 digits");
      return;
    }
    try {
      await updateProfile(formData);
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleNotificationUpdate = async () => {
    try {
      await updateNotificationPreferences(notificationSettings);
      toast.success("Notification preferences updated successfully");
    } catch (error) {
      toast.error("Failed to update notification preferences");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
              <p className={"text-gray-600 mt-1 " + jost.className}>Manage your profile information and settings</p>
            </div>
            {activeTab === "personal" && (
              <div className="flex items-center space-x-4 mt-4 lg:mt-0">
                {isEditing ? (
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => setIsEditing(false)}
                      className="btn btn-outline px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveProfile}
                      disabled={profileUpdateLoading}
                      className="btn btn-primary px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {profileUpdateLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="btn btn-primary px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-4 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? "border-indigo-600 text-indigo-600"
                        : "border-transparent text-gray-600 hover:text-indigo-600"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className="h-5 w-5" />
                      <span>{tab.label}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {activeTab === "personal" && (
            <div className="space-y-6">
              {/* Avatar Section */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6">
                <div className="relative w-24 h-24 rounded-full overflow-hidden">
                  <img
                    src={serviceProvider?.avatar?.url || "/default-avatar.png"}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                  {isEditing && (
                    <button
                      onClick={() => fileInputRef.current.click()}
                      className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white"
                    >
                      <Camera className="h-6 w-6" />
                    </button>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarUpload}
                    accept="image/*"
                    className="hidden"
                    disabled={avatarUpdateLoading}
                  />
                </div>
                <div className="mt-4 sm:mt-0">
                  <h3 className="text-lg font-semibold text-gray-900">Profile Picture</h3>
                  <p className={"text-sm text-gray-600 " + jost.className}>
                    {isEditing
                      ? "Click the image to upload a new profile picture (max 5MB)"
                      : "Your profile picture is displayed to clients"}
                  </p>
                  {avatarUpdateLoading && (
                    <p className="text-sm text-indigo-600 mt-2">Uploading...</p>
                  )}
                </div>
              </div>

              {/* Personal Info Form */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </Label>
                  <Input
                    type="text"
                    value={formData.fullname.firstName}
                    onChange={(e) => handleInputChange("fullname.firstName", e.target.value)}
                    disabled={!isEditing}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                    placeholder="First Name"
                  />
                </div>
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </Label>
                  <Input
                    type="text"
                    value={formData.fullname.lastName}
                    onChange={(e) => handleInputChange("fullname.lastName", e.target.value)}
                    disabled={!isEditing}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                    placeholder="Last Name"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label className="block text-sm font-medium text-gray-700 mb-1">
                    Middle Name (Optional)
                  </Label>
                  <Input
                    type="text"
                    value={formData.fullname.middleName}
                    onChange={(e) => handleInputChange("fullname.middleName", e.target.value)}
                    disabled={!isEditing}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                    placeholder="Middle Name"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    disabled={!isEditing}
                    rows={4}
                    maxLength={500}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                    placeholder="Tell clients about yourself and your services..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.description.length}/500 characters
                  </p>
                </div>
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </Label>
                  <div className="flex space-x-2">
                    <Input
                      type="text"
                      value={formData.phoneNumber.countryCode}
                      onChange={(e) => handleInputChange("phoneNumber.countryCode", e.target.value)}
                      disabled={!isEditing}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                      placeholder="+1"
                    />
                    <Input
                      type="tel"
                      value={formData.phoneNumber.number}
                      onChange={(e) => handleInputChange("phoneNumber.number", e.target.value)}
                      disabled={!isEditing}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                      placeholder="1234567890"
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <Label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </Label>
                  <Input
                    type="text"
                    value={formData.address.street}
                    onChange={(e) => handleInputChange("address.street", e.target.value)}
                    disabled={!isEditing}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                    placeholder="Street Address"
                  />
                </div>
                <div>
                  <Input
                    type="text"
                    value={formData.address.city}
                    onChange={(e) => handleInputChange("address.city", e.target.value)}
                    disabled={!isEditing}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                    placeholder="City"
                  />
                </div>
                <div>
                  <Input
                    type="text"
                    value={formData.address.state}
                    onChange={(e) => handleInputChange("address.state", e.target.value)}
                    disabled={!isEditing}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                    placeholder="State"
                  />
                </div>
                <div>
                  <Input
                    type="text"
                    value={formData.address.country}
                    onChange={(e) => handleInputChange("address.country", e.target.value)}
                    disabled={!isEditing}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                    placeholder="Country"
                  />
                </div>
                <div>
                  <Input
                    type="text"
                    value={formData.address.zipCode}
                    onChange={(e) => handleInputChange("address.zipCode", e.target.value)}
                    disabled={!isEditing}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                    placeholder="Zip Code"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map((tag) => (
                      <div
                        key={tag}
                        className="flex items-center bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full"
                      >
                        {tag}
                        {isEditing && (
                          <button
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-2 text-indigo-600 hover:text-indigo-800"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {isEditing && (
                    <div className="flex space-x-2">
                      <Input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Add a tag (e.g., plumbing, electrician)"
                        maxLength={20}
                      />
                      <Button
                        onClick={handleAddTag}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      >
                        <Tag className="h-4 w-4 mr-2 inline" />
                        Add
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="receiveMessageEmails"
                    checked={notificationSettings.receiveMessageEmails}
                    onChange={(e) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        receiveMessageEmails: e.target.checked,
                      })
                    }
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="receiveMessageEmails" className="ml-2 text-sm text-gray-700">
                    Receive message emails
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="receiveBookingNotifications"
                    checked={notificationSettings.receiveBookingNotifications}
                    onChange={(e) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        receiveBookingNotifications: e.target.checked,
                      })
                    }
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="receiveBookingNotifications" className="ml-2 text-sm text-gray-700">
                    Receive booking notifications
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="receiveReviewNotifications"
                    checked={notificationSettings.receiveReviewNotifications}
                    onChange={(e) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        receiveReviewNotifications: e.target.checked,
                      })
                    }
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="receiveReviewNotifications" className="ml-2 text-sm text-gray-700">
                    Receive review notifications
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="receivePromotionalEmails"
                    checked={notificationSettings.receivePromotionalEmails}
                    onChange={(e) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        receivePromotionalEmails: e.target.checked,
                      })
                    }
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="receivePromotionalEmails" className="ml-2 text-sm text-gray-700">
                    Receive promotional emails
                  </label>
                </div>
              </div>
              <Button
                onClick={handleNotificationUpdate}
                className="btn btn-primary px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Notification Settings
              </Button>
            </div>
          )}

          {activeTab === "stats" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Performance Statistics</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.label}
                      className={`p-4 bg-${stat.color}-50 rounded-lg border border-${stat.color}-200 flex items-center space-x-4`}
                    >
                      <Icon className={`h-8 w-8 text-${stat.color}-600`} />
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                        <p className="text-xl font-semibold text-gray-900">{stat.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;