import { config } from "dotenv";
import type { NextConfig } from "next";
import { resolve } from "path";

// 루트 .env 파일 로드
config({ path: resolve(__dirname, "../../.env") });

const nextConfig: NextConfig = {
  // 환경변수 설정
  env: {
    API_URL: process.env.API_URL || "http://localhost:4000",
    RPC_URL: process.env.RPC_URL || "http://forlong.io:8545",
    CHAIN_ID: process.env.CHAIN_ID || "1337",
    DEFAULT_ACCOUNTS: process.env.DEFAULT_ACCOUNTS || "",
  },
};

export default nextConfig;
