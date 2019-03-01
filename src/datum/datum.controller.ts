import { Controller, Get, Post, Body } from '@nestjs/common';
import { User } from '../shared/decorators/user';
import { SimpleDataDto } from './datum.dto';
import { DatumService } from './datum.service';

@Controller('datum')
export class DatumController {
  constructor(private readonly datumService: DatumService) {}
  @Get('scan/products')
  async getProducts(@User() user: any) {
    return await this.datumService.getProducts();
  }
  @Post('simple')
  async getSimpleData(@User() user: any, @Body() data: SimpleDataDto) {
    return await this.datumService.setData(
      user,
      data.followUserId,
      data.productId,
      data.type,
    );
  }
}
