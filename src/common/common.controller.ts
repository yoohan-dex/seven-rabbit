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
import * as qcloud from 'wafer-node-sdk';
import { CommonService } from './common.service';
import { ImageFile } from './common.type';
import { sendCustomerMsg } from '../shared/utils/sendCustomerMsg';
@Controller('common')
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

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

  @Post('msg')
  async postCustomerMsg(@Body() msg: any) {
    console.log('msg', msg);
    return '';
  }

  @Get('message')
  async checkSignature(@Query() query: any) {
    const { signature, timestamp, nonce, echostr } = query;
    if (!qcloud.message.checkSignature(signature, timestamp, nonce))
      return 'ERR_WHEN_CHECK_SIGNATURE';
    return echostr;
  }

  @Post('message')
  async receiveMsg(@Query() query: any) {
    const { signature, timestamp, nonce } = query;
    if (!qcloud.message.checkSignature(signature, timestamp, nonce))
      return 'ERR_WHEN_CHECK_SIGNATURE';
    return 'success';
  }

  @Get('test')
  async testSendCustomerMsg(
    @Query('openId') openId: string,
    @Query('content') content: string,
  ) {
    return sendCustomerMsg({
      content: 'sdfdsfsd',
      openId: 'oDeiG5Eqdh0FoCSUKerwRIoqQNvY',
      type: 'text',
    });
  }
}
