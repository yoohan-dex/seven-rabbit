import { IsNumber, IsOptional } from 'class-validator';

export class SimpleDataDto {
  @IsNumber() readonly productId: number;
  @IsNumber() readonly type: 0 | 1 | 2 | 3;
  @IsNumber()
  @IsOptional()
  readonly followUserId?: number;
}
