import { Poppins } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const poppins = Poppins(
  { 
    subsets: ["latin"], 
    weight: ["100", "200", "300", "400", "500", "600", "700", "800"]
  }, 
)

export const metadata = {
  title: "BlacknSell Marketplace",
  description: "A large-scale marketplace for buyers and sellers",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${poppins.className}`} suppressHydrationWarning={true}>
        {children}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          limit={1}
        />
      </body>
    </html>
  );
}
