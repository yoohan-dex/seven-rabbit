import { Controller, Post, Body, Get, Patch, Param } from '@nestjs/common';
import { CreateFilterDto } from './filter.dto';
import { FilterService } from './filter.service';

@Controller('filter')
export class FilterController {
  constructor(private readonly filterService: FilterService) {}

  @Post()
  async create(@Body() createFilter: CreateFilterDto) {
    const filter = await this.filterService.create(createFilter);
    return filter;
  }

  @Get()
  async getFilters() {
    const filters = await this.filterService.getAll();
    return filters;
  }

  @Get(':id')
  async getfilter(@Param('id') id: number) {
    const filter = await this.filterService.getOne(id);
    return filter;
  }

  @Patch(':id')
  async update(@Body() updateFilter: CreateFilterDto, @Param('id') filterId) {
    return await this.filterService.update({ id: filterId, ...updateFilter });
  }
}
