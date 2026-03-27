import {useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {useMutation} from '@tanstack/react-query';
import {toast} from 'sonner';
import {Music, Sparkles, Play, Pause, Download, ArrowLeft, Loader2} from 'lucide-react';
import {Link} from 'react-router-dom';
import {Button} from '@/components/ui/button';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Textarea} from '@/components/ui/textarea';
import {Input} from '@/components/ui/input';

// 表单验证 Schema
const musicGenSchema = z.object({
  prompt: z.string().min(1, '请输入描述或歌词').max(5000, '内容不能超过5000字'),
  mode: z.enum(['simple', 'custom', 'instrumental']),
  model: z.enum(['suno-v4', 'suno-v4.5', 'suno-v4.5plus', 'suno-v4.5all', 'suno-v5']),
  style: z.string().max(200).optional(),
  title: z.string().max(80).optional(),
  vocalGender: z.enum(['m', 'f']).optional(),
  negativeTags: z.string().max(200).optional(),
  duration: z.number().min(30).max(240).optional(),
});

type MusicGenFormData = z.infer<typeof musicGenSchema>;

// 模型选项
const MUSIC_MODELS = [
  {value: 'suno-v4', label: 'Suno v4 - 平衡质量'},
  {value: 'suno-v4.5', label: 'Suno v4.5 - 更好风格'},
  {value: 'suno-v4.5plus', label: 'Suno v4.5+ - 扩展功能'},
  {value: 'suno-v4.5all', label: 'Suno v4.5 All - 完整功能'},
  {value: 'suno-v5', label: 'Suno v5 - 工作室级'},
];

// 时长选项
const DURATION_OPTIONS = [
  {value: 30, label: '30秒'},
  {value: 60, label: '1分钟'},
  {value: 90, label: '1分30秒'},
  {value: 120, label: '2分钟'},
  {value: 180, label: '3分钟'},
  {value: 240, label: '4分钟 (最大)'},
];

// 风格标签
const STYLE_TAGS = [
  'pop',
  'rock',
  'jazz',
  'electronic',
  'lo-fi',
  'cinematic',
  'ballad',
  'upbeat',
  'emotional',
  'romantic',
  'energetic',
  'calm',
  'female vocals',
  'male vocals',
  'acoustic',
  'orchestral',
];

// 音乐任务状态
interface MusicTask {
  taskId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  audioUrl?: string;
  streamUrl?: string;
  title?: string;
  duration?: number;
  tags?: string;
  error?: string;
}

export function MusicPage() {
  const [generatedMusic, setGeneratedMusic] = useState<MusicTask | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [activeTab, setActiveTab] = useState<string>('simple');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: {errors},
  } = useForm<MusicGenFormData>({
    resolver: zodResolver(musicGenSchema) as any,
    defaultValues: {
      mode: 'simple',
      model: 'suno-v4',
      duration: 90,
    },
  });

  const watchedModel = watch('model');
  const watchedDuration = watch('duration');

  // 生成音乐
  const generateMusicMutation = useMutation({
    mutationFn: async (data: MusicGenFormData) => {
      const response = await fetch('/api/v1/ai/music/generate', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success && data.data?.taskId) {
        toast.success('音乐生成任务已创建，请稍候...');
        pollTaskStatus(data.data.taskId);
      } else {
        toast.error(data.error || '生成失败');
      }
    },
    onError: () => {
      toast.error('生成失败，请稍后重试');
    },
  });

  // 轮询任务状态
  const pollTaskStatus = async (taskId: string) => {
    const poll = async (): Promise<MusicTask> => {
      const response = await fetch(`/api/v1/ai/music/task/${taskId}`);
      const data = await response.json();

      if (data.data?.status === 'pending' || data.data?.status === 'processing') {
        await new Promise((r) => setTimeout(r, 5000));
        return poll();
      }

      return data.data;
    };

    try {
      const result = await poll();
      setGeneratedMusic(result);

      if (result.status === 'completed') {
        toast.success('音乐生成完成！');
      } else if (result.status === 'failed') {
        toast.error(result.error || '生成失败');
      }
    } catch (error) {
      toast.error('查询任务状态失败');
    }
  };

  // 表单提交
  const onSubmit = (data: MusicGenFormData) => {
    if (activeTab === 'simple') {
      data.mode = 'simple';
    } else if (activeTab === 'custom') {
      data.mode = 'custom';
    } else {
      data.mode = 'instrumental';
    }

    generateMusicMutation.mutate(data);
  };

  // 播放/暂停
  const togglePlay = () => {
    if (!audioElement) return;

    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play();
    }
    setIsPlaying(!isPlaying);
  };

  // 下载音乐
  const downloadMusic = () => {
    if (!generatedMusic?.audioUrl) return;

    const link = document.createElement('a');
    link.href = generatedMusic.audioUrl;
    link.download = `${generatedMusic.title || 'music'}.mp3`;
    link.click();
  };

  // 添加风格标签
  const addStyleTag = (tag: string) => {
    const currentStyle = watch('style') || '';
    if (!currentStyle.includes(tag)) {
      const newStyle = currentStyle ? `${currentStyle}, ${tag}` : tag;
      setValue('style', newStyle);
    }
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
              <Music className="w-6 h-6" style={{color: '#F97316'}} />
              AI 音乐工作台
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
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-white/10 rounded-xl p-1">
                  <TabsTrigger
                    value="simple"
                    className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60 rounded-lg"
                  >
                    简单模式
                  </TabsTrigger>
                  <TabsTrigger
                    value="custom"
                    className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60 rounded-lg"
                  >
                    自定义歌词
                  </TabsTrigger>
                  <TabsTrigger
                    value="instrumental"
                    className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60 rounded-lg"
                  >
                    纯音乐
                  </TabsTrigger>
                </TabsList>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
                  {/* 简单模式 */}
                  <TabsContent value="simple" className="space-y-4 mt-0">
                    <div>
                      <Label className="text-white/70">音乐描述 *</Label>
                      <Textarea
                        {...register('prompt')}
                        placeholder="描述你想要的音乐，例如：一首关于爱情的温柔民谣，钢琴伴奏，女声，情感真挚"
                        rows={4}
                        className="mt-2 bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-orange-400/50"
                      />
                      {errors.prompt && <p className="text-sm text-red-400 mt-1">{errors.prompt.message}</p>}
                      <p className="text-xs text-white/40 mt-1">AI 会根据你的描述自动生成歌词和旋律</p>
                    </div>
                  </TabsContent>

                  {/* 自定义歌词 */}
                  <TabsContent value="custom" className="space-y-4 mt-0">
                    <div>
                      <Label className="text-white/70">歌词 *</Label>
                      <Textarea
                        {...register('prompt')}
                        placeholder={`[Verse]\n写你的歌词...\n\n[Chorus]\n副歌部分...\n\n[Bridge]\n过渡段...\n\n[Outro]\n结尾...`}
                        rows={10}
                        className="mt-2 font-mono bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-orange-400/50"
                      />
                      {errors.prompt && <p className="text-sm text-red-400 mt-1">{errors.prompt.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white/70">歌曲标题 *</Label>
                        <Input
                          {...register('title')}
                          placeholder="我的歌"
                          className="mt-2 bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-orange-400/50"
                        />
                      </div>
                      <div>
                        <Label className="text-white/70">人声性别</Label>
                        <Select
                          value={watch('vocalGender')}
                          onValueChange={(v) => setValue('vocalGender', v as 'm' | 'f')}
                        >
                          <SelectTrigger className="mt-2 bg-white/5 border-white/10 text-white">
                            <SelectValue placeholder="选择人声" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-white/20">
                            <SelectItem value="f" className="hover:bg-white/10">
                              女声
                            </SelectItem>
                            <SelectItem value="m" className="hover:bg-white/10">
                              男声
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label className="text-white/70">音乐风格 *（用逗号分隔）</Label>
                      <Input
                        {...register('style')}
                        placeholder="pop, ballad, emotional, female vocals"
                        className="mt-2 bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-orange-400/50"
                      />
                      <div className="flex flex-wrap gap-2 mt-2">
                        {STYLE_TAGS.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => addStyleTag(tag)}
                            className="px-2 py-1 text-xs bg-white/5 hover:bg-orange-500/20 hover:text-orange-400 text-white/50 rounded-full transition-colors cursor-pointer"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  {/* 纯音乐 */}
                  <TabsContent value="instrumental" className="space-y-4 mt-0">
                    <div>
                      <Label className="text-white/70">音乐描述 *</Label>
                      <Textarea
                        {...register('prompt')}
                        placeholder="描述你想要的纯音乐，例如：紧张刺激的动作场景配乐，快节奏，鼓点强烈"
                        rows={4}
                        className="mt-2 bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-orange-400/50"
                      />
                      {errors.prompt && <p className="text-sm text-red-400 mt-1">{errors.prompt.message}</p>}
                    </div>

                    <div>
                      <Label className="text-white/70">音乐风格（可选）</Label>
                      <Input
                        {...register('style')}
                        placeholder="cinematic, orchestral, intense"
                        className="mt-2 bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-orange-400/50"
                      />
                    </div>
                  </TabsContent>

                  {/* 通用设置 */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                    <div>
                      <Label className="text-white/70">模型</Label>
                      <Select value={watchedModel} onValueChange={(v) => setValue('model', v as any)}>
                        <SelectTrigger className="mt-2 bg-white/5 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-white/20">
                          {MUSIC_MODELS.map((m) => (
                            <SelectItem key={m.value} value={m.value} className="hover:bg-white/10">
                              {m.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-white/70">目标时长</Label>
                      <Select
                        value={watchedDuration?.toString()}
                        onValueChange={(v) => setValue('duration', parseInt(v))}
                      >
                        <SelectTrigger className="mt-2 bg-white/5 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-white/20">
                          {DURATION_OPTIONS.map((d) => (
                            <SelectItem key={d.value} value={d.value.toString()} className="hover:bg-white/10">
                              {d.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-white/70">负向风格标签（要排除的风格）</Label>
                    <Input
                      {...register('negativeTags')}
                      placeholder="heavy metal, distorted guitar"
                      className="mt-2 bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-orange-400/50"
                    />
                  </div>

                  {/* 提交按钮 */}
                  <Button
                    type="submit"
                    className="w-full h-12 text-lg cursor-pointer"
                    style={{
                      background: 'linear-gradient(135deg, #F97316, #EA580C)',
                      boxShadow: '0 4px 20px rgba(249, 115, 22, 0.4)',
                    }}
                    disabled={generateMusicMutation.isPending}
                  >
                    {generateMusicMutation.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        生成中...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        生成音乐
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

              {generatedMusic ? (
                <div className="space-y-4">
                  {generatedMusic.status === 'processing' && (
                    <div className="flex items-center gap-2 text-orange-400">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>生成中... {generatedMusic.progress || 0}%</span>
                    </div>
                  )}

                  {generatedMusic.status === 'completed' && generatedMusic.audioUrl && (
                    <>
                      <div
                        className="rounded-lg p-4 border border-orange-500/20"
                        style={{background: 'rgba(249, 115, 22, 0.1)'}}
                      >
                        <h3 className="font-medium text-lg text-white">{generatedMusic.title || 'AI 生成音乐'}</h3>
                        {generatedMusic.duration && (
                          <p className="text-sm text-white/50">
                            时长: {Math.floor(generatedMusic.duration / 60)}:
                            {(generatedMusic.duration % 60).toString().padStart(2, '0')}
                          </p>
                        )}
                        {generatedMusic.tags && (
                          <p className="text-sm text-white/50 mt-1">风格: {generatedMusic.tags}</p>
                        )}
                      </div>

                      <audio
                        ref={setAudioElement}
                        src={generatedMusic.audioUrl}
                        onEnded={() => setIsPlaying(false)}
                        className="hidden"
                      />

                      <div className="flex gap-2">
                        <Button
                          onClick={togglePlay}
                          className="flex-1 cursor-pointer"
                          style={{
                            background: 'linear-gradient(135deg, #F97316, #EA580C)',
                            boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
                          }}
                        >
                          {isPlaying ? (
                            <>
                              <Pause className="w-4 h-4 mr-2" />
                              暂停
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              播放
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={downloadMusic}
                          variant="outline"
                          className="border-white/20 text-white hover:bg-white/10 cursor-pointer"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          下载
                        </Button>
                      </div>
                    </>
                  )}

                  {generatedMusic.status === 'failed' && (
                    <div className="text-red-400">生成失败: {generatedMusic.error || '未知错误'}</div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-white/40">
                  <Music className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>输入描述，开始创作你的音乐</p>
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
                  • <strong>简单模式</strong>：描述你想要的音乐，AI 自动生成歌词
                </li>
                <li>
                  • <strong>自定义歌词</strong>：自己写歌词，AI 为你谱曲演唱
                </li>
                <li>
                  • <strong>纯音乐</strong>：生成无歌词的背景音乐
                </li>
                <li>• 生成时间约 60-120 秒，请耐心等待</li>
                <li>• 音频链接 24 小时内有效，请及时下载</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
