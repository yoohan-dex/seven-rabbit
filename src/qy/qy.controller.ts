import { Controller, Get, Param, Query } from '@nestjs/common';
import { QyService } from './qy.service';

@Controller('qy')
export class QyController {
  constructor(private readonly qyService: QyService) {}
  @Get('accessToken')
  async getAccessToken() {
    try {
      const res = await this.qyService.getAccessToken();
      console.log('res', res);
      return res;
    } catch (err) {
      console.log(err);
      return 'nothing';
    }
  }

  @Get('signature')
  async getSignature(@Query('url') url: string) {
    return this.qyService.getSignature(url);
  }

  @Get('ex-tags')
  async getExTags(@Query() p: object, @Query('groupName') groupName: string) {
    console.log('pdd', p);
    console.log(groupName);
    return this.qyService.getExTags(groupName);
  }

  @Get('contact')
  async getContact() {
    return this.qyService.getUser();
  }

  @Get('customer')
  async getCustomer() {
    return this.qyService.getCustomer();
  }
}
