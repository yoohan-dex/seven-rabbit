import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  HttpException,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CommonService } from '../common/common.service';
import {
  CreateOrderDto,
  ChangeCostDto,
  SearchQuery,
  TimeQuery,
  SetReasonDto,
} from './order.dto';
import { User } from '../shared/decorators/user';
import { Roles } from '../shared/decorators/roles';
import { WxUserDto } from '../auth/auth.dto';

@Controller('order')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly commonService: CommonService,
  ) {}

  @Post('create')
  async createOne(@Body() createOrder: CreateOrderDto) {
    const images = await this.commonService.findByIds(createOrder.imageIds);
    if (!images || images.length !== createOrder.imageIds.length) {
      return new Error('图片有错');
    }

    const order = await this.orderService.createOne(createOrder, images);
    return order;
  }

  @Get()
  @Roles('admin')
  async getAll(@User() user: WxUserDto) {
    return await this.orderService.findAll();
  }

  @Get('step/next')
  async nextStep(@Query('id') orderId: number) {
    const order = await this.orderService.nextStep(orderId);
    return order;
  }

  @Get('step/back')
  async backStep(@Query('id') orderId: number) {
    const order = await this.orderService.backStep(orderId);
    return order;
  }

  @Post('express/commit')
  async commitExpress(
    @Body('id') orderId: number,
    @Body('expressType') expressType: '顺丰' | '韵达' | '德邦',
    @Body('expressNum') expressNum: string,
  ) {
    return await this.orderService.setExpress(orderId, expressType, expressNum);
  }

  @Post('payment/status')
  async setPaymentStatus(
    @Body('orderId') orderId: number,
    @Body('status') status: 0 | 1 | 2,
  ) {
    return await this.orderService.setPaymentStatus(orderId, status);
  }

  @Get('issue-reason')
  async getIssueReason() {
    return await this.orderService.getIssueReason();
  }

  @Post('issue-controll')
  async setIssueReason(@Body() setReasonDto: SetReasonDto) {
    return await this.orderService.setIssueReason(
      setReasonDto.id,
      setReasonDto.reason,
      setReasonDto.reasonId,
    );
  }

  @Get('finish')
  async finishOrder(@Query('id') id: number) {
    return await this.orderService.finishOrder(id);
  }

  @Get('all-by-phone')
  async getAllByUser(@User() user: WxUserDto) {
    if (!user.phone || user.phone.length === 0) {
      throw new HttpException('还没绑定手机呢', 420);
    }
    return this.orderService.findAllByPhone(user.phone[0]);
  }

  @Get('/one-by-phone')
  async getOneByPhone(@Query('phone') phone: string) {
    return await this.orderService.findOneByPhone(phone);
  }

  @Post('/cost')
  async changeCost(@Body() obj: ChangeCostDto) {
    return await this.orderService.changeCost(obj);
  }

  @Get('/express/check')
  async checkExpress(@Query('id') id: number) {
    return await this.orderService.checkExpress(id);
  }

  @Get('/search')
  @Roles('admin')
  async searchOrders(@Query() query: SearchQuery) {
    return await this.orderService.search(query);
  }

  @Get('/find-by-time')
  async findByTime(@Query() query: TimeQuery) {
    return await this.orderService.findByTime(query);
  }

  @Get('/one-by-id')
  async getOneById(@Query('id') id: number) {
    const order = await this.orderService.findOneById(id);
    // const matchPhone = user.phone && user.phone.includes(order.clientPhone);
    // const matchRole = user.roles.includes('admin');
    // if (matchRole) {
    return order;
    // }
  }
}
