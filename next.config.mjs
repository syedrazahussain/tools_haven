/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['tools-haven-server.onrender.com'],// 👈 Allow image loading from localhost
  },
};

export default nextConfig;
