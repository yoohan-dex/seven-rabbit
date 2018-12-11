import { Get, Controller, Render } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('system-manager-486')
  @Render('index')
  root(): string {
    return this.appService.root();
  }
}
