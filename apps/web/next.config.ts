import type { NextConfig } from "next";
import path from "path";

const packagesRoot = path.join(__dirname, "../../packages");

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, "../.."),
  outputFileTracingIncludes: {
    "/**": [
      "../../templates/instagram-v1/**/*",
      "../../node_modules/.prisma/client/**/*",
      "../../node_modules/@prisma/client/**/*",
    ],
  },
  transpilePackages: ["@mic/db", "@mic/generator", "@mic/instagram"],
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  turbopack: {
    resolveAlias: {
      "@mic/db": path.join(packagesRoot, "db/src"),
      "@mic/generator": path.join(packagesRoot, "generator/src"),
      "@mic/instagram": path.join(packagesRoot, "instagram/src"),
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@mic/db": path.join(packagesRoot, "db/src"),
      "@mic/generator": path.join(packagesRoot, "generator/src"),
      "@mic/instagram": path.join(packagesRoot, "instagram/src"),
    };
    return config;
  },
};

export default nextConfig;
