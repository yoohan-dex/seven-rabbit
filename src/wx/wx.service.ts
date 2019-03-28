import { Injectable } from '@nestjs/common';
import { WxMedia } from './wx.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { sendFileToWechatServer } from '../shared/utils/sendFileToWechatServer';
import { sendCustomerMsg } from '../shared/utils/sendCustomerMsg';
import { random } from '../shared/utils/ramdom';

@Injectable()
export class WxService {
  constructor(
    @InjectRepository(WxMedia)
    private readonly TmpMediaRepository: Repository<WxMedia>,
  ) {}
  async saveNewTmpMedia() {
    this.TmpMediaRepository.delete('*');
    const result = await sendFileToWechatServer();
    const mediaIds = result.map(r => r.media_id);
    const mediaArray = mediaIds.map(mediaId => {
      const m = new WxMedia();
      m.mediaId = mediaId;
      return m;
    });
    return this.TmpMediaRepository.save(mediaArray);
  }

  async getTmpMedia() {
    const media = await this.TmpMediaRepository.find();
    if (media.length < 1) return await this.saveNewTmpMedia();
    const time = media[0].createTime.getTime();
    const now = new Date().getTime();
    if (now - time > 60 * 24 * 1000 * 2) {
      return await this.saveNewTmpMedia();
    }
    return media;
  }
  async sendCustomMedia(openId: string, type: 'image' | 'text' = 'image') {
    const medias = await this.getTmpMedia();
    const media = medias[random(medias.length)];

    return await sendCustomerMsg({
      openId,
      type,
      image: { media_id: media.mediaId },
    });
  }
}
