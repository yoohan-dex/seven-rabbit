import { Get, Controller, Render } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get('back-admin')
  @Render('back-admin/index')
<<<<<<< HEAD
  root() {}
=======
  root() { }
>>>>>>> ba195c15e473a8e2f31b8a8cf287d6e7d70d8c40

  @Get('super-word-generator')
  @Render('bundle')
  wordGenerator() { }
}
