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
      // .leftJoinAndSelect('data.product', 'product')
      // .leftJoinAndMapOne('data.p', 'data.product', 'product')
      // .leftJoinAndMapOne(
      //   'data.product.cover',
      //   'image',
      //   'image',
      //   'image.id = product.coverId',
      // )
      // .leftJoinAndSelect('product', 'product', 'product.id = productId')
      // .leftJoinAndSelect('image', 'product_cover', 'image.id = product.coverId')
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
    data.product = product;
    data.type = type;
    data.followUser = followUser;
    data.user = user;
    return await this.simpleDataRepository.save(data);
  }
}
