// 时间线轨道组件
import {useState, useRef, useCallback} from 'react';
import type {TimelineTrack as TimelineTrackType, TimelineClip as TimelineClipType} from './types';
import {TimelineClip} from './TimelineClip';

interface TimelineTrackProps {
  track: TimelineTrackType;
  zoom: number;
  duration: number;
  currentTime: number;
  selectedClipId: string | null;
  snapToGrid: boolean;
  gridSize: number;
  onSelectTrack: () => void;
  onSelectClip: (clipId: string) => void;
  onUpdateClip: (clipId: string, updates: Partial<TimelineClipType>) => void;
  onMoveClip: (clipId: string, newStartTime: number) => void;
  onToggleMute: () => void;
  onToggleLock: () => void;
  onToggleVisibility: () => void;
  onDeleteTrack: () => void;
}

export function TimelineTrack({
  track,
  zoom,
  duration,
  currentTime,
  selectedClipId,
  snapToGrid,
  gridSize,
  onSelectTrack,
  onSelectClip,
  onUpdateClip,
  onMoveClip,
  onToggleMute,
  onToggleLock,
  onToggleVisibility,
  onDeleteTrack,
}: TimelineTrackProps) {
  const dragRef = useRef<{
    clipId: string;
    startX: number;
    startTime: number;
  } | null>(null);

  const totalWidth = duration * zoom + 100;
  const playheadPosition = currentTime * zoom;

  // 吸附到网格
  const snapTime = useCallback(
    (time: number) => {
      if (!snapToGrid) return time;
      return Math.round(time / gridSize) * gridSize;
    },
    [snapToGrid, gridSize],
  );

  // 处理片段拖拽开始
  const handleClipDragStart = (clipId: string, e: React.MouseEvent) => {
    if (track.locked) return;

    const clip = track.clips.find((c) => c.id === clipId);
    if (!clip) return;

    dragRef.current = {
      clipId,
      startX: e.clientX,
      startTime: clip.startTime,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!dragRef.current) return;

      const deltaX = moveEvent.clientX - dragRef.current.startX;
      const deltaTime = deltaX / zoom;
      let newStartTime = snapTime(dragRef.current.startTime + deltaTime);

      // 限制不能小于0
      if (newStartTime < 0) newStartTime = 0;

      onMoveClip(clipId, newStartTime);
    };

    const handleMouseUp = () => {
      dragRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // 获取轨道图标
  const getTrackIcon = () => {
    switch (track.type) {
      case 'video':
        return '🎬';
      case 'audio':
        return '🎵';
      case 'subtitle':
        return '📝';
    }
  };

  // 获取轨道颜色
  const getTrackColor = () => {
    switch (track.type) {
      case 'video':
        return 'border-blue-500/30';
      case 'audio':
        return 'border-green-500/30';
      case 'subtitle':
        return 'border-purple-500/30';
    }
  };

  return (
    <div className="flex border-b border-slate-700">
      {/* 轨道头部 */}
      <div className={`w-48 flex-shrink-0 bg-slate-800 border-r ${getTrackColor()} p-2`}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span>{getTrackIcon()}</span>
            <span className="text-sm text-white truncate">{track.name}</span>
          </div>
          <button className="text-slate-400 hover:text-red-400 text-xs" onClick={onDeleteTrack} title="删除轨道">
            ✕
          </button>
        </div>

        {/* 轨道控制按钮 */}
        <div className="flex items-center gap-1">
          <button
            className={`px-1.5 py-0.5 text-xs rounded ${
              track.muted ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-400'
            }`}
            onClick={onToggleMute}
            title={track.muted ? '取消静音' : '静音'}
          >
            {track.muted ? '🔇' : '🔊'}
          </button>
          <button
            className={`px-1.5 py-0.5 text-xs rounded ${
              track.locked ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-700 text-slate-400'
            }`}
            onClick={onToggleLock}
            title={track.locked ? '解锁' : '锁定'}
          >
            {track.locked ? '🔒' : '🔓'}
          </button>
          <button
            className={`px-1.5 py-0.5 text-xs rounded ${
              !track.visible ? 'bg-slate-600 text-slate-500' : 'bg-slate-700 text-slate-400'
            }`}
            onClick={onToggleVisibility}
            title={track.visible ? '隐藏' : '显示'}
          >
            {track.visible ? '👁' : '👁‍🗨'}
          </button>
        </div>
      </div>

      {/* 轨道内容区 */}
      <div
        className={`relative h-16 bg-slate-900 ${track.locked ? 'opacity-60' : ''}`}
        style={{width: totalWidth}}
        onClick={onSelectTrack}
      >
        {/* 片段 */}
        {track.clips.map((clip) => (
          <TimelineClip
            key={clip.id}
            clip={clip}
            zoom={zoom}
            isSelected={selectedClipId === clip.id}
            snapToGrid={snapToGrid}
            gridSize={gridSize}
            maxTime={duration}
            trackType={track.type}
            onSelect={() => onSelectClip(clip.id)}
            onUpdate={(updates) => onUpdateClip(clip.id, updates)}
            onDragStart={(e) => handleClipDragStart(clip.id, e)}
          />
        ))}

        {/* 播放头 */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none"
          style={{left: playheadPosition}}
        />
      </div>
    </div>
  );
}
