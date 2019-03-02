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
    return await this.simpleDataRepository
      .createQueryBuilder()
      .select('productId', 'productId')
      .addSelect('count(*)', 'count')
      .leftJoinAndSelect('product', 'product', 'product.id = productId')
      .groupBy('productId')
      .orderBy('count', 'DESC')
      .getRawMany();
  }
  async setData(
    user: WxUser,
    followUserId: number,
    productId: number,
    type: 0 | 1 | 2 | 3 = 0,
  ) {
    if (
      user.roles.includes('primary') ||
      user.roles.includes('admin') ||
      user.roles.includes('service')
    )
      return;
    if (user.id === followUserId) return;
    const [followUser, product] = await Promise.all([
      this.userRepository.findOne(followUserId),
      this.productRepository.findOne(productId),
    ]);
    if (!followUser || !product) return;

    const data = new SimpleData();
    data.productId = productId;
    data.product = product;
    data.type = type;
    data.followUserId = followUserId;
    data.followUser = followUser;
    data.user = user;
    data.userId = user.id;
    return await this.simpleDataRepository.save(data);
  }
}
