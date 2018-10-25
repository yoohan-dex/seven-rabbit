import { IsString, IsNumber, IsArray, IsOptional } from 'class-validator';

export class CreateOrderDto {
  @IsString() readonly clientName: string;
  @IsString() readonly clientCompany: string;
  @IsString() readonly clientAddress: string;
  @IsString() readonly clientPhone: string;
  @IsNumber() readonly imageId: number;
  @IsString() readonly material: string;
  @IsString() readonly pattern: string;
  @IsString() readonly printing: string;
  @IsString() readonly detail: string;
  @IsArray() readonly sizeAndNum: { color?: string; sizeAndCount: object }[];
  @IsNumber() readonly totalNum: number;
  @IsNumber() readonly price: number;
  @IsNumber() readonly total: number;
  @IsString() readonly seller: string;
  @IsString() readonly remark: string;
  @IsString() readonly express: string;
  @IsNumber() readonly sendTime: number;
}

export class ChangeCostDto {
  @IsNumber() readonly id: number;
  @IsNumber() readonly num: number;
}

export class SearchQuery {
  @IsOptional()
  @IsString()
  readonly clientPhone?: string;
  @IsOptional()
  @IsString()
  readonly clientCompany?: string;
  @IsOptional()
  @IsString()
  readonly clientName?: string;

  @IsOptional() readonly noCost?: boolean;
  @IsOptional() readonly status?: number;
  @IsOptional()
  @IsString()
  readonly time?: 'seven';
}

export class TimeQuery {
  @IsString() readonly time: 'seven';
}
