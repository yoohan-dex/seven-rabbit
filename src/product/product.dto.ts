import { IsInt, IsString, IsArray } from 'class-validator';

export class CreateProductDto {
  @IsString() readonly name: string;

  @IsInt() readonly cover: number;

  @IsInt() readonly category: number;

  @IsArray() readonly detail: number[];

  @IsArray() readonly features: number[];
}

export class UpdateProductDto extends CreateProductDto {
  @IsInt() id: number;
}

export class GetProductDto {
  category?: number;
  features?: number[];
  page?: number;
  size?: number;
}
