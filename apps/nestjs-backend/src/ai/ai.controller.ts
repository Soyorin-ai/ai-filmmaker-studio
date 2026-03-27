import {Controller, Post, Get, Body, Param, UseGuards} from '@nestjs/common';
import {ApiTags, ApiOperation} from '@nestjs/swagger';
import {JwtAuthGuard} from '../auth/guards/jwt-auth.guard';
import {AiService} from './ai.service';
import {CreateImageTaskDto} from './dto/create-image-task.dto';
import {CreateVideoTaskDto} from './dto/create-video-task.dto';
import {CreateMusicTaskDto} from './dto/create-music-task.dto';

interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error?: string;
}

interface ImageGenResponse {
  imageUrl?: string;
  metadata?: {
    format?: string;
  };
}

interface VideoGenResponse {
  taskId?: string;
  status?: string;
}

interface VideoTaskResponse {
  taskId: string;
  status: string;
  progress?: number;
  videoUrl?: string;
  audioUrl?: string;
  error?: string;
}

interface MusicGenResponse {
  taskId?: string;
  status?: string;
}

interface MusicTaskResponse {
  taskId: string;
  status: string;
  progress?: number;
  audioUrl?: string;
  streamUrl?: string;
  title?: string;
  duration?: number;
  tags?: string;
  error?: string;
}

@ApiTags('AI')
@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  // ========== 图片生成 ==========

  @Post('image/generate')
  @ApiOperation({summary: '生成图片'})
  async generateImage(@Body() dto: CreateImageTaskDto): Promise<ApiResponse<ImageGenResponse>> {
    const result = await this.aiService.generateImage({
      prompt: dto.prompt,
      negativePrompt: dto.negativePrompt,
      imageSize: dto.imageSize,
      aspectRatio: dto.aspectRatio,
      referenceImage: dto.referenceImage,
      referenceStrength: dto.referenceStrength,
    });

    return {
      success: result.success,
      data: result.success
        ? {
            imageUrl: result.imageUrl,
            metadata: result.metadata,
          }
        : null,
      error: result.error,
    };
  }

  // ========== 视频生成 ==========

  @Post('video/generate')
  @ApiOperation({summary: '生成视频'})
  async generateVideo(@Body() dto: CreateVideoTaskDto): Promise<ApiResponse<VideoGenResponse>> {
    const result = await this.aiService.generateVideo({
      prompt: dto.prompt,
      type: dto.type,
      resolution: dto.resolution,
      duration: dto.duration,
      generateAudio: dto.generateAudio,
      firstFrameImage: dto.firstFrameImage,
      lastFrameImage: dto.lastFrameImage,
    });

    return {
      success: result.success,
      data: result.success
        ? {
            taskId: result.taskId,
            status: result.status,
          }
        : null,
      error: result.error,
    };
  }

  @Get('video/task/:taskId')
  @ApiOperation({summary: '查询视频任务状态'})
  async getVideoTaskStatus(@Param('taskId') taskId: string): Promise<ApiResponse<VideoTaskResponse>> {
    const result = await this.aiService.getVideoTaskStatus(taskId);

    return {
      success: result.status !== 'failed',
      data: result,
      error: result.error,
    };
  }

  // ========== 音乐生成 ==========

  @Post('music/generate')
  @ApiOperation({summary: '生成音乐'})
  async generateMusic(@Body() dto: CreateMusicTaskDto): Promise<ApiResponse<MusicGenResponse>> {
    const result = await this.aiService.generateMusic({
      prompt: dto.prompt,
      mode: dto.mode,
      model: dto.model,
      style: dto.style,
      title: dto.title,
      vocalGender: dto.vocalGender,
      negativeTags: dto.negativeTags,
      duration: dto.duration,
    });

    return {
      success: result.success,
      data: result.success
        ? {
            taskId: result.taskId,
            status: result.status,
          }
        : null,
      error: result.error,
    };
  }

  @Get('music/task/:taskId')
  @ApiOperation({summary: '查询音乐任务状态'})
  async getMusicTaskStatus(@Param('taskId') taskId: string): Promise<ApiResponse<MusicTaskResponse>> {
    const result = await this.aiService.getMusicTaskStatus(taskId);

    return {
      success: result.status !== 'failed',
      data: result,
      error: result.error,
    };
  }
}
