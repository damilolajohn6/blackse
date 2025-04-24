"use client";

import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";
import Image from "next/image";
import Link from "next/link";
import { Button, AppBar, Toolbar, Typography } from "@mui/material";
import styles from "@/styles/styles";
import { IoIosArrowForward } from "react-icons/io";

export default function Header() {
  const { user, logout} = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header className="bg-[#1976D2] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              <Link href="/" className="flex items-center">
                <Image
                  src="/blacknsell.png"
                  alt="BlacknSell Logo"
                  width={150}
                  height={40}
                  className="h-10 w-auto"
                />
              </Link>
            </Typography>
            <div className={`${styles.button} ml-4 !rounded-[12px]`}>
              <Link href="/shop/login">
                <h1 className="text-[#fff] flex items-center">
                  Become a Seller <IoIosArrowForward className="ml-1" />
                </h1>
              </Link>
            </div>
            <div className={`${styles.button} ml-4 !rounded-[12px]`}>
              <Link href="/learn/login">
                <h1 className="text-[#fff] flex items-center">
                  Become a Tutor <IoIosArrowForward className="ml-1" />
                </h1>
              </Link>
            </div>
            {/* <Link href="/">
              <Button color="inherit">Home</Button>
            </Link>
            <Link href="/products">
              <Button color="inherit">Products</Button>
            </Link>
            <Link href="/events">
              <Button color="inherit">Events</Button>
            </Link> */}
            <Link href="/social">
              <Button color="inherit">Social</Button>
            </Link>
            {user ? (
              <>
                {user.role === "seller" && (
                  <Link href="/shop/dashboard">
                    <Button color="inherit">Dashboard</Button>
                  </Link>
                )}
                <Button color="inherit" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button color="inherit">Login</Button>
                </Link>
                <Link href="/forgot-password">
                  <Button color="inherit">Forgot Password</Button>
                </Link>
              </>
            )}
          </Toolbar>
        </AppBar>
      </div>
    </header>
  );
}
