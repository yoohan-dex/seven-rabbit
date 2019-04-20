import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Delete,
  Query,
} from '@nestjs/common';
import { TopicService } from './topic.service';
import { TopicDto } from './topic.dto';
import { DatumService } from '../datum/datum.service';
import { User } from '../shared/decorators/user';

@Controller('topic')
export class TopicController {
  constructor(
    private readonly topicSerivce: TopicService,
    private readonly datumService: DatumService,
  ) {}

  @Get()
  async getTopicBySize(
    @Query('size') size: number,
    @Query('admin') admin: boolean,
  ) {
    return await this.topicSerivce.findTopic({ count: size, admin });
  }
  @Get('/:id')
  async getTopicDetail(@Param('id') id: number, @User() user: any) {
    await this.datumService.setTopicData(user, id);
    return await this.topicSerivce.findTopic({ id });
  }

  @Post()
  async createTopic(@Body() topicContent: TopicDto) {
    return await this.topicSerivce.saveTopic(topicContent);
  }
  @Post('/:id')
  async postTopic(@Param('id') id: number, @Body() topicContent: TopicDto) {
    return await this.topicSerivce.saveTopic(topicContent, id);
  }

  @Delete('/:id')
  async deleteTopic(@Param('id') id: number) {
    return await this.topicSerivce.removeTopic(id);
  }

  @Get('sort/topic')
  async getTopicSort() {
    return await this.topicSerivce.getTopicSort();
  }
  @Post('sort/topic')
  async updateTopicSort(sort: number[]) {
    return await this.topicSerivce.updateTopicSort(sort);
  }
}
