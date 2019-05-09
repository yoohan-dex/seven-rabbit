import {
  IsString,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsArray,
} from 'class-validator';

export class GenOrderDto {
  @IsString() readonly message: string;
  @IsNumber() readonly neckTagType: number;
  @IsOptional()
  @IsNumber()
  readonly neckTag: number;
  @IsArray() readonly preview: number[];
}