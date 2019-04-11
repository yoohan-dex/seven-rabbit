import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Topic } from './topic.entity';
import { Repository } from 'typeorm';
import { Image } from '../common/common.entity';
import { TopicDto } from './topic.dto';

@Injectable()
export class TopicService {
  constructor(
    @InjectRepository(Topic)
    private readonly topicRepository: Repository<Topic>,
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
  ) {}

  async findTopic(id?: number) {
    if (id) {
      return await this.topicRepository.findOne(id);
    } else {
      return await this.topicRepository.find();
    }
  }

  async saveTopic(topicContent: TopicDto, id: number) {
    let topic: Topic;
    if (id) {
      topic = await this.topicRepository.findOne(id);
    } else {
      topic = new Topic();
    }

    if (topicContent.title) {
      topic.title = topicContent.title;
    }
    if (topicContent.type) {
      topic.type = topicContent.type;
    }

    const cover = await this.imageRepository.findOne(topicContent.cover);
    topic.cover = cover;
    const content = await this.imageRepository.findByIds(topicContent.content);
    topic.content = content;
  }
  async removeTopic(id: number) {
    return await this.topicRepository.delete(id);
  }
}
