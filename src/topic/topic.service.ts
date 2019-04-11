import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Topic, TopicSort } from './topic.entity';
import { Repository, In } from 'typeorm';
import { Image } from '../common/common.entity';
import { TopicDto } from './topic.dto';

@Injectable()
export class TopicService {
  constructor(
    @InjectRepository(Topic)
    private readonly topicRepository: Repository<Topic>,
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
    @InjectRepository(TopicSort)
    private readonly topicSortRepository: Repository<TopicSort>,
  ) {}

  async findTopic({ id, count }: { id?: number; count?: number } = {}) {
    if (id) {
      return await this.topicRepository.findOne(id);
    } else {
      const sortObj = await this.topicSortRepository.findOne();
      const sortIds = sortObj.topicIds.slice(0, count);

      const topicList = await this.topicRepository.find({
        select: ['id'],
        join: {
          alias: 't',
          leftJoinAndSelect: {
            cover: 't.cover',
          },
        },
        where: In(sortIds),
        take: count,
      });

      const realTopicList = [];
      sortIds.forEach((sid: any) => {
        const tid = parseInt(sid, 10);
        const item = topicList.find(v => v.id === tid);
        if (item) {
          realTopicList.push(item);
        }
      });
      return realTopicList;
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

    const sort = await this.topicSortRepository.findOne();
    sort.topicIds.push(topic.id);
    await this.topicSortRepository.save(sort);

    return topic;
  }
  async removeTopic(id: number) {
    return await this.topicRepository.delete(id);
  }
  async getTopicSort() {
    const sort = await this.topicSortRepository.findOne();
    if (!sort) {
      const newSort = new TopicSort();
      newSort.topicIds = [];
      return await this.topicSortRepository.save(newSort);
    }
    return sort.topicIds;
  }
  async updateTopicSort(ids: number[]) {
    const sort = await this.topicSortRepository.findOne();
    sort.topicIds = ids;
    return await this.topicSortRepository.save(sort);
  }
}
