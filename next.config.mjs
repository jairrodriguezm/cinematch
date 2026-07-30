import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required: tells Next.js 16 we acknowledge Turbopack is the default,
  // but the PWA plugin's webpack config is intentional for service-worker generation.
  turbopack: {},
};

export default withPWA(nextConfig);
