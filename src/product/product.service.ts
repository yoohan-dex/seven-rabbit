import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import {
  CreateProductDto,
  UpdateProductDto,
  GetProductDto,
} from './product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product, HotSort } from './product.entity';
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
    @InjectRepository(HotSort)
    private readonly hotSortRepository: Repository<HotSort>,
  ) {}
  async getOne(id: number) {
    return await this.productRepository.findOne(id);
  }
  async getListByIds(ids: number[]) {
    return await this.productRepository.findByIds(ids);
  }

  async saveCrop(id: number, image: Image) {
    const product = await this.productRepository.findOne(id);
    product.squreCover = image;
    return await this.productRepository.save(product);
  }

  async saveShareImage(id: number, image: Image) {
    const product = await this.productRepository.findOne(id);
    product.shareCover = image;
    return await this.productRepository.save(product);
  }

  async getNewEight() {
    return await this.productRepository.find({
      take: 8,
      order: { id: 'DESC' },
    });
  }

  async getHotSortByType(type: number) {
    let sort: HotSort;
    sort = await this.hotSortRepository.findOne({ where: { type } });
    if (!sort) {
      sort = new HotSort();
      sort.type = type;
      sort.productIds = [];
    }
    return sort;
  }
  async getHotListByTypeAdmin(type: number, count?: number) {
    const sort = await this.getHotSortByType(type);
    const pids = count ? sort.productIds.slice(0, count) : sort.productIds;
    if (pids.length < 1) {
      return [];
    }
    const where: any = {
      hot: true,
      id: In(pids),
    };
    if (type !== undefined) {
      where.type = type;
    }
    const hotList = await this.productRepository.find({ where });
    const realHotList = [];
    pids.forEach((sid: any) => {
      const id = parseInt(sid, 10);
      const item = hotList.find(v => v.id === id);
      if (item) {
        realHotList.push(item);
      }
    });
    return realHotList;
  }
  async getHotListByType(type: number, count?: number) {
    const sort = await this.getHotSortByType(type);
    const pids = count ? sort.productIds.slice(0, count) : sort.productIds;
    const hotList = await this.productRepository.find({
      join: {
        alias: 'p',
        leftJoinAndSelect: {
          cover: 'p.cover',
        },
      },
      select: ['id', 'name', 'hot', 'cover'],
      where: {
        hot: true,
        hotType: type,
        id: In(pids),
      },
      // take: count, // todo! 记得加上排序后去掉这个吧
    });
    const realHotList = [];
    pids.forEach((sid: any) => {
      const id = parseInt(sid, 10);
      const item = hotList.find(v => v.id === id);
      if (item) {
        realHotList.push(item);
      }
    });
    return realHotList;
  }
  async getHotList(page: number = 1, count: number = 8) {
    const sortObj = await this.hotSortRepository.findOne();
    const sortIds =
      page !== 0
        ? sortObj.productIds.slice((page - 1) * count, count)
        : sortObj.productIds;
    const hotList = await this.productRepository.find({
      join: {
        alias: 'p',
        leftJoinAndSelect: {
          cover: 'p.cover',
        },
      },
      select: ['id', 'name', 'hot', 'cover'],
      where: {
        hot: true,
        id: In(sortIds),
      },
    });
    const realHotList = [];
    sortIds.forEach((sid: any) => {
      const id = parseInt(sid, 10);
      const item = hotList.find(v => v.id === id);
      if (item) {
        realHotList.push(item);
      }
    });
    return realHotList;
  }

  async getSort() {
    const sort = await this.hotSortRepository.findOne();
    return sort.productIds;
  }

  async updateNewSort(type: number, ids: number[]) {
    const sort = await this.getHotSortByType(type);
    sort.productIds = ids;
    return await this.hotSortRepository.save(sort);
  }
  async updateSort(hotType: number, ids: number[]) {
    const sort = await this.getHotSortByType(hotType);
    sort.productIds = ids;
    return await this.hotSortRepository.save(sort);
  }

  async initSort(hotType: number) {
    const hotProducts = await this.productRepository.find({
      select: ['id'],
      where: { hot: true, hotType },
    });
    const ids = hotProducts.map(p => p.id);

    const sort = await this.getHotSortByType(hotType);
    sort.productIds = ids;
    return await this.hotSortRepository.save(sort);
  }

  async getAll(getParams: GetProductDto = {}) {
    const options = {
      take: getParams.size || 20,
      skip: getParams.page ? (getParams.page - 1) * (getParams.size || 20) : 0,
      where: { hot: false },
    };
    if (!getParams.features && getParams.category) {
      const category = await this.categoryRepository.findOne(
        getParams.category,
      );
      const [products, total] = await this.productRepository.findAndCount({
        ...options,
        where: { ...options.where, category },
        select: ['cover', 'id', 'name', 'createTime'],
        join: {
          alias: 'p',
          leftJoinAndSelect: {
            cover: 'p.cover',
          },
        },
        order: {
          createTime: 'DESC',
        },
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
        const idsSet = new Set<number>();
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
        where: { id: In(finalIds), category: getParams.category, hot: false },
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
    product.hot = productData.hot;
    product.category = category;
    product.cover = cover;
    product.detail = detail;
    product.features = features;
    product.hotType = productData.hotType;
    try {
      const savedProduct = await this.productRepository.save(product);
      if (savedProduct.hot) {
        const sort = await this.getHotSortByType(product.hotType);
        sort.productIds.push(savedProduct.id);
        await this.hotSortRepository.save(sort);
      }
      return savedProduct;
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
    product.hot = productData.hot;
    product.category = category;
    product.cover = cover;
    product.detail = detail;
    product.features = features;
    product.hotType = productData.hotType;

    const savedProduct = await this.productRepository.save(product);
    if (savedProduct.hot) {
      const sort = await this.getHotSortByType(product.hotType);
      if (!sort.productIds.includes(savedProduct.id)) {
        sort.productIds.push(savedProduct.id);
        if (sort.productIds.map(id => savedProduct.id === id).length > 1) {
          const idx = sort.productIds.indexOf(savedProduct.id);
          sort.productIds.splice(idx, 1);
        }
      }
      await this.hotSortRepository.save(sort);
    }
    return savedProduct;
  }

  async remove(id) {
    const oldProduct = await this.productRepository.findOne(id);
    if (oldProduct.hot) {
      const sort = await this.hotSortRepository.findOne();
      const idx = sort.productIds.findIndex(v => v === id);
      if (idx) {
        sort.productIds.splice(idx, 1);
        await this.hotSortRepository.save(sort);
      }
    }
    return await this.productRepository.delete(id);
  }
}
