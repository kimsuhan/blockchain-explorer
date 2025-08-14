import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { RedisCacheModule } from '@/modules/cache/redis-cache.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [RedisCacheModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
