import { Controller, Get, Post, Body } from '@nestjs/common';
import { User } from '../shared/decorators/user';
import { SimpleDataDto } from './datum.dto';
import { DatumService } from './datum.service';

@Controller('datum')
export class DatumController {
  constructor(private readonly datumService: DatumService) {}
  @Post('simple')
  getSimpleData(@User() user: any, @Body() data: SimpleDataDto) {
    return this.datumService.setData(
      user,
      data.followUserId,
      data.productId,
      data.type,
    );
  }
}
