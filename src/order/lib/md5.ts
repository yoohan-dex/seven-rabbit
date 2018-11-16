import * as crypto from 'crypto';
import * as Case from 'case';

export const md5 = str => {
  console.log('start md5');
  return crypto
    .createHash('md5')
    .update(str, 'utf8')
    .digest('hex');
};

export const upperCase = str => {
  console.log('start upper');
  return Case.upper(str);
};

export const expressMd5 = str => upperCase(md5(str));
