import { BadRequestException } from '@nestjs/common';
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { Signale } from 'signale';
import * as chalk from 'chalk';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

const options = {
  scope: 'Bad Request',
  types: {
    error: {
      color: 'cyan',
    },
  },
};
const custom = new Signale(options);

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value, metadata: ArgumentMetadata) {
    const { metatype } = metadata;
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = plainToClass(metatype, value);
    const errors = await validate(object, { whitelist: true });
    if (errors.length > 0) {
      const msg = errors.reduce(
        (preStr, error) =>
          `${preStr}
  🙅   ${Object.keys(error.constraints).reduce(
    (pre, curr) => `  ${pre}
      ${error.constraints[curr]} `,
    '',
  )}`,
        '',
      );

      custom.error(chalk.hex('#F16B6F')(msg));
      throw new BadRequestException('传入数据有误', msg);
    }
    return object;
  }

  private toValidate(metatype): boolean {
    const types = [String, Boolean, Number, Array, Object];
    return !types.find(type => metatype === type);
  }
}
