import * as moment from 'moment';
import { chineseType, type } from './type';
import { ClothesMsg, Rule, Material } from './gen-order.entity';
import { BadRequestException } from '@nestjs/common';
const genError = (msg: string) => {
  throw new BadRequestException('订单解析错误', msg);
};
export const replaceBr = (str: string) => {
  if (!str.includes('<br/>')) {
    return str;
  }
  const reg = /\<br\/\>/g;
  return str.replace(reg, '\n');
};
export const replaceComma = (str: string) => {
  const reg = /,/g;
  return str.replace(reg, '，');
};

export const removeLineNum = (str: string) => {
  const reg2 = /\d+\$/g;
  const reg7 = /\d+＄/g;

  const reg5 = /\$/g;
  const reg6 = /＄/g;

  const removed = str
    .replace(reg2, '$')
    .replace(reg7, '$')
    .replace(reg5, '$')
    .replace(reg6, '$');
  return removed;
};
export const isNumber = (str: string, errMsg: string) => {
  const int = parseInt(str, 10);

  if (Number.isInteger(int)) {
    return str;
  }
  throw new BadRequestException(errMsg);
};
export const breakClass = (str: string) => {
  const s1 = str.split('$').filter(content => content !== '');
  return s1.slice(1);
  // .map(s => s.trim());
};

interface Category {
  readonly category: string;
  readonly content: string;
}
export const genClass = (classes: ReadonlyArray<string>) => {
  return classes.reduce(
    (
      pre: ReadonlyArray<Category>,
      curr: string,
      i,
      arr,
    ): ReadonlyArray<Category> => {
      const idx = curr.indexOf('\n');
      const category = curr.slice(0, idx).trim();
      const content =
        i === arr.length - 1
          ? curr.slice(idx + 1)
          : curr.slice(idx + 1, curr.length - 1);
      return [...pre, { category, content }];
    },
    [],
  );
};

export const removeNumberFromSize = (str: string) => {
  if (str.length >= 4) {
    const number = parseInt(str, 10);
    if (number > 150) {
      const letters = str.replace(`${number}`, '');
      return letters;
    }
    return str;
  }
  return str;
};

export const parseSizeAndCount = (str: string, totalCount?: number) => {
  // tslint:disable-next-line:prefer-const
  let total = 0;
  const colorAndSizeArr = str
    .split('\n')
    .map(item => item.trim())
    .filter(v => v !== '');
  // tslint:disable-next-line:readonly-array
  const colorIdx: number[] = [];
  colorAndSizeArr.forEach((item, idx) => {
    if (item.indexOf('色') !== -1) {
      colorIdx.push(idx);
    }
  });
  if (colorIdx.length === 0) {
    genError('尺码或留版没有写颜色哦，请重新编辑，要有色这个关键词');
  }

  const clothesMsg = colorIdx.map((idx, i, arr) => {
    let color: string;
    let sizeArr: string[];

    color = colorAndSizeArr[idx];
    if (i === 0 && idx === 0) {
      sizeArr = colorAndSizeArr.slice(1, arr[1]);
    } else if (i === arr.length) {
      sizeArr = colorAndSizeArr.slice(idx + 1);
    } else {
      sizeArr = colorAndSizeArr.slice(idx + 1, arr[i + 1]);
    }

    const sizeAndCount = sizeArr.map(item => {
      const transferSize = (size: string) => {
        let xs = 0;
        for (const letter of size) {
          if (letter === 'X') {
            xs += 1;
          }
        }
        if (xs < 2) {
          return size;
        }
        return `${xs}XL`;
      };
      const [size, count] = item
        .replace(/＝/g, '=')
        .split('=')
        .map(s => s.trim());
      const regM = /m/g;
      const regS = /s/g;
      const regL = /l/g;
      const regX = /x/g;
      const realSize = size
        .replace(regS, 'S')
        .replace(regL, 'L')
        .replace(regM, 'M')
        .replace(regX, 'X');
      total += parseInt(count, 10);
      const s = {
        count: parseInt(count, 10),
        size: transferSize(removeNumberFromSize(realSize)),
      } as Rule;
      return s;
    });

    return {
      count: sizeAndCount.reduce((pre, curr) => pre + curr.count, 0),
      color,
      rules: sizeAndCount,
    };
  });

  if (totalCount && total !== totalCount) {
    genError(
      `上传订单的总数不对， 请重新计算检查一下, 订单写着 ${totalCount} 件, 但计算后是 ${total} 件`,
    );
  }
  return clothesMsg;
};

export const formatCategory = (categories: ReadonlyArray<Category>) => {
  // tslint:disable-next-line:prefer-const
  let obj = {};
  if (categories.length < type.length) {
    if (type.filter(str => str === 'editService').length > categories.length) {
      throw new BadRequestException('订单解析错误', '你可能有些信息漏了写');
    }
  }
  categories.forEach(item => {
    const idx = chineseType.indexOf(item.category);
    if (idx === -1) {
      genError(`请检查订单信息的「${item.category}」标题， 可能中文写错了`);
    }
    obj = {
      ...obj,
      [type[idx]]: item.content,
    };
  });
  return obj as {
    readonly transactionCode: string;
    readonly productName: string;
    readonly material: string;
    readonly pattern: string;
    readonly printing: string;
    readonly printingRemark: string;
    readonly detail: string;
    readonly sizeAndNum: string;
    readonly totalNum: string;
    readonly price: string;
    readonly total: string;
    readonly address: string;
    readonly seller: string;
    readonly express: string;
    readonly remark: string;
    readonly sendTime: string;
    readonly company: string;
    readonly isHurry: boolean;
    readonly keep: string;
    readonly editService: string;
  };
};

export const parseTotal = (str: string) => {
  return parseInt(str.split('\n')[0], 10);
};

export const parseClient = (str: string) => {
  if (str === '待定') {
    return {
      clientAddress: '',
      clientName: '',
      clientPhone: '',
    };
  }
  const [clientAddress, clientName, clientPhone] = str.split('，');
  const errMsg =
    '以「地址，姓名，手机」这个格式填写地址，你可能填错了。如果不需要地址，填待定';
  if (!clientAddress) {
    throw new BadRequestException('缺少地址', errMsg);
  } else if (!clientName) {
    throw new BadRequestException('缺少客户姓名', errMsg);
  } else if (!clientPhone) {
    throw new BadRequestException('缺少手机号码', errMsg);
  }
  return {
    clientAddress,
    clientName,
    clientPhone,
  };
};

export const parseAgent = (str: string) => {
  const agents = ['撕人', '地雷', '晓凯'];
  // const s1 = encodeURIComponent(agents[0]);
  // const s2 = encodeURIComponent(str.trim());
  if (agents.every(a => !str.includes(a))) return false;
  const agentMessage = [
    { sender: '定制有嘻哈' },
    { sender: '致服团队', senderPhone: '18630402156' },
    { sender: '宏创服饰' },
  ];
  const idx = agents.findIndex(a => str.includes(a));
  return agentMessage[idx];
};

export const parsePattern = (str: string) => {
  let scaleType = -1;
  let scaleText = '';
  let finalText = str;
  const exist =
    str.includes('（') &&
    str.includes('）') &&
    str.includes('码') &&
    str.includes('放大');
  let reallyExist = false;

  const keywords = ['儿童放大一码', '成人放大一码', '全放大一码'];
  keywords.forEach((word, i) => {
    if (str.includes(word)) {
      reallyExist = true;
      const idx = str.indexOf(word);
      finalText = str.slice(0, idx - 1);
      scaleType = i;
      scaleText = word;
    }
  });
  if (exist && !reallyExist) {
    throw new BadRequestException(
      '放大格式错误',
      '放大码数的可选项只有「儿童放大一码」，「成人放大一码」，「全放大一码」，必须精确地填写',
    );
  }
  return {
    finalText,
    scaleType,
    scaleText,
  };
};

const parseOrderName = (
  productName,
  client: any,
  company: string,
  pattern: string,
) => {
  const cityIdx = client.clientAddress.indexOf('市');
  const area = client.clientAddress.slice(0, cityIdx + 1);
  return `${area}${company}${productName}${pattern}`;
};

const parseServicer = (str: string) => {
  const reg = '－';
  const theSeller = str.replace(reg, '-').split('-')[0];
  const seller005 = ['白兔', '黑兔', '阿叉'];
  let is005 = false;
  seller005.forEach(seller => {
    if (theSeller.includes(seller)) {
      is005 = true;
    }
  });
  if (is005) {
    return '005';
  } else {
    return '010';
  }
};
const parseServerce = (str: string) => {
  const agent = parseAgent(str);
  if (agent && agent.sender !== '宏创服饰') {
    return '006';
  }
  const reg = '－';
  const service = str.replace(reg, '-').split('-')[1];
  return service;
};
export const parseRemark = (str: string) => {
  if (str === '无') {
    return '';
  }
  return str;
};
export const parseDate = (str: string) => {
  const willRemoveIdx = str.indexOf('之前');
  const afterSliceStr =
    willRemoveIdx !== -1 ? str.slice(0, willRemoveIdx) : str;
  const isYear = afterSliceStr.indexOf('年');
  const monthIdx = afterSliceStr.indexOf('月');
  const dayIdx = afterSliceStr.indexOf('日');
  const year =
    isYear !== -1 ? afterSliceStr.slice(0, isYear) : new Date().getFullYear();
  const month =
    isYear !== -1
      ? afterSliceStr.slice(isYear, monthIdx)
      : afterSliceStr.slice(0, monthIdx);
  const day = afterSliceStr.slice(monthIdx + 1, dayIdx);
  const fullTime = `${year}-${month}-${day}`;
  if (!moment(fullTime, 'YYYY-MM-DD').isValid()) {
    genError('发货时间格式错误，请检查一下');
  }

  return moment(fullTime, 'YYYY-MM-DD').valueOf();
};

export const parseSendTime = (str: string) => {
  const error = new BadRequestException(
    '下单信息解析错误',
    '请检查发货日期格式，请以「XX月XX日」或「XX.XX」的日期格式填写',
  );
  let isHurry = false;
  let date = str;
  const idx = str.indexOf('（加急）');
  if (idx !== -1) {
    isHurry = true;
    date = date.slice(0, idx);
  }
  const dotIdx = date.indexOf('.');
  if (dotIdx !== -1) {
    let month = date.slice(0, dotIdx);
    let day = date.slice(dotIdx + 1);
    if (month.length > 1) {
      month = month.slice(month.length - 2, month.length);
    }
    if (Number.isNaN(parseInt(month, 10))) {
      month = month.slice(month.length - 1, month.length);
      if (Number.isNaN(parseInt(month, 10))) {
        throw error;
      }
    }

    if (day.length > 1) {
      day = day.slice(0, 2);
    }
    if (Number.isNaN(parseInt(day, 10))) {
      throw error;
    }
    return {
      date: `${month}月${day}日`,
      day,
      isHurry,
    };
  }

  const monthIdx = date.indexOf('月');
  let dayNumber = date.slice(monthIdx + 1, monthIdx + 3);

  let monthNumber = date.slice(0, monthIdx);

  if (monthNumber.length > 1) {
    monthNumber = monthNumber.slice(monthNumber.length - 2, monthNumber.length);
  }
  if (Number.isNaN(parseInt(monthNumber, 10))) {
    monthNumber = monthNumber.slice(monthNumber.length - 1, monthNumber.length);
    if (Number.isNaN(parseInt(monthNumber, 10))) {
      throw error;
    }
  }
  if (dayNumber.length > 1) {
    dayNumber = dayNumber.slice(0, 2);
  }
  if (Number.isNaN(parseInt(dayNumber, 10))) {
    throw error;
  }
  return {
    day: dayNumber,
    date: `${monthNumber}月${dayNumber}日`,
    isHurry,
  };
};

export const parseCompany = (str: string) => {
  const idx = str.indexOf('（新）' || '（老）');
  if (idx === -1) return str;
  return str.slice(0, idx);
};

export const checkTotal = (
  total: number,
  totalNumber: number,
  price: number,
) => {
  // if (total !== totalNumber * price) {
  //   throw new Error('请检查一遍金额是否计算错误');
  // }
};
export const parseCommon = (item: string) => {
  if (typeof item !== 'string') {
    genError('item have to be a string');
  }

  const afterGen = genClass(
    breakClass(removeLineNum(replaceBr(replaceComma(item)))),
  );

  const afterFormat = formatCategory(afterGen);
  const clothesMsg = parseSizeAndCount(
    afterFormat.sizeAndNum,
    parseInt(afterFormat.totalNum, 10),
  );
  const keep = afterFormat.keep !== '无' && parseSizeAndCount(afterFormat.keep);
  const client = parseClient(afterFormat.address);
  const total = parseTotal(afterFormat.total);
  // checkTotal(
  //   total,
  //   parseInt(afterFormat.totalNum, 10),
  //   parseInt(afterFormat.price, 10),
  // );
  const pattern = parsePattern(afterFormat.pattern);
  const sendTime = parseSendTime(afterFormat.sendTime);
  // isNumber(afterFormat.transactionCode, '单号格式错误');
  isNumber(afterFormat.price, '单价格式错误');
  isNumber(afterFormat.total, '总数格式错误');
  isNumber(afterFormat.totalNum, '总价格式错误');
  const agent = parseAgent(afterFormat.seller);
  console.log('agent:', agent);
  const final = {
    ...afterFormat,
    ...client,
    material: afterFormat.material,
    orderName: parseOrderName(
      afterFormat.productName,
      client,
      afterFormat.company,
      pattern.finalText,
    ),
    pattern: pattern.finalText,
    scaleType: pattern.scaleType,
    scaleText: pattern.scaleText,
    clientCompany: afterFormat.company,
    price: parseInt(afterFormat.price, 10),
    clothesMsg,
    keep,
    total,
    sender: agent && agent.sender,
    senderPhone: agent && agent.senderPhone,
    package: agent && '空白透明包装袋',
    remark: parseRemark(afterFormat.remark),
    isHurry: sendTime.isHurry,
    sendTime: sendTime.date,
    sendDay: sendTime.day,
    totalNum: parseInt(afterFormat.totalNum, 10),
    servicer: parseServicer(afterFormat.seller),
    service: parseServerce(afterFormat.seller),
    printingRemark:
      afterFormat.printingRemark === '无' ? '' : afterFormat.printingRemark,
  };
  delete final.sizeAndNum;
  delete final.address;
  return final;
};
