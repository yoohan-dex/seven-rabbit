import {
  IsString,
  IsDate,
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { UserInfo } from './interface';

export class WxUserDto {
  @IsNumber() readonly id: number;

  @IsString() readonly openId: string;

  @IsString() readonly skey: string;

  @IsString() readonly sessionkey: string;

  @IsOptional()
  @IsArray()
  readonly phone: string[];

  @IsOptional()
  @IsNotEmpty()
  readonly userInfo: UserInfo;

  @IsDate() readonly createTime: Date;

  @IsDate() readonly lastVisitTime: Date;

  @IsOptional()
  @IsArray()
  readonly roles: string[];
}

export class BindPhoneData {
  @IsString() readonly phone: string;
  @IsString() readonly code: string;
  @IsBoolean() readonly isWechat: boolean;
}
