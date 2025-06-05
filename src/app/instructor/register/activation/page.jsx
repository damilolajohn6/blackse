"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import useInstructorStore from "@/store/instructorStore";

const InstructorActivationPage = () => {
  const { verifyInstructorOtp } = useInstructorStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      toast.error("Email is required for activation");
      router.push("/instructor/register");
    }
  }, [email, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await verifyInstructorOtp(email, otp, router);
    } catch (error) {
      console.error("Activation error:", error);
      toast.error(error.message || "Failed to activate instructor account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER}/instructor/resend-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
          credentials: "include",
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(data.message);
    } catch (error) {
      console.error("Resend OTP error:", error);
      toast.error(error.message || "Failed to resend OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Activate Your Instructor Account
      </h2>
      <p className="text-sm text-gray-600 mb-6">
        Enter the OTP sent to {email}
      </p>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="otp"
            className="block text-sm font-medium text-gray-700"
          >
            OTP
          </label>
          <input
            type="text"
            name="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
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
          {isLoading ? "Activating..." : "Activate Instructor Account"}
        </button>
      </form>
      <div className="mt-4 text-center">
        <button
          onClick={handleResendOtp}
          disabled={isLoading}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Resend OTP
        </button>
      </div>
    </div>
  );
};

export default InstructorActivationPage;
