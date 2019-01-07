import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CreateCategoryDto, UpdateCategoryDto } from './category.dto';
import { CategoryService } from './category.service';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  getCategories() {
    return this.categoryService.getAll();
  }

  @Get(':id')
  getCategory(@Param('id') id: number) {
    return this.categoryService.getOne(id);
  }

  @Post()
  createCategory(@Body() createCategory: CreateCategoryDto) {
    return this.categoryService.create(createCategory);
  }

  @Delete(':id')
  deleteCategory(@Param('id') categoryId) {
    return this.categoryService.del(categoryId);
  }

  @Post(':id')
  updateCategory(
    @Body() updateCategory: CreateCategoryDto,
    @Param('id') categoryId: number,
  ) {
    return this.categoryService.update({ id: categoryId, ...updateCategory });
  }
}
