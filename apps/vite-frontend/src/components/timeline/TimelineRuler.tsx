// 时间刻度尺组件
import { useMemo } from 'react';

interface TimelineRulerProps {
  duration: number;
  zoom: number;
  currentTime: number;
  onSeek: (time: number) => void;
}

export function TimelineRuler({ duration, zoom, currentTime, onSeek }: TimelineRulerProps) {
  // 生成时间刻度
  const markers = useMemo(() => {
    const result: Array<{ time: number; position: number; label: string; isMain: boolean }> = [];
    
    // 根据缩放级别决定主刻度间隔
    let mainInterval = 5; // 秒
    if (zoom >= 100) mainInterval = 1;
    else if (zoom >= 50) mainInterval = 2;
    else if (zoom >= 25) mainInterval = 5;
    else mainInterval = 10;
    
    const subInterval = mainInterval / 5;
    
    for (let t = 0; t <= duration; t += subInterval) {
      const isMain = t % mainInterval === 0;
      result.push({
        time: t,
        position: t * zoom,
        label: isMain ? formatTime(t) : '',
        isMain,
      });
    }
    
    return result;
  }, [duration, zoom]);

  const playheadPosition = currentTime * zoom;
  const totalWidth = duration * zoom + 100; // 额外空间

  return (
    <div 
      className="relative h-8 bg-slate-800 border-b border-slate-700 select-none"
      style={{ width: totalWidth }}
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const time = x / zoom;
        onSeek(Math.max(0, Math.min(time, duration)));
      }}
    >
      {/* 刻度标记 */}
      {markers.map(({ time, position, label, isMain }) => (
        <div
          key={time}
          className="absolute top-0 h-full flex flex-col items-center"
          style={{ left: position }}
        >
          <div
            className={`w-px ${isMain ? 'h-3 bg-slate-400' : 'h-2 bg-slate-600'}`}
          />
          {label && (
            <span className="text-[10px] text-slate-400 mt-0.5">{label}</span>
          )}
        </div>
      ))}
      
      {/* 播放头 */}
      <div
        className="absolute top-0 w-0.5 h-full bg-red-500 z-10"
        style={{ left: playheadPosition }}
      >
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full" />
      </div>
    </div>
  );
}

// 格式化时间为 mm:ss
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
