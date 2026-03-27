import apiClient from './ai';

// Asset 类型定义
export type AssetType = 'IMAGE' | 'VIDEO' | 'AUDIO';
export type AssetSource = 'GENERATE' | 'UPLOAD' | 'EDIT' | 'IMPORT';

export interface Asset {
  id: string;
  userId: string;
  projectId?: string;
  type: AssetType;
  name: string;
  originalName?: string;
  url: string;
  thumbnail?: string;
  fileSize: string; // BigInt serialized as string
  mimeType?: string;
  metadata?: Record<string, unknown>;
  source: AssetSource;
  tags: string[];
  isFavorite: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QueryAssetsParams {
  page?: number;
  limit?: number;
  type?: AssetType;
  source?: AssetSource;
  projectId?: string;
  search?: string;
  tag?: string;
  isFavorite?: boolean;
}

export interface AssetsListResult {
  items: Asset[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateAssetParams {
  type: AssetType;
  name: string;
  originalName?: string;
  url: string;
  thumbnail?: string;
  fileSize: string | number;
  mimeType?: string;
  metadata?: Record<string, unknown>;
  source: AssetSource;
  projectId?: string;
  taskId?: string;
  tags?: string[];
  isFavorite?: boolean;
  isPublic?: boolean;
}

export interface UpdateAssetParams {
  name?: string;
  originalName?: string;
  thumbnail?: string;
  tags?: string[];
  isFavorite?: boolean;
  isPublic?: boolean;
  projectId?: string;
}

export interface AssetStats {
  total: number;
  byType: Record<AssetType, number>;
  storageUsed: string; // BigInt serialized as string
}

// Assets API 服务
export const assetsApi = {
  /**
   * 查询素材列表
   */
  getAssets: async (params: QueryAssetsParams = {}): Promise<AssetsListResult> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set('page', String(params.page));
    if (params.limit) queryParams.set('limit', String(params.limit));
    if (params.type) queryParams.set('type', params.type);
    if (params.source) queryParams.set('source', params.source);
    if (params.projectId) queryParams.set('projectId', params.projectId);
    if (params.search) queryParams.set('search', params.search);
    if (params.tag) queryParams.set('tag', params.tag);
    if (params.isFavorite !== undefined) queryParams.set('isFavorite', String(params.isFavorite));

    const response = await apiClient.get<{success: boolean; data: AssetsListResult}>(
      `/assets?${queryParams.toString()}`,
    );
    return response.data.data;
  },

  /**
   * 获取素材详情
   */
  getAsset: async (id: string): Promise<Asset> => {
    const response = await apiClient.get<{success: boolean; data: Asset}>(`/assets/${id}`);
    return response.data.data;
  },

  /**
   * 创建素材
   */
  createAsset: async (params: CreateAssetParams): Promise<Asset> => {
    const response = await apiClient.post<{success: boolean; data: Asset}>('/assets', params);
    return response.data.data;
  },

  /**
   * 更新素材
   */
  updateAsset: async (id: string, params: UpdateAssetParams): Promise<Asset> => {
    const response = await apiClient.put<{success: boolean; data: Asset}>(`/assets/${id}`, params);
    return response.data.data;
  },

  /**
   * 删除素材
   */
  deleteAsset: async (id: string): Promise<void> => {
    await apiClient.delete(`/assets/${id}`);
  },

  /**
   * 批量删除素材
   */
  deleteAssets: async (ids: string[]): Promise<{count: number}> => {
    const response = await apiClient.delete<{success: boolean; data: {count: number}}>('/assets/batch', {data: {ids}});
    return response.data.data;
  },

  /**
   * 切换收藏状态
   */
  toggleFavorite: async (id: string): Promise<Asset> => {
    const response = await apiClient.post<{success: boolean; data: Asset}>(`/assets/${id}/favorite`);
    return response.data.data;
  },

  /**
   * 添加标签
   */
  addTag: async (id: string, tag: string): Promise<Asset> => {
    const response = await apiClient.post<{success: boolean; data: Asset}>(`/assets/${id}/tags`, {tag});
    return response.data.data;
  },

  /**
   * 移除标签
   */
  removeTag: async (id: string, tag: string): Promise<Asset> => {
    const response = await apiClient.delete<{success: boolean; data: Asset}>(
      `/assets/${id}/tags/${encodeURIComponent(tag)}`,
    );
    return response.data.data;
  },

  /**
   * 获取用户所有标签
   */
  getUserTags: async (): Promise<string[]> => {
    const response = await apiClient.get<{success: boolean; data: string[]}>('/assets/tags');
    return response.data.data;
  },

  /**
   * 获取素材统计
   */
  getStats: async (): Promise<AssetStats> => {
    const response = await apiClient.get<{success: boolean; data: AssetStats}>('/assets/stats');
    return response.data.data;
  },
};

export default assetsApi;
