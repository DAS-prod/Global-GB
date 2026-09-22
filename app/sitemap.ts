import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://abroad.godavaribasket.com";

  const pages = [
    {
      path: "",
      changeFrequency: "weekly" as const,
      priority: 1,
    },
    {
      path: "/build",
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      path: "/bundles",
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      path: "/combos",
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      path: "/about",
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
  ];

  return pages.map((page) => ({
    url: `${baseUrl}${page.path}`,
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
