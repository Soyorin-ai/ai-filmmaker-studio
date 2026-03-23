import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsUrl, IsOptional, IsBoolean, IsArray, IsObject, IsNumber } from 'class-validator';
import { AssetType, AssetSource } from '@prisma/client';

export class CreateAssetDto {
  @ApiProperty({ description: '素材类型', enum: AssetType })
  @IsEnum(AssetType)
  type!: AssetType;

  @ApiProperty({ description: '素材名称' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ description: '原始文件名' })
  @IsOptional()
  @IsString()
  originalName?: string;

  @ApiProperty({ description: '文件URL' })
  @IsUrl()
  url!: string;

  @ApiPropertyOptional({ description: '缩略图URL' })
  @IsOptional()
  @IsUrl()
  thumbnail?: string;

  @ApiProperty({ description: '文件大小（字节）' })
  @IsNumber()
  fileSize!: number;

  @ApiPropertyOptional({ description: 'MIME类型' })
  @IsOptional()
  @IsString()
  mimeType?: string;

  @ApiPropertyOptional({ description: '元数据（宽高、时长等）' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiProperty({ description: '素材来源', enum: AssetSource })
  @IsEnum(AssetSource)
  source!: AssetSource;

  @ApiPropertyOptional({ description: '所属项目ID' })
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional({ description: '关联任务ID' })
  @IsOptional()
  @IsString()
  taskId?: string;

  @ApiPropertyOptional({ description: '标签' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: '是否收藏' })
  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;

  @ApiPropertyOptional({ description: '是否公开' })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
