import { BlockService } from '@/modules/block/block.service';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class BlockSchedule {
  constructor(private readonly blockService: BlockService) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  async handle() {
    let isCall = true;
    if (!isCall) {
      return;
    }

    await this.blockService.initBlock();
    isCall = false;
  }
}
