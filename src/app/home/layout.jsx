import { Geist} from "next/font/google";
import "../globals.css";
import AuthProvider from "@/components/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});


export const metadata = {
  title: "BlacknSell Marketplace",
  description: "A large-scale marketplace for buyers and sellers",
};

export default function HomeLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable}`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
