import * as CosSdk from 'cos-nodejs-sdk-v5';
import * as shortid from 'shortid';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from './common.entity';
import { ImageFile } from './common.type';

@Injectable()
export class CommonService {
  private cos: any;
  constructor(
    @InjectRepository(Image)
    private readonly ImageRepository: Repository<Image>,
  ) {
    this.cos = new CosSdk({
      SecretId: process.env.QCLOUD_SECRET_ID,
      SecretKey: process.env.QCLOUD_SECRET_KEY,
      Domain: `http://${process.env.COS_FILE_BUCKET}-${
        process.env.QClOUD_APP_ID
      }.cos.${process.env.COS_REGION}.myqcloud.com/`,
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
    const imgKey = `${Date.now()}-${shortid.generate()}.${
      file.mimetype.split('/')[1]
    }`;
    const uploadFolder = process.env.COS_UPLOAD_FOLDER
      ? process.env.COS_UPLOAD_FOLDER + '/'
      : '';
    const params = {
      Bucket: `${process.env.COS_FILE_BUCKET}-${process.env.QClOUD_APP_ID}`,
      Region: process.env.COS_REGION,
      Key: `${uploadFolder}${imgKey}`,
      FilePath: file.path,
      ContentLength: file.size,
    };

    return new Promise((resolve, reject) => {
      this.cos.sliceUploadFile(params, (err, data) => {
        if (err) {
          console.log('err', err)
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
