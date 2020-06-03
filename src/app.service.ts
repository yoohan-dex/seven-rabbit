import { Injectable } from '@nestjs/common';

// import { QyWeChat } from 'tnwx';

@Injectable()
export class AppService {
  root(): string {
    return 'Hello World!';
  }
}
