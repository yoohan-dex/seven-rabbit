import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import {
  CreateProductDto,
  UpdateProductDto,
  GetProductDto,
} from './product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './product.entity';
import {
  Repository,
  createQueryBuilder,
  QueryBuilder,
  SelectQueryBuilder,
  In,
} from 'typeorm';

import { UpdateCategoryDto } from '../category/category.dto';
import { Image } from '../common/common.entity';
import { Feature } from '../filter/feature.entity';
import { Category } from '../category/category.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
    @InjectRepository(Feature)
    private readonly featureRepository: Repository<Feature>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}
  async getOne(id) {
    return await this.productRepository.findOne(id);
  }
  async getListByIds(ids: number[]) {
    return await this.productRepository.findByIds(ids);
  }
  async getAll(getParams: GetProductDto = {}) {
    const options = {
      take: getParams.size || 20,
      skip: getParams.page ? (getParams.page - 1) * 10 : 0,
    };
    if (!getParams.features && getParams.category) {
      const category = await this.categoryRepository.findOne(
        getParams.category,
      );
      const [products, total] = await this.productRepository.findAndCount({
        ...options,
        where: { category },
      });
      return {
        list: products,
        total,
      };
    }
    if (getParams.features && getParams.features.length > 0) {
      const raw = await createQueryBuilder()
        .select('productId')
        .addSelect('count(*)', 'countNum')
        .from('product_features_feature', 'features')
        .where({
          featureId: In(getParams.features),
        })
        .groupBy('productId')
        .having(`countNum = ${getParams.features.length}`)
        .getRawMany();
      const productIds: number[] = raw.map(obj => obj.productId);
      if (productIds.length < 1) {
        return {
          list: [],
          total: 0,
        };
      }
      const [products, total] = await this.productRepository.findAndCount({
        ...options,
        where: { id: In(productIds), category: getParams.category },
      });
      return {
        list: products,
        total,
      };
    }
    const [products, total] = await this.productRepository.findAndCount(
      options,
    );
    return {
      list: products,
      total,
    };
  }
  async create(productData: CreateProductDto) {
    const getCategory = this.categoryRepository.findOne(productData.category);
    const getCover = this.imageRepository.findOne(productData.cover);
    const getDetail = this.imageRepository.findByIds(productData.detail);
    const getFeatures = this.featureRepository.findByIds(productData.features);
    const [cover, detail, features, category] = await Promise.all([
      getCover,
      getDetail,
      getFeatures,
      getCategory,
    ]);

    const product = new Product();

    product.name = productData.name;
    product.category = category;
    product.cover = cover;
    product.detail = detail;
    product.features = features;
    try {
      return await this.productRepository.save(product);
    } catch (err) {
      throw new HttpException('图片重复了', HttpStatus.CONFLICT);
    }
  }

  async update(productData: UpdateProductDto) {
    const getCategory = this.categoryRepository.findOne(productData.category);
    const getProduct = this.productRepository.findOne(productData.id);
    const getCover = this.imageRepository.findOne(productData.cover);
    const getDetail = this.imageRepository.findByIds(productData.detail);
    const getFeatures = this.featureRepository.findByIds(productData.features);
    const [product, cover, detail, features, category] = await Promise.all([
      getProduct,
      getCover,
      getDetail,
      getFeatures,
      getCategory,
    ]);

    product.name = productData.name;
    product.category = category;
    product.cover = cover;
    product.detail = detail;
    product.features = features;
    return await this.productRepository.save(product);
  }

  async remove(id) {
    return await this.productRepository.delete(id);
  }
}
