import {Download} from 'lucide-react';
import {BaseNode} from './BaseNode';
import type {OutputNodeData} from '../types';
import type {NodeProps} from '@xyflow/react';

export function OutputNode(props: NodeProps<OutputNodeData>) {
  const {data} = props;

  return (
    <BaseNode
      {...props}
      data={data}
      icon={<Download className="w-4 h-4" />}
      color="#10B981"
      inputs={[{id: 'input'}]}
    >
      {data.outputUrl ? (
        <div className="text-xs text-green-400 flex items-center gap-1">
          <Download className="w-3 h-3" />
          点击下载
        </div>
      ) : (
        <div className="text-xs text-white/60">
          {data.format.toUpperCase()} · {data.resolution}
        </div>
      )}
    </BaseNode>
  );
}
