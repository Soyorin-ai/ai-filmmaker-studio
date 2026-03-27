// 时间线编辑器主组件
import {useReducer, useCallback, useRef, useEffect, useState} from 'react';
import type {TimelineState, TimelineTrack as TimelineTrackType, TimelineClip} from './types';
import {defaultTimelineState} from './types';
import {timelineReducer} from './reducer';
import {TimelineRuler} from './TimelineRuler';
import {TimelineTrack} from './TimelineTrack';

interface TimelineEditorProps {
  projectId: string;
  initialState?: Partial<TimelineState>;
  onStateChange?: (state: TimelineState) => void;
}

export function TimelineEditor({projectId, initialState, onStateChange}: TimelineEditorProps) {
  const [state, dispatch] = useReducer(timelineReducer, {
    ...defaultTimelineState,
    ...initialState,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // 缩放控制
  const [zoom, setZoom] = useState(state.zoom);

  useEffect(() => {
    dispatch({type: 'SET_ZOOM', payload: zoom});
  }, [zoom]);

  // 播放控制
  const play = useCallback(() => {
    if (state.isPlaying) return;

    dispatch({type: 'SET_PLAYING', payload: true});
    lastTimeRef.current = performance.now();

    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      dispatch({type: 'SET_CURRENT_TIME', payload: state.currentTime + deltaTime});

      if (state.currentTime + deltaTime < state.duration) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        dispatch({type: 'SET_PLAYING', payload: false});
        dispatch({type: 'SET_CURRENT_TIME', payload: 0});
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [state.isPlaying, state.currentTime, state.duration]);

  const pause = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    dispatch({type: 'SET_PLAYING', payload: false});
  }, []);

  const togglePlay = useCallback(() => {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [state.isPlaying, play, pause]);

  const seek = useCallback((time: number) => {
    dispatch({type: 'SET_CURRENT_TIME', payload: time});
  }, []);

  const stepForward = useCallback(() => {
    seek(Math.min(state.currentTime + 1, state.duration));
  }, [state.currentTime, state.duration, seek]);

  const stepBackward = useCallback(() => {
    seek(Math.max(state.currentTime - 1, 0));
  }, [state.currentTime, seek]);

  // 轨道操作
  const addTrack = useCallback(
    (type: 'video' | 'audio' | 'subtitle') => {
      const newTrack: TimelineTrackType = {
        id: `${type}-track-${Date.now()}`,
        type,
        name: `${type === 'video' ? '视频' : type === 'audio' ? '音频' : '字幕'}轨道 ${state.tracks.filter((t) => t.type === type).length + 1}`,
        muted: false,
        locked: false,
        visible: true,
        clips: [],
      };
      dispatch({type: 'ADD_TRACK', payload: newTrack});
    },
    [state.tracks],
  );

  const removeTrack = useCallback((trackId: string) => {
    dispatch({type: 'REMOVE_TRACK', payload: trackId});
  }, []);

  const updateTrack = useCallback((trackId: string, updates: Partial<TimelineTrackType>) => {
    dispatch({type: 'UPDATE_TRACK', payload: {id: trackId, updates}});
  }, []);

  // 片段操作
  const addClip = useCallback((trackId: string, clip: Omit<TimelineClip, 'id' | 'trackId'>) => {
    const newClip: TimelineClip = {
      ...clip,
      id: `clip-${Date.now()}`,
      trackId,
    };
    dispatch({type: 'ADD_CLIP', payload: {trackId, clip: newClip}});
  }, []);

  const removeClip = useCallback((trackId: string, clipId: string) => {
    dispatch({type: 'REMOVE_CLIP', payload: {trackId, clipId}});
  }, []);

  const updateClip = useCallback((trackId: string, clipId: string, updates: Partial<TimelineClip>) => {
    dispatch({type: 'UPDATE_CLIP', payload: {trackId, clipId, updates}});
  }, []);

  const moveClip = useCallback(
    (clipId: string, newStartTime: number) => {
      // 找到片段所在的轨道
      const track = state.tracks.find((t) => t.clips.some((c) => c.id === clipId));
      if (!track) return;

      // 更新开始时间
      updateClip(track.id, clipId, {startTime: newStartTime});
    },
    [state.tracks, updateClip],
  );

  // 选择
  const selectClip = useCallback((clipId: string | null) => {
    dispatch({type: 'SET_SELECTED_CLIP', payload: clipId});
  }, []);

  // 导出状态变化
  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 如果焦点在输入框，不处理快捷键
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          stepBackward();
          break;
        case 'ArrowRight':
          e.preventDefault();
          stepForward();
          break;
        case 'Delete':
        case 'Backspace':
          if (state.selectedClipId) {
            const track = state.tracks.find((t) => t.clips.some((c) => c.id === state.selectedClipId));
            if (track && !track.locked) {
              removeClip(track.id, state.selectedClipId);
            }
          }
          break;
        case '+':
        case '=':
          setZoom((z) => Math.min(z + 10, 200));
          break;
        case '-':
          setZoom((z) => Math.max(z - 10, 10));
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, stepForward, stepBackward, state.selectedClipId, state.tracks, removeClip]);

  const totalWidth = state.duration * state.zoom + 100;

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      {/* 工具栏 */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        {/* 播放控制 */}
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-slate-700 rounded" onClick={stepBackward} title="后退1秒 (←)">
            ⏮
          </button>
          <button
            className="p-2 hover:bg-slate-700 rounded text-xl"
            onClick={togglePlay}
            title={state.isPlaying ? '暂停 (空格)' : '播放 (空格)'}
          >
            {state.isPlaying ? '⏸' : '▶️'}
          </button>
          <button className="p-2 hover:bg-slate-700 rounded" onClick={stepForward} title="前进1秒 (→)">
            ⏭
          </button>
          <span className="text-sm text-slate-400 ml-2">
            {formatTime(state.currentTime)} / {formatTime(state.duration)}
          </span>
        </div>

        {/* 缩放控制 */}
        <div className="flex items-center gap-2">
          <button
            className="px-2 py-1 text-sm bg-slate-700 hover:bg-slate-600 rounded"
            onClick={() => setZoom((z) => Math.max(z - 10, 10))}
          >
            ➖
          </button>
          <input
            type="range"
            min="10"
            max="200"
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-24"
          />
          <button
            className="px-2 py-1 text-sm bg-slate-700 hover:bg-slate-600 rounded"
            onClick={() => setZoom((z) => Math.min(z + 10, 200))}
          >
            ➕
          </button>
          <span className="text-xs text-slate-400 w-16">{zoom}px/s</span>
        </div>

        {/* 添加轨道 */}
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-500 rounded" onClick={() => addTrack('video')}>
            + 视频轨道
          </button>
          <button
            className="px-3 py-1 text-sm bg-green-600 hover:bg-green-500 rounded"
            onClick={() => addTrack('audio')}
          >
            + 音频轨道
          </button>
          <button
            className="px-3 py-1 text-sm bg-purple-600 hover:bg-purple-500 rounded"
            onClick={() => addTrack('subtitle')}
          >
            + 字幕轨道
          </button>
        </div>
      </div>

      {/* 时间线主体 */}
      <div className="flex-1 overflow-auto" ref={containerRef}>
        <div className="min-w-max">
          {/* 时间刻度尺 */}
          <div className="flex sticky top-0 z-20">
            <div className="w-48 flex-shrink-0 bg-slate-800 border-b border-r border-slate-700" />
            <TimelineRuler duration={state.duration} zoom={state.zoom} currentTime={state.currentTime} onSeek={seek} />
          </div>

          {/* 轨道列表 */}
          {state.tracks.map((track) => (
            <TimelineTrack
              key={track.id}
              track={track}
              zoom={state.zoom}
              duration={state.duration}
              currentTime={state.currentTime}
              selectedClipId={state.selectedClipId}
              snapToGrid={state.snapToGrid}
              gridSize={state.gridSize}
              onSelectTrack={() => {}}
              onSelectClip={selectClip}
              onUpdateClip={(clipId, updates) => updateClip(track.id, clipId, updates)}
              onMoveClip={moveClip}
              onToggleMute={() => updateTrack(track.id, {muted: !track.muted})}
              onToggleLock={() => updateTrack(track.id, {locked: !track.locked})}
              onToggleVisibility={() => updateTrack(track.id, {visible: !track.visible})}
              onDeleteTrack={() => removeTrack(track.id)}
            />
          ))}
        </div>
      </div>

      {/* 底部信息栏 */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-t border-slate-700 text-xs text-slate-400">
        <div>
          轨道: {state.tracks.length} | 片段: {state.tracks.reduce((sum, t) => sum + t.clips.length, 0)}
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={state.snapToGrid}
              onChange={(e) => dispatch({type: 'SET_ZOOM', payload: state.zoom})} // 临时占位，实际应该有 SET_SNAP_TO_GRID
            />
            吸附到网格
          </label>
          <span>快捷键: 空格=播放 | ←→=跳转 | Delete=删除 | +-=缩放</span>
        </div>
      </div>
    </div>
  );
}

// 格式化时间为 mm:ss
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  return `${mins}:${secs.toString().padStart(2, '0')}.${ms}`;
}
