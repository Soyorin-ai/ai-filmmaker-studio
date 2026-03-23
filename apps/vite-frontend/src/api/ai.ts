import axios, {AxiosInstance} from 'axios';

// AI API 类型定义
export interface ImageGenParams {
  prompt: string;
  negativePrompt?: string;
  imageSize?: '0.5K' | '1K' | '2K' | '4K';
  aspectRatio?: string;
  referenceImage?: string; // base64
  referenceStrength?: number;
}

export interface ImageGenResult {
  success: boolean;
  data?: {
    imageUrl: string;
    metadata?: {
      format?: string;
    };
  };
  error?: string;
}

export interface VideoGenParams {
  prompt: string;
  type: 'text2video' | 'image2video' | 'frame2video';
  resolution?: '480p' | '720p' | '1080p';
  duration?: number; // 4-12 秒
  generateAudio?: boolean;
  firstFrameImage?: string; // base64
  lastFrameImage?: string; // base64
}

export interface VideoGenResult {
  success: boolean;
  data?: {
    taskId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
  };
  error?: string;
}

export interface VideoTaskStatus {
  taskId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  videoUrl?: string;
  audioUrl?: string;
  error?: string;
}

// 创建 axios 实例
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 120000, // 2 minutes
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加 token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// AI API 服务
export const aiApi = {
  /**
   * 生成图片
   */
  generateImage: async (params: ImageGenParams): Promise<ImageGenResult> => {
    const response = await apiClient.post<ImageGenResult>('/ai/image/generate', params);
    return response.data;
  },

  /**
   * 生成视频
   */
  generateVideo: async (params: VideoGenParams): Promise<VideoGenResult> => {
    const response = await apiClient.post<VideoGenResult>('/ai/video/generate', params);
    return response.data;
  },

  /**
   * 查询视频任务状态
   */
  getVideoTaskStatus: async (taskId: string): Promise<VideoTaskStatus> => {
    const response = await apiClient.get<{success: boolean; data: VideoTaskStatus; error?: string}>(
      `/ai/video/task/${taskId}`,
    );
    return response.data.data;
  },
};

export default apiClient;
