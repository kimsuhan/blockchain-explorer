// 블록 탐색기 헤더 컴포넌트
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { checkNetworkConnection } from '@/lib/web3';
import { Search, BarChart3, Square, CreditCard, User } from 'lucide-react';

export default function Header() {
  // 네트워크 연결 상태를 관리하는 state
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);

  // 컴포넌트가 마운트될 때 네트워크 연결 상태 확인
  useEffect(() => {
    const checkConnection = async () => {
      setIsChecking(true);
      const connected = await checkNetworkConnection();
      setIsConnected(connected);
      setIsChecking(false);
    };

    checkConnection();

    // 30초마다 연결 상태 재확인
    const interval = setInterval(checkConnection, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* 로고 및 제목 */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-2xl font-bold hover:text-blue-200 transition-colors flex items-center space-x-2">
              <Search className="w-8 h-8" />
              <span>Local Block Explorer</span>
            </Link>
            <span className="text-blue-200 text-sm">
              Hardhat Local Network
            </span>
          </div>

          {/* 네트워크 상태 표시 */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div 
                className={`w-3 h-3 rounded-full ${
                  isChecking 
                    ? 'bg-yellow-400 animate-pulse' 
                    : isConnected 
                    ? 'bg-green-400' 
                    : 'bg-red-400'
                }`}
              />
              <span className="text-sm">
                {isChecking 
                  ? '연결 확인 중...' 
                  : isConnected 
                  ? '연결됨' 
                  : '연결 끊김'
                }
              </span>
            </div>

            {/* 네트워크 정보 */}
            <div className="text-sm text-blue-200">
              <div>RPC: http://127.0.0.1:8545</div>
              <div>Chain ID: 31337</div>
            </div>
          </div>
        </div>

        {/* 네비게이션 메뉴 */}
        <nav className="mt-4">
          <div className="flex space-x-6">
            <Link 
              href="/" 
              className="hover:text-blue-200 transition-colors font-medium flex items-center space-x-1"
            >
              <BarChart3 className="w-4 h-4" />
              <span>대시보드</span>
            </Link>
            <Link 
              href="/blocks" 
              className="hover:text-blue-200 transition-colors font-medium flex items-center space-x-1"
            >
              <Square className="w-4 h-4" />
              <span>블록</span>
            </Link>
            <Link 
              href="/transactions" 
              className="hover:text-blue-200 transition-colors font-medium flex items-center space-x-1"
            >
              <CreditCard className="w-4 h-4" />
              <span>트랜잭션</span>
            </Link>
            <Link 
              href="/accounts" 
              className="hover:text-blue-200 transition-colors font-medium flex items-center space-x-1"
            >
              <User className="w-4 h-4" />
              <span>계정</span>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}