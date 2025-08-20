"use client";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Jost } from "next/font/google";
const jost = Jost(
  {
    subsets: ["latin"],
    weight: ["100", "200", "300", "400", "500", "600", "700", "800"]
  },
)
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

const queryClient = new QueryClient()

export default function ServiceProviderLayout({ children }) {
 

  return (
    <div className="min-h-screen bg-gray-100">
      <QueryClientProvider client={queryClient}>
        <main className="">
          {children}
        </main>
      </QueryClientProvider>

      <footer className="bg-blue-600 text-white mt-auto">
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center ${jost.className}`}>
          <p suppressHydrationWarning={true}>
            © {new Date().getFullYear()} BlackandSell. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  
  );
}
