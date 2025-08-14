import { BlockService } from '@/modules/block/block.service';
import { Controller, Get, Query } from '@nestjs/common';

@Controller('block')
export class BlockController {
  constructor(private readonly blockService: BlockService) {}

  @Get()
  async getBlocks(@Query('limit') limit: number, @Query('offset') offset: number): Promise<string[]> {
    return await this.blockService.getBlocks(limit, offset);
  }
}
