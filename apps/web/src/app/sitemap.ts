import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = env.appUrl.replace(/\/$/, "");
  const now = new Date();
  const pages = [
    { path: "", changeFrequency: "weekly" as const, priority: 1 },
    { path: "/pricing", changeFrequency: "monthly" as const, priority: 0.9 },
    { path: "/affiliates", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/signup", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/login", changeFrequency: "yearly" as const, priority: 0.5 },
    { path: "/terms", changeFrequency: "yearly" as const, priority: 0.3 },
  ];

  return pages.map(({ path, changeFrequency, priority }) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
