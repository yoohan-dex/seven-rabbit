import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { User } from '../shared/decorators/user';
import { SimpleDataDto, SimpleQuery } from './datum.dto';
import { DatumService } from './datum.service';

@Controller('datum')
export class DatumController {
  constructor(private readonly datumService: DatumService) {}
  @Get('hot/products')
  async getProducts(@User() user: any, @Query() query: SimpleQuery) {
    return await this.datumService.getProducts(query);
  }
  @Post('simple')
  async setSimpleData(@User() user: any, @Body() data: any) {
    console.log('simple-data', data);
    let followUserId;
    if (typeof data.followUserId === 'object') {
      followUserId = data.followUserId.data;
    } else {
      followUserId = data.followUserId;
    }
    return await this.datumService.setData(
      user,
      data.productId,
      data.type,
      data.followUserId,
    );
  }
}
