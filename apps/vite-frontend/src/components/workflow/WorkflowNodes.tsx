import {memo} from 'react';
import {Handle, Position, type NodeProps} from '@xyflow/react';
import {Type, Image, Video, Music, Combine, Download, Wrench} from 'lucide-react';
import type {WorkflowNodeData, WorkflowNodeType} from './types';

const nodeConfig: Record<WorkflowNodeType, {icon: React.ElementType; color: string; bgColor: string}> = {
  input: {
    icon: Type,
    color: '#3B82F6',
    bgColor: 'rgba(59, 130, 246, 0.1)',
  },
  imageGen: {
    icon: Image,
    color: '#8B5CF6',
    bgColor: 'rgba(139, 92, 246, 0.1)',
  },
  videoGen: {
    icon: Video,
    color: '#EC4899',
    bgColor: 'rgba(236, 72, 153, 0.1)',
  },
  musicGen: {
    icon: Music,
    color: '#F97316',
    bgColor: 'rgba(249, 115, 22, 0.1)',
  },
  merge: {
    icon: Combine,
    color: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
  },
  export: {
    icon: Download,
    color: '#06B6D4',
    bgColor: 'rgba(6, 182, 212, 0.1)',
  },
};

interface WorkflowNodeProps extends NodeProps<WorkflowNodeData> {
  nodeType: WorkflowNodeType;
}

function WorkflowNodeComponent({data, nodeType, selected}: WorkflowNodeProps) {
  const config = nodeConfig[nodeType];
  const Icon = config.icon;
  const label = data.label ?? nodeType;

  return (
    <div
      className="px-4 py-3 rounded-xl border backdrop-blur-sm min-w-[160px] transition-all duration-200"
      style={{
        background: `linear-gradient(135deg, rgba(30, 27, 75, 0.9), rgba(15, 23, 42, 0.9))`,
        borderColor: selected ? config.color : 'rgba(255, 255, 255, 0.1)',
        boxShadow: selected ? `0 0 20px ${config.color}40` : 'none',
      }}
    >
      {/* 输入 Handle */}
      {nodeType !== 'input' && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 border-2"
          style={{
            background: config.color,
            borderColor: config.color,
          }}
        />
      )}

      {/* 节点内容 */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg" style={{background: config.bgColor}}>
          <Icon className="w-4 h-4" style={{color: config.color}} />
        </div>
        <div>
          <div className="text-sm font-medium text-white">{label}</div>
          {'prompt' in data && data.prompt && (
            <div className="text-xs text-white/40 truncate max-w-[120px]">{data.prompt}</div>
          )}
        </div>
      </div>

      {/* 配置按钮 */}
      <button
        type="button"
        className="absolute top-2 right-2 p-1 rounded opacity-0 hover:opacity-100 transition-opacity"
        style={{background: 'rgba(255, 255, 255, 0.1)'}}
      >
        <Wrench className="w-3 h-3 text-white/60" />
      </button>

      {/* 输出 Handle */}
      {nodeType !== 'export' && (
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 border-2"
          style={{
            background: config.color,
            borderColor: config.color,
          }}
        />
      )}
    </div>
  );
}

// 创建各个节点类型
export const InputNode = memo((props: NodeProps) => <WorkflowNodeComponent {...props} nodeType="input" />);

export const ImageGenNode = memo((props: NodeProps) => <WorkflowNodeComponent {...props} nodeType="imageGen" />);

export const VideoGenNode = memo((props: NodeProps) => <WorkflowNodeComponent {...props} nodeType="videoGen" />);

export const MusicGenNode = memo((props: NodeProps) => <WorkflowNodeComponent {...props} nodeType="musicGen" />);

export const MergeNode = memo((props: NodeProps) => <WorkflowNodeComponent {...props} nodeType="merge" />);

export const ExportNode = memo((props: NodeProps) => <WorkflowNodeComponent {...props} nodeType="export" />);

export const nodeTypes = {
  input: InputNode,
  imageGen: ImageGenNode,
  videoGen: VideoGenNode,
  musicGen: MusicGenNode,
  merge: MergeNode,
  export: ExportNode,
};
