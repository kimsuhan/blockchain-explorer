import { BlockService } from '@/modules/block/block.service';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class BlockSchedule {
  constructor(private readonly blockService: BlockService) {}

  @Cron(CronExpression.EVERY_SECOND)
  handle() {
    const initOn = this.blockService.initOn;
    if (!initOn) {
      return;
    }

    void this.blockService.initBlock();
  }
}
