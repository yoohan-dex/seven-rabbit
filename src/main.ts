import * as dotenv from 'dotenv';
dotenv.config();
import { NestFactory, Reflector } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { swig } from 'consolidate';
import { AppModule } from './app.module';
import { ValidationPipe } from './shared/pipe/validation.pipe';
import { RolesGuard } from './shared/guard/user.guard';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalGuards(new RolesGuard());
  app.useStaticAssets(__dirname + '/public');
  app.setBaseViewsDir(__dirname + '/public');
  app.engine('html', swig);
  app.setViewEngine('html');
  app.enableCors({ methods: ['post'] });

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
