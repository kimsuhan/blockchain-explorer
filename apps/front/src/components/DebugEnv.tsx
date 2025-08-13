'use client';

import { useEffect } from 'react';

export default function DebugEnv() {
  useEffect(() => {
    console.log('=== 환경변수 디버깅 ===');
    console.log('RPC_URL:', process.env.RPC_URL);
    console.log('DEFAULT_ACCOUNTS:', process.env.DEFAULT_ACCOUNTS);
    console.log('API_URL:', process.env.API_URL);
    console.log('CHAIN_ID:', process.env.CHAIN_ID);
    console.log('전체 process.env:', process.env);
  }, []);

  return (
    <div style={{ padding: '10px', background: '#f0f0f0', margin: '10px' }}>
      <h3>환경변수 디버그</h3>
      <p>RPC_URL: {process.env.RPC_URL}</p>
      <p>DEFAULT_ACCOUNTS: {process.env.DEFAULT_ACCOUNTS}</p>
      <p>API_URL: {process.env.API_URL}</p>
      <p>CHAIN_ID: {process.env.CHAIN_ID}</p>
    </div>
  );
}