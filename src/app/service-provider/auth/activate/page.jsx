import ActivateForm from "./ActivateForm";

export default function ActivatePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-indigo-600 rounded-full flex items-center justify-center">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Activate Your Account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              We've sent a 6-digit code to your email.
            </p>
          </div>
          <ActivateForm />
        </div>
      </div>
    </div>
  );
}
