import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ESLint is still on the old Vite flat-config; proper eslint-config-next
  // setup is a Phase 6 cleanup item. Don't block builds on it meanwhile.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
