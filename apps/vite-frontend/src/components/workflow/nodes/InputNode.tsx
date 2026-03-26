import {Type} from 'lucide-react';
import {BaseNode} from './BaseNode';
import type {InputNodeData} from '../types';
import type {NodeProps} from '@xyflow/react';

export function InputNode(props: NodeProps<InputNodeData>) {
  const {data} = props;

  return (
    <BaseNode
      {...props}
      data={data}
      icon={<Type className="w-4 h-4" />}
      color="#3B82F6"
      outputs={[{id: 'output'}]}
    >
      <div className="text-xs text-white/60 line-clamp-2">
        {data.prompt || '点击配置提示词...'}
      </div>
    </BaseNode>
  );
}
