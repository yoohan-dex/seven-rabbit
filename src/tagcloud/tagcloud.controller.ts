import { Controller, Get, Query } from '@nestjs/common';
import { TagcloudService } from './tagcloud.service';
import { FeatureService } from 'filter/feature.service';

@Controller('tagcloud')
export class TagcloudController {
  constructor(
    private readonly tagcloudService: TagcloudService,
    private readonly featureService: FeatureService,
  ) {}

  @Get('/overview')
  async getOverview(@Query('from') from: string, @Query('to') to: string) {
    const items = await this.tagcloudService.getTagcloudByTime(from, to);

    const featureIds = items.map(item => item.featureId);
    const features = await this.featureService.selectByIds(featureIds);

    
  }
}
