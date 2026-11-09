import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: false,
  serverExternalPackages: ["duckdb", "@mapbox/node-pre-gyp"],
};

export default nextConfig;
