import * as moment from 'moment';
import { chineseType, type } from './type';
import { ClothesMsg, Rule, Material } from './gen-order.entity';

export const replaceBr = (str: string) => {
  if (!str.includes('<br/>')) {
    return str;
  }
  const reg = /\<br\/\>/g;
  return str.replace(reg, '\n');
};
export const removeLineNum = (str: string) => {
  const reg = /\d+#/g;
  return str.replace(reg, '#');
};

export const breakClass = (str: string) =>
  str
    .split('#')
    .filter(content => content !== '')
    .slice(1);
// .map(s => s.trim());

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

export const parseSizeAndCount = (str: string, totalCount: number) => {
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
    throw new Error('尺码格式错误，请重新编辑');
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
      const [size, count] = item.split('=').map(s => s.trim());

      total += parseInt(count, 10);
      return {
        count: parseInt(count, 10),
        size,
      } as Rule;
    });

    return {
      count: sizeAndCount.reduce((pre, curr) => pre + curr.count, 0),
      color,
      rules: sizeAndCount,
    };
  });
  if (total !== totalCount) {
    throw new Error(
      `上传订单的总数不对， 请重新计算检查一下, 订单写着 ${totalCount} 件, 但计算后是 ${total} 件`,
    );
  }
  return clothesMsg;
};

export const formatCategory = (categories: ReadonlyArray<Category>) => {
  // tslint:disable-next-line:prefer-const
  let obj = {};
  categories.forEach(item => {
    const idx = chineseType.indexOf(item.category);
    obj = {
      ...obj,
      [type[idx]]: item.content,
    };
  });
  return obj as {
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
  };
};

export const parseTotal = (str: string) => {
  return parseInt(str.split('\n')[0], 10);
};

export const parseClient = (str: string) => {
  const [clientAddress, clientName, clientPhone] = str.split('，');
  return {
    clientAddress,
    clientName,
    clientPhone,
  };
};

export const parseMaterial = (str: string): Material[] => {
  const ms = str.split('m');
  ms.shift();
  return ms.map((m, idx) => {
    const [primary, addition] = m.replace(/\n/g, '').split('p');
    return {
      num: idx + 1,
      primary: primary || ' ',
      addition: addition || ' ',
    };
  });
};

export const parsePattern = (str: string) => {
  let scaleType = -1;
  let scaleText = '';
  let finalText = str;
  const keywords = ['儿童放大一码', '成人放大一码', '全放大一码'];
  keywords.forEach((word, i) => {
    if (str.includes(word)) {
      const idx = str.indexOf(word);
      finalText = str.slice(0, idx - 1);
      scaleType = i;
      scaleText = word;
    }
  });
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
  const seller005 = ['白兔', '黑兔', '阿叉'];
  let is005 = false;
  seller005.forEach(seller => {
    if (str.includes(seller)) {
      is005 = true;
    }
  });
  if (is005) {
    return '005';
  } else {
    return '010';
  }
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
    throw new Error('发货时间格式错误，请检查一下');
  }

  return moment(fullTime, 'YYYY-MM-DD').valueOf();
};

export const checkTotal = (
  total: number,
  totalNumber: number,
  price: number,
) => {
  if (total !== totalNumber * price) {
    throw new Error('请检查一遍金额是否计算错误');
  }
};
export const parseCommon = (item: string) => {
  if (typeof item !== 'string') {
    throw new Error('item have to be a string');
  }

  const afterGen = genClass(breakClass(removeLineNum(replaceBr(item))));
  const afterFormat = formatCategory(afterGen);
  const clothesMsg = parseSizeAndCount(
    afterFormat.sizeAndNum,
    parseInt(afterFormat.totalNum, 10),
  );
  const client = parseClient(afterFormat.address);
  const total = parseTotal(afterFormat.total);
  checkTotal(
    total,
    parseInt(afterFormat.totalNum, 10),
    parseInt(afterFormat.price, 10),
  );
  const pattern = parsePattern(afterFormat.pattern);
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
    sendTime: afterFormat.sendTime,
    clothesMsg,
    total,
    totalNum: parseInt(afterFormat.totalNum, 10),
    servicer: parseServicer(afterFormat.seller),
  };
  delete final.sizeAndNum;
  delete final.address;
  return final;
};
