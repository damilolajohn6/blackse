"use client"; // Crucial for client-side components in Next.js App Router

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation"; // Import usePathname
import Link from "next/link";
import {
  Menu,
  X,
  Home,
  Calendar,
  MessageSquare,
  Settings,
  User,
  Star,
  BarChart3,
  LogOut,
  Bell,
  Search,
  Grid,
  ChevronDown,
} from "lucide-react";
import useServiceProviderStore from "@/store/serviceStore";
import { toast } from "react-toastify";

const DashboardLayout = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname(); // Get the current pathname using usePathname hook
  const {
    serviceProvider,
    sidebarOpen,
    toggleSidebar,
    logout,
    notifications,
    unreadNotifications,
  } = useServiceProviderStore();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const navigationItems = [
    { name: "Dashboard", href: "/service-provider/dashboard", icon: Home },
    { name: "Services", href: "/service-provider/services", icon: Grid },
    { name: "Bookings", href: "/service-provider/bookings", icon: Calendar },
    {
      name: "Messages",
      href: "/service-provider/messages",
      icon: MessageSquare,
    },
    { name: "Reviews", href: "/service-provider/reviews", icon: Star },
    { name: "Analytics", href: "/service-provider/analytics", icon: BarChart3 },
    { name: "Profile", href: "/service-provider/profile", icon: User },
    { name: "Settings", href: "/service-provider/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      router.push("/service-provider/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Even if there's an error, redirect to login for security/consistency
      router.push("/service-provider/auth/login");
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click is outside both notification and profile dropdowns
      if (
        !event.target.closest(".notification-dropdown-trigger") &&
        !event.target.closest(".profile-dropdown-trigger") &&
        showNotifications // Only close if it's currently open
      ) {
        setShowNotifications(false);
      }
      if (
        !event.target.closest(".profile-dropdown-trigger") &&
        !event.target.closest(".notification-dropdown-trigger") &&
        showProfileMenu // Only close if it's currently open
      ) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showNotifications, showProfileMenu]); // Depend on dropdown states

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {" "}
      {/* Changed to flex for desktop layout */}
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:flex lg:flex-col lg:shrink-0`} // Added flex-col for proper height
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <Link
            href="/service-provider/dashboard"
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SP</span>
            </div>
            <span className="text-xl font-bold text-gray-900">ServicePro</span>
          </Link>
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-8 px-4 space-y-2 flex-grow overflow-y-auto">
          {" "}
          {/* flex-grow for scrollable nav */}
          {navigationItems.map((item) => {
            const Icon = item.icon;
            // Use pathname from usePathname hook
            const isActive =
              pathname === item.href ||
              (item.href !== "/service-provider/dashboard" &&
                pathname.startsWith(item.href));
            // The condition `item.href !== "/service-provider/dashboard"`
            // prevents "/service-provider/dashboard" from matching all other sub-routes
            // if they also start with "/service-provider/dashboard".
            // This ensures "/service-provider/dashboard" is only active when on the exact dashboard route.

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 border-r-4 border-indigo-700" // Increased border size for emphasis
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Profile Section (at the bottom of sidebar) */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
            <img
              src={serviceProvider?.avatar?.url || "/default-avatar.png"}
              alt={serviceProvider?.fullname?.firstName || "User"}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {serviceProvider?.fullname?.firstName}{" "}
                {serviceProvider?.fullname?.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {serviceProvider?.service}
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col ${
          // Added flex flex-col to main content
          sidebarOpen ? "" : "" // No need for dynamic margin here, sidebar is fixed or static
        }`}
      >
        {/* Top Bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40">
          {" "}
          {/* Sticky top-bar */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Search */}
            <div className="hidden md:block relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="block w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Notifications Dropdown */}
            <div className="relative dropdown">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg hover:bg-gray-100 relative notification-dropdown-trigger" // Added class for click outside
                aria-label="Toggle notifications"
              >
                <Bell className="h-5 w-5 text-gray-600" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
                    {" "}
                    {/* Added subtle animation */}
                    {unreadNotifications}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900">
                      Notifications
                    </h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-gray-500 text-sm">
                        No notifications
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((notification) => (
                        <div
                          key={notification.id}
                          className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          <p className="text-sm text-gray-900 font-medium">
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-700 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(notification.timestamp).toLocaleString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                  {notifications.length > 5 && (
                    <div className="px-4 py-2 border-t border-gray-200">
                      <Link
                        href="/service-provider/notifications"
                        className="text-sm text-indigo-600 hover:text-indigo-500 block text-center"
                      >
                        View all notifications
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile Menu Dropdown */}
            <div className="relative dropdown">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 profile-dropdown-trigger" // Added class for click outside
                aria-label="Toggle profile menu"
              >
                <img
                  src={serviceProvider?.avatar?.url || "/default-avatar.png"}
                  alt={serviceProvider?.fullname?.firstName || "User"}
                  className="w-8 h-8 rounded-full object-cover border border-gray-200"
                />
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <Link
                    href="/service-provider/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Link>
                  <Link
                    href="/service-provider/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                  <hr className="my-1 border-gray-200" />{" "}
                  {/* Added border class */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-4 lg:p-6 flex-grow overflow-y-auto">
          {" "}
          {/* Added flex-grow and overflow */}
          {children}
        </main>
      </div>
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
          aria-label="Close sidebar overlay"
        />
      )}
    </div>
  );
};

export default DashboardLayout;
