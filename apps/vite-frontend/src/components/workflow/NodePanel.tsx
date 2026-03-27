import {Type, Image, Video, Music, Layers, Download} from 'lucide-react';

interface NodePanelProps {
  onAddNode: (type: string, label: string) => void;
}

const NODE_TEMPLATES = [
  {
    type: 'input',
    label: '输入节点',
    icon: Type,
    color: '#3B82F6',
    description: '输入提示词',
  },
  {
    type: 'imageGen',
    label: '生图节点',
    icon: Image,
    color: '#8B5CF6',
    description: 'AI 生成图片',
  },
  {
    type: 'videoGen',
    label: '生视频节点',
    icon: Video,
    color: '#EC4899',
    description: 'AI 生成视频',
  },
  {
    type: 'musicGen',
    label: '音乐节点',
    icon: Music,
    color: '#F59E0B',
    description: 'AI 生成音乐',
  },
  {
    type: 'merge',
    label: '合并节点',
    icon: Layers,
    color: '#06B6D4',
    description: '合并多个素材',
  },
  {
    type: 'output',
    label: '输出节点',
    icon: Download,
    color: '#10B981',
    description: '导出最终作品',
  },
];

export function NodePanel({onAddNode}: NodePanelProps) {
  return (
    <div
      className="rounded-lg border border-white/10 backdrop-blur-sm p-3 w-52"
      style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 27, 75, 0.9))',
      }}
    >
      <h3 className="text-sm font-semibold text-white mb-3">节点库</h3>
      <div className="space-y-1">
        {NODE_TEMPLATES.map((template) => {
          const Icon = template.icon;
          return (
            <button
              key={template.type}
              type="button"
              onClick={() => onAddNode(template.type, template.label)}
              className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-white/10 transition-colors text-left group cursor-pointer"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{backgroundColor: `${template.color}20`}}
              >
                <Icon className="w-4 h-4" style={{color: template.color}} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white group-hover:text-white">{template.label}</div>
                <div className="text-xs text-white/40">{template.description}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-white/10">
        <p className="text-xs text-white/40">拖拽节点到画布，或点击添加</p>
      </div>
    </div>
  );
}
