/**
 * AI 服务配置
 */
export interface AiServiceConfig {
  dmxApiBaseUrl: string;
  dmxApiKey: string;
}

/**
 * 图片生成参数
 */
export interface ImageGenParams {
  prompt: string;
  negativePrompt?: string;
  imageSize?: string; // 0.5K, 1K, 2K, 4K
  aspectRatio?: string; // 1:1, 16:9, 9:16, 4:3, 3:4, etc.
  referenceImage?: string; // 参考图片 URL（图生图）
  referenceStrength?: number; // 参考图强度 0-1
}

/**
 * 图片生成结果
 */
export interface ImageGenResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
  metadata?: {
    width?: number;
    height?: number;
    format?: string;
  };
}

/**
 * 视频生成参数
 */
export interface VideoGenParams {
  prompt: string;
  type: 'text2video' | 'image2video' | 'frame2video';
  resolution?: '480p' | '720p' | '1080p';
  duration?: number; // 4-12 秒
  generateAudio?: boolean;
  firstFrameImage?: string; // 首帧图片 URL
  lastFrameImage?: string; // 尾帧图片 URL（frame2video）
}

/**
 * 视频生成结果
 */
export interface VideoGenResult {
  success: boolean;
  taskId?: string; // 异步任务 ID
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  audioUrl?: string;
  error?: string;
  metadata?: {
    duration?: number;
    resolution?: string;
    fileSize?: number;
  };
}

/**
 * 视频任务状态查询结果
 */
export interface VideoTaskStatus {
  taskId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  videoUrl?: string;
  audioUrl?: string;
  error?: string;
}
