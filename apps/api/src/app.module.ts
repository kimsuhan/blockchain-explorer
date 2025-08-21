import chainConfig from '@/config/chain.config';
import redisConfig from '@/config/redis.config';
import { PrismaModule } from '@/modules/prisma/prisma.module';
import { RedisModule } from '@/modules/redis/redis.module';
import { ViemModule } from '@/modules/viem/viem.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../../../.env'],
      load: [redisConfig, chainConfig],
    }), // Config Module

    RedisModule, // Redis Module
    PrismaModule, // Prisma Module
    ViemModule, // Viem Module

    // BlockModule,
    // EthersModule,
    // ScheduleModule.forRoot(),
    // TokenFactoryModule,
  ],
})
export class AppModule {}
