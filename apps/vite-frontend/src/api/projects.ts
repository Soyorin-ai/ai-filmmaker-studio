import apiClient from './ai';

// Project 类型定义
export type ProjectStatus = 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';

export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  cover?: string;
  status: ProjectStatus;
  workflow?: Record<string, unknown>;
  workflowVersion: number;
  timeline?: Record<string, unknown>;
  duration: number;
  assetCount: number;
  taskCount: number;
  settings?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  assets?: any[];
  tasks?: any[];
  _count?: {
    assets: number;
    tasks: number;
  };
}

export interface QueryProjectsParams {
  page?: number;
  limit?: number;
  status?: ProjectStatus;
  search?: string;
}

export interface ProjectsListResult {
  items: Project[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateProjectParams {
  name: string;
  description?: string;
  cover?: string;
  status?: ProjectStatus;
  workflow?: Record<string, unknown>;
  timeline?: Record<string, unknown>;
  settings?: Record<string, unknown>;
}

export interface UpdateProjectParams {
  name?: string;
  description?: string;
  cover?: string;
  status?: ProjectStatus;
  workflow?: Record<string, unknown>;
  timeline?: Record<string, unknown>;
  settings?: Record<string, unknown>;
}

export interface ProjectStats {
  total: number;
  byStatus: Record<ProjectStatus, number>;
  recent: Pick<Project, 'id' | 'name' | 'cover' | 'status' | 'updatedAt'>[];
}

const statusLabels: Record<ProjectStatus, string> = {
  DRAFT: '草稿',
  IN_PROGRESS: '进行中',
  COMPLETED: '已完成',
  ARCHIVED: '已归档',
};

const statusColors: Record<ProjectStatus, string> = {
  DRAFT: 'bg-slate-500',
  IN_PROGRESS: 'bg-blue-500',
  COMPLETED: 'bg-green-500',
  ARCHIVED: 'bg-gray-500',
};

export const getProjectStatusLabel = (status: ProjectStatus): string => statusLabels[status];
export const getProjectStatusColor = (status: ProjectStatus): string => statusColors[status];

// Projects API 服务
export const projectsApi = {
  /**
   * 查询项目列表
   */
  getProjects: async (params: QueryProjectsParams = {}): Promise<ProjectsListResult> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set('page', String(params.page));
    if (params.limit) queryParams.set('limit', String(params.limit));
    if (params.status) queryParams.set('status', params.status);
    if (params.search) queryParams.set('search', params.search);

    const response = await apiClient.get<{success: boolean; data: ProjectsListResult}>(
      `/projects?${queryParams.toString()}`,
    );
    return response.data.data;
  },

  /**
   * 获取项目详情
   */
  getProject: async (id: string): Promise<Project> => {
    const response = await apiClient.get<{success: boolean; data: Project}>(`/projects/${id}`);
    return response.data.data;
  },

  /**
   * 创建项目
   */
  createProject: async (params: CreateProjectParams): Promise<Project> => {
    const response = await apiClient.post<{success: boolean; data: Project}>('/projects', params);
    return response.data.data;
  },

  /**
   * 更新项目
   */
  updateProject: async (id: string, params: UpdateProjectParams): Promise<Project> => {
    const response = await apiClient.put<{success: boolean; data: Project}>(`/projects/${id}`, params);
    return response.data.data;
  },

  /**
   * 更新项目工作流
   */
  updateWorkflow: async (id: string, workflow: Record<string, unknown>): Promise<Project> => {
    const response = await apiClient.put<{success: boolean; data: Project}>(`/projects/${id}/workflow`, {workflow});
    return response.data.data;
  },

  /**
   * 更新项目时间线
   */
  updateTimeline: async (id: string, timeline: Record<string, unknown>): Promise<Project> => {
    const response = await apiClient.put<{success: boolean; data: Project}>(`/projects/${id}/timeline`, {timeline});
    return response.data.data;
  },

  /**
   * 删除项目
   */
  deleteProject: async (id: string): Promise<void> => {
    await apiClient.delete(`/projects/${id}`);
  },

  /**
   * 批量删除项目
   */
  deleteProjects: async (ids: string[]): Promise<{count: number}> => {
    const response = await apiClient.delete<{success: boolean; data: {count: number}}>('/projects/batch', {
      data: {ids},
    });
    return response.data.data;
  },

  /**
   * 归档项目
   */
  archiveProject: async (id: string): Promise<Project> => {
    const response = await apiClient.post<{success: boolean; data: Project}>(`/projects/${id}/archive`);
    return response.data.data;
  },

  /**
   * 恢复项目
   */
  restoreProject: async (id: string): Promise<Project> => {
    const response = await apiClient.post<{success: boolean; data: Project}>(`/projects/${id}/restore`);
    return response.data.data;
  },

  /**
   * 添加素材到项目
   */
  addAsset: async (projectId: string, assetId: string): Promise<Project> => {
    const response = await apiClient.post<{success: boolean; data: Project}>(
      `/projects/${projectId}/assets/${assetId}`,
    );
    return response.data.data;
  },

  /**
   * 从项目移除素材
   */
  removeAsset: async (projectId: string, assetId: string): Promise<Project> => {
    const response = await apiClient.delete<{success: boolean; data: Project}>(
      `/projects/${projectId}/assets/${assetId}`,
    );
    return response.data.data;
  },

  /**
   * 获取项目统计
   */
  getStats: async (): Promise<ProjectStats> => {
    const response = await apiClient.get<{success: boolean; data: ProjectStats}>('/projects/stats');
    return response.data.data;
  },
};

export default projectsApi;
