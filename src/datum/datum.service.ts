import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
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
    const userNumQ = this.simpleDataRepository
      .createQueryBuilder()
      .select('*')
      .addSelect('count(*)')
      .from(qb => {
        qb.select('*')
          .from('simple_data', 'innerData')
          .orderBy('actionTime', 'DESC');
      }, 'data')
      .groupBy('userId')
      .having('productId = :id', { id })
      .getRawMany();

    const [
      genPoster,
      scanCode,
      afterTransfer,
      view,
      userNum,
    ] = await Promise.all([
      genPosterQ,
      scanCodeQ,
      afterTransferQ,
      viewQ,
      userNumQ,
    ]);
    return {
      product,
      datum: { genPoster, scanCode, afterTransfer, view, userNum },
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
}
