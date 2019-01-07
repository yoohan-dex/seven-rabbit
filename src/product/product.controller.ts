import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Delete,
  Query,
} from '@nestjs/common';
import { CreateProductDto } from './product.dto';
import { ProductService } from './product.service';
import { StatisticsService } from '../statistics/statistics.service';
import { CommonService } from '../common/common.service';

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
  async getHostList() {
    return this.productService.getHotList();
  }

  @Get('hot/8')
  async getHostList8() {
    return this.productService.getHotList(8);
  }

  @Get('hot-sort')
  async getSort() {
    return await this.productService.getSort();
  }

  @Post('hot-sort')
  async updateSort(@Body() ids: number[]) {
    console.log('ids', ids);
    return await this.productService.updateSort(ids);
  }

  @Get('initial-sort')
  async initSort() {
    return await this.productService.initSort();
  }
  @Get('crop')
  async cropProductCover(@Query('id') id: number) {
    const product = await this.productService.getOne(id);
    const image = await this.commonService.saveWithCrop(
      product.cover.originUrl,
    );

    return await this.productService.saveCrop(id, image);
  }
  @Get(':id')
  async getOne(@Param('id') productId: number) {
    this.statisticsService.recordItems({
      productIds: [productId],
      type: 1,
      user: 'test',
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
        user: 'test',
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
    return await this.productService.create(createProductDto);
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
