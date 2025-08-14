import { createKeyv, Keyv } from '@keyv/redis';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { CacheableMemory } from 'cacheable';

@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: () => {
        return {
          stores: [
            new Keyv({
              store: new CacheableMemory({ ttl: 6000, lruSize: 5000 }), // ttl= 타임아웃, lruSize= 최대 캐시 크기
            }),
            createKeyv('redis://localhost:6379'),
          ],
        };
      },
    }),
  ],
})
export class RedisCacheModule {}
