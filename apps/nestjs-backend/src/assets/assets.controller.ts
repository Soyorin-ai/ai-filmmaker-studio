import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseArrayPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { type JwtPayload } from '../auth/strategies/jwt.strategy';
import { AssetsService } from './assets.service';
import { CreateAssetDto, UpdateAssetDto, QueryAssetDto } from './dto';

@ApiTags('素材管理')
@ApiBearerAuth()
@Controller('assets')
@UseGuards(JwtAuthGuard)
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  /**
   * 创建素材
   */
  @Post()
  @ApiOperation({ summary: '创建素材' })
  async create(@Body() dto: CreateAssetDto, @CurrentUser() user: JwtPayload) {
    const asset = await this.assetsService.create(user.sub, dto);
    return {
      success: true,
      data: asset,
    };
  }

  /**
   * 查询素材列表
   */
  @Get()
  @ApiOperation({ summary: '查询素材列表' })
  async findAll(@Query() query: QueryAssetDto, @CurrentUser() user: JwtPayload) {
    const result = await this.assetsService.findAll(user.sub, query);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 获取素材统计
   */
  @Get('stats')
  @ApiOperation({ summary: '获取素材统计' })
  async getStats(@CurrentUser() user: JwtPayload) {
    const stats = await this.assetsService.getStats(user.sub);
    return {
      success: true,
      data: stats,
    };
  }

  /**
   * 获取用户所有标签
   */
  @Get('tags')
  @ApiOperation({ summary: '获取用户所有标签' })
  async getUserTags(@CurrentUser() user: JwtPayload) {
    const tags = await this.assetsService.getUserTags(user.sub);
    return {
      success: true,
      data: tags,
    };
  }

  /**
   * 批量删除素材
   */
  @Post('batch-delete')
  @ApiOperation({ summary: '批量删除素材' })
  async removeMany(
    @Body('ids', new ParseArrayPipe({ items: String })) ids: string[],
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.assetsService.removeMany(user.sub, ids);
    return {
      success: result.success,
      data: { count: result.count },
    };
  }

  /**
   * 获取素材详情
   */
  @Get(':id')
  @ApiOperation({ summary: '获取素材详情' })
  async findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const asset = await this.assetsService.findOne(user.sub, id);
    return {
      success: true,
      data: asset,
    };
  }

  /**
   * 更新素材
   */
  @Put(':id')
  @ApiOperation({ summary: '更新素材' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAssetDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const asset = await this.assetsService.update(user.sub, id, dto);
    return {
      success: true,
      data: asset,
    };
  }

  /**
   * 删除素材
   */
  @Delete(':id')
  @ApiOperation({ summary: '删除素材' })
  async remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const result = await this.assetsService.remove(user.sub, id);
    return {
      success: result.success,
    };
  }

  /**
   * 切换收藏状态
   */
  @Post(':id/favorite')
  @ApiOperation({ summary: '切换收藏状态' })
  async toggleFavorite(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const asset = await this.assetsService.toggleFavorite(user.sub, id);
    return {
      success: true,
      data: asset,
    };
  }

  /**
   * 添加标签
   */
  @Post(':id/tags')
  @ApiOperation({ summary: '添加标签' })
  async addTag(
    @Param('id') id: string,
    @Body('tag') tag: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const asset = await this.assetsService.addTag(user.sub, id, tag);
    return {
      success: true,
      data: asset,
    };
  }

  /**
   * 移除标签
   */
  @Delete(':id/tags/:tag')
  @ApiOperation({ summary: '移除标签' })
  async removeTag(
    @Param('id') id: string,
    @Param('tag') tag: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const asset = await this.assetsService.removeTag(user.sub, id, tag);
    return {
      success: true,
      data: asset,
    };
  }
}
