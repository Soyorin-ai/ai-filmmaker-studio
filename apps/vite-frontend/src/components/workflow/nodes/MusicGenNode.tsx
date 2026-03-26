import {Music} from 'lucide-react';
import {BaseNode} from './BaseNode';
import type {MusicGenNodeData} from '../types';
import type {NodeProps} from '@xyflow/react';

export function MusicGenNode(props: NodeProps<MusicGenNodeData>) {
  const {data} = props;

  const modeLabels = {
    simple: '简单模式',
    custom: '自定义歌词',
    instrumental: '纯音乐',
  };

  return (
    <BaseNode
      {...props}
      data={data}
      icon={<Music className="w-4 h-4" />}
      color="#F59E0B"
      inputs={[{id: 'prompt'}]}
      outputs={[{id: 'audio'}]}
    >
      {data.audioUrl ? (
        <div className="flex items-center gap-2 bg-white/5 rounded p-1">
          <div className="w-6 h-6 rounded bg-orange-500/20 flex items-center justify-center">
            <Music className="w-3 h-3 text-orange-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-white truncate">音频已生成</div>
          </div>
        </div>
      ) : (
        <div className="text-xs text-white/60">
          {modeLabels[data.mode]} · {data.duration}s
        </div>
      )}
    </BaseNode>
  );
}
