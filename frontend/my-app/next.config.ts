import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['localhost'], // ✅ Agrega localhost como dominio permitido
  },
};

export default nextConfig;
