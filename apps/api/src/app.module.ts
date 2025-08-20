import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { BlockModule } from '@/modules/block/block.module';
import { RedisCacheModule } from '@/modules/cache/redis-cache.module';
import { EthersModule } from '@/modules/ethers/ethers.module';
import { TokenFactoryModule } from '@/modules/token-factory/token-factory.module';
import { ViemModule } from '@/modules/viem/viem.module';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [RedisCacheModule, BlockModule, EthersModule, ScheduleModule.forRoot(), TokenFactoryModule, ViemModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
