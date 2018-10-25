import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { Repository, Like, Raw, LessThan, MoreThan, IsNull } from 'typeorm';
import { CreateOrderDto, SearchQuery, TimeQuery } from './order.dto';
import { Image } from '../common/common.entity';
import { Content } from './content.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Content)
    private readonly contentRepository: Repository<Content>,
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
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
    return await this.orderRepository.save(order);
  }

  async backStep(orderId: number) {
    const order = await this.orderRepository.findOne(orderId);
    if (order.progress > 0) {
      order.progress -= 1;
    }
    return await this.orderRepository.save(order);
  }

  async changeCost(id: number, num: number) {
    const order = await this.orderRepository.findOne(id);
    order.cost = num;
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
    } = query;
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
    if (!time) {
      return await this.orderRepository.find({ where });
    }
    if (time === 'seven') {
      timeQuery = 'createTime >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
      return await this.orderRepository
        .createQueryBuilder()
        .select()
        .where(where)
        .andWhere(timeQuery)
        .getManyAndCount();
    }
  }

  async findByTime(query: TimeQuery) {
    let where = '';
    if (query.time === 'seven') {
      where = 'createTime >= DATE_SUB(CURDATE(), INTERVAL 4 DAY)';
    }
    return this.orderRepository.find({ where });
  }

  async createOne(dto: CreateOrderDto, image: Image) {
    const content = await this.saveContent(dto.sizeAndNum);

    const order = new Order();
    order.clientName = dto.clientName;
    order.clientCompany = dto.clientCompany;
    order.clientAddress = dto.clientAddress;
    order.clientPhone = dto.clientPhone;
    order.content = content;
    order.image = image;
    order.imageId = dto.imageId;
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
