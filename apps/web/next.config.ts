import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@cruz-agenda/ui", "@cruz-agenda/domain", "@cruz-agenda/validation"],
};

export default nextConfig;
