import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Get,
  Delete,
  Query,
} from '@nestjs/common';
import { CreateProductDto } from './product.dto';
import { ProductService } from './product.service';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get(':id')
  async getOne(@Param('id') productId: number) {
    return this.productService.getOne(productId);
  }

  @Get()
  async getProducts(
    @Query('category') category: number,
    @Query('features') features: number[],
    @Query('page') page: number,
    @Query('size') size: number,
  ) {
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
    return this.productService.create(createProductDto);
  }

  @Patch(':id')
  async updateProduct(
    @Param('id') productId: number,
    @Body() data: CreateProductDto,
  ) {
    return this.productService.update({ id: productId, ...data });
  }

  @Delete(':id')
  async deleteProduct(@Param('id') productId: number) {
    return this.productService.remove(productId);
  }
}
