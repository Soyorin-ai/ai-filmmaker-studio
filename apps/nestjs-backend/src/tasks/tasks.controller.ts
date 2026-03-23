import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {JwtAuthGuard} from '../auth/guards/jwt-auth.guard';
import {TasksService} from './tasks.service';
import {CreateImageTaskDto} from './dto/create-image-task.dto';
import {CreateVideoTaskDto} from './dto/create-video-task.dto';
import {CurrentUser} from '../auth/decorators/current-user.decorator';
import {type JwtPayload} from '../auth/strategies/jwt.strategy';
import {TaskType, TaskStatus} from '@prisma/client';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  /**
   * 创建图片生成任务
   */
  @Post('image')
  async createImageTask(
    @Body() dto: CreateImageTaskDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const task = await this.tasksService.createImageTask(user.sub, {
      prompt: dto.prompt,
      negativePrompt: dto.negativePrompt,
      imageSize: dto.imageSize,
      aspectRatio: dto.aspectRatio,
      referenceImage: dto.referenceImage,
      projectId: dto.projectId,
    });

    return {
      success: true,
      data: task,
    };
  }

  /**
   * 创建视频生成任务
   */
  @Post('video')
  async createVideoTask(
    @Body() dto: CreateVideoTaskDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const task = await this.tasksService.createVideoTask(user.sub, {
      prompt: dto.prompt,
      type: dto.type,
      resolution: dto.resolution,
      duration: dto.duration,
      generateAudio: dto.generateAudio,
      firstFrameImage: dto.firstFrameImage,
      lastFrameImage: dto.lastFrameImage,
      projectId: dto.projectId,
    });

    return {
      success: true,
      data: task,
    };
  }

  /**
   * 获取任务列表
   */
  @Get()
  async getTasks(
    @CurrentUser() user: JwtPayload,
    @Query('type') type?: TaskType,
    @Query('status') status?: TaskStatus,
    @Query('projectId') projectId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const result = await this.tasksService.getUserTasks(user.sub, {
      type,
      status,
      projectId,
      limit: limit ? parseInt(limit, 10) : 20,
      offset: offset ? parseInt(offset, 10) : 0,
    });

    return {
      success: true,
      data: result.tasks,
      meta: {
        total: result.total,
        limit: limit ? parseInt(limit, 10) : 20,
        offset: offset ? parseInt(offset, 10) : 0,
      },
    };
  }

  /**
   * 获取任务详情
   */
  @Get(':taskId')
  async getTask(
    @Param('taskId') taskId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const task = await this.tasksService.getTask(taskId, user.sub);

    if (!task) {
      return {
        success: false,
        error: 'Task not found',
      };
    }

    return {
      success: true,
      data: task,
    };
  }

  /**
   * 取消任务
   */
  @Delete(':taskId')
  async cancelTask(
    @Param('taskId') taskId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const task = await this.tasksService.cancelTask(taskId, user.sub);

    if (!task) {
      return {
        success: false,
        error: 'Task not found',
      };
    }

    return {
      success: true,
      data: task,
    };
  }
}
