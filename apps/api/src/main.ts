import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { config } from 'dotenv';
import { resolve } from 'path';
import { AppModule } from './app.module';

// 루트 .env 파일 로드 (Docker와 로컬 환경 모두 지원)
const envPaths = [
  resolve(__dirname, '../../../.env'), // 로컬 개발환경
  resolve(process.cwd(), '.env'), // Docker 루트 경로
  '/app/.env', // Docker 절대 경로
];

for (const envPath of envPaths) {
  try {
    const result = config({ path: envPath });
    if (result.parsed) {
      console.log(`✅ Environment loaded from: ${envPath}`);
      break;
    }
  } catch (error) {
    console.error(error);
    // 파일이 없으면 다음 경로 시도
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS 활성화 (프론트엔드와 통신을 위해)
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Cats example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('cats')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  // 환경변수 디버깅 로그
  console.log('🔍 Environment Variables:');
  console.log(`  API_PORT: ${process.env.API_PORT}`);
  console.log(`  RPC_URL: ${process.env.RPC_URL}`);
  console.log(`  CHAIN_ID: ${process.env.CHAIN_ID}`);
  console.log(
    `  DEFAULT_ACCOUNTS: ${process.env.DEFAULT_ACCOUNTS ? '설정됨' : '없음'}`,
  );
  console.log(`  NODE_ENV: ${process.env.NODE_ENV}`);

  const port = process.env.API_PORT || process.env.PORT || 4000;
  await app.listen(port);

  console.log(`🚀 API Server running on http://localhost:${port}`);
}

void bootstrap();
