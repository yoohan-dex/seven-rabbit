import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { BuyerShowService } from './buyer-show.service';
import { CreateBuyerShowDto, QueryBuyerShowDto } from './buyer-show.dto';

@Controller('buyer-show')
export class BuyerShowController {
  constructor(private readonly buyerShowService: BuyerShowService) {}

  @Get()
  async findAll(@Query() query: QueryBuyerShowDto) {
    return await this.buyerShowService.getList(query);
  }

  @Get('new/8')
  async findNew8() {
    return await this.buyerShowService.getNew8();
  }

  @Post()
  async createOne(@Body() createData: CreateBuyerShowDto) {
    return await this.buyerShowService.saveOne(createData);
  }
}
