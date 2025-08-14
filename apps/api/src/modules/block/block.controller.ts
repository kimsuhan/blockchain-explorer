import { BlockService } from '@/modules/block/block.service';
import { Controller, Get, Logger, Query } from '@nestjs/common';

@Controller('block')
export class BlockController {
  private readonly logger = new Logger(BlockController.name);
  constructor(private readonly blockService: BlockService) {}

  @Get()
  async getBlocks(
    @Query('limit') limit: number,
    @Query('offset') offset: number,
  ): Promise<{ data: string[]; total: number }> {
    this.logger.log('[GET] /block');
    return await this.blockService.getBlocks(limit, offset);
  }
}
