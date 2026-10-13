import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });

  app.useGlobalPipes(
    new ValidationPipe({

      transform: true,

      whitelist: true,
    }),
  );

  app.enableCors({
    origin: ['http://localhost:3001', 'https://monitoring.wellington.codes', 'https://projects.wellington.codes'],
  });

  await app.listen(process.env.PORT || 3000);

}
await bootstrap();
