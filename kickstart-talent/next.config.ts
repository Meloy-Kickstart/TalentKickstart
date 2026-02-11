import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/about',
        destination: 'https://meloykickstart.tech/',
        permanent: false,
      },
      {
        source: '/contact',
        destination: 'https://meloykickstart.tech/',
        permanent: false,
      },
    ]
  },
};

export default nextConfig;
