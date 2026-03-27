import {ApiPropertyOptional} from '@nestjs/swagger';
import {IsOptional, IsEnum, IsBoolean, IsString, IsInt, Min} from 'class-validator';
import {Type} from 'class-transformer';
import {AssetType, AssetSource} from '@prisma/client';

export class QueryAssetDto {
  @ApiPropertyOptional({description: '页码', default: 1})
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({description: '每页数量', default: 20})
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({description: '素材类型', enum: AssetType})
  @IsOptional()
  @IsEnum(AssetType)
  type?: AssetType;

  @ApiPropertyOptional({description: '素材来源', enum: AssetSource})
  @IsOptional()
  @IsEnum(AssetSource)
  source?: AssetSource;

  @ApiPropertyOptional({description: '项目ID'})
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional({description: '搜索关键词'})
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({description: '标签'})
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiPropertyOptional({description: '是否收藏'})
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isFavorite?: boolean;
}
