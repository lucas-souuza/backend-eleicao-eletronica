import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { configurarSwagger } from './common/swagger/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('/v1/api');

  // Documentação da API em http://localhost:3000/docs
  configurarSwagger(app);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
