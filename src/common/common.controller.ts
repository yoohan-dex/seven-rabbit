import {
  Controller,
  Post,
  Options,
  UseInterceptors,
  FileInterceptor,
  UploadedFile,
  Get,
  Render,
} from '@nestjs/common';
import { CommonService } from './common.service';
import { ImageFile } from './common.type';
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
    console.log('res', res);
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
}
