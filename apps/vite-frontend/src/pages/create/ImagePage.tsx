import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Wand2, Upload, Download, Sparkles, Image as ImageIcon, X } from 'lucide-react';
import { aiApi, type ImageGenParams } from '@/api/ai';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// 表单验证 Schema
const imageGenSchema = z.object({
  prompt: z.string().min(1, '请输入提示词').max(1000, '提示词不能超过1000字'),
  negativePrompt: z.string().max(500, '负向提示词不能超过500字').optional(),
  imageSize: z.enum(['0.5K', '1K', '2K', '4K']),
  aspectRatio: z.string(),
  referenceStrength: z.number().min(0).max(1).optional(),
});

type ImageGenFormData = z.output<typeof imageGenSchema>;

// 宽高比选项
const ASPECT_RATIOS = [
  { value: '1:1', label: '1:1 (方形)' },
  { value: '16:9', label: '16:9 (横屏)' },
  { value: '9:16', label: '9:16 (竖屏)' },
  { value: '4:3', label: '4:3 (传统)' },
  { value: '3:4', label: '3:4 (传统竖屏)' },
  { value: '21:9', label: '21:9 (电影)' },
  { value: '9:21', label: '9:21 (电影竖屏)' },
  { value: '1:2', label: '1:2 (竖长)' },
  { value: '2:1', label: '2:1 (横长)' },
  { value: '1:3', label: '1:3 (超长竖)' },
  { value: '3:1', label: '3:1 (超长横)' },
  { value: '1:4', label: '1:4 (极长竖)' },
  { value: '4:1', label: '4:1 (极长横)' },
  { value: '1:8', label: '1:8 (极致竖)' },
  { value: '8:1', label: '8:1 (极致横)' },
];

// 分辨率选项
const IMAGE_SIZES = [
  { value: '0.5K', label: '0.5K (512px) - 快速预览' },
  { value: '1K', label: '1K (1024px) - 标准' },
  { value: '2K', label: '2K (2048px) - 高清' },
  { value: '4K', label: '4K (4096px) - 超高清' },
];

export function ImagePage() {
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
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

  const watchedSize = watch('imageSize');
  const watchedRatio = watch('aspectRatio');

  // 图片上传处理
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 检查文件大小 (最大 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('图片大小不能超过 10MB');
      return;
    }

    // 转换为 base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (base64) {
        // 移除 data:image/xxx;base64, 前缀
        const base64Data = base64.split(',')[1] || '';
        if (base64Data) {
          setReferenceImage(base64Data);
          toast.success('参考图片已上传');
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // 移除参考图片
  const handleRemoveImage = () => {
    setReferenceImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 生成图片
  const generateMutation = useMutation({
    mutationFn: (data: ImageGenParams) => aiApi.generateImage(data),
    onSuccess: (result) => {
      if (result.success && result.data) {
        setGeneratedImage(result.data.imageUrl);
        toast.success('图片生成成功！');
      } else {
        toast.error(result.error || '生成失败，请重试');
      }
      setIsGenerating(false);
    },
    onError: (error) => {
      toast.error('生成失败，请检查网络或重试');
      setIsGenerating(false);
      console.error('Image generation error:', error);
    },
  });

  const onSubmit = (data: ImageGenFormData) => {
    setIsGenerating(true);
    setGeneratedImage(null);

    generateMutation.mutate({
      ...data,
      referenceImage: referenceImage || undefined,
    });
  };

  // 下载图片
  const handleDownload = () => {
    if (!generatedImage) return;

    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `ai-generated-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
            <Wand2 className="w-10 h-10 text-rose-500" style={{ filter: 'drop-shadow(0 0 15px rgba(244,63,94,0.5))' }} />
            AI 生图工作台
          </h1>
          <p className="text-slate-200 text-lg" style={{ textShadow: '0 1px 5px rgba(0,0,0,0.5)' }}>
            通过文字描述或参考图片，生成高质量的艺术作品
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：输入区域 */}
          <div className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* 提示词输入 */}
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                <Label htmlFor="prompt" className="text-white text-lg font-semibold mb-3 block">
                  提示词 <span className="text-rose-500">*</span>
                </Label>
                <textarea
                  {...register('prompt')}
                  id="prompt"
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all resize-none"
                  placeholder="描述你想要的画面，例如：一个穿着红裙的女孩站在樱花树下，阳光透过花瓣洒在她身上..."
                />
                {errors.prompt && (
                  <p className="text-rose-500 text-sm mt-2">{errors.prompt.message}</p>
                )}

                <div className="mt-4">
                  <Label htmlFor="negativePrompt" className="text-slate-300 text-sm font-medium mb-2 block">
                    负向提示词（可选）
                  </Label>
                  <textarea
                    {...register('negativePrompt')}
                    id="negativePrompt"
                    rows={2}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all resize-none text-sm"
                    placeholder="描述你不想要的内容，例如：模糊、低质量、变形..."
                  />
                </div>
              </div>

              {/* 参考图片上传（图生图） */}
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                <Label className="text-white text-lg font-semibold mb-3 block">
                  参考图片（可选）
                </Label>
                <p className="text-slate-400 text-sm mb-4">
                  上传一张参考图片，AI 将基于它生成新的图片
                </p>

                {referenceImage ? (
                  <div className="relative">
                    <img
                      src={`data:image/jpeg;base64,${referenceImage}`}
                      alt="参考图片"
                      className="w-full h-48 object-cover rounded-lg border border-slate-600"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:border-rose-500 transition-colors"
                  >
                    <Upload className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">
                      点击或拖拽上传图片
                    </p>
                    <p className="text-slate-500 text-xs mt-1">
                      支持 JPG、PNG，最大 10MB
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {referenceImage && (
                  <div className="mt-4">
                    <Label className="text-slate-300 text-sm font-medium mb-2 block">
                      参考强度
                    </Label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      {...register('referenceStrength')}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>低（更多创意）</span>
                      <span>高（更接近原图）</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 参数设置 */}
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
                <h3 className="text-white text-lg font-semibold mb-4">参数设置</h3>

                <div className="grid grid-cols-2 gap-4">
                  {/* 分辨率 */}
                  <div>
                    <Label className="text-slate-300 text-sm font-medium mb-2 block">
                      分辨率
                    </Label>
                    <Select value={watchedSize} onValueChange={(value) => setValue('imageSize', value as any)}>
                      <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {IMAGE_SIZES.map((size) => (
                          <SelectItem key={size.value} value={size.value}>
                            {size.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 宽高比 */}
                  <div>
                    <Label className="text-slate-300 text-sm font-medium mb-2 block">
                      宽高比
                    </Label>
                    <Select value={watchedRatio} onValueChange={(value) => setValue('aspectRatio', value)}>
                      <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ASPECT_RATIOS.map((ratio) => (
                          <SelectItem key={ratio.value} value={ratio.value}>
                            {ratio.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* 生成按钮 */}
              <Button
                type="submit"
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold py-4 text-lg shadow-lg shadow-rose-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 mr-2" />
                    开始生成
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* 右侧：结果展示 */}
          <div className="lg:sticky lg:top-8 h-fit">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-rose-500" />
                生成结果
              </h3>

              {generatedImage ? (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={generatedImage}
                      alt="生成的图片"
                      className="w-full rounded-lg border border-slate-600 shadow-2xl"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleDownload}
                      className="flex-1 bg-slate-700 hover:bg-slate-600 text-white"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      下载图片
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      保存到素材库
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-600 rounded-lg p-12 text-center">
                  <ImageIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-500 text-sm">
                    生成的图片将在这里显示
                  </p>
                </div>
              )}
            </div>

            {/* 提示 */}
            <div className="mt-4 bg-slate-800/30 border border-slate-700 rounded-lg p-4">
              <h4 className="text-slate-300 font-medium mb-2 text-sm">💡 提示</h4>
              <ul className="text-slate-500 text-xs space-y-1">
                <li>• 详细的提示词会得到更好的结果</li>
                <li>• 参考图片可以控制生成风格</li>
                <li>• 0.5K 适合快速预览，4K 适合最终输出</li>
                <li>• 负向提示词可以避免不想要的内容</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
