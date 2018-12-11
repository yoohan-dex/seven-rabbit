import { IsString, IsOptional, IsArray, IsNumber } from 'class-validator';

export class CreateBuyerShowDto {
  @IsString()
  @IsOptional()
  readonly name?: string;

  @IsArray() readonly detail: number[];
}
export class QueryBuyerShowDto {
  @IsOptional()
  // @IsNumber()
  page?: number;
  @IsOptional()
  // @IsNumber()
  size?: number;
}
