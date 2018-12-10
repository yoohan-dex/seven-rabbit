import * as CosSdk from 'cos-nodejs-sdk-v5';
import * as shortid from 'shortid';
import http from 'axios';
import * as Util from 'util';
import * as imageSize from 'image-size';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from './common.entity';
import { ImageFile } from './common.type';

const sizeOf = Util.promisify(imageSize);

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
    image.width = file.width;
    image.height = file.height;
    return await this.ImageRepository.save(image);
  }

  async findAll() {
    return await this.ImageRepository.find();
  }

  async findByIds(ids: number[]) {
    return await this.ImageRepository.findByIds(ids);
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

  async saveInCloud(file) {
    console.log('file');
    const dimentions: { width: number; height: number } = (await sizeOf(
      file.path,
    )) as any;
    console.log('dimentions', dimentions);
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

    const upload = Util.promisify(this.cos.sliceUploadFile).bind(this.cos);
    const data = await upload(params);
    return {
      imgUrl: `http://${data.Location}`,
      size: file.size,
      mimeType: file.mimetype,
      name: file.filename,
      width: dimentions.width,
      height: dimentions.height,
    };
  }
}
