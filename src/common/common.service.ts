import * as CosSdk from 'cos-nodejs-sdk-v5';
import * as shortid from 'shortid';
import http from 'axios';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from './common.entity';
import { ImageFile } from './common.type';

@Injectable()
export class CommonService {
  private domain: string;
  private cos: any;
  constructor(
    @InjectRepository(Image)
    private readonly ImageRepository: Repository<Image>,
  ) {
    this.domain = `http://${process.env.COS_FILE_BUCKET}-${
      process.env.QClOUD_APP_ID
    }.cos.${process.env.COS_REGION}.myqcloud.com/`;

    this.cos = new CosSdk({
      SecretId: process.env.QCLOUD_SECRET_ID,
      SecretKey: process.env.QCLOUD_SECRET_KEY,
      Domain: this.domain,
    });
  }
  async save(file: ImageFile): Promise<Image> {
    const image = new Image();
    image.name = file.name;
    image.url =
      file.imgUrl.indexOf(`cos.${process.env.COS_REGION}`) !== -1
        ? `${file.imgUrl.replace(`cos.${process.env.COS_REGION}`, 'image')}!zip`
        : file.imgUrl;
    image.originUrl = file.imgUrl;
    image.meta = file.mimeType;

    return await this.ImageRepository.save(image);
  }

  async findAll() {
    return await this.ImageRepository.find();
  }

  async findOne(id: number) {
    return await this.ImageRepository.findOne(id);
  }

  async deleteOne(originUrl: string) {
    const key = originUrl.replace(this.domain, '');
    const params = {
      Bucket: `${process.env.COS_FILE_BUCKET}-${process.env.QClOUD_APP_ID}`,
      Region: process.env.COS_REGION,
      Key: key,
    };
    return new Promise((resolve, reject) => {
      this.cos.deleteObject(params, (error, data) => {
        if (!error) {
          resolve(data);
        } else {
          reject(error);
        }
      });
    });
  }

  async zip(cosUrl: string): Promise<string> {
    const url =
      cosUrl.indexOf(`cos.${process.env.COS_REGION}`) !== -1
        ? cosUrl.replace(`cos.${process.env.COS_REGION}`, 'picgz')
        : cosUrl;
    await http({
      url,
      method: 'get',
    });
    return url;
  }

  async updateUrl(image: Image, newUrl) {
    image.url = newUrl;
    return await this.ImageRepository.save(image);
  }

  saveInCloud(file): Promise<ImageFile> {
    const imgKey = `${Date.now()}-${shortid.generate()}.${
      file.mimetype.split('/')[1]
    }`;
    const uploadFolder = process.env.COS_UPLOAD_FOLDER
      ? process.env.COS_UPLOAD_FOLDER + '/'
      : '';
    const key = `${uploadFolder}${imgKey}`;
    const params = {
      Bucket: `${process.env.COS_FILE_BUCKET}-${process.env.QClOUD_APP_ID}`,
      Region: process.env.COS_REGION,
      Key: key,
      FilePath: file.path,
      ContentLength: file.size,
    };

    return new Promise((resolve, reject) => {
      this.cos.sliceUploadFile(params, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            imgUrl: `http://${data.Location}`,
            size: file.size,
            mimeType: file.mimetype,
            name: file.filename,
          });
        }
      });
    });
  }
}
