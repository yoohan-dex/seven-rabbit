import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { ValidationPipe } from './pipe/validation.pipe';

dotenv.config();
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  app.useStaticAssets(__dirname + '/public');
  app.setBaseViewsDir(__dirname + '/public');
  app.setViewEngine('html');
  app.enableCors();

  const options = new DocumentBuilder()
    .setTitle('seven rabbit server')
    .setDescription('The API of seven rabbit server')
    .setVersion('1.0')
    .addTag('server')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('/api', app, document);

  await app.listen(3000);
}
bootstrap();
