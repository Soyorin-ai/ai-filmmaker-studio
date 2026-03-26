import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  Max,
  MaxLength,
} from 'class-validator';

/**
 * 音乐生成模式
 */
export enum MusicMode {
  SIMPLE = 'simple', // 简单模式：AI自动生成歌词
  CUSTOM = 'custom', // 自定义模式：用户提供歌词
  INSTRUMENTAL = 'instrumental', // 纯音乐模式
}

/**
 * 音乐模型
 */
export enum MusicModel {
  V4 = 'suno-v4',
  V4_5 = 'suno-v4.5',
  V4_5_PLUS = 'suno-v4.5plus',
  V4_5_ALL = 'suno-v4.5all',
  V5 = 'suno-v5',
}

/**
 * 人声性别
 */
export enum VocalGender {
  MALE = 'm',
  FEMALE = 'f',
}

/**
 * 创建音乐任务 DTO
 */
export class CreateMusicTaskDto {
  @ApiProperty({description: '音乐描述或歌词', example: '一首关于爱情的温柔民谣'})
  @IsString()
  @MaxLength(5000)
  prompt!: string;

  @ApiProperty({
    description: '生成模式',
    enum: MusicMode,
    example: MusicMode.SIMPLE,
  })
  @IsEnum(MusicMode)
  mode!: MusicMode;

  @ApiPropertyOptional({
    description: '音乐模型',
    enum: MusicModel,
    default: MusicModel.V4,
  })
  @IsOptional()
  @IsEnum(MusicModel)
  model?: MusicModel;

  @ApiPropertyOptional({
    description: '音乐风格标签（自定义模式必填）',
    example: 'pop, ballad, emotional, female vocals',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  style?: string;

  @ApiPropertyOptional({
    description: '歌曲标题（自定义模式必填）',
    example: '八千年的等待',
  })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  title?: string;

  @ApiPropertyOptional({
    description: '人声性别',
    enum: VocalGender,
  })
  @IsOptional()
  @IsEnum(VocalGender)
  vocalGender?: VocalGender;

  @ApiPropertyOptional({
    description: '负向风格标签（要排除的风格）',
    example: 'heavy metal, distorted guitar',
  })
  @IsOptional()
  @IsString()
  negativeTags?: string;

  @ApiPropertyOptional({
    description: '目标时长（秒）',
    minimum: 30,
    maximum: 240,
    default: 90,
  })
  @IsOptional()
  @IsInt()
  @Min(30)
  @Max(240)
  duration?: number;
}
