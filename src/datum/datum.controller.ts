import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { User } from '../shared/decorators/user';
import { SimpleDataDto, SimpleQuery } from './datum.dto';
import { DatumService } from './datum.service';
import { Roles } from '../shared/decorators/roles';

@Controller('datum')
export class DatumController {
  constructor(private readonly datumService: DatumService) {}
  @Get('hot/products')
  @Roles('admin', 'primary', 'service')
  async getProducts(@Query() query: SimpleQuery) {
    return await this.datumService.getProducts(query);
  }

  @Get('hot/product/:id')
  @Roles('admin', 'primary', 'service')
  async getProductDetail(@Param('id') productId: number, @Query() query: any) {
    return await this.datumService.getProduct(productId, query);
  }

  @Get('topic/data')
  async getTopicData(
    @Query('userId') userId: number,
    @Query('topicId') topicId: number,
  ) {
    return await this.datumService.getTopicData({
      userId,
      topicId,
    });
  }

  @Get('user/:id')
  @Roles('admin', 'primary', 'service')
  async getUserDatum(@Param('id') userId: number) {
    return await this.datumService.getUserDatum(userId);
  }
  @Post('simple')
  async setSimpleData(@User() user: any, @Body() data: any) {
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
  @Post('simple/stay')
  async setSimpleStay(
    @User() user: any,
    @Body() data: { stayTime: number; dataId: number },
  ) {
    return await this.datumService.setDataStay(
      user,
      data.dataId,
      data.stayTime,
    );
  }
}
