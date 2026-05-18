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
  apiUrl: "https://repetitor.somee.com/api",
  chatHubUrl: "https://repetitor.somee.com/chatHub",
  serverUrl: "https://repetitor.somee.com",
  videoCallUrl: "https://repetitor.somee.com/videoCallHub"
}

export default nextConfig;
