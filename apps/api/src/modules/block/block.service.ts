import { BlockGateway } from '@/modules/block/block.gateway';
import { CACHE_KEY } from '@/modules/cache/consts/cache-key.const';
import { RedisCacheService } from '@/modules/cache/redis-cache.service';
import { EthersService } from '@/modules/ethers/ethers.service';
import { BlockDto } from '@/modules/viem/dto/block.dto';
import { ViemService } from '@/modules/viem/viem.service';
import { Injectable, Logger } from '@nestjs/common';
import { TransactionReceipt } from 'ethers';

@Injectable()
export class BlockService {
  private readonly logger = new Logger(BlockService.name);
  private initOn: boolean = false;

  constructor(
    private readonly redis: RedisCacheService,
    private readonly ethers: EthersService,
    private readonly blockGateway: BlockGateway,
    private readonly viem: ViemService,
  ) {
    void this.initBlock();
  }

  /**
   * 블록 초기화
   */
  async initBlock() {
    // 이미 초기화 중이면 종료
    if (this.initOn) {
      return;
    }

    this.initOn = true;

    const lastBlockNumber = await this.viem.getLastBlockNumber(); // 현재 블록 번호
    const redisBlockNumber = Number((await this.redis.get(CACHE_KEY.LAST_BLOCK)) || 0); // 마지막 블록 번호
    if (redisBlockNumber === 0) {
      await this.redis.flushall();
    }

    if (redisBlockNumber === lastBlockNumber) {
      this.initOn = false;
      return;
    }

    // 10,000개만 저장
    if (lastBlockNumber > redisBlockNumber + 10000) {
      await this.redis.flushall();
      await this.blockPush(lastBlockNumber - 10000, lastBlockNumber);
    } else {
      await this.blockPush(redisBlockNumber, lastBlockNumber);
    }

    // 마지막 블록 정보 기록
    await this.redis.set(CACHE_KEY.LAST_BLOCK, lastBlockNumber);

    this.initOn = false;
  }

  /**
   * 블록 정보 조회
   *
   * @param blockNumber
   */
  async getBlock(blockNumber: number): Promise<BlockDto | null> {
    const viemBlock = await this.viem.getBlock(blockNumber);

    if (viemBlock) {
      return viemBlock;
    }

    // const block: Block | null = await this.viem.getBlock(blockNumber);
    // if (block && block.transactions.length > 0) {
    //   for (const transaction of block.transactions) {
    //     const receipt = await this.ethers.jsonProvider.getTransactionReceipt(transaction);
    //     if (receipt) {
    //       await this.pushTransaction(receipt);
    //     }
    //   }
    // }

    return viemBlock;
  }

  /**
   * 블록 정보 조회
   *
   * @param blockNumber
   * @returns
   */
  // async getRedisBlock(blockNumber: number): Promise<Record<string, unknown> | null> {
  //   // 모든 블록을 가져와서 해당 번호의 블록 찾기
  //   const allBlocks = await this.redis.lrange(CACHE_KEY.BLOCK, 0, -1);

  //   for (const blockStr of allBlocks) {
  //     try {
  //       const blockData = JSON.parse(blockStr) as Record<string, unknown>;
  //       if (blockData.number === blockNumber) {
  //         return blockData;
  //       }
  //     } catch (error) {
  //       this.logger.error('블록 데이터 파싱 실패:', error);
  //     }
  //   }

  //   const block = await this.getBlock(blockNumber);
  //   if (block) {
  //     return {
  //       number: block.number,
  //       hash: block.hash,
  //       timestamp: block.timestamp,
  //       transactions: block.transactions.length,
  //       parentHash: block.parentHash,
  //       parentBeaconBlockRoot: block.parentBeaconBlockRoot,
  //       nonce: block.nonce,
  //       difficulty: block.difficulty.toString(),
  //       stateRoot: block.stateRoot,
  //       receiptsRoot: block.receiptsRoot,
  //       blobGasUsed: block.blobGasUsed?.toString() || null,
  //       excessBlobGas: block.excessBlobGas?.toString() || null,
  //       miner: block.miner,
  //       prevRandao: block.nonce,
  //       extraData: block.extraData,
  //       baseFeePerGas: block.baseFeePerGas?.toString() || null,
  //       gasLimit: block.gasLimit.toString(),
  //       gasUsed: block.gasUsed.toString(),
  //     };
  //   }

  //   return null;
  // }

  /**
   * Redis 에 블록 정보 저장
   *
   * @param blockNumber
   */
  async blockPush(startBlockNumber: number, endBlockNumber: number): Promise<void> {
    const pipeline = this.redis.pipeline();
    const blocks: BlockDto[] = [];
    for (let i = startBlockNumber; i < endBlockNumber; i++) {
      const block: BlockDto | null = await this.viem.getBlock(i);
      if (!block || block === null) {
        this.logger.error('❌ 블록 정보 조회 실패');
        continue;
      }

      // this.logger.log(`${(i / endBlockNumber) * 100}% 블록 저장 완료`);
      this.logger.verbose(`[ ${block.blockNumber} ] ${Math.round((i / endBlockNumber) * 100)}%`);

      pipeline.zadd(CACHE_KEY.BLOCK, block.blockNumber, JSON.stringify(block));
      blocks.push(block);

      pipeline.zremrangebyrank(CACHE_KEY.BLOCK, 0, -10001); // 10,000개 유지
    }

    this.logger.debug(`${startBlockNumber} ~ ${endBlockNumber} 새로운 블록 저장`);
    await pipeline.exec();

    // WebSocket으로 새 블록 알림 브로드캐스트
    this.blockGateway.broadcastNewBlock(blocks);
  }

  /**
   * 트랜잭션 정보 저장
   *
   * @param transaction
   */
  async pushTransaction(transaction: TransactionReceipt) {
    await this.redis.lpush(CACHE_KEY.TRANSACTION, JSON.stringify(transaction));
    await this.redis.ltrim(CACHE_KEY.TRANSACTION, 0, 9999);
  }

  /**
   * 블록 정보 조회
   *
   * @param limit
   * @param offset
   */
  async getBlocks(limit: number, offset: number): Promise<{ data: BlockDto[]; total: number }> {
    const start = offset;
    const end = offset + limit - 1;
    const total = await this.redis.zcard(CACHE_KEY.BLOCK);
    const blocks = await this.redis.zrevrange(CACHE_KEY.BLOCK, start, end);

    const response = blocks.map((block) => JSON.parse(block) as BlockDto);

    return {
      data: response,
      total,
    };
  }

  /**
   * 트랜잭션 정보 조회
   *
   * @param limit
   * @param offset
   * @returns
   */
  async getTransactions(limit: number, offset: number): Promise<{ data: Record<string, unknown>[]; total: number }> {
    const len = await this.redis.llen(CACHE_KEY.TRANSACTION);
    const transactions = await this.redis.lrange(CACHE_KEY.TRANSACTION, offset, offset + limit - 1);

    const response = transactions.map((transaction) => JSON.parse(transaction) as Record<string, unknown>);

    return {
      data: response,
      total: len,
    };
  }
}
