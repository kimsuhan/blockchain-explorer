import { BlockSchedule } from '@/modules/block/block.schedule';
import { Module } from '@nestjs/common';
import { BlockController } from './block.controller';
import { BlockService } from './block.service';

@Module({
  controllers: [BlockController],
  providers: [BlockService, BlockSchedule],
})
export class BlockModule {}
