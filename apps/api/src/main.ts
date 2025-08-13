import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import { resolve } from 'path';

// 루트 .env 파일 로드
config({ path: resolve(__dirname, '../../../.env') });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS 활성화 (프론트엔드와 통신을 위해)
  app.enableCors();
  
  const port = process.env.API_PORT || process.env.PORT || 4000;
  await app.listen(port);
  
  console.log(`🚀 API Server running on http://localhost:${port}`);
}
bootstrap();
