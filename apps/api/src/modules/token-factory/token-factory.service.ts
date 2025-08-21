import { TOKEN_FACTORY_ABI, TOKEN_FACTORY_ADDRESS } from '@/modules/ethers/consts/token-factory.const';
import { EthersService } from '@/modules/ethers/ethers.service';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { ViemService } from '@/modules/viem/viem.service';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ContractEventPayload } from 'ethers';

@Injectable()
export class TokenFactoryService implements OnModuleInit {
  private readonly logger = new Logger(TokenFactoryService.name);

  async onModuleInit(): Promise<void> {
    void this.setupEventListeners();

    await this.init();
  }

  constructor(
    private readonly etherService: EthersService,
    private readonly viemService: ViemService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * 실시간 이벤트 리스너 설정
   */
  setupEventListeners() {
    this.logger.debug('🎧 실시간 이벤트 리스너 설정...');

    void this.etherService.tokenFactoryContract.on(
      'TokenDeployed',
      (name: string, symbol: string, initialSupply: bigint, owner: string, event: ContractEventPayload) => {
        this.logger.log(`TokenDeployed: ${name} ${symbol} ${initialSupply} ${owner}`);
        // const supply = ethers.formatEther(initialSupply);

        // void this.insertToken(name, symbol, initialSupply, owner, event);
      },
    );
  }

  /**
   * 토큰 정보 삽입
   *
   * @param name 토큰 이름
   * @param symbol 토큰 심볼
   * @param initialSupply 토큰 초기 공급량
   * @param owner 토큰 소유자
   * @param event 이벤트 정보
   */
  async insertToken(name: string, symbol: string, initialSupply: string, tokenAddress: `0x${string}`) {
    await this.prisma.token.upsert({
      where: { address: tokenAddress },
      update: { name, symbol },
      create: { address: tokenAddress, name, symbol, decimals: 18, totalSupply: initialSupply },
    });
  }

  /**
   * 토큰 목록 조회
   *
   * @returns 토큰 목록
   */
  getTokens(limit: number, offset: number) {
    return this.prisma.token.findMany({});
    // return {
    //   data: this.db.data.tokens.slice(offset, offset + limit),
    //   total: this.db.data.tokens.length,
    // };
  }

  /**
   * 토큰 목록 초기화
   */
  async init() {
    const events = await this.viemService.publicClient.getContractEvents({
      address: TOKEN_FACTORY_ADDRESS,
      eventName: 'TokenDeployed',
      abi: TOKEN_FACTORY_ABI,
      toBlock: 'latest',
      fromBlock: 0n,
    });

    for (const event of events) {
      const args = event['args'] as { name: string; symbol: string; initialSupply: bigint; owner: string };

      const data = await this.viemService.publicClient.readContract({
        address: TOKEN_FACTORY_ADDRESS,
        abi: TOKEN_FACTORY_ABI,
        functionName: 'tokenAddresses',
        args: [args.symbol],
      });

      const findToken = await this.prisma.token.count({ where: { address: data as `0x${string}` } });

      console.log(findToken);

      // const transaction = await event.getTransaction();
      if (findToken === 0) {
        this.logger.log(`🔍 새로운 토큰 발견: ${args.name} ${args.symbol} ${args.initialSupply} ${args.owner}`);
        await this.insertToken(args.name, args.symbol, String(args.initialSupply), data as `0x${string}`);
      }
    }
  }
}
