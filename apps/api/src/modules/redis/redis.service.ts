import redisConfig from '@/config/redis.config';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
  private readonly logger = new Logger(RedisService.name);
  private redis: Redis;

  constructor(
    @Inject(redisConfig.KEY)
    private redisConfigs: ConfigType<typeof redisConfig>,
  ) {}

  /**
   * 모듈 초기화
   */
  async onModuleInit() {
    const redisHost = this.redisConfigs.host;
    const redisPort = this.redisConfigs.port;

    try {
      this.logger.log('┌─────────────────────────────┐');
      this.logger.log('  Redis 세팅 시작');
      this.logger.log(`  REDIS_HOST: ${redisHost}`);
      this.logger.log(`  REDIS_PORT: ${redisPort}`);

      this.redis = new Redis({
        host: redisHost,
        port: redisPort,
      });

      await new Promise((resolve) => {
        this.redis.on('ready', () => {
          resolve(true);
          this.logger.log('  Redis 준비 완료');
        });

        this.redis.on('error', (error) => {
          this.logger.error('Redis Error', error);
        });
      });

      this.logger.log('└─────────────────────────────┘');
    } catch (error) {
      this.logger.error(error);
    }
  }

  /**
   * Redis 연결 상태 확인
   *
   * @returns Redis 연결 상태
   */
  isReady(): boolean {
    return this.redis.status === 'ready';
  }
}
