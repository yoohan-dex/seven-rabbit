import { IsInt, IsString, IsArray, IsBoolean } from 'class-validator';

export class CreateProductDto {
  @IsString() readonly name: string;

  @IsBoolean() readonly hot: boolean;

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
