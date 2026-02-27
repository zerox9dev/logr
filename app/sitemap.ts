import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: "https://logr.work",
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
      alternates: {
        languages: {
          en: "https://logr.work",
          ru: "https://logr.work/ru",
          uk: "https://logr.work/uk",
        },
      },
    },
    {
      url: "https://logr.work/ru",
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: "https://logr.work/uk",
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
  ];
}
