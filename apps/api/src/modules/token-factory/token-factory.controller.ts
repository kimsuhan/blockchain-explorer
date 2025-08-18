import { Controller, Get, Query } from '@nestjs/common';
import { TokenFactoryService } from './token-factory.service';

@Controller('token-factory')
export class TokenFactoryController {
  constructor(private readonly tokenFactoryService: TokenFactoryService) {}

  @Get('tokens')
  getTokens(@Query('limit') limit: number, @Query('offset') offset: number) {
    return this.tokenFactoryService.getTokens(limit, offset);
  }
}
