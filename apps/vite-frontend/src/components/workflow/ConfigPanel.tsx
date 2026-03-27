import {X, Trash2} from 'lucide-react';
import type {Node} from '@xyflow/react';
import type {WorkflowNodeData} from './types';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';

type ConfigPanelProps = {
  readonly node: Node<WorkflowNodeData>;
  readonly onUpdate: (data: Partial<WorkflowNodeData>) => void;
  readonly onDelete: () => void;
  readonly onClose: () => void;
}

export function ConfigPanel({node, onUpdate, onDelete, onClose}: ConfigPanelProps) {
  const {data} = node;

  // 根据节点类型渲染不同的配置项
  const renderConfig = () => {
    switch (data.type) {
      case 'input': {
        return (
          <div>
            <Label className="text-white/70">提示词</Label>
            <Textarea
              value={data.prompt}
              placeholder="输入场景描述..."
              className="mt-2 bg-white/5 border-white/10 text-white placeholder-white/30"
              rows={4}
              onChange={(e) => { onUpdate({prompt: e.target.value}); }}
            />
          </div>
        );
      }

      case 'imageGen': {
        return (
          <>
            <div>
              <Label className="text-white/70">提示词</Label>
              <Textarea
                value={data.prompt}
                placeholder="描述你想要的画面..."
                className="mt-2 bg-white/5 border-white/10 text-white placeholder-white/30"
                rows={3}
                onChange={(e) => { onUpdate({prompt: e.target.value}); }}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-white/70">分辨率</Label>
                <Select
                  value={data.imageSize}
                  onValueChange={(v) => { onUpdate({imageSize: v as '0.5K' | '1K' | '2K' | '4K'}); }}
                >
                  <SelectTrigger className="mt-2 bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/20">
                    <SelectItem value="0.5K">0.5K</SelectItem>
                    <SelectItem value="1K">1K</SelectItem>
                    <SelectItem value="2K">2K</SelectItem>
                    <SelectItem value="4K">4K</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white/70">宽高比</Label>
                <Select value={data.aspectRatio} onValueChange={(v) => { onUpdate({aspectRatio: v}); }}>
                  <SelectTrigger className="mt-2 bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/20">
                    <SelectItem value="1:1">1:1</SelectItem>
                    <SelectItem value="16:9">16:9</SelectItem>
                    <SelectItem value="9:16">9:16</SelectItem>
                    <SelectItem value="4:3">4:3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        );
      }

      case 'videoGen': {
        return (
          <>
            <div>
              <Label className="text-white/70">提示词</Label>
              <Textarea
                value={data.prompt}
                placeholder="描述视频内容..."
                className="mt-2 bg-white/5 border-white/10 text-white placeholder-white/30"
                rows={3}
                onChange={(e) => { onUpdate({prompt: e.target.value}); }}
              />
            </div>
            <div>
              <Label className="text-white/70">生成方式</Label>
              <Select
                value={data.genType}
                onValueChange={(v) => { onUpdate({genType: v as 'text2video' | 'image2video' | 'frame2video'}); }}
              >
                <SelectTrigger className="mt-2 bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/20">
                  <SelectItem value="text2video">文生视频</SelectItem>
                  <SelectItem value="image2video">图生视频</SelectItem>
                  <SelectItem value="frame2video">首尾帧</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-white/70">分辨率</Label>
                <Select
                  value={data.resolution}
                  onValueChange={(v) => { onUpdate({resolution: v as '480p' | '720p' | '1080p'}); }}
                >
                  <SelectTrigger className="mt-2 bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/20">
                    <SelectItem value="480p">480p</SelectItem>
                    <SelectItem value="720p">720p</SelectItem>
                    <SelectItem value="1080p">1080p</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white/70">时长 (秒)</Label>
                <Input
                  type="number"
                  value={data.duration}
                  className="mt-2 bg-white/5 border-white/10 text-white"
                  min={4}
                  max={12}
                  onChange={(e) => { onUpdate({duration: Number(e.target.value)}); }}
                />
              </div>
            </div>
          </>
        );
      }

      case 'musicGen': {
        return (
          <>
            <div>
              <Label className="text-white/70">音乐描述</Label>
              <Textarea
                value={data.prompt}
                placeholder="描述音乐风格..."
                className="mt-2 bg-white/5 border-white/10 text-white placeholder-white/30"
                rows={3}
                onChange={(e) => { onUpdate({prompt: e.target.value}); }}
              />
            </div>
            <div>
              <Label className="text-white/70">模式</Label>
              <Select
                value={data.mode}
                onValueChange={(v) => { onUpdate({mode: v as 'simple' | 'custom' | 'instrumental'}); }}
              >
                <SelectTrigger className="mt-2 bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/20">
                  <SelectItem value="simple">简单模式</SelectItem>
                  <SelectItem value="custom">自定义歌词</SelectItem>
                  <SelectItem value="instrumental">纯音乐</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white/70">时长 (秒)</Label>
              <Input
                type="number"
                value={data.duration}
                className="mt-2 bg-white/5 border-white/10 text-white"
                min={30}
                max={240}
                onChange={(e) => { onUpdate({duration: Number(e.target.value)}); }}
              />
            </div>
          </>
        );
      }

      case 'merge': {
        return (
          <>
            <div>
              <Label className="text-white/70">合并方式</Label>
              <Select value={data.mode} onValueChange={(v) => { onUpdate({mode: v as 'sequence' | 'parallel'}); }}>
                <SelectTrigger className="mt-2 bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/20">
                  <SelectItem value="sequence">顺序合并</SelectItem>
                  <SelectItem value="parallel">并行合成</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-white/50">
              顺序合并：按顺序连接视频
              <br />
              并行合成：同时播放多个素材
            </p>
          </>
        );
      }

      case 'output': {
        return (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-white/70">格式</Label>
              <Select value={data.format} onValueChange={(v) => { onUpdate({format: v as 'mp4' | 'webm' | 'gif'}); }}>
                <SelectTrigger className="mt-2 bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/20">
                  <SelectItem value="mp4">MP4</SelectItem>
                  <SelectItem value="webm">WebM</SelectItem>
                  <SelectItem value="gif">GIF</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white/70">分辨率</Label>
              <Select
                value={data.resolution}
                onValueChange={(v) => { onUpdate({resolution: v as '480p' | '720p' | '1080p'}); }}
              >
                <SelectTrigger className="mt-2 bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/20">
                  <SelectItem value="480p">480p</SelectItem>
                  <SelectItem value="720p">720p</SelectItem>
                  <SelectItem value="1080p">1080p</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      }
    }
  };

  return (
    <div
      className="rounded-lg border border-white/10 backdrop-blur-sm p-4 w-72"
      style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 27, 75, 0.9))',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">{data.label}</h3>
        <button
          type="button"
          className="p-1 hover:bg-white/10 rounded transition-colors cursor-pointer"
          onClick={onClose}
        >
          <X className="w-4 h-4 text-white/60" />
        </button>
      </div>

      {/* Name */}
      <div className="mb-4">
        <Label className="text-white/70">节点名称</Label>
        <Input
          value={data.label}
          className="mt-2 bg-white/5 border-white/10 text-white"
          onChange={(e) => { onUpdate({label: e.target.value}); }}
        />
      </div>

      {/* Type-specific config */}
      <div className="space-y-4">{renderConfig()}</div>

      {/* Actions */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <Button variant="destructive" size="sm" className="w-full cursor-pointer" onClick={onDelete}>
          <Trash2 className="w-4 h-4 mr-2" />
          删除节点
        </Button>
      </div>
    </div>
  );
}
