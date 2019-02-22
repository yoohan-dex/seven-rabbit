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

  async setData(
    user: WxUser,
    followUserId: string,
    productId: number,
    type: 0 | 1 | 2 | 3 = 0,
  ) {
    if (parseInt(user.uuid, 10) === parseInt(followUserId, 10)) return;
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
    data.userId = user.uuid;
    return await this.simpleDataRepository.save(data);
  }
}
