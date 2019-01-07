import { crop, info } from 'easyimage';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

export const cropImage = async (
  srcPath: string,
): Promise<{
  path: string;
  mimetype: string;
  size: number;
  filename: string;
}> => {
  const name = Date.now();
  const dotIdx = srcPath.lastIndexOf('.');
  const type = srcPath.slice(dotIdx + 1);
  const dst = path.resolve(__dirname, 'tmp', `${name}.${type}`);
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

      await crop({
        src: dst,
        autoOrient: false,
        dst,
        cropWidth: isHeight ? height : width,
      });
      resolve(obj);
    });
    stream.on('error', () => reject('error'));
  });
};
