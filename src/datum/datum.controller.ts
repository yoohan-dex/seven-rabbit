import { Controller, Get, Post, Body } from '@nestjs/common';
import { User } from '../shared/decorators/user';
import { SimpleDataDto } from './datum.dto';
import { DatumService } from './datum.service';

@Controller('datum')
export class DatumController {
  constructor(private readonly datumService: DatumService) {}
  @Get('hot/products')
  async getProducts(@User() user: any) {
    return await this.datumService.getProducts();
  }
  @Post('simple')
  async setSimpleData(@User() user: any, @Body() data: any) {
    console.log('simple-data', data);
    return await this.datumService.setData(
      user,
      data.productId,
      data.type,
      data.followUserId,
    );
  }
}
