"use client";

import { ethers } from "ethers";
import { AlertCircle, CheckCircle, Coins, Loader, Wallet, RefreshCw, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const TOKEN_FACTORY_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "symbol",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "initialSupply",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "TokenDeployed",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "symbol",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "initialSupply",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "deployToken",
    outputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    name: "tokenAddresses",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "tokenSymbols",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

// TODO: 실제 Token Factory 컨트랙트 주소로 교체 필요
const TOKEN_FACTORY_ADDRESS = "0xCfEB869F69431e42cdB54A4F4f105C19C080A601";

interface DeployedToken {
  symbol: string;
  name: string;
  address: string;
  initialSupply: string;
  owner: string;
  txHash: string;
}

export default function TokenFactory() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState(false);

  // 토큰 발행 폼 상태
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [initialSupply, setInitialSupply] = useState("");

  // 트랜잭션 상태
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [deploymentMessage, setDeploymentMessage] = useState("");
  const [deployedTokens, setDeployedTokens] = useState<DeployedToken[]>([]);
  
  // 페이징 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTokens, setTotalTokens] = useState(0);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);
  const TOKENS_PER_PAGE = 10;

  // 지갑 연결 확인 및 토큰 목록 로딩
  useEffect(() => {
    checkWalletConnection();
    loadTokensFromAPI(1);
  }, []);

  const checkWalletConnection = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          setIsWalletConnected(true);
          setWalletAddress(accounts[0]);
        }
      } catch (error) {
        console.error("지갑 연결 확인 중 오류:", error);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      alert("MetaMask가 설치되지 않았습니다. MetaMask를 설치해주세요.");
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (accounts.length > 0) {
        setIsWalletConnected(true);
        setWalletAddress(accounts[0]);
      }
    } catch (error) {
      console.error("지갑 연결 실패:", error);
      alert("지갑 연결에 실패했습니다.");
    } finally {
      setIsConnecting(false);
    }
  };

  // API에서 토큰 목록 로딩 (페이징 지원)
  const loadTokensFromAPI = async (page: number = 1) => {
    try {
      setIsLoadingTokens(true);
      
      const offset = (page - 1) * TOKENS_PER_PAGE;
      const limit = TOKENS_PER_PAGE;
      
      const response = await fetch(
        `${process.env.API_URL || 'http://localhost:4000'}/token-factory/tokens?limit=${limit}&offset=${offset}`
      );
      
      if (!response.ok) {
        throw new Error(`API 요청 실패: ${response.status}`);
      }
      
      const responseData = await response.json();
      
      // 표준 응답 형식 확인 (data, total)
      const tokensData = responseData.data || responseData;
      const total = responseData.total || tokensData.length;
      
      // API 응답을 DeployedToken 형태로 변환
      const formattedTokens: DeployedToken[] = tokensData.map((token: any) => ({
        symbol: token.symbol || "N/A",
        name: token.name || "Unknown Token",
        address: token.address || "0x0",
        initialSupply: token.initialSupply || "0",
        owner: token.owner || "0x0",
        txHash: token.txHash || token.transactionHash || "0x0"
      }));
      
      setDeployedTokens(formattedTokens);
      setTotalTokens(total);
      setCurrentPage(page);
    } catch (error) {
      console.error("토큰 목록 로딩 실패:", error);
      // 에러가 발생해도 기존 로컬 토큰들은 유지
    } finally {
      setIsLoadingTokens(false);
    }
  };

  const deployToken = async () => {
    if (!isWalletConnected || !tokenName || !tokenSymbol || !initialSupply) {
      alert("모든 필드를 입력하고 지갑을 연결해주세요.");
      return;
    }

    setIsDeploying(true);
    setDeploymentStatus("pending");
    setDeploymentMessage("토큰 배포 중...");

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(TOKEN_FACTORY_ADDRESS, TOKEN_FACTORY_ABI, signer);

      // 초기 공급량을 wei 단위로 변환 (18 decimals)
      const initialSupplyWei = ethers.parseEther(initialSupply);

      const tx = await contract.deployToken(tokenName, tokenSymbol, initialSupplyWei, walletAddress);

      setDeploymentMessage(`트랜잭션 전송됨: ${tx.hash}`);

      const receipt = await tx.wait();

      if (receipt.status === 1) {
        // 이벤트에서 토큰 주소 추출
        const event = receipt.logs.find((log: any) => {
          try {
            const parsedLog = contract.interface.parseLog(log);
            return parsedLog && parsedLog.name === "TokenDeployed";
          } catch {
            return false;
          }
        });

        let tokenAddress = "주소 조회 실패";
        if (event) {
          const parsedLog = contract.interface.parseLog(event);
          // deployToken 함수의 반환값으로 토큰 주소를 얻을 수 있어야 하지만,
          // 여기서는 이벤트에서 가져오거나 토큰 심볼로 조회
          try {
            tokenAddress = await contract.tokenAddresses(tokenSymbol);
          } catch (error) {
            console.error("토큰 주소 조회 실패:", error);
          }
        }

        const newToken: DeployedToken = {
          symbol: tokenSymbol,
          name: tokenName,
          address: tokenAddress,
          initialSupply: initialSupply,
          owner: walletAddress,
          txHash: tx.hash,
        };

        setDeployedTokens((prev) => [newToken, ...prev]);
        setDeploymentStatus("success");
        setDeploymentMessage(`토큰이 성공적으로 배포되었습니다! 주소: ${tokenAddress}`);

        // 폼 초기화
        setTokenName("");
        setTokenSymbol("");
        setInitialSupply("");
        
        // API에서 최신 토큰 목록 다시 로딩
        setTimeout(() => {
          loadTokensFromAPI(1); // 첫 페이지로 이동하면서 새로고침
        }, 2000); // 2초 후 API에서 업데이트된 목록을 가져옴
      } else {
        setDeploymentStatus("error");
        setDeploymentMessage("토큰 배포에 실패했습니다.");
      }
    } catch (error: any) {
      console.error("토큰 배포 오류:", error);
      setDeploymentStatus("error");
      setDeploymentMessage(`배포 실패: ${error.message || "알 수 없는 오류"}`);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center space-x-3">
            <Coins className="w-8 h-8 text-blue-600" />
            <span>토큰 팩토리</span>
          </h1>
          <p className="text-gray-600">새로운 ERC-20 토큰을 간편하게 발행하세요</p>
        </div>

        {/* 토큰 발행 폼 */}
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">토큰 발행</h2>

            {/* 지갑 연결 */}
            {!isWalletConnected ? (
              <div className="mb-6">
                <button
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isConnecting ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>연결 중...</span>
                    </>
                  ) : (
                    <>
                      <Wallet className="w-5 h-5" />
                      <span>지갑 연결</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-800 font-medium">지갑 연결됨</span>
                </div>
                <p className="text-green-700 text-sm mt-1">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </p>
              </div>
            )}

            {/* 토큰 정보 입력 폼 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">토큰 이름</label>
                <input
                  type="text"
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                  placeholder="예: My Token"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!isWalletConnected || isDeploying}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">토큰 심볼</label>
                <input
                  type="text"
                  value={tokenSymbol}
                  onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
                  placeholder="예: MTK"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!isWalletConnected || isDeploying}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">초기 발행량</label>
                <input
                  type="number"
                  value={initialSupply}
                  onChange={(e) => setInitialSupply(e.target.value)}
                  placeholder="예: 1000000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!isWalletConnected || isDeploying}
                />
                <p className="text-xs text-gray-500 mt-1">토큰 단위로 입력하세요 (소수점 18자리 지원)</p>
              </div>

              <button
                onClick={deployToken}
                disabled={!isWalletConnected || isDeploying || !tokenName || !tokenSymbol || !initialSupply}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeploying ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>배포 중...</span>
                  </>
                ) : (
                  <>
                    <Coins className="w-5 h-5" />
                    <span>토큰 발행</span>
                  </>
                )}
              </button>
            </div>

            {/* 배포 상태 메시지 */}
            {deploymentStatus !== "idle" && (
              <div
                className={`mt-4 p-3 rounded-lg ${
                  deploymentStatus === "success"
                    ? "bg-green-50 border border-green-200"
                    : deploymentStatus === "error"
                      ? "bg-red-50 border border-red-200"
                      : "bg-blue-50 border border-blue-200"
                }`}
              >
                <div className="flex items-start space-x-2">
                  {deploymentStatus === "success" && <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />}
                  {deploymentStatus === "error" && <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />}
                  {deploymentStatus === "pending" && <Loader className="w-5 h-5 text-blue-600 animate-spin mt-0.5" />}
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        deploymentStatus === "success"
                          ? "text-green-800"
                          : deploymentStatus === "error"
                            ? "text-red-800"
                            : "text-blue-800"
                      }`}
                    >
                      {deploymentMessage}
                    </p>
                  </div>
                </div>
              </div>
            )}
        </div>

        {/* 발행된 토큰 목록 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">발행된 토큰</h2>
              <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-600">
                  총 {totalTokens}개 토큰 (페이지 {currentPage} / {Math.ceil(totalTokens / TOKENS_PER_PAGE) || 1})
                </div>
                <button
                  onClick={() => loadTokensFromAPI(currentPage)}
                  disabled={isLoadingTokens}
                  className="bg-blue-100 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-200 transition-colors flex items-center space-x-2 disabled:opacity-50"
                  title="토큰 목록 새로고침"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingTokens ? 'animate-spin' : ''}`} />
                  <span>{isLoadingTokens ? '로딩...' : '새로고침'}</span>
                </button>
              </div>
            </div>

            {deployedTokens.length === 0 ? (
              <div className="text-center py-12">
                <Coins className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">아직 발행된 토큰이 없습니다</p>
                <p className="text-sm text-gray-400 mt-2">토큰을 발행하면 여기에 표시됩니다</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        토큰 정보
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        컨트랙트 주소
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        발행량
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        소유자
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        트랜잭션
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {deployedTokens.map((token, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        {/* 토큰 정보 */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <Coins className="h-5 w-5 text-blue-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{token.name}</div>
                              <div className="text-sm text-gray-500">
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                  {token.symbol}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 컨트랙트 주소 */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-mono text-gray-600 bg-gray-50 px-2 py-1 rounded">
                            {token.address.slice(0, 8)}...{token.address.slice(-6)}
                          </div>
                        </td>

                        {/* 발행량 */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-medium">
                            {parseFloat(token.initialSupply).toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">tokens</div>
                        </td>

                        {/* 소유자 */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-mono text-gray-600 bg-gray-50 px-2 py-1 rounded">
                            {token.owner.slice(0, 6)}...{token.owner.slice(-4)}
                          </div>
                        </td>

                        {/* 트랜잭션 */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link 
                            href={`/transactions/${token.txHash}`}
                            className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <span className="text-sm font-mono">
                              {token.txHash.slice(0, 8)}...{token.txHash.slice(-6)}
                            </span>
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* 페이지네이션 */}
            {totalTokens > TOKENS_PER_PAGE && (
              <div className="mt-6 border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    총 {totalTokens.toLocaleString()}개 토큰 중{" "}
                    <span className="font-medium">
                      {(currentPage - 1) * TOKENS_PER_PAGE + 1}-
                      {Math.min(currentPage * TOKENS_PER_PAGE, totalTokens)}
                    </span>
                    번째 표시
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* 이전 페이지 버튼 */}
                    <button
                      onClick={() => loadTokensFromAPI(currentPage - 1)}
                      disabled={currentPage === 1 || isLoadingTokens}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        currentPage === 1 || isLoadingTokens
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      이전
                    </button>

                    {/* 페이지 번호들 */}
                    <div className="flex items-center space-x-1">
                      {(() => {
                        const totalPages = Math.ceil(totalTokens / TOKENS_PER_PAGE);
                        const maxVisiblePages = 5;
                        const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                        const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                        
                        return Array.from({ length: endPage - startPage + 1 }, (_, i) => {
                          const pageNum = startPage + i;
                          return (
                            <button
                              key={pageNum}
                              onClick={() => loadTokensFromAPI(pageNum)}
                              disabled={isLoadingTokens}
                              className={`px-3 py-2 rounded-md text-sm font-medium ${
                                pageNum === currentPage
                                  ? "bg-blue-600 text-white"
                                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        });
                      })()}
                    </div>

                    {/* 다음 페이지 버튼 */}
                    <button
                      onClick={() => loadTokensFromAPI(currentPage + 1)}
                      disabled={currentPage >= Math.ceil(totalTokens / TOKENS_PER_PAGE) || isLoadingTokens}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        currentPage >= Math.ceil(totalTokens / TOKENS_PER_PAGE) || isLoadingTokens
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      다음
                    </button>
                  </div>
                </div>
              </div>
            )}
        </div>

        {/* 안내 사항 */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">주의사항</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• 토큰 발행 시 가스비가 소모됩니다</li>
            <li>• 토큰 심볼은 중복될 수 있으니 주의하세요</li>
            <li>• 발행된 토큰은 ERC-20 표준을 따릅니다</li>
            <li>• 현재 테스트넷에서만 사용 가능합니다</li>
            <li>• 토큰 목록은 API 서버에서 자동으로 관리됩니다</li>
            <li>• 새로고침 버튼으로 최신 토큰 목록을 확인할 수 있습니다</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
