"use client";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import InstructorAuthProvider from "@/components/Providers/InstructorAuthProvider";
import useInstructorStore from "@/store/instructorStore";
import Image from "next/image";
import Link from "next/link";
import {
  FaChalkboardTeacher,
  FaBook,
  FaCog,
  FaSignOutAlt,
  FaBars, // Added for potential mobile menu toggle
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useState } from "react"; // Added for managing mobile menu state

export default function InstructorLayout({ children }) {
  const { instructor, isInstructor, logoutInstructor } = useInstructorStore();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for mobile menu

  const handleLogout = async () => {
    await logoutInstructor(router);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <InstructorAuthProvider>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        {" "}
        {/* Added flex-col */}
        {/* Instructor Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center flex-wrap">
            {" "}
            {/* Added flex-wrap */}
            {/* Logo & Instructor Name */}
            <Link
              href={isInstructor ? "/instructor" : "/"}
              className="flex items-center space-x-3"
            >
              <Image
                src={instructor?.avatar?.url || "/blacknsell.png"}
                alt={
                  instructor?.fullname
                    ? `${instructor.fullname.firstName} ${instructor.fullname.lastName}`
                    : "BlacknSell Instructor"
                }
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover"
              />
              <span className="text-lg font-semibold text-gray-900">
                {instructor?.fullname
                  ? `${instructor.fullname.firstName} ${instructor.fullname.lastName}`
                  : "My Instructor Profile"}
              </span>
            </Link>
            {/* Mobile Menu Toggle */}
            {isInstructor && (
              <div className="block lg:hidden">
                {" "}
                {/* Show only on small screens */}
                <button
                  onClick={toggleMobileMenu}
                  className="text-gray-600 hover:text-blue-600 focus:outline-none"
                >
                  <FaBars className="h-6 w-6" />
                </button>
              </div>
            )}
            {/* Navigation - Desktop */}
            {isInstructor && (
              <nav className="hidden lg:flex items-center space-x-6">
                {" "}
                {/* Hide on small screens */}
                <Link
                  href="/instructor/dashboard"
                  className="flex items-center space-x-1 text-gray-600 hover:text-blue-600"
                >
                  <FaChalkboardTeacher className="h-5 w-5" />
                  <span className="text-sm font-medium">Dashboard</span>
                </Link>
                <Link
                  href="/instructor/courses"
                  className="flex items-center space-x-1 text-gray-600 hover:text-blue-600"
                >
                  <FaBook className="h-5 w-5" />
                  <span className="text-sm font-medium">Courses</span>
                </Link>
                <Link
                  href="/instructor/profile"
                  className="flex items-center space-x-1 text-gray-600 hover:text-blue-600"
                >
                  <FaCog className="h-5 w-5" />
                  <span className="text-sm font-medium">My Profile</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-600 hover:text-red-600"
                >
                  <FaSignOutAlt className="h-5 w-5" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </nav>
            )}
          </div>

          {/* Navigation - Mobile */}
          {isInstructor && (
            <div
              className={`lg:hidden ${isMobileMenuOpen ? "block" : "hidden"}`} // Show/hide based on state
            >
              <nav className="flex flex-col space-y-2 px-4 pt-2 pb-4">
                <Link
                  href="/instructor/dashboard"
                  className="flex items-center space-x-1 text-gray-600 hover:text-blue-600"
                  onClick={() => setIsMobileMenuOpen(false)} // Close menu on click
                >
                  <FaChalkboardTeacher className="h-5 w-5" />
                  <span className="text-sm font-medium">Dashboard</span>
                </Link>
                <Link
                  href="/instructor/courses"
                  className="flex items-center space-x-1 text-gray-600 hover:text-blue-600"
                  onClick={() => setIsMobileMenuOpen(false)} // Close menu on click
                >
                  <FaBook className="h-5 w-5" />
                  <span className="text-sm font-medium">Courses</span>
                </Link>
                <Link
                  href="/instructor/profile"
                  className="flex items-center space-x-1 text-gray-600 hover:text-blue-600"
                  onClick={() => setIsMobileMenuOpen(false)} // Close menu on click
                >
                  <FaCog className="h-5 w-5" />
                  <span className="text-sm font-medium">My Profile</span>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false); // Close menu on logout
                  }}
                  className="flex items-center space-x-1 text-gray-600 hover:text-red-600"
                >
                  <FaSignOutAlt className="h-5 w-5" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </nav>
            </div>
          )}
        </header>
        {/* Content */}
        <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {" "}
          {/* Added flex-grow and w-full */}
          {children}
        </main>
        {/* Footer */}
        <footer className="bg-blue-600 text-white mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center">
            <p>
              © {new Date().getFullYear()} BlackandSell. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
      <ToastContainer />
    </InstructorAuthProvider>
  );
}
