import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/certificado/**": ["./lib/kintal-logo.png"],
  },
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
