import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  /**
   * 모듈 초기화
   */
  async onModuleInit(): Promise<void> {
    try {
      this.logger.log('┌─────────────────────────────┐');
      this.logger.log('  Prisma 세팅 시작');
      this.logger.log(`  DATABASE_URL: ${process.env.DATABASE_URL}`); // 프리즈마는 DATABASE_URL 환경변수를 사용함

      await this.$connect();

      this.logger.log('└─────────────────────────────┘');
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * Prisma 연결 상태 확인
   *
   * @returns Prisma 연결 상태
   */
  async isReady(): Promise<boolean> {
    return this.$connect()
      .then(() => true)
      .catch(() => false);
  }
}
