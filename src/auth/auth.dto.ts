import {
  IsString,
  IsUUID,
  IsDate,
  ValidateNested,
  ValidateIf,
  IsNotEmpty,
} from 'class-validator';
import { UserInfo } from './interface';

export class WxUserDto {
  @IsUUID() readonly uuid: string;

  @IsString() readonly openId: string;

  @IsString() readonly skey: string;

  @IsString() readonly sessionkey: string;

  @IsNotEmpty() readonly userInfo: UserInfo;

  @IsDate() readonly createTime: Date;

  @IsDate() readonly lastVisitTime: Date;
}
