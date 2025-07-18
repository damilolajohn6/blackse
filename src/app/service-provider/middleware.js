import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Check if it's a service provider route
  if (pathname.startsWith("/service-provider")) {
    const token = request.cookies.get("service_provider_token");

    // Protected routes that require authentication
    const protectedRoutes = [
      "/service-provider/dashboard",
      "/service-provider/bookings",
      "/service-provider/messages",
      "/service-provider/services",
      "/service-provider/profile",
      "/service-provider/settings",
      "/service-provider/reviews",
      "/service-provider/analytics",
    ];

    // Auth routes that should redirect if already authenticated
    const authRoutes = [
      "/service-provider/auth/login",
      "/service-provider/auth/register",
      "/service-provider/auth/activate",
      "/service-provider/auth/forgot-password",
      "/service-provider/auth/reset-password",
    ];

    const isProtectedRoute = protectedRoutes.some((route) =>
      pathname.startsWith(route)
    );

    const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

    // Redirect to login if accessing protected route without token
    if (isProtectedRoute && !token) {
      const url = new URL("/service-provider/auth/login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    // Redirect to dashboard if accessing auth route with valid token
    if (isAuthRoute && token) {
      return NextResponse.redirect(
        new URL("/service-provider/dashboard", request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/service-provider/:path*"],
};
