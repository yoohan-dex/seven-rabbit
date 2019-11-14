import {
  Controller,
  Post,
  Body,
  Get,
  Res,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
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
      msg.overWrite,
      msg.neckTag,
    );
  }
  @Get('word')
  async genWord(
    @Query('url') url: string,
    @Query('filename') filename: string,
    @Res() res: Response,
  ) {
    res.download(url, filename.replace('==', '#'));
  }
  @Get('info-by-order')
  async getInfoByOrder(@Query() query: { orders: string[]; color: string }) {
    return await this.genOrderService.getInfoByOrder(query.orders, query.color);
  }
  @Get('information')
  async getInformation(@Query()
  query: {
    material: string[];
    color: string;
    pattern: string[];
    except: string[];
  }) {
    return await this.genOrderService.getInfo(
      query.material,
      query.pattern,
      query.color,
      query.except,
    );
  }

  @Get('sheet')
  async GetSheet(@Query('time') time: string[], @Query('jwt') jwt: string) {
    const { ORDER_GET_JWT } = process.env;

    if (jwt !== ORDER_GET_JWT)
      throw new UnauthorizedException('权限问题', '你没有访问的权限');
    const url = await this.genOrderService.sheet(time);
    return { url };
  }

  @Get('download-sheet')
  async downloadSheet(@Query('url') url, @Res() res: Response) {
    res.download(url, '手机后4位.xlsx');
  }

  @Get('price-sheet')
  async GetPriceSheet(
    @Query('time') time: string[],
    @Query('jwt') jwt: string,
  ) {
    const { ORDER_GET_JWT } = process.env;

    if (jwt !== ORDER_GET_JWT)
      throw new UnauthorizedException('权限问题', '你没有访问的权限');
    const url = await this.genOrderService.priceSheet(time);
    return { url };
  }

  @Get('download-price-sheet')
  async downloadPriceSheet(@Query('url') url, @Res() res: Response) {
    res.download(url, '价格表.xlsx');
  }
}
