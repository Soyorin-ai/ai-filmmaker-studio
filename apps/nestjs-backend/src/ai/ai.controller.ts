import {Controller, Post, Get, Body, Param, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from '../auth/guards/jwt-auth.guard';
import {AiService} from './ai.service';
import {CreateImageTaskDto} from './dto/create-image-task.dto';
import {CreateVideoTaskDto} from './dto/create-video-task.dto';
import {CurrentUser} from '../auth/decorators/current-user.decorator';
import {type JwtPayload} from '../auth/strategies/jwt.strategy';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /**
   * 生成图片
   */
  @Post('image/generate')
  async generateImage(
    @Body() dto: CreateImageTaskDto,
    @CurrentUser() _user: JwtPayload,
  ) {
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

  /**
   * 生成视频
   */
  @Post('video/generate')
  async generateVideo(
    @Body() dto: CreateVideoTaskDto,
    @CurrentUser() _user: JwtPayload,
  ) {
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

  /**
   * 查询视频任务状态
   */
  @Get('video/task/:taskId')
  async getVideoTaskStatus(
    @Param('taskId') taskId: string,
    @CurrentUser() _user: JwtPayload,
  ) {
    const result = await this.aiService.getVideoTaskStatus(taskId);

    return {
      success: result.status !== 'failed',
      data: result,
      error: result.error,
    };
  }
}
