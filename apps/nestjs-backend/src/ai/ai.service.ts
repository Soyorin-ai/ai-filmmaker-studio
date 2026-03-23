import {Injectable, Logger} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import axios, {AxiosInstance} from 'axios';
import {
  ImageGenParams,
  ImageGenResult,
  VideoGenParams,
  VideoGenResult,
  VideoTaskStatus,
} from './types/ai.types';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly dmxApiClient: AxiosInstance;
  private readonly dmxApiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.dmxApiKey = this.configService.get<string>('DMX_API_KEY') || '';
    const dmxApiBaseUrl =
      this.configService.get<string>('DMX_API_BASE_URL') ||
      'https://www.dmxapi.cn';

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
      const requestBody: {
        contents: Array<{
          parts: Array<{text?: string; inlineData?: {mimeType: string; data: string}}>;
        }>;
        generationConfig: {
          responseModalities: string[];
          responseMimeType: string;
        };
      } = {
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

      const response = await this.dmxApiClient.post(
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
      const parts = candidates[0]?.content?.parts || [];
      const imagePart = parts.find(
        (part: Record<string, unknown>) => part.inlineData,
      );

      if (imagePart?.inlineData?.data) {
        // 如果返回的是 base64 数据，转换为 data URL
        const mimeType = imagePart.inlineData.mimeType || 'image/png';
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
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
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
      } else if (
        params.type === 'frame2video' &&
        params.firstFrameImage &&
        params.lastFrameImage
      ) {
        input.first_frame_image = params.firstFrameImage;
        input.last_frame_image = params.lastFrameImage;
      }

      // 构建请求体 - Doubao Seedance 1.5 Pro API
      const requestBody: Record<string, unknown> = {
        model: 'doubao-seedance-1-5-pro',
        input,
        parameters: {
          resolution: params.resolution || '720p',
          duration: params.duration || 5,
          generate_audio: params.generateAudio ?? false,
          camera_fixed: false,
          watermark: false,
        },
      };

      const response = await this.dmxApiClient.post(
        '/v1/responses',
        requestBody,
      );

      // Seedance API 返回任务 ID，需要轮询查询状态
      const taskId = response.data?.id || response.data?.task_id;

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
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * 查询视频生成任务状态
   */
  async getVideoTaskStatus(taskId: string): Promise<VideoTaskStatus> {
    try {
      const response = await this.dmxApiClient.get(
        `/v1/responses/${taskId}?model=seedance-get`,
      );

      const data = response.data;

      // 映射状态
      let status: VideoTaskStatus['status'] = 'pending';
      if (data.status === 'processing' || data.status === 'running') {
        status = 'processing';
      } else if (data.status === 'completed' || data.status === 'success') {
        status = 'completed';
      } else if (data.status === 'failed' || data.status === 'error') {
        status = 'failed';
      }

      return {
        taskId,
        status,
        progress: data.progress || 0,
        videoUrl: data.output?.video_url || data.video_url,
        audioUrl: data.output?.audio_url || data.audio_url,
        error: data.error || data.message,
      };
    } catch (error) {
      this.logger.error('Failed to get video task status:', error);
      return {
        taskId,
        status: 'failed',
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
}
