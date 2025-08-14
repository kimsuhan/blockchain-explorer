import { BlockGateway } from '@/modules/block/block.gateway';
import { CACHE_KEY } from '@/modules/cache/consts/cache-key.const';
import { RedisCacheService } from '@/modules/cache/redis-cache.service';
import { EthersService } from '@/modules/ethers/ethers.service';
import { Injectable, Logger } from '@nestjs/common';
import { Block, TransactionReceipt } from 'ethers';

@Injectable()
export class BlockService {
  private readonly logger = new Logger(BlockService.name);
  initOn: boolean = false;

  constructor(
    private readonly redis: RedisCacheService,
    private readonly ethers: EthersService,
    private readonly blockGateway: BlockGateway,
  ) {
    void this.initBlock();
  }

  /**
   * 블록 초기화
   */
  async initBlock() {
    this.initOn = false;
    const blockNumber: number = await this.ethers.jsonProvider.getBlockNumber();
    const lastBlock: number = Number(await this.redis.get(CACHE_KEY.LAST_BLOCK)) || 0;
    if (lastBlock === 0) {
      await this.redis.flushall();
    }

    if (lastBlock < blockNumber) {
      const maxBlocks = 10000; // 최대 10000개만 기록
      let count = 0;
      for (let i = blockNumber; i > lastBlock && count < maxBlocks; i--, count++) {
        void this.blockPush(i);
      }

      // 마지막 블록 정보 기록
      await this.redis.set(CACHE_KEY.LAST_BLOCK, blockNumber);
    }

    this.initOn = true;
  }

  /**
   * 블록 정보 조회
   *
   * @param blockNumber
   */
  async getBlock(blockNumber: number): Promise<Block | null> {
    const block: Block | null = await this.ethers.jsonProvider.getBlock(blockNumber);
    if (block && block.transactions.length > 0) {
      for (const transaction of block.transactions) {
        const receipt = await this.ethers.jsonProvider.getTransactionReceipt(transaction);
        this.logger.debug('트랜잭션 정보:', receipt);
      }
    }
    return block;
  }

  /**
   * 블록 정보 조회
   *
   * @param blockNumber
   * @returns
   */
  async getRedisBlock(blockNumber: number): Promise<Record<string, unknown> | null> {
    blockNumber -= 1; // 0부터 시작하므로 1 빼줌
    const block: string[] | null = await this.redis.zrange(CACHE_KEY.BLOCK, blockNumber, blockNumber);
    if (block && block.length > 0) {
      return JSON.parse(block[0]) as Record<string, unknown>;
    }

    return null;
  }

  /**
   * 블록 정보 조회
   *
   * @param blockNumber
   */
  async blockPush(blockNumber: number): Promise<void> {
    const block: Block | null = await this.getBlock(blockNumber);

    // TODO: 블록 정보 조회 실패 시 처리
    if (!block) {
      this.logger.error('❌ 블록 정보 조회 실패');
      return;
    }

    // Sorted Set 으로 넣어보기
    await this.pushBlock(block.number, {
      hash: block.hash,
      timestamp: block.timestamp,
      transactions: block.transactions.length,
      parentBeaconBlockRoot: block.parentBeaconBlockRoot,
      nonce: block.nonce,
      difficulty: block.difficulty.toString(),
      stateRoot: block.stateRoot,
      receiptsRoot: block.receiptsRoot,
      blobGasUsed: block.blobGasUsed?.toString() || null,
      excessBlobGas: block.excessBlobGas?.toString() || null,
      miner: block.miner,
      prevRandao: block.prevRandao,
      extraData: block.extraData,
      baseFeePerGas: block.baseFeePerGas?.toString() || null,
      gasLimit: block.gasLimit.toString(),
      gasUsed: block.gasUsed.toString(),
    });
  }

  /**
   * 블록 정보 저장
   *
   * @param blockNumber
   * @param info
   */
  async pushBlock(
    blockNumber: number,
    info: {
      hash: string | null;
      timestamp: number;
      transactions: number;
      parentBeaconBlockRoot: string | null;
      nonce: string;
      difficulty: string;
      stateRoot: string | null;
      receiptsRoot: string | null;
      blobGasUsed: string | null;
      excessBlobGas: string | null;
      miner: string | null;
      prevRandao: string | null;
      extraData: string | null;
      baseFeePerGas: string | null;
      gasLimit: string;
      gasUsed: string;
    },
  ) {
    console.log(`${blockNumber} 새로운 블록 저장`);
    await this.redis.zadd(CACHE_KEY.BLOCK, blockNumber, JSON.stringify({ ...info, number: blockNumber }));

    // 최대 10000개만 기록
    const maxBlocks = 10000;
    const blocks = await this.redis.zrange(CACHE_KEY.BLOCK, 0, -1);
    if (blocks.length >= maxBlocks) {
      await this.redis.zremrangebyrank(CACHE_KEY.BLOCK, 0, maxBlocks);
    }

    // WebSocket으로 새 블록 알림 브로드캐스트
    this.blockGateway.broadcastNewBlock({ ...info, number: blockNumber });
  }

  /**
   * 트랜잭션 정보 저장
   *
   * @param transaction
   */
  async pushTransaction(transaction: TransactionReceipt) {
    await this.redis.set(CACHE_KEY.TRANSACTION, JSON.stringify(transaction));
  }

  /**
   * 블록 정보 조회
   *
   * @param limit
   * @param offset
   */
  async getBlocks(limit: number, offset: number): Promise<{ data: string[]; total: number }> {
    const len = await this.redis.zcard(CACHE_KEY.BLOCK);

    // 최신 블록부터 역순으로 가져오기 위해 start/end 계산
    const start = Math.max(0, len - offset - limit);
    const end = Math.max(-1, len - offset - 1);

    // start가 end보다 큰 경우 빈 배열 반환
    if (start > end || start >= len) {
      return {
        data: [],
        total: len,
      };
    }

    const blocks = await this.redis.zrange(CACHE_KEY.BLOCK, start, end);

    // 최신 블록이 먼저 오도록 역순 정렬
    const reversedBlocks = blocks.reverse();

    return {
      data: reversedBlocks,
      total: len,
    };
  }
}
