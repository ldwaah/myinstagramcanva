import type { NextConfig } from "next";
import path from "path";
import { PrismaPlugin } from "@prisma/nextjs-monorepo-workaround-plugin";

const packagesRoot = path.join(__dirname, "../../packages");

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, "../.."),
  serverExternalPackages: ["@prisma/client", "prisma"],
  outputFileTracingIncludes: {
    "/**": [
      "templates/instagram-v1/**/*",
      "packages/generator/ai-extractor/**/*",
      "node_modules/.prisma/client/**/*",
      "node_modules/@prisma/client/**/*",
      "node_modules/.prisma/client/libquery_engine-*",
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
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins = [...config.plugins, new PrismaPlugin()];
    }
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
