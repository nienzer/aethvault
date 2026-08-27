import type { NextConfig } from "next";
// @ts-ignore
import withPWAInit from "next-pwa";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Jika bos punya konfigurasi lain sebelumnya, taruh di dalam sini
};

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development", // PWA hanya aktif saat production (build)
  register: true,
  skipWaiting: true,
});

export default withPWA(nextConfig);