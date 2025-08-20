import { BlockGateway } from '@/modules/block/block.gateway';
import { BlockSchedule } from '@/modules/block/block.schedule';
import { ViemModule } from '@/modules/viem/viem.module';
import { Module } from '@nestjs/common';
import { BlockController } from './block.controller';
import { BlockService } from './block.service';

@Module({
  imports: [ViemModule],
  controllers: [BlockController],
  providers: [BlockService, BlockSchedule, BlockGateway],
})
export class BlockModule {}
