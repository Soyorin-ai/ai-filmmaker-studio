import {Injectable, NotFoundException, ForbiddenException} from '@nestjs/common';
import {PrismaService} from '@next-nest-turbo-auth-boilerplate/db';
import {Asset, AssetType} from '@prisma/client';
import {CreateAssetDto, UpdateAssetDto, QueryAssetDto} from './dto';
import {Prisma} from '@prisma/client';

@Injectable()
export class AssetsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 创建素材
   */
  async create(userId: string, dto: CreateAssetDto): Promise<Asset> {
    return this.prisma.asset.create({
      data: {
        userId,
        type: dto.type,
        name: dto.name,
        originalName: dto.originalName,
        url: dto.url,
        thumbnail: dto.thumbnail,
        fileSize: BigInt(dto.fileSize),
        mimeType: dto.mimeType,
        metadata: dto.metadata as Prisma.InputJsonValue,
        source: dto.source,
        projectId: dto.projectId,
        tags: dto.tags || [],
        isFavorite: dto.isFavorite || false,
        isPublic: dto.isPublic || false,
      },
    });
  }

  /**
   * 查询素材列表
   */
  async findAll(userId: string, query: QueryAssetDto) {
    const {page = 1, limit = 20, type, source, projectId, search, tag, isFavorite} = query;
    const skip = (page - 1) * limit;

    const where: Prisma.AssetWhereInput = {
      userId,
      deletedAt: null,
    };

    if (type) {
      where.type = type;
    }

    if (source) {
      where.source = source;
    }

    if (projectId) {
      where.projectId = projectId;
    }

    if (isFavorite !== undefined) {
      where.isFavorite = isFavorite;
    }

    if (tag) {
      where.tags = {
        has: tag,
      };
    }

    if (search) {
      where.OR = [
        {name: {contains: search, mode: 'insensitive'}},
        {originalName: {contains: search, mode: 'insensitive'}},
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.asset.findMany({
        where,
        skip,
        take: limit,
        orderBy: {createdAt: 'desc' as const},
      }),
      this.prisma.asset.count({where}),
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
   * 获取素材详情
   */
  async findOne(userId: string, id: string): Promise<Asset> {
    const asset = await this.prisma.asset.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!asset) {
      throw new NotFoundException('素材不存在');
    }

    // 检查权限：只有所有者或公开素材可以访问
    if (asset.userId !== userId && !asset.isPublic) {
      throw new ForbiddenException('无权访问此素材');
    }

    return asset;
  }

  /**
   * 更新素材
   */
  async update(userId: string, id: string, dto: UpdateAssetDto): Promise<Asset> {
    // 检查素材是否存在且属于当前用户
    await this.findOne(userId, id);

    return this.prisma.asset.update({
      where: {id},
      data: {
        name: dto.name,
        originalName: dto.originalName,
        thumbnail: dto.thumbnail,
        tags: dto.tags,
        isFavorite: dto.isFavorite,
        isPublic: dto.isPublic,
        projectId: dto.projectId,
      },
    });
  }

  /**
   * 软删除素材
   */
  async remove(userId: string, id: string): Promise<{success: boolean}> {
    // 检查素材是否存在且属于当前用户
    await this.findOne(userId, id);

    await this.prisma.asset.update({
      where: {id},
      data: {deletedAt: new Date()},
    });

    return {success: true};
  }

  /**
   * 批量删除素材
   */
  async removeMany(userId: string, ids: string[]): Promise<{success: boolean; count: number}> {
    const result = await this.prisma.asset.updateMany({
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
   * 切换收藏状态
   */
  async toggleFavorite(userId: string, id: string): Promise<Asset> {
    const asset = await this.findOne(userId, id);

    return this.prisma.asset.update({
      where: {id},
      data: {isFavorite: !asset.isFavorite},
    });
  }

  /**
   * 添加标签
   */
  async addTag(userId: string, id: string, tag: string): Promise<Asset> {
    await this.findOne(userId, id);

    return this.prisma.asset.update({
      where: {id},
      data: {
        tags: {
          push: tag,
        },
      },
    });
  }

  /**
   * 移除标签
   */
  async removeTag(userId: string, id: string, tag: string): Promise<Asset> {
    const asset = await this.findOne(userId, id);

    return this.prisma.asset.update({
      where: {id},
      data: {
        tags: asset.tags.filter((t) => t !== tag),
      },
    });
  }

  /**
   * 获取用户的所有标签
   */
  async getUserTags(userId: string): Promise<string[]> {
    const assets = await this.prisma.asset.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      select: {
        tags: true,
      },
    });

    const tagSet = new Set<string>();
    assets.forEach((asset) => {
      asset.tags.forEach((tag) => tagSet.add(tag));
    });

    return Array.from(tagSet).sort();
  }

  /**
   * 获取素材统计
   */
  async getStats(userId: string) {
    const [totalCount, typeStats, storageUsed] = await Promise.all([
      // 总素材数
      this.prisma.asset.count({
        where: {userId, deletedAt: null},
      }),
      // 按类型统计
      this.prisma.asset.groupBy({
        by: ['type'],
        where: {userId, deletedAt: null},
        _count: {id: true},
      }),
      // 存储空间使用
      this.prisma.asset.aggregate({
        where: {userId, deletedAt: null},
        _sum: {fileSize: true},
      }),
    ]);

    return {
      total: totalCount,
      byType: typeStats.reduce(
        (acc, item) => {
          acc[item.type] = item._count.id;
          return acc;
        },
        {} as Record<AssetType, number>,
      ),
      storageUsed: storageUsed._sum.fileSize || BigInt(0),
    };
  }
}
