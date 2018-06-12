import * as CosSdk from 'cos-nodejs-sdk-v5';
import * as shortid from 'shortid';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from './common.entity';
import config from '../../config';
import { ImageFile } from './common.type';

@Injectable()
export class CommonService {
  private cos: any;
  constructor(
    @InjectRepository(Image)
    private readonly ImageRepository: Repository<Image>,
  ) {
    this.cos = new CosSdk({
      AppId: config.qcloudAppId,
      SecretId: config.qcloudSecretId,
      SecretKey: config.qcloudSecretKey,
      Domain: `http://${config.cos.fileBucket}-${config.qcloudAppId}.${
        config.cos.region
      }.myqcloud.com/`,
    });
  }
  save(fileObject: ImageFile): Promise<Image> {
    const image = new Image();
    image.name = fileObject.name;
    image.url = fileObject.imgUrl;
    image.meta = fileObject.mimeType;

    return this.ImageRepository.save(image);
  }
  saveInCloud(file): Promise<ImageFile> {
    console.log(file);
    const imgKey = `${Date.now()}-${shortid.generate()}.${
      file.mimetype.split('/')[1]
    }`;
    const uploadFolder = config.cos.uploadFolder
      ? config.cos.uploadFolder + '/'
      : '';
    const params = {
      Bucket: config.cos.fileBucket,
      Region: config.cos.region,
      Key: `${uploadFolder}${imgKey}`,
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
            name: file.originalname,
          });
        }
      });
    });
  }
}
