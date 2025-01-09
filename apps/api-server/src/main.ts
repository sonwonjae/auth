import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';

import { AppModule } from './app.module';

async function bootstrap() {
  if (!process.env.PORT) {
    throw new Error('환경변수에 PORT를 설정해주세요.');
  }

  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [process.env.HOST as string],
    credentials: true,
  });

  app.use(cookieParser());
  // 모든 경로가 /api/user로 시작하도록 설정
  app.setGlobalPrefix('api/user');

  await app.listen(process.env.PORT ?? 5555);
}
bootstrap();
