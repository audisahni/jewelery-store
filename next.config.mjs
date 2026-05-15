// @ts-check
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

if (process.env.NODE_ENV === "development") {
  await initOpenNextCloudflareForDev();
}

export default nextConfig;
