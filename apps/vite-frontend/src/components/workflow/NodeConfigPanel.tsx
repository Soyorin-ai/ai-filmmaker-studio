import {useState} from 'react';
import {X, Wrench} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import type {WorkflowNode, WorkflowNodeType} from './types';

interface NodeConfigPanelProps {
  node: WorkflowNode | null;
  onClose: () => void;
  onUpdate: (nodeId: string, data: Partial<WorkflowNode['data']>) => void;
}

const imageSizeOptions = ['0.5K', '1K', '2K', '4K'] as const;
const aspectRatioOptions = ['1:1', '16:9', '9:16', '4:3', '3:4', '21:9'] as const;
const videoResolutionOptions = ['480p', '720p', '1080p'] as const;
const videoTypeOptions = ['text2video', 'image2video', 'frame2video'] as const;
const musicModelOptions = ['suno-v4', 'suno-v4.5', 'suno-v5'] as const;
const musicModeOptions = ['simple', 'custom', 'instrumental'] as const;
const exportFormatOptions = ['mp4', 'webm', 'gif'] as const;
const exportResolutionOptions = ['720p', '1080p', '4K'] as const;
const mergeModeOptions = ['sequence', 'parallel'] as const;

const nodeTypeLabels: Record<WorkflowNodeType, string> = {
  input: '输入节点',
  imageGen: '图片生成',
  videoGen: '视频生成',
  musicGen: '音乐生成',
  merge: '合并节点',
  export: '导出节点',
};

export function NodeConfigPanel({node, onClose, onUpdate}: NodeConfigPanelProps) {
  const [localData, setLocalData] = useState(node?.data ?? {});

  if (!node) {
    return (
      <div
        className="w-80 rounded-2xl border border-white/10 backdrop-blur-sm overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.6), rgba(15, 23, 42, 0.6))',
        }}
      >
        <div className="flex flex-col items-center justify-center py-12 text-white/40">
          <Wrench className="w-12 h-12 mb-3 opacity-50" />
          <p className="text-sm">选择一个节点进行配置</p>
        </div>
      </div>
    );
  }

  const handleUpdate = (key: string, value: string | number | boolean) => {
    const newData = {...localData, [key]: value};
    setLocalData(newData);
    onUpdate(node.id, newData as Partial<WorkflowNode['data']>);
  };

  return (
    <div
      className="w-80 rounded-2xl border border-white/10 backdrop-blur-sm overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.6), rgba(15, 23, 42, 0.6))',
      }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <h3 className="text-sm font-medium text-white">{nodeTypeLabels[node.type as WorkflowNodeType]}</h3>
        <button type="button" onClick={onClose} className="p-1 rounded hover:bg-white/10 transition-colors">
          <X className="w-4 h-4 text-white/60" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* 通用：名称 */}
        <div>
          <Label className="text-white/70">节点名称</Label>
          <Input
            value={'label' in localData ? (localData.label as string) : ''}
            onChange={(e) => {
              handleUpdate('label', e.target.value);
            }}
            className="mt-2 bg-white/5 border-white/10 text-white"
          />
        </div>

        {/* 输入节点 */}
        {node.type === 'input' && (
          <div>
            <Label className="text-white/70">提示词</Label>
            <Textarea
              value={'prompt' in localData ? (localData.prompt as string) : ''}
              onChange={(e) => {
                handleUpdate('prompt', e.target.value);
              }}
              placeholder="输入提示词..."
              className="mt-2 bg-white/5 border-white/10 text-white"
              rows={4}
            />
          </div>
        )}

        {/* 图片生成节点 */}
        {node.type === 'imageGen' && (
          <>
            <div>
              <Label className="text-white/70">提示词 *</Label>
              <Textarea
                value={'prompt' in localData ? (localData.prompt as string) : ''}
                onChange={(e) => {
                  handleUpdate('prompt', e.target.value);
                }}
                placeholder="描述你想要的画面..."
                className="mt-2 bg-white/5 border-white/10 text-white"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-white/70">分辨率</Label>
                <Select
                  value={'imageSize' in localData ? (localData.imageSize as string) : '1K'}
                  onValueChange={(v) => {
                    handleUpdate('imageSize', v);
                  }}
                >
                  <SelectTrigger className="mt-2 bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/20">
                    {imageSizeOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white/70">宽高比</Label>
                <Select
                  value={'aspectRatio' in localData ? (localData.aspectRatio as string) : '16:9'}
                  onValueChange={(v) => {
                    handleUpdate('aspectRatio', v);
                  }}
                >
                  <SelectTrigger className="mt-2 bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/20">
                    {aspectRatioOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )}

        {/* 视频生成节点 */}
        {node.type === 'videoGen' && (
          <>
            <div>
              <Label className="text-white/70">提示词 *</Label>
              <Textarea
                value={'prompt' in localData ? (localData.prompt as string) : ''}
                onChange={(e) => {
                  handleUpdate('prompt', e.target.value);
                }}
                placeholder="描述视频内容..."
                className="mt-2 bg-white/5 border-white/10 text-white"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-white/70">类型</Label>
                <Select
                  value={'type' in localData ? (localData.type as string) : 'text2video'}
                  onValueChange={(v) => {
                    handleUpdate('type', v);
                  }}
                >
                  <SelectTrigger className="mt-2 bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/20">
                    {videoTypeOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white/70">分辨率</Label>
                <Select
                  value={'resolution' in localData ? (localData.resolution as string) : '720p'}
                  onValueChange={(v) => {
                    handleUpdate('resolution', v);
                  }}
                >
                  <SelectTrigger className="mt-2 bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/20">
                    {videoResolutionOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-white/70">时长 (秒)</Label>
              <Input
                type="number"
                value={'duration' in localData ? (localData.duration as number) : 5}
                onChange={(e) => {
                  handleUpdate('duration', Number.parseInt(e.target.value, 10));
                }}
                className="mt-2 bg-white/5 border-white/10 text-white"
                min={4}
                max={12}
              />
            </div>
          </>
        )}

        {/* 音乐生成节点 */}
        {node.type === 'musicGen' && (
          <>
            <div>
              <Label className="text-white/70">描述/歌词 *</Label>
              <Textarea
                value={'prompt' in localData ? (localData.prompt as string) : ''}
                onChange={(e) => {
                  handleUpdate('prompt', e.target.value);
                }}
                placeholder="描述音乐或输入歌词..."
                className="mt-2 bg-white/5 border-white/10 text-white"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-white/70">模式</Label>
                <Select
                  value={'mode' in localData ? (localData.mode as string) : 'simple'}
                  onValueChange={(v) => {
                    handleUpdate('mode', v);
                  }}
                >
                  <SelectTrigger className="mt-2 bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/20">
                    {musicModeOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white/70">模型</Label>
                <Select
                  value={'model' in localData ? (localData.model as string) : 'suno-v4'}
                  onValueChange={(v) => {
                    handleUpdate('model', v);
                  }}
                >
                  <SelectTrigger className="mt-2 bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/20">
                    {musicModelOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )}

        {/* 合并节点 */}
        {node.type === 'merge' && (
          <div>
            <Label className="text-white/70">合并模式</Label>
            <Select
              value={'mode' in localData ? (localData.mode as string) : 'sequence'}
              onValueChange={(v) => {
                handleUpdate('mode', v);
              }}
            >
              <SelectTrigger className="mt-2 bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/20">
                {mergeModeOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt === 'sequence' ? '顺序播放' : '并行合成'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* 导出节点 */}
        {node.type === 'export' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-white/70">格式</Label>
              <Select
                value={'format' in localData ? (localData.format as string) : 'mp4'}
                onValueChange={(v) => {
                  handleUpdate('format', v);
                }}
              >
                <SelectTrigger className="mt-2 bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/20">
                  {exportFormatOptions.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white/70">分辨率</Label>
              <Select
                value={'resolution' in localData ? (localData.resolution as string) : '1080p'}
                onValueChange={(v) => {
                  handleUpdate('resolution', v);
                }}
              >
                <SelectTrigger className="mt-2 bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/20">
                  {exportResolutionOptions.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/10">
        <Button
          onClick={onClose}
          className="w-full cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #F97316, #EA580C)',
          }}
        >
          应用配置
        </Button>
      </div>
    </div>
  );
}
