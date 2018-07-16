import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from 'app.module';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { ValidationPipe } from 'pipe/validation.pipe';

dotenv.config();
const IS_DEV = process.env.DEPLOY_MODE === 'dev';
async function bootstrap() {
  const httpsOptions = IS_DEV
    ? ''
    : {
        key: fs.readFileSync(path.join(process.cwd(), './key.key')),
        cert: fs.readFileSync(path.join(process.cwd(), './crt.crt')),
      };
  const app = IS_DEV
    ? await NestFactory.create(AppModule)
    : await NestFactory.create(AppModule, { httpsOptions });

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
