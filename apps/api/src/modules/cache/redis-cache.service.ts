import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisCacheService extends Redis {
  constructor() {
    super({
      host: 'localhost', // TODO: env 설정
      port: 6379, // TODO: env 설정
    });
  }
}
