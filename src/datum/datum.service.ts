import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SimpleData, TopicData } from './datum.entity';
import { Repository, Raw } from 'typeorm';
import { WxUser } from '../auth/auth.entity';
import { Product } from '../product/product.entity';
import { SimpleQuery } from './datum.dto';
import { Topic } from '../topic/topic.entity';

@Injectable()
export class DatumService {
  constructor(
    @InjectRepository(SimpleData)
    private readonly simpleDataRepository: Repository<SimpleData>,
    @InjectRepository(WxUser)
    private readonly userRepository: Repository<WxUser>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(TopicData)
    private readonly topicDataRepository: Repository<TopicData>,
    @InjectRepository(Topic)
    private readonly topicRepository: Repository<Topic>,
  ) {}
  async getProduct(id: number, query?: SimpleQuery) {
    const product = await this.productRepository.findOne(id);
    if (!product) throw new NotFoundException('没有这个产品');

    let where: any = { productId: id };
    // put time in query
    if (query) {
      if (query.time) {
        where = {
          ...where,
          actionTime: Raw(
            actionTime =>
              `${actionTime} >= DATE_SUB(CURDATE(), INTERVAL ${
                query.time
              } DAY)`,
          ),
        };
      }
    }

    // select all quene
    const genPosterQ = this.simpleDataRepository.count({
      where: { ...where, type: 0 },
    });
    const scanCodeQ = this.simpleDataRepository.count({
      where: { ...where, type: 1 },
    });
    const afterTransferQ = this.simpleDataRepository.count({
      where: { ...where, type: 2 },
    });
    const viewQ = this.simpleDataRepository.count({
      where: { ...where, type: 3 },
    });
    const allDataQ = this.simpleDataRepository.find({
      where,
      order: {
        actionTime: 'DESC',
      },
    });

    const [
      genPoster,
      scanCode,
      afterTransfer,
      view,
      allData,
    ] = await Promise.all([
      genPosterQ,
      scanCodeQ,
      afterTransferQ,
      viewQ,
      allDataQ,
    ]);
    const userSet = new Set();
    allData.forEach(data => {
      userSet.add(data.userId);
    });
    const userIds = Array.from(userSet);
    const users = await this.userRepository.findByIds(userIds);

    const visitedUsers = userIds.map(userId => ({
      ...users.find(user => user.id === userId),
      viewData: allData.find(d => d.userId === userId),
    }));

    const stayTimeItems = allData.filter(d => d.stay !== 0).map(d => d.stay);
    if (stayTimeItems.length === 0) {
      stayTimeItems.push(5);
    }
    const aveStay = (
      stayTimeItems.reduce((pre, curr) => pre + curr, 0) / stayTimeItems.length
    ).toFixed(1);
    return {
      product,
      datum: {
        genPoster,
        scanCode,
        afterTransfer,
        view,
        visitedUsers,
        visitedCount: visitedUsers.length,
        aveStay,
      },
    };
  }

  async getUserDatum(userId: number) {
    const targetUser = await this.userRepository.findOne(userId);
    if (!targetUser) throw new NotFoundException('没有这个用户');
    const datum = await this.simpleDataRepository.find({
      select: ['actionTime', 'productId', 'type', 'stay'],
      where: {
        userId: targetUser.id,
      },
      order: {
        actionTime: 'DESC',
      },
    });
    const products = await this.productRepository.findByIds(
      datum.map(d => d.productId),
    );
    const visitDatum = datum.map(d => ({
      ...d,
      product: products.find(product => d.productId === product.id),
    }));
    return {
      targetUser,
      visitDatum,
    };
  }

  async getProducts(query?: SimpleQuery) {
    let whereQuery = '';
    if (query) {
      if (query.time) {
        whereQuery = `actionTime >= DATE_SUB(CURDATE(), INTERVAL ${
          query.time
        } DAY)`;
      }
    }
    const simpleDatum: {
      times: number;
      productId: number;
    }[] = await this.simpleDataRepository
      .createQueryBuilder('data')
      .select('productId')
      .addSelect('count(*)', 'times')
      .where(whereQuery)
      .groupBy('productId')
      .orderBy('times', 'DESC')
      .limit(20)
      .getRawMany();

    const pids = simpleDatum.map(data => data.productId);
    const products = await this.productRepository.findByIds(pids);

    const sortedProducts = simpleDatum.map(data => ({
      product: products.find(p => p.id === data.productId),
      times: data.times,
    }));

    return sortedProducts;
  }
  async setData(
    user: WxUser,
    productId: number,
    type: 0 | 1 | 2 | 3 = 0,
    followUserId?: any,
  ) {
    if (
      user.roles.includes('primary') ||
      user.roles.includes('admin') ||
      user.roles.includes('service')
    )
      return;
    const queries: any[] = [this.productRepository.findOne(productId)];

    if (followUserId && followUserId !== 'undefined') {
      queries.push(this.userRepository.findOne(followUserId));
    }
    const [product, followUser] = await Promise.all(queries);
    if (!product) return;

    const data = new SimpleData();
    data.productId = product.id;
    data.type = type;
    if (followUser) {
      data.followUserId = followUser.id;
    }
    data.userId = user.id;
    return await this.simpleDataRepository.save(data);
  }

  async setDataStay(user: WxUser, dataId: number, stayTime: number) {
    const datum = await this.simpleDataRepository.findOne(dataId);
    if (!user || datum.userId !== user.id) {
      throw new BadRequestException('你在做什么呢');
    }
    datum.stay += stayTime * 1;
    return await this.simpleDataRepository.save(datum);
  }

  async setTopicData(user: WxUser, topicId: number) {
    const topicData = new TopicData();
    topicData.userId = user.id;
    topicData.topicId = topicId;

    return await this.topicDataRepository.save(topicData);
  }

  async getTopicData({
    userId,
    topicId,
  }: { userId?: number; topicId?: number } = {}) {
    const where: any = {};

    if (userId) {
      where.userId = userId;
    }
    if (topicId) {
      where.topicId = topicId;
    }
    const data = await this.topicDataRepository.find({ where });

    let topicIds = data.map(v => v.topicId);
    const topicIdsSet = new Set(topicIds);
    topicIds = Array.from(topicIdsSet);

    let userIds = data.map(v => v.userId);
    const userIdsSet = new Set(userIds);
    userIds = Array.from(userIdsSet);

    const topicList = await this.topicRepository.findByIds(topicIds);
    const userList = await this.userRepository.findByIds(userIds);

    return data.map(d => ({
      ...d,
      topic: topicList.find(t => t.id === d.topicId),
      user: userList.find(u => u.id === d.userId),
    }));
  }
}
