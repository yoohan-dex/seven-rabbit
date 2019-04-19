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

  async findTopic({
    id,
    count,
    admin,
  }: { id?: number; count?: number; admin?: boolean } = {}) {
    if (id) {
      return await this.topicRepository.findOne(id);
    } else {
      // const sortObj = await this.topicSortRepository.findOne();
      // const sortIds = sortObj.topicIds.slice(0, count);
      if (!admin) {
        const topicList = await this.topicRepository.find({
          select: ['id', 'cover', 'background'],
          join: {
            alias: 't',
            leftJoinAndSelect: {
              cover: 't.cover',
              background: 't.background',
            },
          },
          // where: In(sortIds), // todo! 记得去把这个排序功能完善， 然后加上这个
          take: count,
        });
        return topicList;
      } else {
        return await this.topicRepository.find();
      }
      // const realTopicList = [];
      // sortIds.forEach((sid: any) => {
      //   const tid = parseInt(sid, 10);
      //   const item = topicList.find(v => v.id === tid);
      //   if (item) {
      //     realTopicList.push(item);
      //   }
      // });
      // return realTopicList;
    }
  }

  async saveTopic(topicContent: TopicDto, id?: number) {
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
    const [cover, background] = await Promise.all([
      this.imageRepository.findOne(topicContent.cover),
      this.imageRepository.findOne(topicContent.background),
    ]);
    topic.cover = cover;
    topic.background = background;
    const detail = await this.imageRepository.findByIds(topicContent.detail);
    topic.detail = detail;

    const savedTopic = await this.topicRepository.save(topic);
    const sort = await this.topicSortRepository.findOne();
    sort.topicIds.push(savedTopic.id);
    await this.topicSortRepository.save(sort);

    return savedTopic;
  }
  async removeTopic(id: number) {
    return await this.topicRepository.delete(id);
  }
  async getTopicSort() {
    const sort = await this.topicSortRepository.findOne();
    if (!sort) {
      const newSort = new TopicSort();
      newSort.topicIds = [];
      const s = await this.topicSortRepository.save(newSort);
      return s.topicIds;
    }
    return sort.topicIds;
  }
  async updateTopicSort(ids: number[]) {
    const sort = await this.topicSortRepository.findOne();
    sort.topicIds = ids;
    return await this.topicSortRepository.save(sort);
  }
}
