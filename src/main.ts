import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';
import * as path from 'path';
import { ValidationPipe } from 'pipe/validation.pipe';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const httpsOptions = {
    key: fs.readFileSync(path.join(__dirname, './secrets/key.key')),
    cert: fs.readFileSync(path.join(__dirname, './secrets/crt.crt')),
  };
  // const app = await NestFactory.create(AppModule, { httpsOptions });
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

  await app.listen(80);
}
bootstrap();
