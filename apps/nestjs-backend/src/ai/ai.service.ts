/* eslint-disable @typescript-eslint/naming-convention */
import {Injectable, Logger} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import axios, {AxiosInstance} from 'axios';
import {
  ImageGenParams,
  ImageGenResult,
  VideoGenParams,
  VideoGenResult,
  VideoTaskStatus,
  MusicGenParams,
  MusicGenResult,
  MusicTaskStatus,
} from './types/ai.types';

interface GeminiContent {
  parts: Array<{text?: string; inlineData?: {mimeType: string; data: string}}>;
}

interface GeminiRequestBody {
  contents: GeminiContent[];
  generationConfig: {
    responseModalities: string[];
    responseMimeType: string;
  };
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        inlineData?: {
          mimeType?: string;
          data?: string;
        };
      }>;
    };
  }>;
}

interface SeedanceRequestBody {
  model: string;
  input: Record<string, unknown>;
  parameters: {
    resolution: string;
    duration: number;
    generate_audio: boolean;
    camera_fixed: boolean;
    watermark: boolean;
  };
}

interface SeedanceResponse {
  id?: string;
  task_id?: string;
}

interface SeedanceTaskResponse {
  status?: string;
  progress?: number;
  output?: {
    video_url?: string;
    audio_url?: string;
  };
  video_url?: string;
  audio_url?: string;
  error?: string;
  message?: string;
}

interface EvolinkRequestBody {
  prompt: string;
  model: string;
  custom_mode: boolean;
  instrumental: boolean;
  style?: string;
  title?: string;
  vocal_gender?: string;
  negative_tags?: string;
  duration?: number;
}

interface EvolinkResponse {
  id?: string;
  task_id?: string;
}

interface EvolinkTaskResponse {
  status?: string;
  progress?: number;
  error?: {message?: string};
  result_data?: Array<{
    audio_url?: string;
    stream_audio_url?: string;
    title?: string;
    duration?: number;
    tags?: string;
  }>;
  results?: string[];
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly dmxApiClient: AxiosInstance;
  private readonly dmxApiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.dmxApiKey = this.configService.get<string>('DMX_API_KEY') ?? '';
    const dmxApiBaseUrl = this.configService.get<string>('DMX_API_BASE_URL') ?? 'https://www.dmxapi.cn';

    this.dmxApiClient = axios.create({
      baseURL: dmxApiBaseUrl,
      timeout: 120000, // 2 minutes timeout for video generation
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.dmxApiKey}`,
      },
    });

    this.logger.log('AI Service initialized');
  }

  /**
   * 生成图片（文生图 / 图生图）
   */
  async generateImage(params: ImageGenParams): Promise<ImageGenResult> {
    try {
      this.logger.log(`Generating image with prompt: ${params.prompt}`);

      // 构建请求体 - Gemini 3.1 Flash Image Preview API
      const requestBody: GeminiRequestBody = {
        contents: [
          {
            parts: [
              {
                text: params.prompt,
              },
            ],
          },
        ],
        generationConfig: {
          responseModalities: ['image', 'text'],
          responseMimeType: 'text/plain',
        },
      };

      // 添加参考图（图生图）
      if (params.referenceImage) {
        requestBody.contents[0].parts.unshift({
          inlineData: {
            mimeType: 'image/jpeg',
            data: params.referenceImage,
          },
        });
      }

      const response = await this.dmxApiClient.post<GeminiResponse>(
        '/v1beta/models/gemini-3.1-flash-image-preview:generateContent',
        requestBody,
      );

      // 解析响应
      const candidates = response.data?.candidates;
      if (!candidates || candidates.length === 0) {
        return {
          success: false,
          error: 'No image generated',
        };
      }

      // 提取图片 URL
      const parts = candidates[0]?.content?.parts ?? [];
      const imagePart = parts.find((part) => part.inlineData);

      if (imagePart?.inlineData?.data) {
        // 如果返回的是 base64 数据，转换为 data URL
        const mimeType = imagePart.inlineData.mimeType ?? 'image/png';
        const imageUrl = `data:${mimeType};base64,${imagePart.inlineData.data}`;

        return {
          success: true,
          imageUrl,
          metadata: {
            format: mimeType.split('/')[1],
          },
        };
      }

      return {
        success: false,
        error: 'No image data in response',
      };
    } catch (error) {
      this.logger.error('Image generation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * 生成视频（文生视频 / 图生视频 / 首尾帧生视频）
   */
  async generateVideo(params: VideoGenParams): Promise<VideoGenResult> {
    try {
      this.logger.log(`Generating video with prompt: ${params.prompt}`);

      // 构建输入参数
      const input: Record<string, unknown> = {
        prompt: params.prompt,
      };

      // 根据类型添加不同的输入
      if (params.type === 'image2video' && params.firstFrameImage) {
        input.first_frame_image = params.firstFrameImage;
      } else if (params.type === 'frame2video' && params.firstFrameImage && params.lastFrameImage) {
        input.first_frame_image = params.firstFrameImage;
        input.last_frame_image = params.lastFrameImage;
      }

      // 构建请求体 - Doubao Seedance 1.5 Pro API
      const requestBody: SeedanceRequestBody = {
        model: 'doubao-seedance-1-5-pro',
        input,
        parameters: {
          resolution: params.resolution ?? '720p',
          duration: params.duration ?? 5,
          generate_audio: params.generateAudio ?? false,
          camera_fixed: false,
          watermark: false,
        },
      };

      const response = await this.dmxApiClient.post<SeedanceResponse>('/v1/responses', requestBody);

      // Seedance API 返回任务 ID，需要轮询查询状态
      const taskId = response.data?.id ?? response.data?.task_id;

      if (!taskId) {
        return {
          success: false,
          error: 'No task ID returned from API',
        };
      }

      return {
        success: true,
        taskId,
        status: 'pending',
      };
    } catch (error) {
      this.logger.error('Video generation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * 查询视频生成任务状态
   */
  async getVideoTaskStatus(taskId: string): Promise<VideoTaskStatus> {
    try {
      const response = await this.dmxApiClient.get<SeedanceTaskResponse>(`/v1/responses/${taskId}?model=seedance-get`);

      const data = response.data;
      const apiStatus = data.status ?? '';

      // 映射状态
      let status: VideoTaskStatus['status'] = 'pending';
      if (apiStatus === 'processing' || apiStatus === 'running') {
        status = 'processing';
      } else if (apiStatus === 'completed' || apiStatus === 'success') {
        status = 'completed';
      } else if (apiStatus === 'failed' || apiStatus === 'error') {
        status = 'failed';
      }

      return {
        taskId,
        status,
        progress: data.progress ?? 0,
        videoUrl: data.output?.video_url ?? data.video_url,
        audioUrl: data.output?.audio_url ?? data.audio_url,
        error: data.error ?? data.message,
      };
    } catch (error) {
      this.logger.error('Failed to get video task status:', error);
      return {
        taskId,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * 生成音乐
   */
  async generateMusic(params: MusicGenParams): Promise<MusicGenResult> {
    try {
      this.logger.log(`Generating music with prompt: ${params.prompt}`);

      // 构建请求体 - Evolink Music API
      const requestBody: EvolinkRequestBody = {
        prompt: params.prompt,
        model: params.model ?? 'suno-v4',
        custom_mode: params.mode === 'custom',
        instrumental: params.mode === 'instrumental',
      };

      // 自定义模式需要 style 和 title
      if (params.mode === 'custom') {
        requestBody.style = params.style ?? '';
        requestBody.title = params.title ?? 'Untitled';
      }

      // 可选参数
      if (params.vocalGender) {
        requestBody.vocal_gender = params.vocalGender;
      }
      if (params.negativeTags) {
        requestBody.negative_tags = params.negativeTags;
      }
      if (params.duration) {
        requestBody.duration = params.duration;
      }

      // Evolink API
      const evolinkApiKey = this.configService.get<string>('EVOLINK_API_KEY') ?? '';
      const response = await axios.post<EvolinkResponse>('https://api.evolink.ai/v1/audios/generations', requestBody, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${evolinkApiKey}`,
        },
        timeout: 30000,
      });

      const taskId = response.data?.id ?? response.data?.task_id;

      if (!taskId) {
        return {
          success: false,
          error: 'No task ID returned from API',
        };
      }

      return {
        success: true,
        taskId,
        status: 'pending',
      };
    } catch (error) {
      this.logger.error('Music generation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * 查询音乐生成任务状态
   */
  async getMusicTaskStatus(taskId: string): Promise<MusicTaskStatus> {
    try {
      const evolinkApiKey = this.configService.get<string>('EVOLINK_API_KEY') ?? '';
      const response = await axios.get<EvolinkTaskResponse>(`https://api.evolink.ai/v1/tasks/${taskId}`, {
        headers: {
          Authorization: `Bearer ${evolinkApiKey}`,
        },
        timeout: 30000,
      });

      const data = response.data;
      const apiStatus = data.status ?? '';

      // 映射状态
      let status: MusicTaskStatus['status'] = 'pending';
      if (apiStatus === 'processing') {
        status = 'processing';
      } else if (apiStatus === 'completed') {
        status = 'completed';
      } else if (apiStatus === 'failed') {
        status = 'failed';
      }

      // 提取音频 URL
      const resultData = data.result_data?.[0] ?? {};

      return {
        taskId,
        status,
        progress: data.progress ?? 0,
        audioUrl: resultData.audio_url ?? data.results?.[0],
        streamUrl: resultData.stream_audio_url,
        title: resultData.title,
        duration: resultData.duration,
        tags: resultData.tags,
        error: data.error?.message,
      };
    } catch (error) {
      this.logger.error('Failed to get music task status:', error);
      return {
        taskId,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
}
