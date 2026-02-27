import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/ru", "/uk"],
        disallow: ["/dashboard", "/tracker", "/clients", "/funnels", "/invoices", "/profile"],
      },
    ],
    sitemap: "https://logr.work/sitemap.xml",
  };
}
