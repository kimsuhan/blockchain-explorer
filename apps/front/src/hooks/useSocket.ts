"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

import { BlockInfo } from "@/lib/web3";

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastBlock, setLastBlock] = useState<BlockInfo | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Socket.IO 서버 연결
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4001";
    socketRef.current = io(socketUrl, {
      transports: ["websocket", "polling"],
      timeout: 20000,
    });

    const socket = socketRef.current;

    // 연결 이벤트 처리
    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      setIsConnected(true);
      // 블록 업데이트 구독
      socket.emit("subscribe");
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      setIsConnected(false);
    });

    socket.on("connected", (data) => {
      console.log("서버 연결 확인:", data);
    });

    socket.on("subscribed", (data) => {
      console.log("블록 업데이트 구독:", data);
    });

    // 새 블록 이벤트 처리
    socket.on("newBlock", (blockData: BlockInfo) => {
      console.log("🆕 새 블록 받음:", blockData);

      // 백엔드에서 받은 데이터를 BlockInfo 형태로 변환
      const newBlock: BlockInfo = {
        number: blockData.number,
        hash: blockData.hash || "",
        timestamp: blockData.timestamp,
        transactionCount: blockData.transactionCount || 0,
        gasUsed: blockData.gasUsed || "", // 기본값
        gasLimit: blockData.gasLimit || "", // 기본값
        miner: blockData.miner || "",
        parentHash: blockData.parentHash || "", // 기본값
        parentBeaconBlockRoot: blockData.parentBeaconBlockRoot || "", // 기본값
        nonce: blockData.nonce || "", // 기본값
        difficulty: blockData.difficulty || "", // 기본값
        stateRoot: blockData.stateRoot || "", // 기본값
        receiptsRoot: blockData.receiptsRoot || "", // 기본값
        blobGasUsed: blockData.blobGasUsed || "", // 기본값
        excessBlobGas: blockData.excessBlobGas || "", // 기본값
      };

      setLastBlock(newBlock);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket 연결 오류:", error);
      setIsConnected(false);
    });

    // 컴포넌트 언마운트 시 연결 해제
    return () => {
      if (socket) {
        console.log("Socket 연결 해제");
        socket.disconnect();
      }
    };
  }, []);

  // 수동으로 재연결
  const reconnect = () => {
    if (socketRef.current) {
      socketRef.current.connect();
    }
  };

  return {
    isConnected,
    lastBlock,
    reconnect,
    socket: socketRef.current,
  };
}
