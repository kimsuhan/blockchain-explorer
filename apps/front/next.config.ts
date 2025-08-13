import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 환경변수 설정
  env: {
    API_URL: process.env.API_URL || 'http://localhost:4000',
    RPC_URL: process.env.RPC_URL || 'http://forlong.io:8545',
    CHAIN_ID: process.env.CHAIN_ID || '31337',
  }
};

export default nextConfig;
