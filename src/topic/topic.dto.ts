import { IsString, IsNumber, IsArray, IsOptional } from 'class-validator';

export class TopicDto {
  @IsOptional()
  @IsString()
  readonly title?: string;
  @IsNumber() readonly cover: number;

  @IsString() readonly type: 'poster' | 'product';

  @IsArray() readonly content: number[];
}