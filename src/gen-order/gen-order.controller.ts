import { Controller, Post, Body, Get, Res, Query } from '@nestjs/common';
import { GenOrderService } from './gen-order.service';
import { Response } from 'express';
import { GenOrderDto } from './gen-order.dto';

@Controller('gen-order')
export class GenOrderController {
  constructor(private readonly genOrderService: GenOrderService) {}
  @Post()
  async gen(@Body() msg: GenOrderDto) {
    return await this.genOrderService.genOrder(
      msg.message,
      msg.preview,
      msg.neckTagType,
      msg.neckTag,
    );
  }
  @Get('word')
  async genWord(
    @Query('url') url: string,
    @Query('filename') filename: string,
    @Res() res: Response,
  ) {
    res.download(url, filename);
  }

  @Get('information')
  async getInformation(@Query() query: { material: string[]; color: string }) {
    return await this.genOrderService.getInfo(query.material, query.color);
  }
}
