"use client";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";
import Image from "next/image";
import Link from "next/link";
import { Button, AppBar, Toolbar, Typography } from "@mui/material";
import { Button as B } from "@/components/ui/button"
import styles from "@/styles/styles";
import { IoIosArrowForward } from "react-icons/io";
import { Poppins } from "next/font/google";
const poppins = Poppins(
  { 
    subsets: ["latin"], 
    weight: ["100", "200", "300", "400", "500", "600", "700", "800"]
  }, 
)

export default function Header() {
  const { user, logout} = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header className={`bg-[#1976D2] shadow-sm ${poppins.className}`}>
      <AppBar position="static" sx={{ background: "#1976D2", boxShadow: "none" }}>
        <Toolbar className="flex flex-wrap justify-between items-center px-2 sm:px-4">
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            <Link href="/" className="flex items-center">
              <Image
                src="/blacknsell.png"
                alt="BlacknSell Logo"
                width={120}
                height={32}
                className="h-8 w-auto"
              />
            </Link>
          </Typography>
          <div className="hidden md:flex items-center space-x-2">
            <B className={`!rounded-[12px]`}>
              <Link href="/shop/login">
                <h1 className="text-[#fff] flex items-center text-sm">
                  Become a Seller <IoIosArrowForward className="ml-1" />
                </h1>
              </Link>
            </B>
            <B className={`!rounded-[12px]`}>
              <Link href="/service-provider/auth/login">
                <h1 className="text-[#fff] flex items-center text-sm">
                  Become a Service Provider <IoIosArrowForward className="ml-1" />
                </h1>
              </Link>
            </B>
            <B className={`!rounded-[12px]`}>
              <Link href="/instructor/auth/login">
                <h1 className="text-[#fff] flex items-center text-sm">
                  Become a Tutor <IoIosArrowForward className="ml-1" />
                </h1>
              </Link>
            </B>
            <Link href="/social">
              <Button color="inherit" size="small">Social</Button>
            </Link>
            {user ? (
              <>
                {user.role === "seller" && (
                  <Link href="/shop/dashboard">
                    <Button color="inherit" size="small">Dashboard</Button>
                  </Link>
                )}
                <Button color="inherit" size="small" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button color="inherit" size="small">Login</Button>
                </Link>
                <Link href="/forgot-password">
                  <Button color="inherit" size="small">Forgot Password</Button>
                </Link>
              </>
            )}
          </div>
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            {/* You can use a Drawer or a Popover for mobile menu */}
            {/* Example: */}
            {/* <IconButton onClick={toggleMobileMenu}><MenuIcon /></IconButton> */}
            {/* Implement mobile menu logic here */}
          </div>
        </Toolbar>
        {/* Mobile menu (hidden on md and up) */}
        <div className="md:hidden px-4 pb-2">
          <div className="flex flex-col space-y-2">
            <div className={`${styles.button} !rounded-[12px]`}>
              <Link href="/shop/login">
                <h1 className="text-[#fff] flex items-center text-sm">
                  Become a Seller <IoIosArrowForward className="ml-1" />
                </h1>
              </Link>
            </div>
            <div className={`${styles.button} !rounded-[12px]`}>
              <Link href="/service-provider/auth/login">
                <h1 className="text-[#fff] flex items-center text-sm">
                  Become a Service Provider <IoIosArrowForward className="ml-1" />
                </h1>
              </Link>
            </div>
            <div className={`${styles.button} !rounded-[12px]`}>
              <Link href="/instructor/auth/login">
                <h1 className="text-[#fff] flex items-center text-sm">
                  Become a Tutor <IoIosArrowForward className="ml-1" />
                </h1>
              </Link>
            </div>
            <Link href="/social">
              <Button color="inherit" size="small">Social</Button>
            </Link>
            {user ? (
              <>
                {user.role === "seller" && (
                  <Link href="/shop/dashboard">
                    <Button color="inherit" size="small">Dashboard</Button>
                  </Link>
                )}
                <Button color="inherit" size="small" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button color="inherit" size="small">Login</Button>
                </Link>
                <Link href="/forgot-password">
                  <Button color="inherit" size="small">Forgot Password</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </AppBar>
    </header>
  );
}
