/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow connections from any IP address on the network
  async rewrites() {
    return []
  },
  // Enable hostname binding
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '192.168.1.9:3000']
    }
  }
}

module.exports = nextConfig