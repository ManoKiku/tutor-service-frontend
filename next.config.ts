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
  apiUrl: "http://localhost:5154/api",
  chatHubUrl: "http://localhost:5154/chatHub",
  serverUrl: "http://localhost:5154",
  videoCallUrl: "http://localhost:5154/videoCallHub"
}

export default nextConfig;