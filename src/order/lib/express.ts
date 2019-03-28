import axios from 'axios';
import { expressMd5 } from './md5';
import { translateCompany } from './translateCompany';

const { EXPRESS_KEY, EXPRESS_CUSTOMER, EXPRESS_PULL_API } = process.env;
export const mergeParams = (customer: string, key: string, params: string) => {
  return `${params}${key}${customer}`;
};

export const encryptQuery = (params: string) => {
  return expressMd5(mergeParams(EXPRESS_CUSTOMER, EXPRESS_KEY, params));
};

const format = obj =>
  Object.keys(obj).reduce((prev, cur, i, arr) => {
    return prev + `${cur}=${obj[cur]}${i === arr.length - 1 ? '' : '&'}`;
  }, '');

export const queryOrder = async (
  orderNum: string,
  orderCom: '顺丰' | '德邦' | '韵达',
) => {
  const params = {
    num: orderNum,
    com: translateCompany(orderCom),
  };
  const paramStr = JSON.stringify(params);
  try {
    const res = await axios.post(
      EXPRESS_PULL_API,
      format({
        customer: EXPRESS_CUSTOMER,
        sign: encryptQuery(paramStr),
        param: paramStr,
      }),
    );
    return res.data;
  } catch (e) {
    throw new Error(e);
  }
  return '';
};
