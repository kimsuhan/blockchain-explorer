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
    const blockNumber: number = await this.ethers.jsonProvider.getBlockNumber(); // 현재 블록 번호
    let lastBlock: number = Number(await this.redis.get(CACHE_KEY.LAST_BLOCK)) || 0; // 마지막 블록 번호
    if (lastBlock === 0) {
      await this.redis.flushall();
    }

    // 현재 블록 번호가 마지막 블록 번호보다 크면
    if (lastBlock < blockNumber) {
      const maxBlocks = 10000; // 최대 10000개만 기록
      if (blockNumber - lastBlock > maxBlocks) {
        lastBlock = blockNumber - maxBlocks;
      }

      for (let i = lastBlock; i < blockNumber; i++) {
        await this.blockPush(i);
        // await new Promise((resolve) => setTimeout(resolve, 50));
        this.logger.log(`${(i / blockNumber) * 100}% 블록 저장 완료`);
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
    // 모든 블록을 가져와서 해당 번호의 블록 찾기
    const allBlocks = await this.redis.lrange(CACHE_KEY.BLOCK, 0, -1);

    for (const blockStr of allBlocks) {
      try {
        const blockData = JSON.parse(blockStr) as Record<string, unknown>;
        if (blockData.number === blockNumber) {
          return blockData;
        }
      } catch (error) {
        this.logger.error('블록 데이터 파싱 실패:', error);
      }
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
    this.logger.debug(`${blockNumber} 새로운 블록 저장`);

    const info = {
      number: blockNumber,
      hash: block.hash,
      timestamp: block.timestamp,
      transactions: block.transactions.length,
      parentHash: block.parentHash,
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
    };

    await this.redis.lpush(CACHE_KEY.BLOCK, JSON.stringify(info));

    // 최대 10000개만 기록
    await this.redis.ltrim(CACHE_KEY.BLOCK, 0, 9999);

    // WebSocket으로 새 블록 알림 브로드캐스트
    this.blockGateway.broadcastNewBlock(info);
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
  async getBlocks(limit: number, offset: number): Promise<{ data: Record<string, unknown>[]; total: number }> {
    const len = await this.redis.llen(CACHE_KEY.BLOCK);
    const blocks = await this.redis.lrange(CACHE_KEY.BLOCK, offset, offset + limit - 1);

    const response = blocks.map((block) => JSON.parse(block) as Record<string, unknown>);

    return {
      data: response,
      total: len,
    };
  }
}
