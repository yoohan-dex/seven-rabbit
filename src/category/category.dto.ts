import { ApiModelProperty } from '@nestjs/swagger';

import { IsString, IsInt, IsNumber, IsArray } from 'class-validator';

export class CreateCategoryDto {
  @ApiModelProperty()
  @IsString()
  readonly name: string;

  @ApiModelProperty()
  @IsNumber()
  readonly image: number;

  @ApiModelProperty()
  @IsArray()
  readonly filters: number[];

  @ApiModelProperty()
  @IsNumber()
  readonly orderId: number;
}

export class UpdateCategoryDto extends CreateCategoryDto {
  @IsNumber() readonly id: number;
}
