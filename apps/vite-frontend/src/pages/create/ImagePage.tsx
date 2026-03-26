import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Wand2, Upload, Download, Sparkles, X, ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

const imageGenSchema = z.object({
  prompt: z.string().min(1, '请输入提示词').max(1000, '提示词不能超过1000字'),
  negativePrompt: z.string().max(500, '负向提示词不能超过500字').optional(),
  imageSize: z.enum(['0.5K', '1K', '2K', '4K']),
  aspectRatio: z.string(),
  referenceStrength: z.number().min(0).max(1).optional(),
});

type ImageGenFormData = z.infer<typeof imageGenSchema>;

const ASPECT_RATIOS = [
  { value: '1:1', label: '1:1 (方形)' },
  { value: '16:9', label: '16:9 (横屏)' },
  { value: '9:16', label: '9:16 (竖屏)' },
  { value: '4:3', label: '4:3 (传统)' },
  { value: '3:4', label: '3:4 (传统竖屏)' },
  { value: '21:9', label: '21:9 (电影)' },
  { value: '9:21', label: '9:21 (电影竖屏)' },
];

const IMAGE_SIZES = [
  { value: '0.5K', label: '0.5K (512px) - 快速预览' },
  { value: '1K', label: '1K (1024px) - 标准' },
  { value: '2K', label: '2K (2048px) - 高清' },
  { value: '4K', label: '4K (4096px) - 超高清' },
];

export function ImagePage() {
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ImageGenFormData>({
    resolver: zodResolver(imageGenSchema) as any,
    defaultValues: {
      imageSize: '1K',
      aspectRatio: '16:9',
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        setReferenceImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearReferenceImage = () => {
    setReferenceImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const generateImageMutation = useMutation({
    mutationFn: async (data: ImageGenFormData) => {
      const payload = {
        ...data,
        referenceImage: referenceImage || undefined,
      };
      const response = await fetch('/api/v1/ai/image/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success && data.data?.imageUrl) {
        setGeneratedImage(data.data.imageUrl);
        toast.success('图片生成成功！');
      } else {
        toast.error(data.error || '生成失败');
      }
    },
    onError: () => {
      toast.error('生成失败，请稍后重试');
    },
  });

  const onSubmit = (data: ImageGenFormData) => {
    generateImageMutation.mutate(data);
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `ai-image-${Date.now()}.png`;
    link.click();
  };

  return (
    <div 
      className="min-h-screen relative"
      style={{ 
        background: 'linear-gradient(180deg, #0F172A 0%, #1E1B4B 50%, #0F172A 100%)'
      }}
    >
      {/* Header */}
      <header 
        className="border-b border-white/10 sticky top-0 z-10 backdrop-blur-sm"
        style={{ background: 'rgba(15, 23, 42, 0.8)' }}
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors cursor-pointer">
              <ArrowLeft className="w-5 h-5" />
              <span>返回</span>
            </Link>
            <div className="w-px h-6 bg-white/20" />
            <h1 className="text-xl font-semibold flex items-center gap-2 text-white">
              <Wand2 className="w-6 h-6" style={{ color: '#60A5FA' }} />
              AI 生图工作台
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* 左侧：表单 */}
          <div className="lg:col-span-3 space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* 提示词 */}
              <div 
                className="rounded-2xl p-6 border border-white/10 backdrop-blur-sm"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.4), rgba(15, 23, 42, 0.4))'
                }}
              >
                <Label className="text-white/70">提示词 *</Label>
                <Textarea
                  {...register('prompt')}
                  placeholder="描述你想要的图片，例如：一只可爱的橘猫坐在窗台上，阳光洒落，温馨治愈的风格"
                  rows={4}
                  className="mt-2 bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-blue-400/50"
                />
                {errors.prompt && (
                  <p className="text-sm text-red-400 mt-1">{errors.prompt.message}</p>
                )}
              </div>

              {/* 负向提示词 */}
              <div 
                className="rounded-2xl p-6 border border-white/10 backdrop-blur-sm"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.4), rgba(15, 23, 42, 0.4))'
                }}
              >
                <Label className="text-white/70">负向提示词（可选）</Label>
                <Textarea
                  {...register('negativePrompt')}
                  placeholder="描述你不想要的内容，例如：模糊、低质量、水印"
                  rows={2}
                  className="mt-2 bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-blue-400/50"
                />
              </div>

              {/* 参考图上传 */}
              <div 
                className="rounded-2xl p-6 border border-white/10 backdrop-blur-sm"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.4), rgba(15, 23, 42, 0.4))'
                }}
              >
                <Label className="text-white/70">参考图（可选，用于图生图）</Label>
                <div className="mt-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    ref={fileInputRef}
                    className="hidden"
                  />
                  {referenceImage ? (
                    <div className="relative inline-block">
                      <img
                        src={`data:image/jpeg;base64,${referenceImage}`}
                        alt="参考图"
                        className="w-40 h-40 object-cover rounded-lg border border-white/10"
                      />
                      <button
                        type="button"
                        onClick={clearReferenceImage}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-40 h-40 border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-blue-400/50 transition-colors cursor-pointer"
                    >
                      <Upload className="w-8 h-8 text-white/40" />
                      <span className="text-sm text-white/40">上传图片</span>
                    </button>
                  )}
                </div>

                {referenceImage && (
                  <div className="mt-4">
                    <Label className="text-white/70">参考强度</Label>
                    <Input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={watch('referenceStrength') || 0.5}
                      onChange={(e) => setValue('referenceStrength', parseFloat(e.target.value))}
                      className="mt-2 accent-blue-500"
                    />
                    <p className="text-xs text-white/40 mt-1">
                      当前: {((watch('referenceStrength') || 0.5) * 100).toFixed(0)}%
                    </p>
                  </div>
                )}
              </div>

              {/* 设置 */}
              <div 
                className="rounded-2xl p-6 border border-white/10 backdrop-blur-sm"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.4), rgba(15, 23, 42, 0.4))'
                }}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white/70">分辨率</Label>
                    <Select
                      value={watch('imageSize')}
                      onValueChange={(v) => setValue('imageSize', v as any)}
                    >
                      <SelectTrigger className="mt-2 bg-white/5 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/20">
                        {IMAGE_SIZES.map((s) => (
                          <SelectItem key={s.value} value={s.value} className="hover:bg-white/10">
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white/70">宽高比</Label>
                    <Select
                      value={watch('aspectRatio')}
                      onValueChange={(v) => setValue('aspectRatio', v)}
                    >
                      <SelectTrigger className="mt-2 bg-white/5 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/20">
                        {ASPECT_RATIOS.map((r) => (
                          <SelectItem key={r.value} value={r.value} className="hover:bg-white/10">
                            {r.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 mt-6 text-lg cursor-pointer"
                  style={{ 
                    background: 'linear-gradient(135deg, #F97316, #EA580C)',
                    boxShadow: '0 4px 20px rgba(249, 115, 22, 0.4)'
                  }}
                  disabled={generateImageMutation.isPending}
                >
                  {generateImageMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      生成图片
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* 右侧：结果展示 */}
          <div className="lg:col-span-2 space-y-6">
            <div 
              className="rounded-2xl p-6 border border-white/10 backdrop-blur-sm"
              style={{ 
                background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.4), rgba(15, 23, 42, 0.4))'
              }}
            >
              <h2 className="text-lg font-semibold mb-4 text-white">生成结果</h2>

              {generatedImage ? (
                <div className="space-y-4">
                  <img
                    src={generatedImage}
                    alt="Generated"
                    className="w-full rounded-lg border border-white/10"
                  />
                  <Button
                    onClick={downloadImage}
                    className="w-full cursor-pointer"
                    style={{ 
                      background: 'linear-gradient(135deg, #F97316, #EA580C)',
                      boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)'
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    下载图片
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12 text-white/40">
                  <Wand2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>输入提示词，开始创作你的图片</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
