import { TokenFactoryController } from '@/modules/token-factory/token-factory.controller';
import { ViemModule } from '@/modules/viem/viem.module';
import { Module } from '@nestjs/common';
import { TokenFactoryService } from './token-factory.service';

@Module({
  imports: [ViemModule],
  providers: [TokenFactoryService],
  exports: [TokenFactoryService],
  controllers: [TokenFactoryController],
})
export class TokenFactoryModule {}
