import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import * as FormData from 'form-data';
import * as request from 'request';

import { getAccessToken } from './getAccessToken';
import Axios from 'axios';
const readdir = util.promisify(fs.readdir);

export const sendFileToWechatServer = async () => {
  let token: string;
  const type = 'image';
  try {
    const accessToken = await getAccessToken();
    token = accessToken;
  } catch (err) {}
  const url = `https://api.weixin.qq.com/cgi-bin/media/upload?access_token=${token}&type=${type}`;
  const dirPath = path.resolve(process.cwd(), 'wechatCode');
  const dirContent = await readdir(dirPath);
  const functions = dirContent.map(async content => {
    const contentPath = path.resolve(dirPath, content);
    const stream = fs.createReadStream(contentPath);
    const formData = new FormData();
    formData.append('media', stream);
    formData.append('hack', '');
    try {
      const result = await new Promise<string>((res, rej) => {
        const r = request.post(
          {
            url,
          },
          (err, _, body) => {
            if (err) {
              rej(err);
            }
            res(body);
          },
        );
        const form = r.form();
        form.append('media', stream);
        form.append('hack', '');
      });
      return JSON.parse(result) as {
        media_id: string;
      };
    } catch (err) {
      console.log('err', err);
    }
  });
  return await Promise.all(functions);
};
