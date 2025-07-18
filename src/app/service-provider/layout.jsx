"use client";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ServiceProviderLayout({ children }) {
 

  return (
    
      <div className="min-h-screen bg-gray-100">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        <footer className="bg-blue-600 text-white mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center">
            <p>
              © {new Date().getFullYear()} BlackandSell. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
  
  );
}
