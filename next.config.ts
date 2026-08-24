import type { NextConfig } from "next";
import path from "path";

const apiUrl =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:3001";

let apiHostname = "localhost";
let apiProtocol: "http" | "https" = "http";
let apiPort: string | undefined = "3001";

try {
  const parsed = new URL(apiUrl);
  apiHostname = parsed.hostname;
  apiProtocol = parsed.protocol === "https:" ? "https" : "http";
  apiPort = parsed.port || undefined;
} catch {
  // keep defaults
}

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  outputFileTracingRoot: path.join(__dirname),
  images: {
    remotePatterns: [
      {
        protocol: apiProtocol,
        hostname: apiHostname,
        ...(apiPort ? { port: apiPort } : {}),
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
