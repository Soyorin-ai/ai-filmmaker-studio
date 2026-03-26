import {Layers} from 'lucide-react';
import {BaseNode} from './BaseNode';
import type {MergeNodeData} from '../types';
import type {NodeProps} from '@xyflow/react';

export function MergeNode(props: NodeProps<MergeNodeData>) {
  const {data} = props;

  const modeLabels = {
    sequence: '顺序合并',
    parallel: '并行合成',
  };

  return (
    <BaseNode
      {...props}
      data={data}
      icon={<Layers className="w-4 h-4" />}
      color="#06B6D4"
      inputs={[
        {id: 'input1', label: '输入1'},
        {id: 'input2', label: '输入2'},
        {id: 'input3', label: '输入3'},
      ]}
      outputs={[{id: 'output'}]}
    >
      <div className="text-xs text-white/60">
        {modeLabels[data.mode]}
      </div>
    </BaseNode>
  );
}
