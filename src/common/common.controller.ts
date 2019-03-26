import {
  Controller,
  Post,
  UseInterceptors,
  FileInterceptor,
  UploadedFile,
  Get,
  Query,
  Body,
} from '@nestjs/common';
import { CommonService } from './common.service';
import { ImageFile } from './common.type';
import { sendCustomerMsg } from '../shared/utils/sendCustomerMsg';
import sha1 from '../auth/helper/sha1';
@Controller('common')
export class CommonController {
  private token: string;
  constructor(private readonly commonService: CommonService) {
    const { WX_MESSAGE_TOKEN } = process.env;
    this.token = WX_MESSAGE_TOKEN;
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      dest: '/tmp/uploads/',
    }),
  )
  async uploadFile(@UploadedFile() file) {
    if (!file) return null;
    const savedFile = (await this.commonService.saveInCloud(file)) as ImageFile;
    const [_, res] = await Promise.all([
      this.commonService.zip(savedFile.imgUrl),
      this.commonService.save(savedFile),
    ]);
    return res;
  }

  @Get('zip/toggle')
  async zipFile() {
    const images = await this.commonService.findAll();
    const ops = images.map(image => {
      return async () => {
        const afterZipUrl = await this.commonService.zip(image.url);
        const newUrl = afterZipUrl.replace(
          'picgz.myqcloud.com',
          'image.myqcloud.com',
        );
        return await this.commonService.updateUrl(image, newUrl);
      };
    });
    return await Promise.all(ops.map(op => op()));
  }

  @Get('forFixedUrl')
  async fixedUrl() {
    const images = await this.commonService.findAll();
    const ops = images.map(image => {
      return async () => {
        const newUrl = `${image.url}!zip`;
        return await this.commonService.updateUrl(image, newUrl);
      };
    });
    return await Promise.all(ops.map(op => op()));
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

    const { MsgType, Content } = msg;
    if (MsgType === 'text') {
      const content = Content;
      if (content === '2') {
        this.testSendCustomerMsg();
      }
    }

    return 'success';
  }

  async testSendCustomerMsg() {
    return sendCustomerMsg({
      content: 'sdfdsfsd',
      openId: 'oDeiG5Eqdh0FoCSUKerwRIoqQNvY',
      type: 'text',
    });
  }
  checkSignatureFunction(signature, timestamp, nonce) {
    const tmpStr = [this.token, timestamp, nonce].sort().join('');
    const sign = sha1(tmpStr);

    return sign === signature;
  }
}
