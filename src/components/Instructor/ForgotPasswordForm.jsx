"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import useInstructorStore from "@/store/instructorStore";

const InstructorForgotPasswordForm = () => {
  const { forgotInstructorPassword } = useInstructorStore();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await forgotInstructorPassword(email);
      if (!result.success) {
        throw new Error(result.message || "Failed to send reset OTP");
      }
      toast.success("OTP sent to your email!");
      router.push(
        `/instructor/reset-password?email=${encodeURIComponent(email)}`
      );
    } catch (error) {
      toast.error(error.message || "Failed to send reset OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white shadow-sm rounded-lg p-6 max-w-lg w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Forgot Instructor Password
        </h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
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
              id="email"
              value={email}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? "Sending OTP..." : "Send Reset OTP"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InstructorForgotPasswordForm;
