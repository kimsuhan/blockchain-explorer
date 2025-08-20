import { BlockService } from '@/modules/block/block.service';
import { Controller, Get, Logger, Param, Query } from '@nestjs/common';
import { Block } from 'ethers';

@Controller('block')
export class BlockController {
  private readonly logger = new Logger(BlockController.name);
  constructor(private readonly blockService: BlockService) {}

  @Get()
  async getBlocks(
    @Query('limit') limit: number,
    @Query('offset') offset: number,
  ): Promise<{ data: Record<string, unknown>[]; total: number }> {
    this.logger.log(`[GET] /block?limit=${limit}&offset=${offset}`);
    return await this.blockService.getBlocks(Number(limit), Number(offset));
  }

  @Get('block/:blockNumber')
  async getBlock(@Param('blockNumber') blockNumber: number): Promise<Block | null> {
    this.logger.log(`[GET] /block/:blockNumber?blockNumber=${blockNumber}`);
    return await this.blockService.getBlock(Number(blockNumber));
  }

  @Get('redis/:blockNumber')
  async getRedisBlock(@Param('blockNumber') blockNumber: number): Promise<Record<string, unknown> | null> {
    this.logger.log(`[GET] /block/redis/:blockNumber?blockNumber=${blockNumber}`);
    return await this.blockService.getBlock(Number(blockNumber));
  }

  @Get('transactions')
  async getTransactions(
    @Query('limit') limit: number,
    @Query('offset') offset: number,
  ): Promise<{ data: Record<string, unknown>[]; total: number }> {
    this.logger.log(`[GET] /block/transaction?limit=${limit}&offset=${offset}`);
    return await this.blockService.getTransactions(limit, offset);
  }
}
