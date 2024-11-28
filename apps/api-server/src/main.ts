import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  if (!process.env.PORT) {
    throw new Error('환경변수에 PORT를 설정해주세요.');
  }
  await app.listen(process.env.PORT ?? 5555);
}
bootstrap();
