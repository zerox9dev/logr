import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/tracker", "/clients", "/funnels", "/invoices", "/profile"],
      },
    ],
    sitemap: "https://logr.app/sitemap.xml",
  };
}
