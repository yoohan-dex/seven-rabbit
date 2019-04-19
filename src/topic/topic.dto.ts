import { IsString, IsNumber, IsArray, IsOptional } from 'class-validator';

export class TopicDto {
  @IsOptional()
  @IsString()
  readonly title?: string;
  @IsNumber() readonly cover: number;

  @IsOptional()
  @IsString()
  readonly type: 'poster' | 'product';

  @IsNumber() readonly background: number;

  @IsArray() readonly detail: number[];
}
