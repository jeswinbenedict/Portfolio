import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  basePath: "/Portfolio",
  env: {
    NEXT_PUBLIC_BASE_PATH: "/Portfolio",
  },
};

export default nextConfig;
