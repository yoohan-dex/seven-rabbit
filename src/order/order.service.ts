import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { Repository, Like, IsNull } from 'typeorm';
import {
  CreateOrderDto,
  SearchQuery,
  TimeQuery,
  ChangeCostDto,
} from './order.dto';
import { Image } from '../common/common.entity';
import { Content } from './content.entity';
import { log } from 'console';
import { queryOrder } from './lib/express';
import { IssueReason } from './issueReson.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Content)
    private readonly contentRepository: Repository<Content>,
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
    @InjectRepository(IssueReason)
    private readonly issueReasonRepository: Repository<IssueReason>,
  ) {}

  async findAll() {
    const orders = await this.orderRepository.find();
    return orders;
  }

  async findAllByPhone(phone: string) {
    const orders = await this.orderRepository.find({
      where: { clientPhone: phone },
      order: { id: 'DESC' },
    });
    // const imageIds = orders.map(order => order.imageId);
    // const image = await this.imageRepository.findByIds(imageIds);
    // return orders.map((order, idx) => ({
    //   ...order,
    //   image: image.find(i => i.id === order.imageId),
    // }));
    return orders;
  }
  async findOneById(id: number) {
    const order = await this.orderRepository.findOne(id);
    return order;
  }
  async findOneByPhone(phone: string) {
    return await this.orderRepository.findOne({ clientPhone: phone });
  }
  async nextStep(orderId: number) {
    const order = await this.orderRepository.findOne(orderId);
    if (order.progress < 10) {
      order.progress += 1;
    }
    if (order.progress === 10) {
      order.status = 2;
    }
    return await this.orderRepository.save(order);
  }

  async backStep(orderId: number) {
    const order = await this.orderRepository.findOne(orderId);
    if (order.progress > 0) {
      order.progress -= 1;
    }
    return await this.orderRepository.save(order);
  }

  async changeCost(dto: ChangeCostDto) {
    const order = await this.orderRepository.findOne(dto.id);
    order.adultNum = dto.adultNum;
    order.adultCost = dto.adultCost;
    order.childNum = dto.childNum;
    order.childCost = dto.childCost;
    log('test', order);
    return await this.orderRepository.save(order);
  }

  async search(query: SearchQuery) {
    let where = {};
    let timeQuery = '';
    const {
      clientName,
      clientCompany,
      clientPhone,
      status,
      time,
      noCost,
      seller,
      orderNum,
      paymentStatus,
    } = query;
    if (seller) {
      where = { ...where, seller };
    }
    if (orderNum) {
      where = { ...where, orderNum };
    }
    if (clientName) {
      where = { ...where, clientName };
    }
    if (clientCompany) {
      where = { ...where, clientCompany: Like(`%${clientCompany}%`) };
    }
    if (clientPhone) {
      where = { ...where, clientPhone };
    }
    if (status) {
      where = { ...where, status };
    }
    if (noCost) {
      where = { ...where, cost: IsNull() };
    }
    if (paymentStatus) {
      where = { ...where, paymentStatus };
    }
    if (!time) {
      return await this.orderRepository.find({ where });
    }
    if (time === 'seven') {
      timeQuery = 'createTime >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
      return await this.orderRepository
        .createQueryBuilder()
        .select()
        .orderBy('createTime', 'DESC')
        .where(where)
        .andWhere(timeQuery)
        .getManyAndCount();
    }
  }
  async checkExpress(id: number) {
    const order = await this.orderRepository.findOne(id);
    const { expressNum, expressType } = order;
    if (!expressNum || !expressType) return;
    return await queryOrder(expressNum, expressType);
  }
  async findByTime(query: TimeQuery) {
    let where = '';
    if (query.time === 'seven') {
      where = 'createTime >= DATE_SUB(CURDATE(), INTERVAL 4 DAY)';
    }
    return this.orderRepository.find({ where });
  }

  async setPaymentStatus(orderId: number, status: 0 | 1 | 2) {
    const order = await this.orderRepository.findOne(orderId);
    order.paymentStatus = status;
    return await this.orderRepository.save(order);
  }

  async getIssueReason() {
    return await this.issueReasonRepository.find();
  }

  async setIssueReason(orderId: number, reason: string, reasonId?: number) {
    const order = await this.orderRepository.findOne(orderId);
    let issueReason;
    if (reasonId !== undefined) {
      issueReason = await this.issueReasonRepository.findOne(reasonId);
    } else {
      issueReason = new IssueReason();
      issueReason.content = reason;
      issueReason = await this.issueReasonRepository.save(issueReason);
    }
    order.issueReason = [issueReason];
    order.status = 4;
    return await this.orderRepository.save(order);
  }

  async finishOrder(id: number) {
    const order = await this.orderRepository.findOne(id);
    if (order.status === 2) {
      order.status = 3;
    } else if (order.status === 4) {
      order.status = 5;
    }
    return await this.orderRepository.save(order);
  }

  async setExpress(
    id: number,
    expressType: '韵达' | '顺丰' | '德邦',
    expressNum: string,
  ) {
    const order = await this.orderRepository.findOne(id);
    order.expressType = expressType;
    order.expressNum = expressNum;
    return await this.orderRepository.save(order);
  }

  async createOne(dto: CreateOrderDto, images: Image[]) {
    const content = await this.saveContent(dto.sizeAndNum);

    const order = new Order();
    order.clientName = dto.clientName;
    order.clientCompany = dto.clientCompany;
    order.clientAddress = dto.clientAddress;
    order.clientPhone = dto.clientPhone;
    order.content = content;
    order.images = images;
    order.imageIds = dto.imageIds;
    order.material = dto.material;
    order.pattern = dto.pattern;
    order.printing = dto.printing;
    order.detail = dto.detail;
    order.price = dto.price;
    order.totalNum = dto.totalNum;
    order.total = dto.total;
    order.remark = dto.remark;
    order.seller = dto.seller;
    order.express = dto.express;
    order.sendTime = new Date(dto.sendTime);
    order.orderNum = dto.orderNum;
    order.orderNumYear = dto.orderNumYear;

    return await this.orderRepository.save(order);
  }

  private async saveContent(
    contents: {
      color?: string;
      sizeAndCount: object;
    }[],
  ) {
    const contentWork = [];
    for (const c of contents) {
      const content = new Content();
      content.color = c.color || '';
      content.content = c.sizeAndCount;
      contentWork.push(await this.contentRepository.save(content));
    }
    return contentWork;
  }
}
