import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "3mb",
    },
  },
  async redirects() {
    return [
      { source: "/clientes", destination: "/tutores", permanent: true },
    ];
  },
};

export default nextConfig;
