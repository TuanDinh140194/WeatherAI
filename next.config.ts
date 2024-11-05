// next.config.js
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true, // Enables strict mode for better error handling
  //swcMinify: true, // Enables SWC-based minification for faster builds

  webpack(config) {
    // Ensure that problematic node modules aren't included for browser
    config.resolve.fallback = {
      fs: false, // fs (file system) is not used in the client
      path: false, // path module should not be bundled in client-side
    };

    return config;
  },
};

export default nextConfig;
