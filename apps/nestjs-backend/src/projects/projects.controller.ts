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
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto, QueryProjectDto } from './dto';

@ApiTags('项目管理')
@ApiBearerAuth()
@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  /**
   * 创建项目
   */
  @Post()
  @ApiOperation({ summary: '创建项目' })
  async create(@Body() dto: CreateProjectDto, @CurrentUser() user: JwtPayload) {
    const project = await this.projectsService.create(user.sub, dto);
    return {
      success: true,
      data: project,
    };
  }

  /**
   * 查询项目列表
   */
  @Get()
  @ApiOperation({ summary: '查询项目列表' })
  async findAll(@Query() query: QueryProjectDto, @CurrentUser() user: JwtPayload) {
    const result = await this.projectsService.findAll(user.sub, query);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 获取项目统计
   */
  @Get('stats')
  @ApiOperation({ summary: '获取项目统计' })
  async getStats(@CurrentUser() user: JwtPayload) {
    const stats = await this.projectsService.getStats(user.sub);
    return {
      success: true,
      data: stats,
    };
  }

  /**
   * 获取项目详情
   */
  @Get(':id')
  @ApiOperation({ summary: '获取项目详情' })
  async findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const project = await this.projectsService.findOne(user.sub, id);
    return {
      success: true,
      data: project,
    };
  }

  /**
   * 更新项目
   */
  @Put(':id')
  @ApiOperation({ summary: '更新项目' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const project = await this.projectsService.update(user.sub, id, dto);
    return {
      success: true,
      data: project,
    };
  }

  /**
   * 更新项目工作流
   */
  @Put(':id/workflow')
  @ApiOperation({ summary: '更新项目工作流' })
  async updateWorkflow(
    @Param('id') id: string,
    @Body('workflow') workflow: Record<string, unknown>,
    @CurrentUser() user: JwtPayload,
  ) {
    const project = await this.projectsService.updateWorkflow(user.sub, id, workflow);
    return {
      success: true,
      data: project,
    };
  }

  /**
   * 更新项目时间线
   */
  @Put(':id/timeline')
  @ApiOperation({ summary: '更新项目时间线' })
  async updateTimeline(
    @Param('id') id: string,
    @Body('timeline') timeline: Record<string, unknown>,
    @CurrentUser() user: JwtPayload,
  ) {
    const project = await this.projectsService.updateTimeline(user.sub, id, timeline);
    return {
      success: true,
      data: project,
    };
  }

  /**
   * 删除项目
   */
  @Delete(':id')
  @ApiOperation({ summary: '删除项目' })
  async remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const result = await this.projectsService.remove(user.sub, id);
    return {
      success: result.success,
    };
  }

  /**
   * 批量删除项目
   */
  @Delete('batch')
  @ApiOperation({ summary: '批量删除项目' })
  async removeMany(
    @Body('ids', new ParseArrayPipe({ items: String })) ids: string[],
    @CurrentUser() user: JwtPayload,
  ) {
    const result = await this.projectsService.removeMany(user.sub, ids);
    return {
      success: result.success,
      data: { count: result.count },
    };
  }

  /**
   * 归档项目
   */
  @Post(':id/archive')
  @ApiOperation({ summary: '归档项目' })
  async archive(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const project = await this.projectsService.archive(user.sub, id);
    return {
      success: true,
      data: project,
    };
  }

  /**
   * 恢复项目
   */
  @Post(':id/restore')
  @ApiOperation({ summary: '恢复项目' })
  async restore(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const project = await this.projectsService.restore(user.sub, id);
    return {
      success: true,
      data: project,
    };
  }

  /**
   * 添加素材到项目
   */
  @Post(':id/assets/:assetId')
  @ApiOperation({ summary: '添加素材到项目' })
  async addAsset(
    @Param('id') id: string,
    @Param('assetId') assetId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const project = await this.projectsService.addAsset(user.sub, id, assetId);
    return {
      success: true,
      data: project,
    };
  }

  /**
   * 从项目移除素材
   */
  @Delete(':id/assets/:assetId')
  @ApiOperation({ summary: '从项目移除素材' })
  async removeAsset(
    @Param('id') id: string,
    @Param('assetId') assetId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const project = await this.projectsService.removeAsset(user.sub, id, assetId);
    return {
      success: true,
      data: project,
    };
  }
}
