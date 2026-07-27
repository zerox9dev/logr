import type { MetadataRoute } from "next";
import { competitors } from "@/data/competitors";
import { posts } from "@/data/posts";

export default function sitemap(): MetadataRoute.Sitemap {
  const alternativeEntries: MetadataRoute.Sitemap = competitors.map((c) => ({
    url: `https://logr.work/alternatives/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const postEntries: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `https://logr.work/blog/${p.slug}`,
    lastModified: new Date(p.updated ?? p.date),
    changeFrequency: "monthly",
    priority: 0.7,
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
    {
      url: "https://logr.work/blog",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...postEntries,
  ];
}
