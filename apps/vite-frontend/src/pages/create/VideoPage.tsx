import {useState, useRef} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {useMutation} from '@tanstack/react-query';
import {toast} from 'sonner';
import {Upload, Download, Sparkles, Video, X, ArrowLeft, Play, Loader2} from 'lucide-react';
import {Link} from 'react-router-dom';
import {Button} from '@/components/ui/button';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Textarea} from '@/components/ui/textarea';

// 表单验证 Schema
const videoGenSchema = z.object({
  prompt: z.string().min(1, '请输入提示词').max(1000, '提示词不能超过1000字'),
  type: z.enum(['text2video', 'image2video', 'frame2video']),
  resolution: z.enum(['480p', '720p', '1080p']),
  duration: z.number().min(4).max(12),
  generateAudio: z.boolean().default(false),
});

type VideoGenFormData = z.infer<typeof videoGenSchema>;

// 分辨率选项
const RESOLUTIONS = [
  {value: '480p', label: '480p (SD) - 快速预览'},
  {value: '720p', label: '720p (HD) - 标准'},
  {value: '1080p', label: '1080p (Full HD) - 高清'},
];

// 时长选项
const DURATIONS = [
  {value: 4, label: '4 秒'},
  {value: 5, label: '5 秒'},
  {value: 6, label: '6 秒'},
  {value: 8, label: '8 秒'},
  {value: 10, label: '10 秒'},
  {value: 12, label: '12 秒'},
];

// 任务状态
interface VideoTask {
  taskId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  videoUrl?: string;
  error?: string;
}

export function VideoPage() {
  const [activeTab, setActiveTab] = useState<'text2video' | 'image2video' | 'frame2video'>('text2video');
  const [firstFrameImage, setFirstFrameImage] = useState<string | null>(null);
  const [lastFrameImage, setLastFrameImage] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<VideoTask | null>(null);

  const firstFrameInputRef = useRef<HTMLInputElement>(null);
  const lastFrameInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: {errors},
  } = useForm<VideoGenFormData>({
    resolver: zodResolver(videoGenSchema) as any,
    defaultValues: {
      type: 'text2video',
      resolution: '720p',
      duration: 6,
      generateAudio: false,
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (img: string | null) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        setter(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateVideoMutation = useMutation({
    mutationFn: async (data: VideoGenFormData) => {
      const payload = {
        ...data,
        firstFrameImage: activeTab === 'frame2video' ? firstFrameImage : undefined,
        lastFrameImage: activeTab === 'frame2video' ? lastFrameImage : undefined,
        referenceImage: activeTab === 'image2video' ? firstFrameImage : undefined,
      };
      const response = await fetch('/api/v1/ai/video/generate', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success && data.data?.taskId) {
        toast.success('视频生成任务已创建');
        pollTaskStatus(data.data.taskId);
      } else {
        toast.error(data.error || '生成失败');
      }
    },
    onError: () => {
      toast.error('生成失败，请稍后重试');
    },
  });

  const pollTaskStatus = async (taskId: string) => {
    const poll = async (): Promise<VideoTask> => {
      const response = await fetch(`/api/v1/ai/video/task/${taskId}`);
      const data = await response.json();
      if (data.data?.status === 'pending' || data.data?.status === 'processing') {
        await new Promise((r) => setTimeout(r, 5000));
        return poll();
      }
      return data.data;
    };
    try {
      const result = await poll();
      setGeneratedVideo(result);
      if (result.status === 'completed') {
        toast.success('视频生成完成！');
      } else if (result.status === 'failed') {
        toast.error(result.error || '生成失败');
      }
    } catch {
      toast.error('查询任务状态失败');
    }
  };

  const onSubmit = (data: VideoGenFormData) => {
    data.type = activeTab;
    generateVideoMutation.mutate(data);
  };

  const downloadVideo = () => {
    if (!generatedVideo?.videoUrl) return;
    const link = document.createElement('a');
    link.href = generatedVideo.videoUrl;
    link.download = `ai-video-${Date.now()}.mp4`;
    link.click();
  };

  return (
    <div
      className="min-h-screen relative"
      style={{
        background: 'linear-gradient(180deg, #0F172A 0%, #1E1B4B 50%, #0F172A 100%)',
      }}
    >
      {/* Header */}
      <header
        className="border-b border-white/10 sticky top-0 z-10 backdrop-blur-sm"
        style={{background: 'rgba(15, 23, 42, 0.8)'}}
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>返回</span>
            </Link>
            <div className="w-px h-6 bg-white/20" />
            <h1 className="text-xl font-semibold flex items-center gap-2 text-white">
              <Video className="w-6 h-6" style={{color: '#A78BFA'}} />
              AI 生视频工作台
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* 左侧：表单 */}
          <div className="lg:col-span-3 space-y-6">
            <div
              className="rounded-2xl p-6 border border-white/10 backdrop-blur-sm"
              style={{
                background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.4), rgba(15, 23, 42, 0.4))',
              }}
            >
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-white/10 rounded-xl p-1">
                  <TabsTrigger
                    value="text2video"
                    className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60 rounded-lg"
                  >
                    文生视频
                  </TabsTrigger>
                  <TabsTrigger
                    value="image2video"
                    className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60 rounded-lg"
                  >
                    图生视频
                  </TabsTrigger>
                  <TabsTrigger
                    value="frame2video"
                    className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60 rounded-lg"
                  >
                    首尾帧生视频
                  </TabsTrigger>
                </TabsList>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
                  {/* 文生视频 */}
                  <TabsContent value="text2video" className="space-y-4 mt-0">
                    <div>
                      <Label className="text-white/70">视频描述 *</Label>
                      <Textarea
                        {...register('prompt')}
                        placeholder="描述你想要的视频，例如：一只可爱的橘猫在阳光下打盹，毛发随风轻摆"
                        rows={4}
                        className="mt-2 bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-purple-400/50"
                      />
                      {errors.prompt && <p className="text-sm text-red-400 mt-1">{errors.prompt.message}</p>}
                    </div>
                  </TabsContent>

                  {/* 图生视频 */}
                  <TabsContent value="image2video" className="space-y-4 mt-0">
                    <div>
                      <Label className="text-white/70">上传首帧图片 *</Label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, setFirstFrameImage)}
                        ref={firstFrameInputRef}
                        className="hidden"
                      />
                      {firstFrameImage ? (
                        <div className="relative inline-block mt-2">
                          <img
                            src={`data:image/jpeg;base64,${firstFrameImage}`}
                            alt="首帧"
                            className="w-48 h-32 object-cover rounded-lg border border-white/10"
                          />
                          <button
                            type="button"
                            onClick={() => setFirstFrameImage(null)}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors cursor-pointer"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => firstFrameInputRef.current?.click()}
                          className="w-48 h-32 border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center gap-2 mt-2 hover:border-purple-400/50 transition-colors cursor-pointer"
                        >
                          <Upload className="w-8 h-8 text-white/40" />
                          <span className="text-sm text-white/40">上传图片</span>
                        </button>
                      )}
                    </div>
                    <div>
                      <Label className="text-white/70">视频描述</Label>
                      <Textarea
                        {...register('prompt')}
                        placeholder="描述视频的运动效果，例如：镜头缓慢推进，猫咪微微睁眼"
                        rows={3}
                        className="mt-2 bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-purple-400/50"
                      />
                    </div>
                  </TabsContent>

                  {/* 首尾帧生视频 */}
                  <TabsContent value="frame2video" className="space-y-4 mt-0">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white/70">首帧图片 *</Label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, setFirstFrameImage)}
                          ref={firstFrameInputRef}
                          className="hidden"
                        />
                        {firstFrameImage ? (
                          <div className="relative inline-block mt-2">
                            <img
                              src={`data:image/jpeg;base64,${firstFrameImage}`}
                              alt="首帧"
                              className="w-full h-24 object-cover rounded-lg border border-white/10"
                            />
                            <button
                              type="button"
                              onClick={() => setFirstFrameImage(null)}
                              className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors cursor-pointer"
                            >
                              <X className="w-3 h-3 text-white" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => firstFrameInputRef.current?.click()}
                            className="w-full h-24 border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center gap-1 mt-2 hover:border-purple-400/50 transition-colors cursor-pointer"
                          >
                            <Upload className="w-6 h-6 text-white/40" />
                            <span className="text-xs text-white/40">首帧</span>
                          </button>
                        )}
                      </div>
                      <div>
                        <Label className="text-white/70">尾帧图片 *</Label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, setLastFrameImage)}
                          ref={lastFrameInputRef}
                          className="hidden"
                        />
                        {lastFrameImage ? (
                          <div className="relative inline-block mt-2">
                            <img
                              src={`data:image/jpeg;base64,${lastFrameImage}`}
                              alt="尾帧"
                              className="w-full h-24 object-cover rounded-lg border border-white/10"
                            />
                            <button
                              type="button"
                              onClick={() => setLastFrameImage(null)}
                              className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors cursor-pointer"
                            >
                              <X className="w-3 h-3 text-white" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => lastFrameInputRef.current?.click()}
                            className="w-full h-24 border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center gap-1 mt-2 hover:border-purple-400/50 transition-colors cursor-pointer"
                          >
                            <Upload className="w-6 h-6 text-white/40" />
                            <span className="text-xs text-white/40">尾帧</span>
                          </button>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label className="text-white/70">过渡描述</Label>
                      <Textarea
                        {...register('prompt')}
                        placeholder="描述首尾帧之间的过渡效果"
                        rows={2}
                        className="mt-2 bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-purple-400/50"
                      />
                    </div>
                  </TabsContent>

                  {/* 通用设置 */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                    <div>
                      <Label className="text-white/70">分辨率</Label>
                      <Select value={watch('resolution')} onValueChange={(v) => setValue('resolution', v as any)}>
                        <SelectTrigger className="mt-2 bg-white/5 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-white/20">
                          {RESOLUTIONS.map((r) => (
                            <SelectItem key={r.value} value={r.value} className="hover:bg-white/10">
                              {r.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-white/70">时长</Label>
                      <Select
                        value={watch('duration')?.toString()}
                        onValueChange={(v) => setValue('duration', parseInt(v))}
                      >
                        <SelectTrigger className="mt-2 bg-white/5 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-white/20">
                          {DURATIONS.map((d) => (
                            <SelectItem key={d.value} value={d.value.toString()} className="hover:bg-white/10">
                              {d.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="generateAudio"
                      checked={watch('generateAudio')}
                      onChange={(e) => setValue('generateAudio', e.target.checked)}
                      className="w-4 h-4 accent-purple-500"
                    />
                    <Label htmlFor="generateAudio" className="text-white/70 cursor-pointer">
                      自动生成音效
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-lg cursor-pointer"
                    style={{
                      background: 'linear-gradient(135deg, #F97316, #EA580C)',
                      boxShadow: '0 4px 20px rgba(249, 115, 22, 0.4)',
                    }}
                    disabled={generateVideoMutation.isPending}
                  >
                    {generateVideoMutation.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        生成中...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        生成视频
                      </>
                    )}
                  </Button>
                </form>
              </Tabs>
            </div>
          </div>

          {/* 右侧：结果展示 */}
          <div className="lg:col-span-2 space-y-6">
            <div
              className="rounded-2xl p-6 border border-white/10 backdrop-blur-sm"
              style={{
                background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.4), rgba(15, 23, 42, 0.4))',
              }}
            >
              <h2 className="text-lg font-semibold mb-4 text-white">生成结果</h2>

              {generatedVideo ? (
                <div className="space-y-4">
                  {generatedVideo.status === 'processing' && (
                    <div className="flex items-center gap-2 text-purple-400">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>生成中... {generatedVideo.progress || 0}%</span>
                    </div>
                  )}

                  {generatedVideo.status === 'completed' && generatedVideo.videoUrl && (
                    <>
                      <video
                        src={generatedVideo.videoUrl}
                        controls
                        className="w-full rounded-lg border border-white/10"
                      />
                      <Button
                        onClick={downloadVideo}
                        className="w-full cursor-pointer"
                        style={{
                          background: 'linear-gradient(135deg, #F97316, #EA580C)',
                          boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
                        }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        下载视频
                      </Button>
                    </>
                  )}

                  {generatedVideo.status === 'failed' && (
                    <div className="text-red-400">生成失败: {generatedVideo.error || '未知错误'}</div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-white/40">
                  <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>选择模式，开始创作你的视频</p>
                </div>
              )}
            </div>

            {/* 使用说明 */}
            <div
              className="rounded-2xl p-6 border border-white/10 backdrop-blur-sm"
              style={{
                background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.4), rgba(15, 23, 42, 0.4))',
              }}
            >
              <h3 className="font-semibold mb-3 text-white">使用提示</h3>
              <ul className="space-y-2 text-sm text-white/50">
                <li>
                  • <strong>文生视频</strong>：用文字描述生成视频
                </li>
                <li>
                  • <strong>图生视频</strong>：上传图片，让AI生成动态效果
                </li>
                <li>
                  • <strong>首尾帧生视频</strong>：上传开始和结束图片，AI生成过渡
                </li>
                <li>• 生成时间约 30-60 秒，请耐心等待</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
