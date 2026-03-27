import {Injectable, NotFoundException, ForbiddenException} from '@nestjs/common';
import {PrismaService} from '@next-nest-turbo-auth-boilerplate/db';
import {Project, ProjectStatus} from '@prisma/client';
import {CreateProjectDto, UpdateProjectDto, QueryProjectDto} from './dto';
import {Prisma} from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 创建项目
   */
  async create(userId: string, dto: CreateProjectDto): Promise<Project> {
    return this.prisma.project.create({
      data: {
        userId,
        name: dto.name,
        description: dto.description,
        cover: dto.cover,
        status: dto.status || ProjectStatus.DRAFT,
        workflow: dto.workflow as Prisma.InputJsonValue,
        timeline: dto.timeline as Prisma.InputJsonValue,
        settings: dto.settings as Prisma.InputJsonValue,
      },
    });
  }

  /**
   * 查询项目列表
   */
  async findAll(userId: string, query: QueryProjectDto) {
    const {page = 1, limit = 20, status, search} = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ProjectWhereInput = {
      userId,
      deletedAt: null,
    };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        {name: {contains: search, mode: 'insensitive'}},
        {description: {contains: search, mode: 'insensitive'}},
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: {updatedAt: 'desc' as const},
        include: {
          _count: {
            select: {assets: true, tasks: true},
          },
        },
      }),
      this.prisma.project.count({where}),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 获取项目详情
   */
  async findOne(userId: string, id: string) {
    const project = await this.prisma.project.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        assets: {
          where: {deletedAt: null},
          orderBy: {createdAt: 'desc' as const},
          take: 20,
        },
        tasks: {
          orderBy: {createdAt: 'desc' as const},
          take: 10,
        },
        _count: {
          select: {assets: true, tasks: true},
        },
      },
    });

    if (!project) {
      throw new NotFoundException('项目不存在');
    }

    if (project.userId !== userId) {
      throw new ForbiddenException('无权访问此项目');
    }

    return project;
  }

  /**
   * 更新项目
   */
  async update(userId: string, id: string, dto: UpdateProjectDto): Promise<Project> {
    // 检查项目是否存在且属于当前用户
    await this.findOne(userId, id);

    const updateData: Prisma.ProjectUpdateInput = {
      name: dto.name,
      description: dto.description,
      cover: dto.cover,
      status: dto.status,
      settings: dto.settings as Prisma.InputJsonValue,
    };

    if (dto.workflow) {
      updateData.workflow = dto.workflow as Prisma.InputJsonValue;
      updateData.workflowVersion = {increment: 1};
    }

    if (dto.timeline) {
      updateData.timeline = dto.timeline as Prisma.InputJsonValue;
      updateData.duration = this.calculateDuration(dto.timeline);
    }

    return this.prisma.project.update({
      where: {id},
      data: updateData,
    });
  }

  /**
   * 更新项目工作流
   */
  async updateWorkflow(userId: string, id: string, workflow: Record<string, any>): Promise<Project> {
    await this.findOne(userId, id);

    return this.prisma.project.update({
      where: {id},
      data: {
        workflow: workflow as Prisma.InputJsonValue,
        workflowVersion: {increment: 1},
      },
    });
  }

  /**
   * 更新项目时间线
   */
  async updateTimeline(userId: string, id: string, timeline: Record<string, any>): Promise<Project> {
    await this.findOne(userId, id);

    return this.prisma.project.update({
      where: {id},
      data: {
        timeline: timeline as Prisma.InputJsonValue,
        duration: this.calculateDuration(timeline),
      },
    });
  }

  /**
   * 软删除项目
   */
  async remove(userId: string, id: string): Promise<{success: boolean}> {
    await this.findOne(userId, id);

    await this.prisma.project.update({
      where: {id},
      data: {deletedAt: new Date()},
    });

    return {success: true};
  }

  /**
   * 批量删除项目
   */
  async removeMany(userId: string, ids: string[]): Promise<{success: boolean; count: number}> {
    const result = await this.prisma.project.updateMany({
      where: {
        id: {in: ids},
        userId,
        deletedAt: null,
      },
      data: {deletedAt: new Date()},
    });

    return {success: true, count: result.count};
  }

  /**
   * 归档项目
   */
  async archive(userId: string, id: string): Promise<Project> {
    await this.findOne(userId, id);

    return this.prisma.project.update({
      where: {id},
      data: {status: ProjectStatus.ARCHIVED},
    });
  }

  /**
   * 恢复项目
   */
  async restore(userId: string, id: string): Promise<Project> {
    await this.findOne(userId, id);

    return this.prisma.project.update({
      where: {id},
      data: {status: ProjectStatus.DRAFT},
    });
  }

  /**
   * 获取项目统计
   */
  async getStats(userId: string) {
    const [totalCount, statusStats, recentProjects] = await Promise.all([
      // 总项目数
      this.prisma.project.count({
        where: {userId, deletedAt: null},
      }),
      // 按状态统计
      this.prisma.project.groupBy({
        by: ['status'],
        where: {userId, deletedAt: null},
        _count: {id: true},
      }),
      // 最近项目
      this.prisma.project.findMany({
        where: {userId, deletedAt: null},
        orderBy: {updatedAt: 'desc' as const},
        take: 5,
        select: {
          id: true,
          name: true,
          cover: true,
          status: true,
          updatedAt: true,
        },
      }),
    ]);

    return {
      total: totalCount,
      byStatus: statusStats.reduce(
        (acc, item) => {
          acc[item.status] = item._count.id;
          return acc;
        },
        {} as Record<ProjectStatus, number>,
      ),
      recent: recentProjects,
    };
  }

  /**
   * 添加素材到项目
   */
  async addAsset(userId: string, projectId: string, assetId: string): Promise<Project> {
    await this.findOne(userId, projectId);

    // 更新素材的 projectId
    await this.prisma.asset.update({
      where: {id: assetId},
      data: {projectId},
    });

    // 更新项目的素材计数
    return this.prisma.project.update({
      where: {id: projectId},
      data: {assetCount: {increment: 1}},
    });
  }

  /**
   * 从项目移除素材
   */
  async removeAsset(userId: string, projectId: string, assetId: string): Promise<Project> {
    await this.findOne(userId, projectId);

    await this.prisma.asset.update({
      where: {id: assetId},
      data: {projectId: null},
    });

    return this.prisma.project.update({
      where: {id: projectId},
      data: {assetCount: {decrement: 1}},
    });
  }

  /**
   * 计算时间线总时长
   */
  private calculateDuration(timeline: Record<string, any>): number {
    if (timeline && typeof timeline === 'object' && 'duration' in timeline) {
      return Number(timeline.duration) || 0;
    }
    return 0;
  }
}
