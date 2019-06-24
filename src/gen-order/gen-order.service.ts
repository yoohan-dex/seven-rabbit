import {
  Injectable,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, RelationQueryBuilder } from 'typeorm';
import { parseCommon } from './parse-order';
import Axios from 'axios';
import * as jszip from 'jszip';
import * as docGenerator from 'docxtemplater';
import * as docImageModule from 'docxtemplater-image-module';
import * as fs from 'fs';
import { createWriteStream } from 'fs';

import * as path from 'path';

import * as imageSize from 'image-size';

import { OrderCommon, Rule } from './gen-order.entity';
import { Image } from '../common/common.entity';

import * as mammoth from 'mammoth';

const p = path.resolve(process.cwd(), `src/gen-order/output.docx`);
// mammoth.convertToHtml({ path: p }).then(res => {
//   const r = res.value;
//   console.log('res', r);
// });
const sizeOf = imageSize;

@Injectable()
export class GenOrderService {
  constructor(
    @InjectRepository(OrderCommon)
    private readonly orderRepository: Repository<OrderCommon>,
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
  ) {}

  async getInfoByOrder(orders: string[], color: string) {
    const order = await this.orderRepository.find({
      transactionCode: In(orders),
    });
    const rightColorMsg: Rule[][] = order.reduce((pre, curr) => {
      if (
        !curr.clothesMsg.some(msg => {
          return msg.color.includes(color);
        })
      ) {
        return pre;
      }
      const rightColor = curr.clothesMsg.find(msg => {
        return msg.color.includes(color);
      });

      return [...pre, rightColor.rules] as Rule[];
    }, []);
    const count = {};
    let total = 0;
    rightColorMsg.forEach(m => {
      m.forEach(r => {
        total += r.count;
        if (count[r.size]) {
          count[r.size] = count[r.size] += r.count;
        } else {
          count[r.size] = r.count;
        }
      });
    });
    return { count, total };
  }

  async getInfo(
    material: string[],
    pattern: string[],
    color: string,
    except: string[],
  ) {
    const materialWhereString = material.reduce((pre, mtr, idx) => {
      if (idx === 0) {
        return `material like '%${mtr}%'`;
      }
      return `${pre} or material like '%${mtr}%'`;
    }, '');
    const patternWhereString = pattern.reduce((pre, mtr, idx) => {
      if (idx === 0) {
        return `pattern like '%${mtr}%'`;
      }
      return `${pre} or pattern like '%${mtr}%'`;
    }, '');
    const order = await this.orderRepository.find({
      where: `(${materialWhereString}) AND (${patternWhereString})`,
      order: {
        transactionCode: 'DESC',
      },
    });
    const filter = (e: string[]) => (o: OrderCommon) => {
      if (!e || e.length < 1) return true;
      let ok = true;
      e.forEach(v => {
        if (o.material.includes(v)) {
          ok = false;
        }
      });
      return ok;
    };

    const rightColorMsg: Rule[][] = order
      .filter(filter(except))
      .reduce((pre, curr) => {
        if (
          !curr.clothesMsg.some(msg => {
            return msg.color.includes(color);
          })
        ) {
          return pre;
        }
        const rightColor = curr.clothesMsg.find(msg => {
          return msg.color.includes(color);
        });

        return [...pre, rightColor.rules] as Rule[];
      }, []);
    const count = {};
    rightColorMsg.forEach(m => {
      m.forEach(r => {
        if (count[r.size]) {
          count[r.size] = count[r.size] += r.count;
        } else {
          count[r.size] = r.count;
        }
      });
    });
    return count;
  }
  async genOrder(
    msg: string,
    previewImageIds: number[],
    neckTagType: number,
    overWrite: boolean,
    neckTag?: number,
  ) {
    try {
      const willSavedOrder = parseCommon(msg);

      const isExsit = await this.orderRepository.findOne({
        transactionCode: willSavedOrder.transactionCode,
      });
      if (overWrite && isExsit) {
        await this.orderRepository.delete(isExsit.id);
      }
      if (!overWrite && isExsit) {
        throw new ConflictException(
          '此订单已存在',
          `请查看单号「${willSavedOrder.transactionCode}」是否已被使用`,
        );
      }
      const order = new OrderCommon();
      const afterRemoveA = willSavedOrder.transactionCode.replace('A', '');
      order.orderNumYear = parseInt(afterRemoveA.slice(0, 4), 10);
      order.orderNum = parseInt(afterRemoveA.slice(4), 10);
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
      order.service = willSavedOrder.service;
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
      order.remark = willSavedOrder.remark;
      order.keep = willSavedOrder.keep;
      if (willSavedOrder.sender) order.sender = willSavedOrder.sender;
      if (willSavedOrder.senderPhone)
        order.senderPhone = willSavedOrder.senderPhone;
      if (willSavedOrder.package) order.package = willSavedOrder.package;
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
      let url3: any;
      if (savedOrder.keep) {
        url3 = await this.genWord(await this.parse2Word(savedOrder), 3);
      }
      const r = {
        url1,
        url2,
        filename1: `【裁片】${filename}`,
        filename2: `${filename}`,
      };
      if (url3) {
        return {
          ...r,
          url3,
          filename3: `【留版】${filename}`,
        };
      }
      return r;
    } catch (err) {
      throw new BadRequestException('订单解析错误', err.message);
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
    const keepSizeType = {};
    size.forEach(s => {
      sizeType[s] = false;
    });
    const clothesMsg = order.clothesMsg.map((msg, ii) => {
      msg.rules.forEach(rule => {
        sizeType[rule.size] = true;
      });
      const colorAndCount: any = {};
      size.forEach(s => {
        colorAndCount[s] = '';
      }) as any;
      colorAndCount.color = msg.color;
      // colorAndCount.total = msg.count;
      const kk = order.keep && order.keep.find(k => k.color === msg.color);
      if (kk) {
        colorAndCount.total = this.parseCount2XML(
          `${msg.count}`,
          `+${kk.count}`,
        );
      } else {
        colorAndCount.total = this.parseCount2XML(`${msg.count}`);
      }
      msg.rules.forEach(rule => {
        if (order.keep && kk) {
          kk.rules.forEach(rr => {
            if (rr.size === rule.size) {
              colorAndCount[rule.size] = this.parseCount2XML(
                `${rule.count}`,
                `+${rr.count}`,
              );
            } else {
              colorAndCount[rule.size] = this.parseCount2XML(`${rule.count}`);
            }
          });
        } else if (!colorAndCount[rule.size]) {
          colorAndCount[rule.size] = this.parseCount2XML(`${rule.count}`);
        } else {
        }
      });
      return colorAndCount;
    });
    const keep =
      order.keep &&
      order.keep.map(msg => {
        msg.rules.forEach(rule => {
          keepSizeType[rule.size] = true;
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
    const neckTagUrl =
      order.neckTagType === 2
        ? await this.getImageFromWeb(order.neckTag)
        : order.neckTagType === 0
          ? path.resolve(process.cwd(), 'src/gen-order/neckTag.jpg')
          : path.resolve(process.cwd(), 'src/gen-order/empty.png');
    const previewUrlsAwait = order.previewImages.map(image =>
      this.getImageFromWeb(image),
    );
    const previewUrls = await Promise.all(previewUrlsAwait);
    const wordObj = {
      ...order,
      material: this.parseMaterial2XML(order.material, '过洗水'),
      orderNumber: `${order.orderNumYear}${order.orderNum.toString().slice(2)}`,
      createTime: `${order.createTime.getMonth() +
        1}月${order.createTime.getDate()}日`,
      clothesMsg,
      keep,
      childType: order.scaleType === 0 || order.scaleType === 2,
      adultType: order.scaleType === 1 || order.scaleType === 2,
      hurry: order.isHurry ? `${order.sendDay}号` : '',
      ...sizeType,
      neckTagUrl,
    };
    previewUrls.forEach((url, i) => {
      wordObj[`previewUrl${i}`] = url;
    });
    previewUrls.forEach((url, i) => {
      wordObj[`keepPreview${i}`] = url;
    });
    return wordObj;
  }
  async genWord(obj: any, step: 1 | 2 | 3) {
    const docName = step === 1 ? '4crop' : step === 2 ? '4printing' : '4keep';
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
        if (
          tagValue === path.resolve(process.cwd(), 'src/gen-order/empty.png')
        ) {
          return [5, 5];
        }
        return [120, 120];
      }
      const dimentions: { width: number; height: number } = sizeOf(img) as any;
      if (tagName.includes('keepPreview')) {
        return [200, (dimentions.height / dimentions.width) * 200];
      }
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
    const name = `【${order.transactionCode.slice(4)}】${date}(${
      order.sendDay
    })（${orderName
      .replace('#', '==')
      .replace('＃', '==')
      .trim()}）.docx`;
    return name;
  }
  parseMaterial2XML(str: string, highLight: string) {
    const washIdx = str.indexOf(highLight);
    if (washIdx !== -1) {
      const head = str.slice(0, washIdx);
      const tail = str.slice(washIdx + highLight.length);
      // tslint:disable-next-line:max-line-length
      return `<w:p><w:r><w:t>布料：${head}</w:t></w:r><w:r><w:rPr><w:color w:val=\"FF0000\"/></w:rPr><w:t>${highLight}</w:t></w:r><w:r><w:t>${tail}</w:t></w:r></w:p>`;
    }
    return `<w:p><w:r><w:t>布料：${str}</w:t></w:r></w:p>`;
  }
  parseCount2XML(str: string, highLight?: string) {
    if (highLight) {
      // tslint:disable-next-line:max-line-length
      return `<w:p><w:r><w:t>${str}</w:t></w:r><w:r><w:rPr><w:color w:val=\"FF0000\"/></w:rPr><w:t>${highLight}</w:t></w:r></w:p>`;
    }
    return `<w:p><w:r><w:t>${str}</w:t></w:r></w:p>`;
  }
}
