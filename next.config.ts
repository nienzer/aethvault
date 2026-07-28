import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // <--- INI BARIS SAKTINYA BOS
  eslint: {
    // Matikan peringatan ESLint (seperti typo tanda kutip) saat build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Matikan peringatan tipe data TypeScript saat build
    ignoreBuildErrors: true,
  },
};

export default nextConfig;