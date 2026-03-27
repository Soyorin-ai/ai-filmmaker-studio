import {Video} from 'lucide-react';
import {BaseNode} from './BaseNode';
import type {VideoGenNodeData} from '../types';
import type {NodeProps} from '@xyflow/react';

export function VideoGenNode(props: NodeProps<VideoGenNodeData>) {
  const {data} = props;

  const typeLabels = {
    text2video: '文生视频',
    image2video: '图生视频',
    frame2video: '首尾帧',
  };

  return (
    <BaseNode
      {...props}
      data={data}
      icon={<Video className="w-4 h-4" />}
      color="#EC4899"
      inputs={[{id: 'prompt'}, {id: 'image'}]}
      outputs={[{id: 'video'}]}
    >
      {data.videoUrl ? (
        <div className="rounded overflow-hidden bg-black/50">
          <video src={data.videoUrl} className="w-full h-16 object-cover" muted />
        </div>
      ) : (
        <div className="text-xs text-white/60">
          {typeLabels[data.genType]} · {data.resolution} · {data.duration}s
        </div>
      )}
    </BaseNode>
  );
}
