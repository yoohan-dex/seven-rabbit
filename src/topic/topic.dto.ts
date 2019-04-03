import { IsString, IsNumber, IsArray } from 'class-validator';

export class TopicDto {
  @IsString() readonly primaryTitle: string;
  @IsString() readonly secondTitle: string;
  @IsString() readonly footerTitle: string;
  @IsNumber() readonly cover: number;

  @IsString() readonly type: 'poster' | 'product';

  @IsArray() readonly content: number[];
}
