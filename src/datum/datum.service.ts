import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SimpleData } from './datum.entity';
import { Repository, Raw } from 'typeorm';
import { WxUser } from '../auth/auth.entity';
import { Product } from '../product/product.entity';
import { SimpleQuery } from './datum.dto';

@Injectable()
export class DatumService {
  constructor(
    @InjectRepository(SimpleData)
    private readonly simpleDataRepository: Repository<SimpleData>,
    @InjectRepository(WxUser)
    private readonly userRepository: Repository<WxUser>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
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

    return {
      product,
      datum: {
        genPoster,
        scanCode,
        afterTransfer,
        view,
        visitedUsers,
        visitedCount: visitedUsers.length,
      },
    };
  }

  async getUserDatum(userId: number) {
    const targetUser = await this.userRepository.findOne(userId);
    if (!targetUser) throw new NotFoundException('没有这个用户');
    const datum = await this.simpleDataRepository.find({
      select: ['actionTime', 'productId', 'type'],
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
    datum.stay += stayTime;
    return await this.simpleDataRepository.save(datum);
  }
}
