import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import {
  CreateProductDto,
  UpdateProductDto,
  GetProductDto,
} from './product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { Repository, createQueryBuilder, In } from 'typeorm';
import * as R from 'ramda';

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
      skip: getParams.page ? (getParams.page - 1) * 20 : 0,
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
      // init a object for features will be grouped
      const groupedFeatures = {};
      // init a array for ids[] will be grouped
      const groupedIds = [] as Set<number>[];
      const features = await this.featureRepository.findByIds(
        getParams.features,
        { relations: ['filter'] },
      );

      for (const feature of features) {
        if (groupedFeatures[feature.filter.id]) {
          groupedFeatures[feature.filter.id].push(feature.id);
        } else {
          groupedFeatures[feature.filter.id] = [feature.id];
        }
      }

      // [In(f1, f2...fn)]
      const matchProduct = (await createQueryBuilder()
        .select()
        .from('product_features_feature', 'features')
        .where({
          featureId: In(getParams.features),
        })
        .getRawMany()) as {
        productId: number;
        featureId: number;
      }[];

      Object.keys(groupedFeatures).forEach((key, i) => {
        const featureIds = groupedFeatures[key] as number[];
        const products = matchProduct.filter(p =>
          featureIds.some(featureId => p.featureId === featureId),
        );
        const idsSet = new Set();
        for (const product of products) {
          idsSet.add(product.productId);
        }
        groupedIds[i] = idsSet;
      });

      const finalIds = groupedIds.reduce((accept, entry, i) => {
        const entryArray = Array.from(entry);
        if (i === 0) {
          return entryArray;
        }
        return R.intersection(accept)(entryArray);
      }, []);
      if (finalIds.length < 1) {
        return {
          list: [],
          total: 0,
        };
      }

      const [products, total] = await this.productRepository.findAndCount({
        ...options,
        where: { id: In(finalIds), category: getParams.category },
      });

      // const raw = await createQueryBuilder()
      //   .select('productId')
      //   .addSelect('count(*)', 'countNum')
      //   .from('product_features_feature', 'features')
      //   .where({
      //     featureId: In(getParams.features),
      //   })
      //   .groupBy('productId')
      //   .having(`countNum = ${getParams.features.length}`)
      //   .getRawMany();

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
