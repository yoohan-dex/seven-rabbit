import { Get, Controller, Render } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('system-manager-486')
export class AppController {
  constructor(private readonly appService: AppService) {}

  // @Get('admin')
  // @Render('index')
  // root(): string {
  //   return this.appService.root();
  // }
}
