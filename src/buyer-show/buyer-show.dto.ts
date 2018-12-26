import { IsString, IsOptional, IsArray, IsNumber } from 'class-validator';

export class CreateBuyerShowDto {
  @IsNumber()
  @IsOptional()
  id?: number;
  @IsString()
  @IsOptional()
  readonly name?: string;

  @IsArray() readonly detail: number[];

  @IsString()
  @IsOptional()
  readonly type: 'image' | 'video';

  @IsString()
  @IsOptional()
  readonly videoUrl: string;
}
export class QueryBuyerShowDto {
  @IsOptional()
  // @IsNumber()
  page?: number;
  @IsOptional()
  // @IsNumber()
  size?: number;

  @IsOptional() type?: 'image' | 'video';
}
