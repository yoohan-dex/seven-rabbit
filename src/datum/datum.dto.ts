import { IsString, IsNumber } from 'class-validator';

export class SimpleDataDto {
  @IsString() readonly followUserId: string;
  @IsNumber() readonly productId: number;
  @IsNumber() readonly type: 0 | 1 | 2 | 3;
}
