// Web3 연결을 위한 유틸리티 파일
import { ethers } from "ethers";

// Hardhat 로컬 노드 연결 설정
// export const LOCAL_RPC_URL = "http://119.28.156.50:8545";
export const LOCAL_RPC_URL = "http://forlong.io:8545";
// export const LOCAL_RPC_URL = "https://ily.blockgateway.net/";
// export const LOCAL_RPC_URL = "https://ethereum.publicnode.com";

// 이더리움 프로바이더 설정 (로컬 Hardhat 노드에 연결)
export const provider = new ethers.JsonRpcProvider(LOCAL_RPC_URL);

// 블록 정보 타입 정의
export interface BlockInfo {
  number: number;
  hash: string;
  timestamp: number;
  transactionCount: number;
  gasUsed: string;
  gasLimit: string;
  miner: string;
  parentHash: string;
}

// 트랜잭션 정보 타입 정의
export interface TransactionInfo {
  hash: string;
  blockNumber: number;
  from: string;
  to: string;
  value: string;
  gasUsed?: string;
  gasPrice: string;
  timestamp?: number;
  status?: number;
}

// 최신 블록 정보 가져오기
export async function getLatestBlock(): Promise<BlockInfo | null> {
  try {
    const block = await provider.getBlock("latest", true);
    if (!block) return null;

    return {
      number: block.number,
      hash: block.hash,
      timestamp: block.timestamp,
      transactionCount: block.transactions.length,
      gasUsed: block.gasUsed.toString(),
      gasLimit: block.gasLimit.toString(),
      miner: block.miner,
      parentHash: block.parentHash,
    };
  } catch (error) {
    console.error("최신 블록 가져오기 실패:", error);
    return null;
  }
}

// 특정 블록 정보 가져오기 (블록 번호로 조회)
export async function getBlockByNumber(
  blockNumber: number
): Promise<BlockInfo | null> {
  try {
    const block = await provider.getBlock(blockNumber, true);
    if (!block) return null;

    return {
      number: block.number,
      hash: block.hash ?? "",
      timestamp: block.timestamp,
      transactionCount: block.transactions.length,
      gasUsed: block.gasUsed.toString(),
      gasLimit: block.gasLimit.toString(),
      miner: block.miner,
      parentHash: block.parentHash,
    };
  } catch (error) {
    console.error(`블록 ${blockNumber} 가져오기 실패:`, error);
    return null;
  }
}

// 최근 블록들 가져오기 (개수 지정)
export async function getRecentBlocks(
  count: number = 10
): Promise<BlockInfo[]> {
  try {
    const latestBlockNumber = await provider.getBlockNumber();
    const blocks: BlockInfo[] = [];

    // 최신 블록부터 거꾸로 가져오기
    for (let i = 0; i < count; i++) {
      const blockNumber = latestBlockNumber - i;
      if (blockNumber < 0) break;

      const blockInfo = await getBlockByNumber(blockNumber);
      if (blockInfo) {
        blocks.push(blockInfo);
      }
    }

    return blocks;
  } catch (error) {
    console.error("최근 블록들 가져오기 실패:", error);
    return [];
  }
}

// 트랜잭션 정보 가져오기
export async function getTransactionByHash(
  txHash: string
): Promise<TransactionInfo | null> {
  try {
    const tx = await provider.getTransaction(txHash);
    const receipt = await provider.getTransactionReceipt(txHash);

    if (!tx) return null;

    // 트랜잭션이 포함된 블록 정보도 가져와서 타임스탬프 추가
    let timestamp: number | undefined;
    if (tx.blockNumber) {
      const block = await provider.getBlock(tx.blockNumber);
      timestamp = block?.timestamp;
    }

    return {
      hash: tx.hash,
      blockNumber: tx.blockNumber || 0,
      from: tx.from,
      to: tx.to || "",
      value: ethers.formatEther(tx.value),
      gasUsed: receipt?.gasUsed.toString(),
      gasPrice: tx.gasPrice?.toString() || "0",
      timestamp,
      status: receipt?.status,
    };
  } catch (error) {
    console.error(`트랜잭션 ${txHash} 가져오기 실패:`, error);
    return null;
  }
}

// 계정 잔액 조회
export async function getAccountBalance(
  address: string
): Promise<string | null> {
  try {
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error(`계정 ${address} 잔액 조회 실패:`, error);
    return null;
  }
}

// 특정 블록의 모든 트랜잭션 가져오기
export async function getTransactionsFromBlock(
  blockNumber: number
): Promise<TransactionInfo[]> {
  try {
    const block = await provider.getBlock(blockNumber, true);
    if (!block || !block.transactions) return [];

    const transactions: TransactionInfo[] = [];

    for (const tx of block.transactions) {
      if (typeof tx === "string") {
        // 트랜잭션 해시만 있는 경우, 상세 정보 가져오기
        const txInfo = await getTransactionByHash(tx);
        if (txInfo) transactions.push(txInfo);
      } else {
        // 트랜잭션 전체 정보가 있는 경우
        const receipt = await provider.getTransactionReceipt(tx.hash);
        transactions.push({
          hash: tx.hash,
          blockNumber: tx.blockNumber || 0,
          from: tx.from,
          to: tx.to || "",
          value: ethers.formatEther(tx.value),
          gasUsed: receipt?.gasUsed.toString(),
          gasPrice: tx.gasPrice?.toString() || "0",
          timestamp: block.timestamp,
          status: receipt?.status,
        });
      }
    }

    return transactions;
  } catch (error) {
    console.error(`블록 ${blockNumber}의 트랜잭션 가져오기 실패:`, error);
    return [];
  }
}

// 네트워크 연결 상태 확인
export async function checkNetworkConnection(): Promise<boolean> {
  try {
    await provider.getBlockNumber();
    return true;
  } catch (error) {
    console.error("네트워크 연결 확인 실패:", error);
    return false;
  }
}
