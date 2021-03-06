import { crop, info } from 'easyimage';
import * as fs from 'fs';
import * as shortid from 'shortid';
import * as path from 'path';
import axios from 'axios';

export const cropImage = async (
  srcPath: string,
  ratio?: string,
): Promise<{
  path: string;
  mimetype: string;
  size: number;
  filename: string;
}> => {
  const name = `${Date.now()}-${shortid.generate()}`;
  const dotIdx = srcPath.lastIndexOf('.');
  const type = srcPath.slice(dotIdx + 1);
  const dst = path.resolve(process.cwd(), 'tmp', `${name}.${type}`);
  const stream = fs.createWriteStream(dst);
  const response = await axios({
    url: srcPath,
    method: 'GET',
    responseType: 'stream',
  });

  response.data.pipe(stream);
  return new Promise<any>((resolve, reject) => {
    const obj = { path: dst, mimetype: type, filename: `${name}`, size: 0 };
    stream.on('finish', async () => {
      const { height, width } = await info(dst);
      const isHeight = width > height;
      const isShare = ratio === 'share';
      if (!isShare) {
        await crop({
          src: dst,
          autoOrient: false,
          dst,
          cropWidth: isHeight ? height : width,
        });
      } else if (isShare) {
        await crop({
          src: dst,
          autoOrient: false,
          dst,
          cropWidth: isHeight ? height : width,
          cropHeight: isHeight ? height * 0.8 : width * 0.8,
          y: isHeight ? height * 0.1 : width * 0.1,
        });
      }
      resolve(obj);
    });
    stream.on('error', () => reject('error'));
  });
};
