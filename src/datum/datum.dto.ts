import { IsNumber, IsOptional } from 'class-validator';

export class SimpleDataDto {
  @IsNumber() readonly productId: number;
  @IsNumber() readonly type: 0 | 1 | 2 | 3;
  @IsOptional() readonly followUserId?: number;
}

export interface SimpleQuery {
  time?: number;
}
