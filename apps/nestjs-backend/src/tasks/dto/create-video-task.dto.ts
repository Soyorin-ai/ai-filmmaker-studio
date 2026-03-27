import {IsString, IsOptional, IsIn, IsNumber, Min, Max, IsBoolean, IsUrl} from 'class-validator';

export class CreateVideoTaskDto {
  @IsString()
  prompt!: string;

  @IsIn(['text2video', 'image2video', 'frame2video'])
  type!: 'text2video' | 'image2video' | 'frame2video';

  @IsOptional()
  @IsIn(['480p', '720p', '1080p'])
  resolution?: '480p' | '720p' | '1080p';

  @IsOptional()
  @IsNumber()
  @Min(4)
  @Max(12)
  duration?: number;

  @IsOptional()
  @IsBoolean()
  generateAudio?: boolean;

  @IsOptional()
  @IsUrl()
  firstFrameImage?: string;

  @IsOptional()
  @IsUrl()
  lastFrameImage?: string;

  @IsOptional()
  @IsString()
  projectId?: string;
}
