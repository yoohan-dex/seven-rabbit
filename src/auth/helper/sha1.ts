import * as crypto from 'crypto';

export default message => {
  return crypto
    .createHash('sha1')
    .update(message, 'utf8')
    .digest('hex');
};
