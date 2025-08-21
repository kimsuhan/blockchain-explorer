import chainConfig from '@/config/chain.config';
import { BlockDto } from '@/modules/viem/dto/block.dto';
import { toNumber } from '@/utils/transform.util';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Block, createPublicClient, http, PublicClient } from 'viem';

@Injectable()
export class ViemService implements OnModuleInit {
  private readonly logger = new Logger(ViemService.name);
  publicClient: PublicClient;

  constructor(
    @Inject(chainConfig.KEY)
    private chainConfigs: ConfigType<typeof chainConfig>,
  ) {}

  /**
   * 모듈 초기화
   */
  onModuleInit() {
    try {
      this.logger.log('┌─────────────────────────────┐');
      this.logger.log('  Viem 세팅 시작');
      this.logger.log(`  RPC_URL: ${this.chainConfigs.rpcUrl}`);

      this.publicClient = createPublicClient({
        chain: {
          id: Number(this.chainConfigs.chainId),
          name: 'Ethereum',
          nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
          blockTime: 10_000,
          rpcUrls: {
            default: {
              http: [this.chainConfigs.rpcUrl as string],
            },
          },
          testnet: true,
        },
        transport: http(this.chainConfigs.rpcUrl),
      });

      this.logger.log('└─────────────────────────────┘');
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * 마지막 블록 번호 조회
   *
   * @returns 마지막 블록 번호
   */
  async getLastBlockNumber(): Promise<number> {
    const blockNumber = await this.publicClient.getBlockNumber();
    return Number(blockNumber);
  }

  /**
   * 블록 정보 조회
   *
   * @param blockNumber
   * @returns
   */
  async getBlock(blockNumber: number): Promise<BlockDto | null> {
    const block: Block = await this.publicClient.getBlock({
      blockNumber: BigInt(blockNumber),
    });

    // const transactions = [];
    if (Array.isArray(block.transactions)) {
      for (const transaction of block.transactions) {
        if (typeof transaction === 'string' && transaction.startsWith('0x')) {
          const receipt = await this.publicClient.getTransactionReceipt({
            hash: transaction,
          });

          console.log(receipt);

          // transactions.push(receipt);
        }
      }

      // try {
      //   console.log(block.transactions.length);
      // } catch (error) {
      //   console.log(error);
      // }

      // console.log(block.transactions.length);
    }

    // console.log(block.transactions.length());

    if (!block) {
      return null;
    }

    return {
      blockNumber: toNumber(block.number),
      baseFeePerGas: toNumber(block.baseFeePerGas),
      blobGasUsed: toNumber(block.blobGasUsed),
      difficulty: toNumber(block.difficulty),
      excessBlobGas: toNumber(block.excessBlobGas),
      extraData: block.extraData,
      gasLimit: toNumber(block.gasLimit),
      gasUsed: toNumber(block.gasUsed),
      hash: String(block.hash),
      logsBloom: String(block.logsBloom),
      miner: block.miner,
      mixHash: block.mixHash,
      nonce: block.nonce,
      number: toNumber(block.number),
      parentBeaconBlockRoot: block.parentBeaconBlockRoot,
      parentHash: block.parentHash,
      receiptsRoot: block.receiptsRoot,
      sealFields: block.sealFields,
      sha3Uncles: block.sha3Uncles,
      size: toNumber(block.size),
      stateRoot: block.stateRoot,
      timestamp: toNumber(block.timestamp),
      totalDifficulty: toNumber(block.totalDifficulty),
      // transactions: block.transactions,
      transactionsRoot: block.transactionsRoot,
      uncles: block.uncles,
      withdrawals: block.withdrawals,
      withdrawalsRoot: block.withdrawalsRoot,
    };
  }
}
