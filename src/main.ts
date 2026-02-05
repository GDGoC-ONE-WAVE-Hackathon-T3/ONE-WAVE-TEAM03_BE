import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { nestConfig } from './app.config';
import { swaggerConfig } from './app.swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new HttpExceptionFilter());

  nestConfig(app);
  swaggerConfig(app);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
