import { Suspense } from "react";
import ResetPasswordForm from "./ResetPasswordForm";
import { Lock } from "lucide-react";

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-indigo-600 rounded-full flex items-center justify-center">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Reset Password
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter the OTP sent to your email and your new password
            </p>
          </div>
          <Suspense fallback={<div>Loading reset form...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
