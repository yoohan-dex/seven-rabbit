import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './category.entity';
import { Repository } from 'typeorm';
import { CreateCategoryDto, UpdateCategoryDto } from './category.dto';
import { Filter } from '../filter/filter.entity';
import { Image } from '../common/common.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Filter)
    private readonly filterRepository: Repository<Filter>,
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
  ) {}
  async getAll() {
    return await this.categoryRepository.find({
      select: ['id', 'name'],
      order: {
        orderId: 'ASC',
      },
    });
  }

  async getOne(id: number) {
    return await this.categoryRepository.findOne(id);
  }
  async create(createCategoryDto: CreateCategoryDto) {
    const filters = await this.filterRepository.findByIds(
      createCategoryDto.filters,
    );
    const pos = JSON.stringify(filters.map(f => f.id));

    const image = await this.imageRepository.findOne(createCategoryDto.image);
    const category = new Category();
    category.name = createCategoryDto.name;
    category.image = image;
    category.orderId = createCategoryDto.orderId;
    category.pos = pos;
    category.filters = filters;
    try {
      return await this.categoryRepository.save(category);
    } catch (err) {
      throw new HttpException('图片重复了', HttpStatus.CONFLICT);
    }
  }

  async update(updateCategoryDto: UpdateCategoryDto) {
    const filters = await this.filterRepository.findByIds(
      updateCategoryDto.filters,
    );
    const pos = JSON.stringify(filters.map(f => f.id));
    const image = await this.imageRepository.findOne(updateCategoryDto.image);
    const category = await this.categoryRepository.findOne(
      updateCategoryDto.id,
    );
    category.name = updateCategoryDto.name;
    category.image = image;
    category.pos = pos;
    category.orderId = updateCategoryDto.orderId;
    category.filters = filters;
    return await this.categoryRepository.save(category);
  }

  async del(id: number) {
    return await this.categoryRepository.delete(id);
  }
}
