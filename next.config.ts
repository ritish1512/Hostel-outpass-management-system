import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";
const withPWA = withPWAInit({
  dest:'public',
  register:true,
})
const nextConfig: NextConfig = {
  turbopack:{},
  devIndicators:false,
  allowedDevOrigins: ['oppose-vendor-armed.ngrok-free.dev'],
};

export default withPWA(nextConfig);
