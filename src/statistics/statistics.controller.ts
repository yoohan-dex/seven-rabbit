import { Controller, Get, Query } from '@nestjs/common';
import { StatisticsService } from './statistics.service';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('overview')
  async getOverview(@Query('from') from: string, @Query('to') to: string) {
    console.log('from', from);
    return await this.statisticsService.getClickTimesByTime(from, to);
  }
}
