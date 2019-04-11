import { Controller, Get, Param, Post, Body, Delete } from '@nestjs/common';
import { TopicService } from './topic.service';
import { TopicDto } from './topic.dto';

@Controller('topic')
export class TopicController {
  constructor(private readonly topicSerivce: TopicService) {}

  @Get('/:id')
  async getTopic(@Param('id') id: number) {
    return await this.topicSerivce.findTopic(id);
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
}
