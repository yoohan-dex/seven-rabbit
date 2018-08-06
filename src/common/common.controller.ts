import {
  Controller,
  Post,
  Options,
  UseInterceptors,
  FileInterceptor,
  UploadedFile,
  Get,
} from '@nestjs/common';
import { CommonService } from './common.service';
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
    const savedFile = await this.commonService.saveInCloud(file);
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
        console.log('start?');
        const afterZipUrl = await this.commonService.zip(image.url);
        return await this.commonService.updateUrl(image, afterZipUrl);
      };
    });
    console.log('ops', ops.length);
    return await Promise.all(ops.map(op => op()));
  }
}
