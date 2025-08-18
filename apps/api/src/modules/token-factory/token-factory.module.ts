import { TokenFactoryController } from '@/modules/token-factory/token-factory.controller';
import { Module } from '@nestjs/common';
import { TokenFactoryService } from './token-factory.service';

@Module({
  providers: [TokenFactoryService],
  exports: [TokenFactoryService],
  controllers: [TokenFactoryController],
})
export class TokenFactoryModule {}
