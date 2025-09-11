"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useInstructorStore from "@/store/instructorStore";
import { toast } from "react-toastify";

export default function InstructorAuthProvider({ children }) {
  const { loadInstructor } = useInstructorStore();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initializeInstructor = async () => {
      try {
        console.log(
          "InstructorAuthProvider: Checking cookies",
          document.cookie
        );
        await loadInstructor();
      } catch (error) {
        console.error("InstructorAuthProvider: Failed to load shop", {
          message: error.message,
          cookies: document.cookie ? "present" : "missing",
        });
        toast.error("Please log in to access your shop", {
          toastId: "auth-error",
        });
        router.push("/instructor/auth/login");
      } finally {
        setIsLoading(false);
      }
    };
    initializeInstructor();
  }, [loadInstructor, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}
