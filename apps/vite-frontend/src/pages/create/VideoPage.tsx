import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Film, Upload, Download, Sparkles, Video, X, RefreshCw } from 'lucide-react';
import { aiApi, type VideoGenParams, type VideoTaskStatus } from '@/api/ai';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// 表单验证 Schema
const videoGenSchema = z.object({
  prompt: z.string().min(1, '请输入提示词').max(1000, '提示词不能超过1000字'),
  type: z.enum(['text2video', 'image2video', 'frame2video']),
  resolution: z.enum(['480p', '720p', '1080p']),
  duration: z.number().min(4).max(12),
  generateAudio: z.boolean().default(false),
});

type VideoGenFormData = z.output<typeof videoGenSchema>;

// 分辨率选项
const RESOLUTIONS = [
  { value: '480p', label: '480p (SD) - 快速预览' },
  { value: '720p', label: '720p (HD) - 标准' },
  { value: '1080p', label: '1080p (Full HD) - 高清' },
];

// 时长选项
const DURATIONS = [
  { value: 4, label: '4 秒' },
  { value: 5, label: '5 秒' },
  { value: 6, label: '6 秒' },
  { value: 8, label: '8 秒' },
  { value: 10, label: '10 秒' },
  { value: 12, label: '12 秒' },
];

export function VideoPage() {
  const [activeTab, setActiveTab] = useState<'text2video' | 'image2video' | 'frame2video'>('text2video');
  const [firstFrameImage, setFirstFrameImage] = useState<string | null>(null);
  const [lastFrameImage, setLastFrameImage] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [taskProgress, setTaskProgress] = useState(0);

  const firstFrameInputRef = useRef<HTMLInputElement>(null);
  const lastFrameInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<VideoGenFormData>({
    resolver: zodResolver(videoGenSchema) as any,
    defaultValues: {
      type: 'text2video',
      resolution: '720p',
      duration: 5,
      generateAudio: false,
    },
  });

  const watchedResolution = watch('resolution');
  const watchedDuration = watch('duration');
  const watchedGenerateAudio = watch('generateAudio');

  // 切换 Tab 时更新表单
  useEffect(() => {
    setValue('type', activeTab);
  }, [activeTab, setValue]);

  // 图片上传处理
  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'first' | 'last'
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('图片大小不能超过 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (base64) {
        const base64Data = base64.split(',')[1] || '';
        if (base64Data) {
          if (type === 'first') {
            setFirstFrameImage(base64Data);
          } else {
            setLastFrameImage(base64Data);
          }
          toast.success('图片已上传');
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // 移除图片
  const handleRemoveImage = (type: 'first' | 'last') => {
    if (type === 'first') {
      setFirstFrameImage(null);
      if (firstFrameInputRef.current) firstFrameInputRef.current.value = '';
    } else {
      setLastFrameImage(null);
      if (lastFrameInputRef.current) lastFrameInputRef.current.value = '';
    }
  };

  // 生成视频
  const generateMutation = useMutation({
    mutationFn: (data: VideoGenParams) => aiApi.generateVideo(data),
    onSuccess: (result) => {
      if (result.success && result.data) {
        toast.success('视频生成任务已提交，请稍候...');
        pollTaskStatus(result.data.taskId);
      } else {
        toast.error(result.error || '生成失败，请重试');
        setIsGenerating(false);
      }
    },
    onError: (error) => {
      toast.error('生成失败，请检查网络或重试');
      setIsGenerating(false);
      console.error('Video generation error:', error);
    },
  });

  // 轮询任务状态
  const pollTaskStatus = async (taskId: string) => {
    const poll = async () => {
      try {
        const status: VideoTaskStatus = await aiApi.getVideoTaskStatus(taskId);
        setTaskProgress(status.progress || 0);

        if (status.status === 'completed' && status.videoUrl) {
          setGeneratedVideo(status.videoUrl);
          setIsGenerating(false);
          toast.success('视频生成成功！');
        } else if (status.status === 'failed') {
          toast.error(status.error || '视频生成失败');
          setIsGenerating(false);
        } else if (status.status === 'processing' || status.status === 'pending') {
          // 继续轮询
          setTimeout(poll, 3000);
        }
      } catch (error) {
        console.error('Poll error:', error);
        setTimeout(poll, 5000);
      }
    };

    poll();
  };

  const onSubmit = (data: VideoGenFormData) => {
    // 验证图片上传
    if (data.type === 'image2video' && !firstFrameImage) {
      toast.error('请上传首帧图片');
      return;
    }
    if (data.type === 'frame2video') {
      if (!firstFrameImage) {
        toast.error('请上传首帧图片');
        return;
      }
      if (!lastFrameImage) {
        toast.error('请上传尾帧图片');
        return;
      }
    }

    setIsGenerating(true);
    setGeneratedVideo(null);
    setTaskProgress(0);

    generateMutation.mutate({
      ...data,
      firstFrameImage: firstFrameImage || undefined,
      lastFrameImage: lastFrameImage || undefined,
    });
  };

  // 下载视频
  const handleDownload = () => {
    if (!generatedVideo) return;
    const link = document.createElement('a');
    link.href = generatedVideo;
    link.download = `ai-generated-video-${Date.now()}.mp4`;
    link.click();
  };

  // 重置表单
  const handleReset = () => {
    reset();
    setFirstFrameImage(null);
    setLastFrameImage(null);
    setGeneratedVideo(null);
    setTaskProgress(0);
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
            <Film className="w-10 h-10 text-purple-500" style={{ filter: 'drop-shadow(0 0 15px rgba(168,85,247,0.5))' }} />
            AI 生视频工作台
          </h1>
          <p className="text-slate-200 text-lg" style={{ textShadow: '0 1px 5px rgba(0,0,0,0.5)' }}>
            通过文字或图片，生成高质量的视频内容
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：输入区域 */}
          <div className="space-y-6">
            {/* 模式选择 Tabs */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-2">
              <div className="flex gap-2">
                {[
                  { key: 'text2video', label: '文生视频', icon: '✍️' },
                  { key: 'image2video', label: '图生视频', icon: '🖼️' },
                  { key: 'frame2video', label: '首尾帧生视频', icon: '🎬' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                      activeTab === tab.key
                        ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* 提示词输入 */}
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                <Label htmlFor="prompt" className="text-white text-lg font-semibold mb-3 block">
                  提示词 <span className="text-purple-500">*</span>
                </Label>
                <textarea
                  {...register('prompt')}
                  id="prompt"
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
                  placeholder="描述你想要的视频内容，例如：一个女孩在樱花树下跳舞，花瓣随风飘落..."
                />
                {errors.prompt && (
                  <p className="text-purple-500 text-sm mt-2">{errors.prompt.message}</p>
                )}
              </div>

              {/* 首帧图片上传（图生视频/首尾帧生视频） */}
              {(activeTab === 'image2video' || activeTab === 'frame2video') && (
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                  <Label className="text-white text-lg font-semibold mb-3 block">
                    首帧图片 <span className="text-purple-500">*</span>
                  </Label>
                  <p className="text-slate-400 text-sm mb-4">
                    视频将从这张图片开始
                  </p>

                  {firstFrameImage ? (
                    <div className="relative">
                      <img
                        src={`data:image/jpeg;base64,${firstFrameImage}`}
                        alt="首帧图片"
                        className="w-full h-48 object-cover rounded-lg border border-slate-600"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage('first')}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => firstFrameInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:border-purple-500 transition-colors"
                    >
                      <Upload className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                      <p className="text-slate-400 text-sm">点击上传首帧图片</p>
                    </div>
                  )}
                  <input
                    ref={firstFrameInputRef}
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={(e) => handleImageUpload(e, 'first')}
                    className="hidden"
                  />
                </div>
              )}

              {/* 尾帧图片上传（首尾帧生视频） */}
              {activeTab === 'frame2video' && (
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                  <Label className="text-white text-lg font-semibold mb-3 block">
                    尾帧图片 <span className="text-purple-500">*</span>
                  </Label>
                  <p className="text-slate-400 text-sm mb-4">
                    视频将结束于这张图片
                  </p>

                  {lastFrameImage ? (
                    <div className="relative">
                      <img
                        src={`data:image/jpeg;base64,${lastFrameImage}`}
                        alt="尾帧图片"
                        className="w-full h-48 object-cover rounded-lg border border-slate-600"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage('last')}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => lastFrameInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:border-purple-500 transition-colors"
                    >
                      <Upload className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                      <p className="text-slate-400 text-sm">点击上传尾帧图片</p>
                    </div>
                  )}
                  <input
                    ref={lastFrameInputRef}
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={(e) => handleImageUpload(e, 'last')}
                    className="hidden"
                  />
                </div>
              )}

              {/* 参数设置 */}
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                <h3 className="text-white text-lg font-semibold mb-4">参数设置</h3>

                <div className="grid grid-cols-2 gap-4">
                  {/* 分辨率 */}
                  <div>
                    <Label className="text-slate-300 text-sm font-medium mb-2 block">
                      分辨率
                    </Label>
                    <Select value={watchedResolution} onValueChange={(value) => setValue('resolution', value as any)}>
                      <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {RESOLUTIONS.map((res) => (
                          <SelectItem key={res.value} value={res.value}>
                            {res.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 时长 */}
                  <div>
                    <Label className="text-slate-300 text-sm font-medium mb-2 block">
                      视频时长
                    </Label>
                    <Select 
                      value={watchedDuration?.toString()} 
                      onValueChange={(value) => setValue('duration', parseInt(value))}
                    >
                      <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DURATIONS.map((dur) => (
                          <SelectItem key={dur.value} value={dur.value.toString()}>
                            {dur.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* 是否生成音频 */}
                <div className="mt-4 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="generateAudio"
                    checked={watchedGenerateAudio}
                    onChange={(e) => setValue('generateAudio', e.target.checked)}
                    className="w-5 h-5 rounded border-slate-600 bg-slate-900 text-purple-500 focus:ring-purple-500"
                  />
                  <Label htmlFor="generateAudio" className="text-slate-300 text-sm cursor-pointer">
                    生成音频（AI 自动配音）
                  </Label>
                </div>
              </div>

              {/* 按钮组 */}
              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={isGenerating}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-4 text-lg shadow-lg shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                      生成中... {taskProgress > 0 ? `${taskProgress}%` : ''}
                    </>
                  ) : (
                    <>
                      <Film className="w-5 h-5 mr-2" />
                      开始生成
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  onClick={handleReset}
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  重置
                </Button>
              </div>
            </form>
          </div>

          {/* 右侧：结果展示 */}
          <div className="lg:sticky lg:top-8 h-fit">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                <Video className="w-5 h-5 text-purple-500" />
                生成结果
              </h3>

              {generatedVideo ? (
                <div className="space-y-4">
                  <div className="relative">
                    <video
                      src={generatedVideo}
                      controls
                      className="w-full rounded-lg border border-slate-600 shadow-2xl"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleDownload}
                      className="flex-1 bg-slate-700 hover:bg-slate-600 text-white"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      下载视频
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      保存到素材库
                    </Button>
                  </div>
                </div>
              ) : isGenerating ? (
                <div className="border-2 border-dashed border-slate-600 rounded-lg p-12 text-center">
                  <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-slate-400 text-sm mb-2">视频生成中...</p>
                  {taskProgress > 0 && (
                    <div className="w-full bg-slate-700 rounded-full h-2 mt-4">
                      <div
                        className="bg-purple-500 h-2 rounded-full transition-all"
                        style={{ width: `${taskProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-600 rounded-lg p-12 text-center">
                  <Video className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-500 text-sm">
                    生成的视频将在这里显示
                  </p>
                </div>
              )}
            </div>

            {/* 提示 */}
            <div className="mt-4 bg-slate-800/30 border border-slate-700 rounded-lg p-4">
              <h4 className="text-slate-300 font-medium mb-2 text-sm">💡 提示</h4>
              <ul className="text-slate-500 text-xs space-y-1">
                <li>• 详细的提示词会得到更好的结果</li>
                <li>• 图生视频可以控制视频起始画面</li>
                <li>• 首尾帧生视频适合制作转场效果</li>
                <li>• 720p 适合大多数场景，1080p 适合最终输出</li>
                <li>• 开启音频生成会自动为视频配音</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
