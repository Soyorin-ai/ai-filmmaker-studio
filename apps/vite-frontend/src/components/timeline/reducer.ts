// 时间线状态管理 Reducer
import type {TimelineState, TimelineAction} from './types';

export function timelineReducer(state: TimelineState, action: TimelineAction): TimelineState {
  switch (action.type) {
    case 'SET_TRACKS':
      return {...state, tracks: action.payload};

    case 'ADD_TRACK':
      return {...state, tracks: [...state.tracks, action.payload]};

    case 'REMOVE_TRACK':
      return {
        ...state,
        tracks: state.tracks.filter((t) => t.id !== action.payload),
      };

    case 'UPDATE_TRACK':
      return {
        ...state,
        tracks: state.tracks.map((t) => (t.id === action.payload.id ? {...t, ...action.payload.updates} : t)),
      };

    case 'ADD_CLIP': {
      const {trackId, clip} = action.payload;
      const newTracks = state.tracks.map((t) => (t.id === trackId ? {...t, clips: [...t.clips, clip]} : t));
      // 重新计算总时长
      const maxEnd = Math.max(
        ...newTracks.flatMap((t) => t.clips.map((c) => c.startTime + c.duration)),
        state.duration,
      );
      return {...state, tracks: newTracks, duration: maxEnd};
    }

    case 'REMOVE_CLIP': {
      const {trackId, clipId} = action.payload;
      const newTracks = state.tracks.map((t) =>
        t.id === trackId ? {...t, clips: t.clips.filter((c) => c.id !== clipId)} : t,
      );
      return {
        ...state,
        tracks: newTracks,
        selectedClipId: state.selectedClipId === clipId ? null : state.selectedClipId,
      };
    }

    case 'UPDATE_CLIP': {
      const {trackId, clipId, updates} = action.payload;
      const newTracks = state.tracks.map((t) =>
        t.id === trackId
          ? {
              ...t,
              clips: t.clips.map((c) => (c.id === clipId ? {...c, ...updates} : c)),
            }
          : t,
      );
      // 重新计算总时长
      const maxEnd = Math.max(
        ...newTracks.flatMap((t) => t.clips.map((c) => c.startTime + c.duration)),
        10, // 最小10秒
      );
      return {...state, tracks: newTracks, duration: maxEnd};
    }

    case 'MOVE_CLIP': {
      const {clipId, targetTrackId, newStartTime} = action.payload;
      let movedClip: TimelineState['tracks'][0]['clips'][0] | null = null;

      // 先从原轨道移除
      let newTracks = state.tracks.map((t) => {
        const clipIndex = t.clips.findIndex((c) => c.id === clipId);
        if (clipIndex >= 0) {
          movedClip = {...t.clips[clipIndex], startTime: newStartTime};
          return {...t, clips: t.clips.filter((c) => c.id !== clipId)};
        }
        return t;
      });

      if (movedClip) {
        // 添加到目标轨道
        newTracks = newTracks.map((t) =>
          t.id === targetTrackId
            ? {...t, clips: [...t.clips, {...movedClip!, startTime: newStartTime, trackId: targetTrackId}]}
            : t,
        );
      }

      return {...state, tracks: newTracks};
    }

    case 'SET_CURRENT_TIME':
      return {...state, currentTime: Math.max(0, Math.min(action.payload, state.duration))};

    case 'SET_ZOOM':
      return {...state, zoom: Math.max(10, Math.min(action.payload, 200))};

    case 'SET_SELECTED_CLIP':
      return {...state, selectedClipId: action.payload};

    case 'SET_PLAYING':
      return {...state, isPlaying: action.payload};

    case 'SET_DURATION':
      return {...state, duration: action.payload};

    default:
      return state;
  }
}
