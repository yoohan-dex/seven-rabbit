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

@Controller('topic')
export class TopicController {
  constructor(private readonly topicSerivce: TopicService) {}

  @Get()
  async getTopicBySize(@Query('size') size: number) {
    return await this.topicSerivce.findTopic({ count: size });
  }
  @Get('/:id')
  async getTopicDetail(@Param('id') id: number) {
    return await this.topicSerivce.findTopic({ id });
  }

  @Post('/:id')
  async postTopic(
    @Param('id') id: number,
    @Body('topicContent') topicContent: TopicDto,
  ) {
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
