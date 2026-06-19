import type { MetadataRoute } from "next";
import { competitors } from "@/data/competitors";

export default function sitemap(): MetadataRoute.Sitemap {
  const alternativeEntries: MetadataRoute.Sitemap = competitors.map((c) => ({
    url: `https://logr.work/alternatives/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: "https://logr.work/",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: "https://logr.work/alternatives",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...alternativeEntries,
  ];
}
