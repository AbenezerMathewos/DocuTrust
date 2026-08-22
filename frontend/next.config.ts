import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['thumbzilla-analysts-library-clicks.trycloudflare.com'],
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
    buildActivityPosition: 'bottom-right',
  }
};

export default nextConfig;
