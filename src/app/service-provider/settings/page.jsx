"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Shield, Bell, Lock, Save, Mail } from "lucide-react";
import DashboardLayout from "@/components/serviceProvider/Layout/DashboardLayout";
import useServiceProviderStore from "@/store/serviceStore";
import { toast } from "react-toastify";

const SettingsPage = () => {
  const router = useRouter();
  const {
    serviceProvider,
    updateNotificationPreferences,
    updateProfile,
    profileUpdateLoading,
  } = useServiceProviderStore();

  const [accountSettings, setAccountSettings] = useState({
    email: serviceProvider?.email || "",
    password: "",
    confirmPassword: "",
  });
  const [notificationSettings, setNotificationSettings] = useState({
    receiveMessageEmails:
      serviceProvider?.notificationPreferences?.receiveMessageEmails ?? true,
    receiveBookingNotifications:
      serviceProvider?.notificationPreferences?.receiveBookingNotifications ??
      true,
    receiveReviewNotifications:
      serviceProvider?.notificationPreferences?.receiveReviewNotifications ??
      true,
    receivePromotionalEmails:
      serviceProvider?.notificationPreferences?.receivePromotionalEmails ??
      false,
  });
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: serviceProvider?.twoFactorEnabled ?? false,
  });

  const handleAccountChange = (field, value) => {
    setAccountSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNotificationChange = (field, value) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSecurityChange = (field, value) => {
    setSecuritySettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveAccount = async () => {
    if (!accountSettings.email) {
      toast.error("Email is required");
      return;
    }
    if (accountSettings.password && accountSettings.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (accountSettings.password !== accountSettings.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const updateData = { email: accountSettings.email };
      if (accountSettings.password) {
        updateData.password = accountSettings.password;
      }
      await updateProfile(updateData);
      toast.success("Account settings updated successfully");
      setAccountSettings((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }));
    } catch (error) {
      toast.error("Failed to update account settings");
    }
  };

  const handleSaveNotifications = async () => {
    try {
      await updateNotificationPreferences(notificationSettings);
      toast.success("Notification preferences updated successfully");
    } catch (error) {
      toast.error("Failed to update notification preferences");
    }
  };

  const handleSaveSecurity = async () => {
    try {
      await updateProfile({
        twoFactorEnabled: securitySettings.twoFactorEnabled,
      });
      toast.success("Security settings updated successfully");
    } catch (error) {
      toast.error("Failed to update security settings");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">
            Manage your account, notifications, and security settings
          </p>
        </div>

        {/* Account Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <User className="h-5 w-5 mr-2" />
            Account Settings
          </h2>
          <div className="mt-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={accountSettings.email}
                onChange={(e) => handleAccountChange("email", e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your email"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={accountSettings.password}
                  onChange={(e) =>
                    handleAccountChange("password", e.target.value)
                  }
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={accountSettings.confirmPassword}
                  onChange={(e) =>
                    handleAccountChange("confirmPassword", e.target.value)
                  }
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Confirm new password"
                />
              </div>
            </div>
            <button
              onClick={handleSaveAccount}
              disabled={profileUpdateLoading}
              className="btn btn-primary px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4 mr-2" />
              {profileUpdateLoading ? "Saving..." : "Save Account Settings"}
            </button>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Notification Preferences
          </h2>
          <div className="mt-6 space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="receiveMessageEmails"
                checked={notificationSettings.receiveMessageEmails}
                onChange={(e) =>
                  handleNotificationChange(
                    "receiveMessageEmails",
                    e.target.checked
                  )
                }
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label
                htmlFor="receiveMessageEmails"
                className="ml-2 text-sm text-gray-700"
              >
                Receive message emails
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="receiveBookingNotifications"
                checked={notificationSettings.receiveBookingNotifications}
                onChange={(e) =>
                  handleNotificationChange(
                    "receiveBookingNotifications",
                    e.target.checked
                  )
                }
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label
                htmlFor="receiveBookingNotifications"
                className="ml-2 text-sm text-gray-700"
              >
                Receive booking notifications
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="receiveReviewNotifications"
                checked={notificationSettings.receiveReviewNotifications}
                onChange={(e) =>
                  handleNotificationChange(
                    "receiveReviewNotifications",
                    e.target.checked
                  )
                }
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label
                htmlFor="receiveReviewNotifications"
                className="ml-2 text-sm text-gray-700"
              >
                Receive review notifications
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="receivePromotionalEmails"
                checked={notificationSettings.receivePromotionalEmails}
                onChange={(e) =>
                  handleNotificationChange(
                    "receivePromotionalEmails",
                    e.target.checked
                  )
                }
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label
                htmlFor="receivePromotionalEmails"
                className="ml-2 text-sm text-gray-700"
              >
                Receive promotional emails
              </label>
            </div>
            <button
              onClick={handleSaveNotifications}
              className="btn btn-primary px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Notification Settings
            </button>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Security Settings
          </h2>
          <div className="mt-6 space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="twoFactorEnabled"
                checked={securitySettings.twoFactorEnabled}
                onChange={(e) =>
                  handleSecurityChange("twoFactorEnabled", e.target.checked)
                }
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label
                htmlFor="twoFactorEnabled"
                className="ml-2 text-sm text-gray-700"
              >
                Enable Two-Factor Authentication
              </label>
            </div>
            <button
              onClick={handleSaveSecurity}
              disabled={profileUpdateLoading}
              className="btn btn-primary px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4 mr-2" />
              {profileUpdateLoading ? "Saving..." : "Save Security Settings"}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
