"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useInstructorStore from "@/store/instructorStore";
import { toast } from "react-toastify";

const InstructorInfo = () => {
  const { instructor, isInstructor, isLoading } = useInstructorStore();
  const router = useRouter();

  useEffect(() => {
    if (!isInstructor && !isLoading) {
      toast.error("Please login to your shop");
      router.push("/instructor/auth/login");
    }
  }, [isInstructor, isLoading, router]);

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!instructor) {
    return null;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between">
        <div>
          <h3 className="text-2xl font-bold text-blue-600 mb-6">
            Welcome, {instructor?.fullname.firstName}
          </h3>
        </div>
      </div>
      <div className="space-y-4">
        <p>
          <strong>Email:</strong> {instructor.email}
        </p>
        {/* <p>
          <strong>Address:</strong> {instructor.address}, {seller.zipCode}
        </p> */}
        {instructor.phone?.number && (
          <p>
            <strong>Phone:</strong> {instructor.phone.countryCode}
            {instructor.phone.number}
          </p>
        )}
        {instructor.avatar?.url && (
          <div>
            <strong>Avatar:</strong>
            <img
              src={instructor.avatar.url}
              alt="instructor Avatar"
              className="mt-2 h-16 w-16 rounded-full object-cover"
            />
          </div>
        )}
      </div>
      <div className="mt-6">
        <button
          onClick={() => router.push("/instructor/dashboard/profile")}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Instructor Profile
        </button>
      </div>
    </div>
  );
};

export default InstructorInfo;
