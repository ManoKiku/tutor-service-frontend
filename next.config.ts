import type { NextConfig } from "next";

interface AppConfig {
  apiUrl : string;
  chatHubUrl: string;
  serverUrl: string;
  videoCallUrl: string;
}

const nextConfig: NextConfig = {
  reactCompiler: true
};

export const appConfig : AppConfig = {
  apiUrl: "https://localhost:5154/api",
  chatHubUrl: "https://localhost:5154/chatHub",
  serverUrl: "https://localhost:5154",
  videoCallUrl: "https://localhost:5154/videoCallHub"
}

export default nextConfig;
