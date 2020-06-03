import { Get, Controller, Render } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('back-admin')
  @Render('bundle')
  root() {}

  @Get('super-word-generator')
  @Render('bundle')
  wordGenerator() {}
}
