// 时间线编辑器类型定义

// 时间线轨道类型
export type TrackType = 'video' | 'audio' | 'subtitle';

// 单个片段（Clip）
export interface TimelineClip {
  id: string;
  trackId: string;
  assetId: string;
  name: string;
  // 时间信息（秒）
  startTime: number;  // 在时间线上的开始时间
  duration: number;   // 片段时长
  trimStart: number;  // 裁剪开始点（相对于素材）
  trimEnd: number;    // 裁剪结束点（相对于素材）
  // 素材信息
  assetUrl: string;
  assetType: 'image' | 'video' | 'audio';
  thumbnail?: string;
  // 特效
  opacity: number;
  volume: number;
  playbackRate: number;
  // 字幕特有
  text?: string;
  textStyle?: {
    fontSize: number;
    color: string;
    position: 'top' | 'center' | 'bottom';
  };
}

// 轨道
export interface TimelineTrack {
  id: string;
  type: TrackType;
  name: string;
  muted: boolean;
  locked: boolean;
  visible: boolean;
  clips: TimelineClip[];
}

// 时间线状态
export interface TimelineState {
  tracks: TimelineTrack[];
  duration: number;        // 总时长
  currentTime: number;     // 当前播放时间
  zoom: number;            // 缩放级别 (pixels per second)
  snapToGrid: boolean;     // 是否吸附到网格
  gridSize: number;        // 网格大小（秒）
  selectedClipId: string | null;
  selectedTrackId: string | null;
  isPlaying: boolean;
}

// 时间线操作
export type TimelineAction =
  | { type: 'SET_TRACKS'; payload: TimelineTrack[] }
  | { type: 'ADD_TRACK'; payload: TimelineTrack }
  | { type: 'REMOVE_TRACK'; payload: string }
  | { type: 'UPDATE_TRACK'; payload: { id: string; updates: Partial<TimelineTrack> } }
  | { type: 'ADD_CLIP'; payload: { trackId: string; clip: TimelineClip } }
  | { type: 'REMOVE_CLIP'; payload: { trackId: string; clipId: string } }
  | { type: 'UPDATE_CLIP'; payload: { trackId: string; clipId: string; updates: Partial<TimelineClip> } }
  | { type: 'MOVE_CLIP'; payload: { clipId: string; targetTrackId: string; newStartTime: number } }
  | { type: 'SET_CURRENT_TIME'; payload: number }
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'SET_SELECTED_CLIP'; payload: string | null }
  | { type: 'SET_PLAYING'; payload: boolean }
  | { type: 'SET_DURATION'; payload: number };

// 默认时间线状态
export const defaultTimelineState: TimelineState = {
  tracks: [
    {
      id: 'video-track-1',
      type: 'video',
      name: '视频轨道 1',
      muted: false,
      locked: false,
      visible: true,
      clips: [],
    },
    {
      id: 'audio-track-1',
      type: 'audio',
      name: '音频轨道 1',
      muted: false,
      locked: false,
      visible: true,
      clips: [],
    },
    {
      id: 'subtitle-track-1',
      type: 'subtitle',
      name: '字幕轨道',
      muted: false,
      locked: false,
      visible: true,
      clips: [],
    },
  ],
  duration: 60,
  currentTime: 0,
  zoom: 50, // 50px per second
  snapToGrid: true,
  gridSize: 0.5, // 0.5 seconds
  selectedClipId: null,
  selectedTrackId: null,
  isPlaying: false,
};
