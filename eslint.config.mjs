import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    ".claude/**",
    "out/**",
    "build/**",
    "dist/**",
    "next-env.d.ts",
    // Runs in PocketBase's goja runtime, not in the Next.js module graph.
    "pb_migrations/**",
  ]),
]);

export default eslintConfig;
