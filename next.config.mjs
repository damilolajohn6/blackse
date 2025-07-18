/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  // async redirects() {
  //   return [
  //     {
  //       source: "/service-provider",
  //       destination: "/service-provider/dashboard",
  //       permanent: true,
  //     },
  //     {
  //       source: "/service-provider/auth",
  //       destination: "/service-provider/auth/login",
  //       permanent: true,
  //     },
  //   ];
  // },
  // async rewrites() {
  //   return [
  //     {
  //       source: "/api/auth/:path*",
  //       destination: `${process.env.NEXT_PUBLIC_SERVER}/service-provider/:path*`,
  //     },
  //   ];
  // },
};

export default nextConfig;
