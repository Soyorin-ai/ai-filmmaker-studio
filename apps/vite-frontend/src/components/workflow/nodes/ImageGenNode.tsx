import {Image} from 'lucide-react';
import {BaseNode} from './BaseNode';
import type {ImageGenNodeData} from '../types';
import type {NodeProps} from '@xyflow/react';

export function ImageGenNode(props: NodeProps<ImageGenNodeData>) {
  const {data} = props;

  return (
    <BaseNode
      {...props}
      data={data}
      icon={<Image className="w-4 h-4" />}
      color="#8B5CF6"
      inputs={[{id: 'prompt'}]}
      outputs={[{id: 'image'}]}
    >
      {data.imageUrl ? (
        <div className="rounded overflow-hidden">
          <img src={data.imageUrl} alt="Generated" className="w-full h-16 object-cover" />
        </div>
      ) : (
        <div className="text-xs text-white/60">
          {data.imageSize} · {data.aspectRatio}
        </div>
      )}
    </BaseNode>
  );
}
