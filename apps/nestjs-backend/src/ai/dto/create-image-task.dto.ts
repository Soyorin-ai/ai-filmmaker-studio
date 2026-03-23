import {IsString, IsOptional, IsIn, IsNumber, Min, Max} from 'class-validator';

export class CreateImageTaskDto {
  @IsString()
  prompt!: string;

  @IsOptional()
  @IsString()
  negativePrompt?: string;

  @IsOptional()
  @IsIn(['0.5K', '1K', '2K', '4K'])
  imageSize?: string;

  @IsOptional()
  @IsIn(['1:1', '16:9', '9:16', '4:3', '3:4', '3:2', '2:3', '1:2', '2:1', '1:3', '3:1', '1:4', '4:1', '1:8', '8:1'])
  aspectRatio?: string;

  @IsOptional()
  @IsString()
  referenceImage?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  referenceStrength?: number;
}
