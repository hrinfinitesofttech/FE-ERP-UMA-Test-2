/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/purchase/bills',
        destination: '/purchase/dashboard',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
