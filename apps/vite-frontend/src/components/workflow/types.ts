// 工作流节点类型
export type WorkflowNodeType =
  | 'input' // 输入节点（提示词）
  | 'imageGen' // 生图节点
  | 'videoGen' // 生视频节点
  | 'musicGen' // 音乐生成节点
  | 'merge' // 合并节点
  | 'output'; // 输出节点

// 节点状态
export type NodeStatus = 'idle' | 'pending' | 'running' | 'completed' | 'failed';

// 基础节点数据
export interface BaseNodeData {
  label: string;
  status: NodeStatus;
  progress?: number;
  error?: string;
}

// 输入节点数据
export interface InputNodeData extends BaseNodeData {
  type: 'input';
  prompt: string;
}

// 生图节点数据
export interface ImageGenNodeData extends BaseNodeData {
  type: 'imageGen';
  prompt: string;
  negativePrompt?: string;
  imageSize: '0.5K' | '1K' | '2K' | '4K';
  aspectRatio: string;
  imageUrl?: string;
}

// 生视频节点数据
export interface VideoGenNodeData extends BaseNodeData {
  type: 'videoGen';
  prompt: string;
  genType: 'text2video' | 'image2video' | 'frame2video';
  resolution: '480p' | '720p' | '1080p';
  duration: number;
  generateAudio: boolean;
  videoUrl?: string;
}

// 音乐生成节点数据
export interface MusicGenNodeData extends BaseNodeData {
  type: 'musicGen';
  prompt: string;
  mode: 'simple' | 'custom' | 'instrumental';
  model: string;
  style?: string;
  duration: number;
  audioUrl?: string;
}

// 合并节点数据
export interface MergeNodeData extends BaseNodeData {
  type: 'merge';
  mode: 'sequence' | 'parallel'; // 顺序合并或并行合并
}

// 输出节点数据
export interface OutputNodeData extends BaseNodeData {
  type: 'output';
  format: 'mp4' | 'webm' | 'gif';
  resolution: '480p' | '720p' | '1080p';
  outputUrl?: string;
}

// 所有节点数据类型
export type WorkflowNodeData =
  | InputNodeData
  | ImageGenNodeData
  | VideoGenNodeData
  | MusicGenNodeData
  | MergeNodeData
  | OutputNodeData;

// 工作流模板
export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  nodes: Array<{
    id: string;
    type: WorkflowNodeType;
    position: {x: number; y: number};
    data: Partial<WorkflowNodeData>;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
  }>;
}

// 预设模板
export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'text-to-video',
    name: '文生视频流程',
    description: '输入文字描述，生成视频',
    nodes: [
      {
        id: 'input-1',
        type: 'input',
        position: {x: 100, y: 200},
        data: {label: '输入提示词', prompt: ''} as Partial<InputNodeData>,
      },
      {
        id: 'video-1',
        type: 'videoGen',
        position: {x: 400, y: 200},
        data: {
          label: '生成视频',
          genType: 'text2video',
          resolution: '720p',
          duration: 5,
          generateAudio: false,
        } as Partial<VideoGenNodeData>,
      },
      {
        id: 'output-1',
        type: 'output',
        position: {x: 700, y: 200},
        data: {label: '导出', format: 'mp4', resolution: '720p'} as Partial<OutputNodeData>,
      },
    ],
    edges: [
      {id: 'e1', source: 'input-1', target: 'video-1'},
      {id: 'e2', source: 'video-1', target: 'output-1'},
    ],
  },
  {
    id: 'multi-scene',
    name: '多场景短片',
    description: '生成多个场景，合并成短片',
    nodes: [
      {
        id: 'input-1',
        type: 'input',
        position: {x: 100, y: 100},
        data: {label: '场景1提示词', prompt: ''} as Partial<InputNodeData>,
      },
      {
        id: 'input-2',
        type: 'input',
        position: {x: 100, y: 300},
        data: {label: '场景2提示词', prompt: ''} as Partial<InputNodeData>,
      },
      {
        id: 'image-1',
        type: 'imageGen',
        position: {x: 350, y: 100},
        data: {label: '场景1生图', imageSize: '1K', aspectRatio: '16:9'} as Partial<ImageGenNodeData>,
      },
      {
        id: 'image-2',
        type: 'imageGen',
        position: {x: 350, y: 300},
        data: {label: '场景2生图', imageSize: '1K', aspectRatio: '16:9'} as Partial<ImageGenNodeData>,
      },
      {
        id: 'video-1',
        type: 'videoGen',
        position: {x: 600, y: 100},
        data: {
          label: '场景1视频',
          genType: 'image2video',
          resolution: '720p',
          duration: 5,
          generateAudio: false,
        } as Partial<VideoGenNodeData>,
      },
      {
        id: 'video-2',
        type: 'videoGen',
        position: {x: 600, y: 300},
        data: {
          label: '场景2视频',
          genType: 'image2video',
          resolution: '720p',
          duration: 5,
          generateAudio: false,
        } as Partial<VideoGenNodeData>,
      },
      {
        id: 'merge-1',
        type: 'merge',
        position: {x: 850, y: 200},
        data: {label: '合并视频', mode: 'sequence'} as Partial<MergeNodeData>,
      },
      {
        id: 'output-1',
        type: 'output',
        position: {x: 1100, y: 200},
        data: {label: '导出短片', format: 'mp4', resolution: '720p'} as Partial<OutputNodeData>,
      },
    ],
    edges: [
      {id: 'e1', source: 'input-1', target: 'image-1'},
      {id: 'e2', source: 'input-2', target: 'image-2'},
      {id: 'e3', source: 'image-1', target: 'video-1'},
      {id: 'e4', source: 'image-2', target: 'video-2'},
      {id: 'e5', source: 'video-1', target: 'merge-1'},
      {id: 'e6', source: 'video-2', target: 'merge-1'},
      {id: 'e7', source: 'merge-1', target: 'output-1'},
    ],
  },
  {
    id: 'music-video',
    name: '音乐视频',
    description: '生成带背景音乐的视频',
    nodes: [
      {
        id: 'input-1',
        type: 'input',
        position: {x: 100, y: 100},
        data: {label: '视频提示词', prompt: ''} as Partial<InputNodeData>,
      },
      {
        id: 'input-2',
        type: 'input',
        position: {x: 100, y: 300},
        data: {label: '音乐描述', prompt: ''} as Partial<InputNodeData>,
      },
      {
        id: 'video-1',
        type: 'videoGen',
        position: {x: 400, y: 100},
        data: {
          label: '生成视频',
          genType: 'text2video',
          resolution: '720p',
          duration: 10,
          generateAudio: false,
        } as Partial<VideoGenNodeData>,
      },
      {
        id: 'music-1',
        type: 'musicGen',
        position: {x: 400, y: 300},
        data: {label: '生成音乐', mode: 'instrumental', model: 'suno-v4', duration: 10} as Partial<MusicGenNodeData>,
      },
      {
        id: 'merge-1',
        type: 'merge',
        position: {x: 700, y: 200},
        data: {label: '合并音视频', mode: 'parallel'} as Partial<MergeNodeData>,
      },
      {
        id: 'output-1',
        type: 'output',
        position: {x: 1000, y: 200},
        data: {label: '导出', format: 'mp4', resolution: '720p'} as Partial<OutputNodeData>,
      },
    ],
    edges: [
      {id: 'e1', source: 'input-1', target: 'video-1'},
      {id: 'e2', source: 'input-2', target: 'music-1'},
      {id: 'e3', source: 'video-1', target: 'merge-1'},
      {id: 'e4', source: 'music-1', target: 'merge-1'},
      {id: 'e5', source: 'merge-1', target: 'output-1'},
    ],
  },
];
