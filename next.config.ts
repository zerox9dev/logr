import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  output: "standalone",
  trailingSlash: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

// remark-gfm adds the markdown features the articles rely on: tables,
// task lists, strikethrough, and autolinks.
const withMDX = createMDX({
  // Referenced by name so Turbopack can serialize the plugin config.
  options: { remarkPlugins: [["remark-gfm", {}]] },
});

export default withMDX(nextConfig);
