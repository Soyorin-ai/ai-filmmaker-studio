// 时间线片段组件
import {useState, useRef, useCallback} from 'react';
import type {TimelineClip as TimelineClipType} from './types';

interface TimelineClipProps {
  clip: TimelineClipType;
  zoom: number;
  isSelected: boolean;
  snapToGrid: boolean;
  gridSize: number;
  maxTime: number;
  trackType: 'video' | 'audio' | 'subtitle';
  onSelect: () => void;
  onUpdate: (updates: Partial<TimelineClipType>) => void;
  onDragStart: (e: React.MouseEvent) => void;
}

export function TimelineClip({
  clip,
  zoom,
  isSelected,
  snapToGrid,
  gridSize,
  maxTime,
  trackType,
  onSelect,
  onUpdate,
  onDragStart,
}: TimelineClipProps) {
  const [isResizing, setIsResizing] = useState<'left' | 'right' | null>(null);
  const resizeStartX = useRef(0);
  const resizeStartTime = useRef(0);
  const resizeStartDuration = useRef(0);

  const left = clip.startTime * zoom;
  const width = clip.duration * zoom;

  // 吸附到网格
  const snapTime = useCallback(
    (time: number) => {
      if (!snapToGrid) return time;
      return Math.round(time / gridSize) * gridSize;
    },
    [snapToGrid, gridSize],
  );

  // 处理左侧裁剪手柄拖拽
  const handleLeftResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing('left');
    resizeStartX.current = e.clientX;
    resizeStartTime.current = clip.startTime;
    resizeStartDuration.current = clip.duration;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - resizeStartX.current;
      const deltaTime = deltaX / zoom;
      let newStartTime = snapTime(resizeStartTime.current + deltaTime);
      let newDuration = resizeStartDuration.current - deltaTime;

      // 限制最小时长
      if (newDuration < 0.5) {
        newDuration = 0.5;
        newStartTime = resizeStartTime.current + resizeStartDuration.current - 0.5;
      }

      // 限制不能小于0
      if (newStartTime < 0) {
        newStartTime = 0;
        newDuration = resizeStartTime.current + resizeStartDuration.current;
      }

      onUpdate({startTime: newStartTime, duration: newDuration});
    };

    const handleMouseUp = () => {
      setIsResizing(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // 处理右侧裁剪手柄拖拽
  const handleRightResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing('right');
    resizeStartX.current = e.clientX;
    resizeStartDuration.current = clip.duration;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - resizeStartX.current;
      const deltaTime = deltaX / zoom;
      let newDuration = snapTime(resizeStartDuration.current + deltaTime);

      // 限制最小时长
      if (newDuration < 0.5) newDuration = 0.5;

      // 限制不超过最大时间
      if (clip.startTime + newDuration > maxTime + 60) {
        newDuration = maxTime + 60 - clip.startTime;
      }

      onUpdate({duration: newDuration});
    };

    const handleMouseUp = () => {
      setIsResizing(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // 根据轨道类型获取样式
  const getTrackStyle = () => {
    switch (trackType) {
      case 'video':
        return 'bg-gradient-to-r from-blue-600 to-blue-500';
      case 'audio':
        return 'bg-gradient-to-r from-green-600 to-green-500';
      case 'subtitle':
        return 'bg-gradient-to-r from-purple-600 to-purple-500';
    }
  };

  return (
    <div
      className={`absolute top-1 bottom-1 rounded cursor-move group ${getTrackStyle()} ${
        isSelected ? 'ring-2 ring-white ring-offset-1 ring-offset-slate-900' : ''
      } ${isResizing ? 'cursor-ew-resize' : ''}`}
      style={{left, width: Math.max(width, 20)}}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onMouseDown={onDragStart}
    >
      {/* 缩略图/波形图区域 */}
      {clip.thumbnail && trackType === 'video' && (
        <div className="absolute inset-0 overflow-hidden rounded opacity-50">
          <img src={clip.thumbnail} alt={clip.name} className="w-full h-full object-cover" />
        </div>
      )}

      {/* 音频波形占位 */}
      {trackType === 'audio' && (
        <div className="absolute inset-0 flex items-center px-2">
          <div className="w-full h-6 flex items-end gap-px">
            {Array.from({length: 30}).map((_, i) => (
              <div key={i} className="flex-1 bg-white/40 rounded-t" style={{height: `${Math.random() * 100}%`}} />
            ))}
          </div>
        </div>
      )}

      {/* 字幕文本 */}
      {trackType === 'subtitle' && clip.text && (
        <div className="absolute inset-0 flex items-center px-2">
          <span className="text-xs text-white truncate">{clip.text}</span>
        </div>
      )}

      {/* 片段名称 */}
      <div className="absolute inset-x-0 bottom-0 px-2 py-0.5 bg-black/30 text-[10px] text-white truncate">
        {clip.name}
      </div>

      {/* 左侧裁剪手柄 */}
      <div
        className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 group-hover:opacity-100 bg-white/20 hover:bg-white/40 transition-opacity"
        onMouseDown={handleLeftResizeStart}
      />

      {/* 右侧裁剪手柄 */}
      <div
        className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 group-hover:opacity-100 bg-white/20 hover:bg-white/40 transition-opacity"
        onMouseDown={handleRightResizeStart}
      />
    </div>
  );
}
