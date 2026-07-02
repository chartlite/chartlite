import type { NextConfig } from "next";

/**
 * Deployed on Vercel as a full Next.js app (SSR enabled), so the site can
 * server-render its own charts via `@chartlite/core/server` — dogfooding the
 * library's SSR. No `output: 'export'` / `basePath` (those were for the old
 * GitHub Pages static export under `/chartlite`).
 */
const nextConfig: NextConfig = {};

export default nextConfig;
