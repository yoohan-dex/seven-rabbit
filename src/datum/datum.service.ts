import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SimpleData } from './datum.entity';
import { Repository } from 'typeorm';
import { WxUser } from '../auth/auth.entity';
import { Product } from '../product/product.entity';

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
  async getProducts() {
    const simpleDatum: {
      times: number;
      productId: number;
    }[] = await this.simpleDataRepository
      .createQueryBuilder('data')
      .select('productId')
      .addSelect('count(*)', 'times')
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
