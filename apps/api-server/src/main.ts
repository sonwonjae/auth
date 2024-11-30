import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      process.env.WEB_SERVER_HOST as string,
      process.env.API_SERVER_HOST as string,
    ],
    credentials: true,
  });
  if (!process.env.PORT) {
    throw new Error('환경변수에 PORT를 설정해주세요.');
  }

  app.use(cookieParser());

  await app.listen(process.env.PORT ?? 5555);
}
bootstrap();
