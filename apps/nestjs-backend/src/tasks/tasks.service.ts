import {Injectable, Logger, OnModuleInit} from '@nestjs/common';
import {PrismaService} from '@next-nest-turbo-auth-boilerplate/db';
import {TaskType, TaskStatus, type Task, type Prisma} from '@prisma/client';
import {AiService} from '../ai/ai.service';

@Injectable()
export class TasksService implements OnModuleInit {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async onModuleInit() {
    this.logger.log('Tasks Service initialized');
    // 启动任务处理器
    this.startTaskProcessor();
  }

  /**
   * 创建图片生成任务
   */
  async createImageTask(
    userId: string,
    params: {
      prompt: string;
      negativePrompt?: string;
      imageSize?: string;
      aspectRatio?: string;
      referenceImage?: string;
      projectId?: string;
    },
  ): Promise<Task> {
    const task = await this.prisma.task.create({
      data: {
        userId,
        projectId: params.projectId,
        type: params.referenceImage ? TaskType.IMAGE_GEN_IMAGE : TaskType.IMAGE_GEN_TEXT,
        status: TaskStatus.PENDING,
        params: params as unknown as Prisma.JsonObject,
      },
    });

    this.logger.log(`Created image task: ${task.id}`);
    return task;
  }

  /**
   * 创建视频生成任务
   */
  async createVideoTask(
    userId: string,
    params: {
      prompt: string;
      type: 'text2video' | 'image2video' | 'frame2video';
      resolution?: '480p' | '720p' | '1080p';
      duration?: number;
      generateAudio?: boolean;
      firstFrameImage?: string;
      lastFrameImage?: string;
      projectId?: string;
    },
  ): Promise<Task> {
    const taskTypeMap = {
      text2video: TaskType.VIDEO_GEN_TEXT,
      image2video: TaskType.VIDEO_GEN_IMAGE,
      frame2video: TaskType.VIDEO_GEN_FRAMES,
    };

    const task = await this.prisma.task.create({
      data: {
        userId,
        projectId: params.projectId,
        type: taskTypeMap[params.type],
        status: TaskStatus.PENDING,
        params: params as unknown as Prisma.JsonObject,
      },
    });

    this.logger.log(`Created video task: ${task.id}`);
    return task;
  }

  /**
   * 获取任务状态
   */
  async getTask(taskId: string, userId: string): Promise<Task | null> {
    return this.prisma.task.findFirst({
      where: {
        id: taskId,
        userId,
      },
      include: {
        asset: true,
      },
    });
  }

  /**
   * 获取用户任务列表
   */
  async getUserTasks(
    userId: string,
    options?: {
      type?: TaskType;
      status?: TaskStatus;
      projectId?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<{tasks: Task[]; total: number}> {
    const where: Prisma.TaskWhereInput = {
      userId,
      ...(options?.type && {type: options.type}),
      ...(options?.status && {status: options.status}),
      ...(options?.projectId && {projectId: options.projectId}),
    };

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        orderBy: {createdAt: 'desc'},
        take: options?.limit || 20,
        skip: options?.offset || 0,
        include: {
          asset: true,
        },
      }),
      this.prisma.task.count({where}),
    ]);

    return {tasks, total};
  }

  /**
   * 取消任务
   */
  async cancelTask(taskId: string, userId: string): Promise<Task | null> {
    const task = await this.prisma.task.findFirst({
      where: {id: taskId, userId},
    });

    if (!task) {
      return null;
    }

    if (task.status === TaskStatus.COMPLETED || task.status === TaskStatus.FAILED) {
      return task;
    }

    return this.prisma.task.update({
      where: {id: taskId},
      data: {status: TaskStatus.CANCELLED},
    });
  }

  /**
   * 启动任务处理器（轮询处理待执行任务）
   */
  private startTaskProcessor() {
    // 每 5 秒检查一次待处理任务
    setInterval(async () => {
      try {
        await this.processPendingTasks();
      } catch (error) {
        this.logger.error('Error processing tasks:', error);
      }
    }, 5000);
  }

  /**
   * 处理待执行任务
   */
  private async processPendingTasks() {
    const pendingTasks = await this.prisma.task.findMany({
      where: {status: TaskStatus.PENDING},
      take: 5, // 每次处理 5 个
    });

    for (const task of pendingTasks) {
      await this.processTask(task);
    }
  }

  /**
   * 处理单个任务
   */
  private async processTask(task: Task) {
    this.logger.log(`Processing task: ${task.id}, type: ${task.type}`);

    // 更新状态为运行中
    await this.prisma.task.update({
      where: {id: task.id},
      data: {
        status: TaskStatus.RUNNING,
        startedAt: new Date(),
      },
    });

    try {
      const params = task.params as Record<string, unknown>;

      switch (task.type) {
        case TaskType.IMAGE_GEN_TEXT:
        case TaskType.IMAGE_GEN_IMAGE:
          await this.processImageTask(task, params);
          break;
        case TaskType.VIDEO_GEN_TEXT:
        case TaskType.VIDEO_GEN_IMAGE:
        case TaskType.VIDEO_GEN_FRAMES:
          await this.processVideoTask(task, params);
          break;
        default:
          this.logger.warn(`Unknown task type: ${task.type}`);
          await this.prisma.task.update({
            where: {id: task.id},
            data: {
              status: TaskStatus.FAILED,
              error: 'Unknown task type',
            },
          });
      }
    } catch (error) {
      this.logger.error(`Task ${task.id} failed:`, error);
      await this.prisma.task.update({
        where: {id: task.id},
        data: {
          status: TaskStatus.FAILED,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  }

  /**
   * 处理图片生成任务
   */
  private async processImageTask(task: Task, params: Record<string, unknown>) {
    const result = await this.aiService.generateImage({
      prompt: params.prompt as string,
      negativePrompt: params.negativePrompt as string,
      imageSize: params.imageSize as string,
      aspectRatio: params.aspectRatio as string,
      referenceImage: params.referenceImage as string,
    });

    if (result.success && result.imageUrl) {
      // 创建素材
      const asset = await this.prisma.asset.create({
        data: {
          userId: task.userId,
          projectId: task.projectId,
          type: 'IMAGE',
          name: `Generated Image ${Date.now()}`,
          url: result.imageUrl,
          source: 'GENERATE',
          fileSize: BigInt(0),
        },
      });

      // 更新任务状态
      await this.prisma.task.update({
        where: {id: task.id},
        data: {
          status: TaskStatus.COMPLETED,
          assetId: asset.id,
          result: {
            imageUrl: result.imageUrl,
            metadata: result.metadata,
          } as unknown as Prisma.JsonObject,
          completedAt: new Date(),
          costImage: 1,
        },
      });

      this.logger.log(`Image task ${task.id} completed`);
    } else {
      throw new Error(result.error || 'Image generation failed');
    }
  }

  /**
   * 处理视频生成任务
   */
  private async processVideoTask(task: Task, params: Record<string, unknown>) {
    const typeMap = {
      VIDEO_GEN_TEXT: 'text2video',
      VIDEO_GEN_IMAGE: 'image2video',
      VIDEO_GEN_FRAMES: 'frame2video',
    } as const;

    const result = await this.aiService.generateVideo({
      prompt: params.prompt as string,
      type: typeMap[task.type as keyof typeof typeMap] as 'text2video' | 'image2video' | 'frame2video',
      resolution: params.resolution as '480p' | '720p' | '1080p',
      duration: params.duration as number,
      generateAudio: params.generateAudio as boolean,
      firstFrameImage: params.firstFrameImage as string,
      lastFrameImage: params.lastFrameImage as string,
    });

    if (result.success && result.taskId) {
      // 保存外部任务 ID，稍后轮询状态
      await this.prisma.task.update({
        where: {id: task.id},
        data: {
          result: {
            externalTaskId: result.taskId,
          } as unknown as Prisma.JsonObject,
        },
      });

      // 启动轮询检查视频状态
      this.pollVideoTaskStatus(task.id, result.taskId);
    } else {
      throw new Error(result.error || 'Video generation failed');
    }
  }

  /**
   * 轮询视频任务状态
   */
  private async pollVideoTaskStatus(taskId: string, externalTaskId: string) {
    const maxAttempts = 60; // 最多检查 60 次（5 分钟）
    const interval = 5000; // 5 秒检查一次

    let attempts = 0;

    const poll = async () => {
      attempts++;
      if (attempts > maxAttempts) {
        await this.prisma.task.update({
          where: {id: taskId},
          data: {
            status: TaskStatus.FAILED,
            error: 'Video generation timeout',
          },
        });
        return;
      }

      const status = await this.aiService.getVideoTaskStatus(externalTaskId);

      if (status.status === 'completed' && status.videoUrl) {
        // 创建素材
        const task = await this.prisma.task.findUnique({
          where: {id: taskId},
        });

        if (!task) return;

        const asset = await this.prisma.asset.create({
          data: {
            userId: task.userId,
            projectId: task.projectId,
            type: 'VIDEO',
            name: `Generated Video ${Date.now()}`,
            url: status.videoUrl,
            source: 'GENERATE',
            fileSize: BigInt(0),
          },
        });

        await this.prisma.task.update({
          where: {id: taskId},
          data: {
            status: TaskStatus.COMPLETED,
            assetId: asset.id,
            result: {
              videoUrl: status.videoUrl,
              audioUrl: status.audioUrl,
            } as unknown as Prisma.JsonObject,
            completedAt: new Date(),
            costVideo: (task.params as Record<string, unknown>).duration as number,
          },
        });

        this.logger.log(`Video task ${taskId} completed`);
      } else if (status.status === 'failed') {
        await this.prisma.task.update({
          where: {id: taskId},
          data: {
            status: TaskStatus.FAILED,
            error: status.error || 'Video generation failed',
          },
        });
      } else {
        // 更新进度并继续轮询
        await this.prisma.task.update({
          where: {id: taskId},
          data: {progress: status.progress || 0},
        });
        setTimeout(poll, interval);
      }
    };

    poll();
  }
}
