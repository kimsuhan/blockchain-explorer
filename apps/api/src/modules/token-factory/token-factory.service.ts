import { EthersService } from '@/modules/ethers/ethers.service';
import { Injectable, Logger } from '@nestjs/common';
import { ContractEventPayload, ethers, EventLog } from 'ethers';
import { Low } from 'lowdb/lib';
import { JSONFilePreset } from 'lowdb/node';

@Injectable()
export class TokenFactoryService {
  private readonly logger = new Logger(TokenFactoryService.name);
  private db: Low<{
    tokens: {
      name: string;
      symbol: string;
      initialSupply: string;
      address: string;
      txHash: string;
      owner: string;
    }[];
  }>;
  constructor(private readonly etherService: EthersService) {
    this.setupEventListeners();

    const path = `/Users/suhankim/Developer/workspace/suhan/blockchain-explorer/apps/api/src/modules/token-factory/lowdb/tokens.db.json`;

    void JSONFilePreset(path, { tokens: [] }).then((db) => {
      this.db = db;
    });

    void this.init();
  }

  /**
   * 실시간 이벤트 리스너 설정
   */
  setupEventListeners() {
    this.logger.debug('🎧 실시간 이벤트 리스너 설정...');

    void this.etherService.tokenFactoryContract.on(
      'TokenDeployed',
      (name: string, symbol: string, initialSupply: bigint, owner: string, event: ContractEventPayload) => {
        this.logger.log(`TokenDeployed: ${name} ${symbol} ${initialSupply} ${owner}`);
        const supply = ethers.formatEther(initialSupply);

        void this.insertToken(name, symbol, supply, owner, event);
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
  async insertToken(name: string, symbol: string, initialSupply: string, owner: string, event: ContractEventPayload) {
    const transaction = await event.getTransaction();
    const txHash = transaction.hash;
    const address = transaction.to;

    if (address === null) {
      this.logger.error('address is null');
      return;
    }

    if (txHash === null) {
      this.logger.error('txHash is null');
      return;
    }

    this.db.data.tokens.push({
      name,
      symbol,
      initialSupply,
      address,
      txHash,
      owner,
    });

    void this.db.write();
  }

  /**
   * 토큰 목록 조회
   *
   * @returns 토큰 목록
   */
  getTokens(limit: number, offset: number) {
    return {
      data: this.db.data.tokens.slice(offset, offset + limit),
      total: this.db.data.tokens.length,
    };
  }

  /**
   * 토큰 목록 초기화
   */
  async init() {
    const tokenDeployedFilter = this.etherService.tokenFactoryContract.filters.TokenDeployed();
    const tokenDeployedEvents = await this.etherService.tokenFactoryContract.queryFilter(
      tokenDeployedFilter,
      0,
      'latest',
    );

    const currentToken = this.db.data.tokens;

    for (const event of tokenDeployedEvents) {
      if (event instanceof EventLog) {
        const [name, symbol, initialSupply, owner] = event['args'];

        const filteredToken = currentToken.filter((token) => token.symbol === symbol);

        const transaction = await event.getTransaction();
        if (filteredToken.length === 0) {
          this.logger.log(`🔍 새로운 토큰 발견: ${name} ${symbol} ${initialSupply} ${owner}`);
          this.db.data.tokens.push({
            name: name as string,
            symbol: symbol as string,
            initialSupply: ethers.formatEther(initialSupply as bigint),
            owner: owner as string,
            txHash: transaction.hash,
            address: event.address,
          });
        }
      }
    }

    void this.db.write();
  }
}
