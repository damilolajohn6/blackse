"use client";

import { useEffect } from "react";
import useAuthStore from "@/store/authStore";

export default function AuthProvider({ children }) {
  const { loadUser } = useAuthStore();

  useEffect(() => {
    loadUser();
    
  }, [loadUser, ]);

  return <>{children}</>;
}
