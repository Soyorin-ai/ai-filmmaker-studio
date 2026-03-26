import {InputNode} from './InputNode';
import {ImageGenNode} from './ImageGenNode';
import {VideoGenNode} from './VideoGenNode';
import {MusicGenNode} from './MusicGenNode';
import {MergeNode} from './MergeNode';
import {OutputNode} from './OutputNode';

// 注册所有节点类型
export const nodeTypes = {
  input: InputNode,
  imageGen: ImageGenNode,
  videoGen: VideoGenNode,
  musicGen: MusicGenNode,
  merge: MergeNode,
  output: OutputNode,
};

export {InputNode, ImageGenNode, VideoGenNode, MusicGenNode, MergeNode, OutputNode};
