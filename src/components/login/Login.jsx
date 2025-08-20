"use client";
import useAuthStore from "@/store/authStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { toast } from "react-toastify";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Inter } from "next/font/google";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
const inter = Inter(
  {
    subsets: ["latin"],
  },
)

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const { login, isLoading, verifyOtp, resendOtp } = useAuthStore();
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      const result = await login(email, password, router);
      if (!result.success) {
        console.log("Login failed:", result);
      }
      if (result.message === "Please verify your account first!") {
        setShowOtpInput(true);
      }
    } catch (error) {
      console.error("Login submission error:", error);
      toast.error("An unexpected error occurred");
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      toast.error("OTP must be a 6-digit number");
      return;
    }

    const result = await verifyOtp(email, otp, router);
    if (!result.success) {
      // Error handled by toast in store
      return;
    }
  };

  const handleResendOtp = async () => {
    const result = await resendOtp(email);
    console.log(email)
    if (!result.success) {
      // Error handled by toast in store
      return;
    }
  };

  return (
    <>
      {isLoading && (
        <div className="z-50 fixed inset-0 bg-black/60 social-loader min-h-screen grid place-content-center">
          <svg viewBox="25 25 50 50">
            <circle r="20" cy="50" cx="50"></circle>
          </svg>
      </div>
      )}
      <div className="bg-gray-50 min-h-screen flex justify-between pt-16">
        <Card className="border-none shadow-none border-2 border-black sm:min-w-lg mx-auto h-fit">
          <CardHeader className="sm:mx-auto sm:w-full sm:max-w-md py-0 my-0">
            <motion.div
              key={showOtpInput ? "otp-title" : "login-title"}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CardTitle className={`${inter.className} py-0 text-center text-lg font-bold text-gray-900`}>
                {showOtpInput ? `Enter the code sent to ${email}` : "Login to your account"}
              </CardTitle>
            </motion.div>
          </CardHeader>
          <AnimatePresence mode="wait" custom={showOtpInput}>
            {!showOtpInput ? (
              <motion.div
                key="login-form"
                custom={false}
                initial={{ x: "100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "-100%", opacity: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  duration: 0.5
                }}
                className="w-full"
              >
                <CardContent className="py-0">
                  <div className="bg-white px-4 sm:rounded-lg sm:px-5">
                    <form className="space-y-5" onSubmit={handleSubmit}>
                      <div>
                        <Label
                          htmlFor="email"
                          className="block text-sm font-medium text-gray-700">
                          Email address
                        </Label>
                        <div className="">
                          <Input
                            type="email"
                            name="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <Label
                          htmlFor="password"
                          className="block text-sm font-medium text-gray-700 mb-2">
                          Password
                        </Label>
                        <div className="mt-1 relative">
                          <Input
                            type={visible ? "text" : "password"}
                            name="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                          {visible ? (
                            <AiOutlineEye
                              className="absolute right-2 top-2 cursor-pointer"
                              size={25}
                              onClick={() => setVisible(false)}
                            />
                          ) : (
                            <AiOutlineEyeInvisible
                              className="absolute right-2 top-2 cursor-pointer"
                              size={25}
                              onClick={() => setVisible(true)}
                            />
                          )}
                        </div>
                      </div>
                      <div className={`flex items-center gap-1 justify-between`}>
                        <div className={`flex items-center gap-3`}>
                          <Input
                            type="checkbox"
                            name="remember-me"
                            id="remember-me"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <Label
                            htmlFor="remember-me"
                            className="block text-sm text-gray-900">
                            Remember me
                          </Label>
                        </div>
                        <div className="text-sm">
                          <Link
                            href="/forgot-password"
                            className="font-medium text-blue-600 hover:text-blue-500"
                          >
                            Forgot your password?
                          </Link>
                        </div>
                      </div>
                      <div>
                        <button
                          type="submit"
                          disabled={isLoading}
                          className={`group relative w-full h-[40px] flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${isLoading
                            ? "bg-blue-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                            }`}>
                          {isLoading ? "Logging in..." : "Login"}
                        </button>
                      </div>
                      <div className={`text-sm flex items-center gap-1 w-full`}>
                        <h4>Don’t have an account?</h4>
                        <Link href="/signup" className="text-blue-600 pl-2">
                          Sign Up
                        </Link>
                      </div>
                    </form>
                  </div>
                </CardContent>
              </motion.div>
            )
              :
              (
                <motion.div
                  key="otp-form"
                  custom={true}
                  initial={{ x: "100%", opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: "-100%", opacity: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    duration: 0.5
                  }}
                  className="w-full"
                >
                  <CardContent className="">
                    <div className="bg-white py-4 px-4 sm:rounded-lg sm:px-5">
                      <form className="space-y-4" onSubmit={handleOtpSubmit}>
                        <div>
                          <Label
                            htmlFor="otp"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Enter OTP
                          </Label>
                          <div className="mt-1">
                            <Input
                              type="text"
                              name="otp"
                              required
                              value={otp}
                              onChange={(e) => setOtp(e.target.value)}
                              placeholder="Enter 6-digit OTP"
                              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <button
                            type="submit"
                            disabled={isLoading}
                            className={`group relative w-full h-[40px] flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${isLoading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                              }`}
                          >
                            {isLoading ? "Verifying..." : "Verify OTP"}
                          </button>
                        </div>
                        <div className="text-center">
                          <button
                            type="button"
                            onClick={handleResendOtp}
                            disabled={isLoading}
                            className={`text-sm text-blue-600 hover:text-blue-800 ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                              }`}
                          >
                            {isLoading ? "Sending..." : "Resend OTP"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </CardContent>
                </motion.div>
              )}
          </AnimatePresence>
        </Card>
      </div>
    </>
  );
};

export default Login;
