import path from "node:path"
import { fileURLToPath } from "node:url"
import type { NextConfig } from "next"

const projectRoot = path.dirname(fileURLToPath(import.meta.url))

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },

  async rewrites() {
    const backendOrigin = process.env.BACKEND_API_ORIGIN ?? "http://localhost:3000"

    return [
      {
        source: "/api/:path*",
        destination: `${backendOrigin}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
