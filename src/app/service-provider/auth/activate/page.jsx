"use client"; 

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader, Mail, RefreshCw, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import useServiceProviderStore from "@/store/serviceStore";

const ActivatePage = () => {
  const router = useRouter();

  const searchParams = useSearchParams();

  const { activateAccount, isLoading, error, clearError } =
    useServiceProviderStore();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Effect to extract email from URL query parameters on component mount
  useEffect(() => {
    const emailFromQuery = searchParams.get("email");
    if (emailFromQuery) {
      setEmail(emailFromQuery);
    }
  }, [searchParams]); // Depend on searchParams to react to changes

  // Effect for the resend OTP timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
      return () => clearTimeout(timer); // Cleanup timer on unmount or if timer changes
    }
  }, [resendTimer]);

  // Handle changes in OTP input fields
  const handleOtpChange = (index, value) => {
    // Only allow single digit and numeric values
    if (value.length > 1 || !/^\d*$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus to the next input field if a digit is entered and it's not the last field
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }

    // Clear any previous error messages when user starts typing
    if (error) clearError();
  };

  // Handle backspace key press for OTP input fields
  const handleKeyDown = (index, e) => {
    // If backspace is pressed and the current field is empty, move focus to the previous field
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // Handle paste event for OTP input fields
  const handlePaste = (e) => {
    e.preventDefault(); // Prevent default paste behavior
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, ""); // Get pasted text and remove non-digits
    if (pastedData.length === 6) {
      setOtp(pastedData.split("")); // Populate OTP fields with pasted data
    }
  };

  // Handle form submission for account activation
  const handleSubmit = async (e) => {
    e.preventDefault();

    const otpString = otp.join(""); // Combine OTP digits into a single string
    if (otpString.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    if (!email) {
      toast.error("Email is required for activation");
      return;
    }

    try {
      await activateAccount({ email, otp: otpString }); // Call the activation API
      toast.success("Account activated successfully!");
      router.push("/service-provider/dashboard"); // Redirect to dashboard on success
    } catch (err) {
      // Display error message from the store or a generic one
      toast.error(
        error || err.message || "Activation failed. Please try again."
      );
    }
  };

  // Handle resending OTP
  const handleResendOtp = async () => {
    if (!email) {
      toast.error("Email is required to resend OTP");
      return;
    }

    setResendLoading(true); // Set loading state for resend button
    try {
      // Construct API URL using environment variable
      const apiUrl = `${
        process.env.NEXT_PUBLIC_SERVER || "http://localhost:8000/api/v2"
      }/service-provider/resend-otp`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("OTP resent successfully! Please check your email.");
        setResendTimer(60); // Start cooldown timer
      } else {
        toast.error(data.message || "Failed to resend OTP. Please try again.");
      }
    } catch (err) {
      console.error("Error resending OTP:", err);
      toast.error(
        "Failed to resend OTP due to a network error. Please try again."
      );
    } finally {
      setResendLoading(false); // Reset loading state
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header Section */}
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-indigo-600 rounded-full flex items-center justify-center">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Activate Your Account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              We've sent a 6-digit code to{" "}
              <strong>{email || "your email"}</strong>
            </p>
          </div>

          {/* Error Display Section */}
          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  {/* Error icon */}
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm">{error}</p>
                </div>
                {/* Dismiss error button */}
                <div className="ml-auto pl-3">
                  <button
                    type="button"
                    onClick={clearError}
                    className="inline-flex text-red-400 hover:text-red-600"
                  >
                    <span className="sr-only">Dismiss</span>
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* OTP and Email Form */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {/* Email Input Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your email"
                required
              />
            </div>

            {/* OTP Input Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Enter 6-digit verification code
              </label>
              <div
                className="flex space-x-2 justify-center"
                onPaste={handlePaste}
              >
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    inputMode="numeric" // Hint for mobile keyboards
                    autoComplete="one-time-code" // Autocomplete for OTP
                  />
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <Loader className="h-5 w-5 animate-spin" />
              ) : (
                "Activate Account"
              )}
            </button>
          </form>

          {/* Resend OTP Section */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Didn't receive the code?{" "}
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendLoading || resendTimer > 0}
                className="font-medium text-indigo-600 hover:text-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin inline mr-1" />
                ) : resendTimer > 0 ? (
                  `Resend in ${resendTimer}s`
                ) : (
                  "Resend OTP"
                )}
              </button>
            </p>
          </div>

          {/* Back to Login Link */}
          <div className="mt-8 text-center">
            <Link
              href="/service-provider/auth/login"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivatePage;
