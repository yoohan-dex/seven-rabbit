import { ApiModelProperty } from '@nestjs/swagger';
import { IsString, IsArray } from 'class-validator';

export class CreateFeatureDto {
  @ApiModelProperty()
  @IsString()
  readonly name: string;
}

export class CreateFilterDto {
  @ApiModelProperty()
  @IsString()
  readonly name: string;

  @ApiModelProperty()
  @IsArray()
  readonly features: CreateFeatureDto[];
}
export class UpdateFeatureDto extends CreateFeatureDto {
  readonly id?: number;
}

export class UpdateFilterDto extends CreateFilterDto {
  readonly id: number;
  readonly features: UpdateFeatureDto[];
}
