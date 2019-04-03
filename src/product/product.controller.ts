import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Delete,
  Query,
  Res,
} from '@nestjs/common';
import { CreateProductDto } from './product.dto';
import { ProductService } from './product.service';
import { StatisticsService } from '../statistics/statistics.service';
import { CommonService } from '../common/common.service';
import { getWXACode } from '../shared/utils/getWXACode';
import { Response } from 'express';
import * as fs from 'fs';
import { log } from 'console';

@Controller('product')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly statisticsService: StatisticsService,
    private readonly commonService: CommonService,
  ) {}

  @Get('new/8')
  async getNewEight() {
    return this.productService.getNewEight();
  }

  @Get('hot')
  async getHostList(@Query('page') page: number, @Query('size') size: number) {
    if (page === 0) return await this.productService.getHotList(0);
    return this.productService.getHotList(page, size);
  }

  @Get('hot/8')
  async getHostList8() {
    return this.productService.getHotList(1, 8);
  }

  @Get('hot-sort')
  async getSort() {
    return await this.productService.getSort();
  }

  @Post('hot-sort')
  async updateSort(@Body() ids: number[]) {
    return await this.productService.updateSort(ids);
  }

  @Get('gen-code')
  async genCode(
    @Query('page') page: string,
    @Query('productId') productId: number,
    @Query('followUserId') followUserId: string,
    @Res() res: Response,
  ) {
    const scene = `${productId}&${followUserId}`;
    const url = await getWXACode(page, scene);
    // const url = '/Users/yoohoo/projects/seven-rabbit/tmp/Byt6fR-fV.png';
    // const stream = fs.createReadStream(url);
    setTimeout(() => {
      fs.exists(url, exist => {
        if (exist) {
          fs.unlink(url, err => {
            if (!err) {
              log('delete finsihed');
            }
          });
        }
      });
    }, 60000);
    return res.sendFile(url);
  }

  @Get('initial-sort')
  async initSort() {
    return await this.productService.initSort();
  }
  @Get('crop-for-share')
  async cropAllProductsShare(
    @Query('page') page: number,
    @Query('size') size: number,
  ) {
    const { list: products } = await this.productService.getAll({ page, size });

    const cropQs = products.map(product => {
      return this.commonService.saveWithCrop(product.cover.originUrl, 'share');
    });
    const images = await Promise.all(cropQs);
    const saveQs = products.map((product, idx) => {
      return this.productService.saveShareImage(product.id, images[idx]);
    });

    const afterProcessProducts = await Promise.all(saveQs);
    return afterProcessProducts;
  }
  @Get('crop')
  async cropAllProductsCover(
    @Query('page') page: number,
    @Query('size') size: number,
  ) {
    const { list: products } = await this.productService.getAll({ page, size });

    const cropQs = products.map(product => {
      return this.commonService.saveWithCrop(product.cover.originUrl);
    });

    const images = await Promise.all(cropQs);
    const saveQs = products.map((product, idx) => {
      return this.productService.saveCrop(product.id, images[idx]);
    });

    const afterProcessProducts = await Promise.all(saveQs);
    return afterProcessProducts;
  }
  // async cropProductCover(@Query('id') id: number) {
  //   const product = await this.productService.getOne(id);
  //   const image = await this.commonService.saveWithCrop(
  //     product.cover.originUrl,
  //   );

  //   return await this.productService.saveCrop(id, image);
  // }
  @Get(':id')
  async getOne(@Param('id') productId: number) {
    this.statisticsService.recordItems({
      productIds: [productId],
      type: 1,
      user: 123,
    });
    return this.productService.getOne(productId);
  }

  @Get()
  async getProducts(
    @Query('category') category: number,
    @Query('features') features: number[],
    @Query('page') page: number,
    @Query('size') size: number,
    @Query('ids') ids: number[],
  ) {
    if (ids && ids.length > 0) {
      this.statisticsService.recordItems({
        productIds: ids,
        type: 1,
        user: 123,
      });
      return await this.productService.getListByIds(ids);
    }
    const params = {
      category,
      features,
      page,
      size,
    };
    return await this.productService.getAll(params);
  }

  @Post()
  async createProduct(@Body() createProductDto: CreateProductDto) {
    const product = await this.productService.create(createProductDto);
    const image = await this.commonService.saveWithCrop(
      product.cover.originUrl,
    );
    await this.productService.saveCrop(product.id, image);
    const shareImage = await this.commonService.saveWithCrop(
      product.cover.originUrl,
      'share',
    );
    return await this.productService.saveShareImage(product.id, image);
  }

  @Post(':id')
  async updateProduct(
    @Param('id') productId: number,
    @Body() data: CreateProductDto,
  ) {
    return this.productService.update({ id: productId, ...data });
  }

  @Delete(':id')
  async deleteProduct(@Param('id') productId: number) {
    const product = await this.productService.getOne(productId);
    let willRemoveImages = [];
    willRemoveImages.push(product.cover.originUrl);
    willRemoveImages = willRemoveImages.concat(
      product.detail.map(v => v.originUrl),
    );
    const willDo = [];
    for (const imageUrl of willRemoveImages) {
      willDo.push(this.commonService.deleteOne(imageUrl));
    }
    try {
      await Promise.all(willDo);
    } catch (e) {}
    return await this.productService.remove(productId);
  }
}
