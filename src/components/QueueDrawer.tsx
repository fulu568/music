/**
 * 待播队列与播放历史抽屉 (Slide-Over Drawer)
 */
import React from 'react';
import { X, Play, Trash2, ListMusic, Music } from 'lucide-react';
import { Track } from '../types';
import { formatTimeSec } from '../utils/lrcParser';

interface QueueDrawerProps {
  queue: Track[];
  currentTrackId?: string;
  onPlayTrack: (track: Track) => void;
  onRemoveFromQueue: (trackId: string) => void;
  onClearQueue: () => void;
  onClose: () => void;
}

export const QueueDrawer: React.FC<QueueDrawerProps> = ({
  queue,
  currentTrackId,
  onPlayTrack,
  onRemoveFromQueue,
  onClearQueue,
  onClose,
}) => {
  return (
    <div className="fixed inset-y-0 right-0 w-80 md:w-96 bg-slate-900/95 backdrop-blur-2xl border-l border-slate-800 z-40 shadow-2xl flex flex-col justify-between p-5 select-none animate-slide-left text-white">
      {/* 头部 */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <ListMusic className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-sm">当前播放队列 ({queue.length})</h3>
        </div>

        <div className="flex items-center gap-2">
          {queue.length > 0 && (
            <button
              onClick={onClearQueue}
              className="text-xs text-slate-400 hover:text-rose-400 font-medium cursor-pointer"
            >
              清空
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 队列列表 */}
      <div className="flex-1 overflow-y-auto custom-scrollbar my-4 space-y-2 pr-1">
        {queue.length === 0 ? (
          <div className="py-20 text-center text-slate-500 text-xs">
            队列为空，请在媒体库中播放歌曲
          </div>
        ) : (
          queue.map((track, idx) => {
            const isCurrent = currentTrackId === track.id;
            return (
              <div
                key={`${track.id}-${idx}`}
                className={`p-2.5 rounded-xl border transition-all flex items-center justify-between group ${
                  isCurrent
                    ? 'bg-emerald-500/15 border-emerald-500/40'
                    : 'bg-slate-950/40 border-slate-800/60 hover:bg-slate-800/50'
                }`}
              >
                <div
                  onClick={() => onPlayTrack(track)}
                  className="flex items-center gap-3 flex-1 truncate cursor-pointer"
                >
                  <span className="text-xs font-mono text-slate-500 w-5">{idx + 1}</span>
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-lg object-cover bg-slate-900"
                  />
                  <div className="truncate">
                    <h5 className={`text-xs font-bold truncate ${isCurrent ? 'text-emerald-400' : 'text-slate-200'}`}>
                      {track.title}
                    </h5>
                    <p className="text-[10px] text-slate-400 truncate">{track.artist}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400">
                    {formatTimeSec(track.duration)}
                  </span>
                  <button
                    onClick={() => onRemoveFromQueue(track.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="pt-3 border-t border-slate-800 text-center text-[10px] text-slate-500">
        拖拽或点击可随时插播曲目
      </div>
    </div>
  );
};
