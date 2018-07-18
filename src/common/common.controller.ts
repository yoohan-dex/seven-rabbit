import {
  Controller,
  Post,
  Options,
  UseInterceptors,
  FileInterceptor,
  UploadedFile,
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
    const res = await this.commonService.save(savedFile);
    return res;
  }
}
