import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {IsString, IsOptional, IsEnum, IsObject, IsUrl, MaxLength} from 'class-validator';
import {ProjectStatus} from '@prisma/client';

export class CreateProjectDto {
  @ApiProperty({description: '项目名称', maxLength: 100})
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({description: '项目描述', maxLength: 2000})
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({description: '封面图URL'})
  @IsOptional()
  @IsUrl()
  cover?: string;

  @ApiPropertyOptional({description: '项目状态', enum: ProjectStatus})
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @ApiPropertyOptional({description: '工作流数据 (React Flow 格式)'})
  @IsOptional()
  @IsObject()
  workflow?: Record<string, any>;

  @ApiPropertyOptional({description: '时间线数据'})
  @IsOptional()
  @IsObject()
  timeline?: Record<string, any>;

  @ApiPropertyOptional({description: '项目设置'})
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}
