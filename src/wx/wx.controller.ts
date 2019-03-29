import { Controller, Query, Get, Post, Body } from '@nestjs/common';
import { WxService } from './wx.service';
import { sendFileToWechatServer } from '../shared/utils/sendFileToWechatServer';
import { sendCustomerMsg } from '../shared/utils/sendCustomerMsg';
import sha1 from '../auth/helper/sha1';

@Controller('wx')
export class WxController {
  private token: string;

  constructor(private readonly wxService: WxService) {
    const { WX_MESSAGE_TOKEN } = process.env;
    this.token = WX_MESSAGE_TOKEN;
  }

  @Get('message')
  async checkSignature(@Query() query: any) {
    const { signature, timestamp, nonce, echostr } = query;
    if (!this.checkSignatureFunction(signature, timestamp, nonce))
      return 'ERR_WHEN_CHECK_SIGNATURE';
    return echostr;
  }

  @Post('message')
  async receiveMsg(
    @Query() query: any,
    @Body()
    msg: {
      MsgType: 'text' | 'image';
      Content: string;
      FromUserName: string;
    },
  ) {
    const { signature, timestamp, nonce } = query;
    if (!this.checkSignatureFunction(signature, timestamp, nonce))
      return 'ERR_WHEN_CHECK_SIGNATURE';

    const { MsgType, Content, FromUserName } = msg;
    console.log('msg', msg);
    if (MsgType === 'text') {
      const content = Content;
      if (content === '2' && FromUserName) {
        this.testSendFiles(FromUserName);
      }
    }

    return 'success';
  }
  async testSendFiles(openId: string) {
    return await this.wxService.sendCustomMedia(openId);
  }

  checkSignatureFunction(signature, timestamp, nonce) {
    const tmpStr = [this.token, timestamp, nonce].sort().join('');
    const sign = sha1(tmpStr);

    return sign === signature;
  }
}
