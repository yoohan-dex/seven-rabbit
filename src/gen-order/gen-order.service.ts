import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { parseCommon } from './parse-order';
import Axios from 'axios';
import * as jszip from 'jszip';
import * as docGenerator from 'docxtemplater';
import * as docImageModule from 'docxtemplater-image-module';
import * as fs from 'fs';
import { createWriteStream } from 'fs';

import * as path from 'path';

import * as imageSize from 'image-size';

import { OrderCommon } from './gen-order.entity';
import { Image } from '../common/common.entity';

const sizeOf = imageSize;

@Injectable()
export class GenOrderService {
  constructor(
    @InjectRepository(OrderCommon)
    private readonly orderRepository: Repository<OrderCommon>,
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
  ) {}
  async genOrder(
    msg: string,
    previewImageIds: number[],
    neckTagType: number,
    neckTag?: number,
  ) {
    try {
      const willSavedOrder = parseCommon(msg);
      const order = new OrderCommon();
      order.orderNumYear = parseInt(
        willSavedOrder.transactionCode.slice(0, 4),
        10,
      );
      order.orderNum = parseInt(willSavedOrder.transactionCode.slice(4), 10);
      order.orderName = willSavedOrder.orderName;
      order.transactionCode = willSavedOrder.transactionCode;
      order.pattern = willSavedOrder.pattern;
      order.scaleType = willSavedOrder.scaleType;
      order.scaleText = willSavedOrder.scaleText;
      order.price = willSavedOrder.price;
      order.total = willSavedOrder.total;
      order.neckTagType = neckTagType;
      order.printing = willSavedOrder.printing;
      order.printingRemark = willSavedOrder.printingRemark;
      order.sendTime = willSavedOrder.sendTime;
      order.sendDay = willSavedOrder.sendDay;
      order.servicer = willSavedOrder.servicer;
      order.totalNum = willSavedOrder.totalNum;
      order.clothesMsg = willSavedOrder.clothesMsg;
      order.clientName = willSavedOrder.clientName;
      order.clientAddress = willSavedOrder.clientAddress;
      order.clientCompany = willSavedOrder.clientCompany;
      order.clientPhone = willSavedOrder.clientPhone;
      order.material = willSavedOrder.material;
      order.detail = willSavedOrder.detail;
      order.express = willSavedOrder.express;
      order.seller = willSavedOrder.seller;
      order.isHurry = willSavedOrder.isHurry;
      if (neckTag) {
        const neckTagImage = await this.imageRepository.findOne(neckTag);
        order.neckTag = neckTagImage;
      }
      if (previewImageIds) {
        const previewImage = await this.imageRepository.findByIds(
          previewImageIds,
        );
        order.previewImages = previewImageIds.map(id =>
          previewImage.find(image => image.id === id),
        );
      }
      const savedOrder = await this.orderRepository.save(order);
      const filename = await this.parseFileName(savedOrder);
      const url1 = await this.genWord(await this.parse2Word(savedOrder), 1);
      const url2 = await this.genWord(await this.parse2Word(savedOrder), 2);
      return {
        url1,
        url2,
        filename1: `【裁片】${filename}`,
        filename2: `${filename}`,
      };
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
  async parse2Word(order: OrderCommon) {
    const size = [
      '90',
      '100',
      '110',
      '120',
      '130',
      '140',
      '150',
      'XS',
      'S',
      'M',
      'L',
      'XL',
      '2XL',
      '3XL',
      '4XL',
    ];

    const sizeType = {};
    size.forEach(s => {
      sizeType[s] = false;
    });
    const clothesMsg = order.clothesMsg.map(msg => {
      msg.rules.forEach(rule => {
        sizeType[rule.size] = true;
      });
      const colorAndCount: any = {};
      size.forEach(s => {
        colorAndCount[s] = '';
      }) as any;
      colorAndCount.color = msg.color;
      colorAndCount.total = msg.count;
      msg.rules.forEach(rule => {
        colorAndCount[rule.size] = rule.count;
      });
      return colorAndCount;
    });
    const monthIdx = order.sendTime.indexOf('月');
    const neckTagUrl =
      order.neckTagType === 2
        ? await this.getImageFromWeb(order.neckTag)
        : order.neckTagType === 0
          ? path.resolve(process.cwd(), 'src/gen-order/neckTag.jpg')
          : '';
    const previewUrlsAwait = order.previewImages.map(image =>
      this.getImageFromWeb(image),
    );
    const previewUrls = await Promise.all(previewUrlsAwait);
    const wordObj = {
      ...order,
      orderNumber: `${order.orderNumYear}${order.orderNum.toString().slice(2)}`,
      createTime: `${order.createTime.getMonth() +
        1}月${order.createTime.getDate()}日`,
      clothesMsg,
      childType: order.scaleType === 0 || order.scaleType === 2,
      adultType: order.scaleType === 1 || order.scaleType === 2,
      hurry: order.isHurry
        ? `${order.sendTime.slice(monthIdx + 1, order.sendTime.length - 1)}号`
        : '',
      ...sizeType,
      neckTagUrl,
    };
    previewUrls.forEach((url, i) => {
      wordObj[`previewUrl${i}`] = url;
    });
    return wordObj;
  }
  async genWord(obj: any, step: 1 | 2) {
    const docName = step === 1 ? '4crop' : '4printing';
    const content = fs.readFileSync(
      path.resolve(process.cwd(), `src/gen-order/${docName}.docx`),
    );

    const imageModuleOptions: any = {};
    imageModuleOptions.centered = true;
    imageModuleOptions.getImage = (tagValue, tagName) => {
      const buf = fs.readFileSync(tagValue);
      return buf;
    };
    imageModuleOptions.getSize = (img: any, tagValue, tagName) => {
      if (tagName === 'neckTagUrl') {
        return [120, 120];
      }
      const dimentions: { width: number; height: number } = sizeOf(img) as any;
      return [650, (dimentions.height / dimentions.width) * 650];
    };
    const imageModule = new docImageModule(imageModuleOptions);
    const zip = new jszip(content);
    const doc = new docGenerator().attachModule(imageModule);
    doc.loadZip(zip);
    doc.setData(obj);
    try {
      doc.render();
    } catch (err) {
      throw err;
    }
    const buf = doc.getZip().generate({ type: 'nodebuffer' });
    const url = path.resolve(
      process.cwd(),
      'word',
      `output-${new Date().getTime()}.docx`,
    );
    fs.writeFileSync(url, buf);
    return url;
  }
  async getImageFromWeb(image: Image) {
    const url = path.resolve(process.cwd(), 'word', `${image.name}`);

    const stream = createWriteStream(url);

    const res = await Axios({
      method: 'GET',
      url: image.originUrl,
      responseType: 'stream',
    });
    res.data.pipe(stream);
    return new Promise(resolve => {
      stream.on('finish', () => resolve(url));
    });
  }
  parseFileName(order: OrderCommon) {
    const date = `${order.createTime.getFullYear()}-${order.createTime.getMonth() +
      1}-${order.createTime.getDate()}`;
    const orderName = order.orderName;
    const name = `【${order.transactionCode}】${date}(${
      order.sendDay
    })（${orderName}）.docx`;
    return name;
  }
}
