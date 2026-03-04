import type { NextConfig } from "next";

interface AppConfig {
  apiUrl : string;
  chatHubUrl: string;
  serverUrl: string;
}

const nextConfig: NextConfig = {
  reactCompiler: true
};

export const appConfig : AppConfig = {
  apiUrl: "http://localhost:5154/api",
  chatHubUrl: "http://localhost:5154/chatHub",
  serverUrl: "http://localhost:5154",
}

export default nextConfig;