/** @type {import('next').NextConfig} */
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: projectRoot,
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
