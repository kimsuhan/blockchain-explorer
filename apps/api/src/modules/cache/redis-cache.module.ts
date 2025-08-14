import { RedisCacheService } from '@/modules/cache/redis-cache.service';
import { createKeyv, Keyv } from '@keyv/redis';
import { CacheModule } from '@nestjs/cache-manager';
import { Global, Module } from '@nestjs/common';
import { CacheableMemory } from 'cacheable';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
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
  providers: [RedisCacheService],
  exports: [RedisCacheService],
})
export class RedisCacheModule {}
