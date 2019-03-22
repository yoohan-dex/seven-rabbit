import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { User } from '../shared/decorators/user';
import { SimpleDataDto, SimpleQuery } from './datum.dto';
import { DatumService } from './datum.service';
import { Roles } from '../shared/decorators/roles';

@Controller('datum')
export class DatumController {
  constructor(private readonly datumService: DatumService) {}
  @Get('hot/products')
  @Roles('admin')
  async getProducts(@Query() query: SimpleQuery) {
    return await this.datumService.getProducts(query);
  }

  @Get('hot/product/:id')
  @Roles('admin')
  async getProductDetail(@Param('id') productId: number, @Query() query: any) {
    return await this.datumService.getProduct(productId, query);
  }
  @Get('user/:id')
  @Roles('admin')
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
}
