/**
 * 底部主播放器控制栏 - 集成实时双行歌词滚轴、高精度进度条与音效调校入口
 */
import React, { useState, useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Repeat1, 
  Volume2, 
  VolumeX, 
  Sliders, 
  Maximize2, 
  Mic2, 
  ListMusic, 
  Gauge,
  Sparkles
} from 'lucide-react';
import { PlaybackMode, Track } from '../types';
import { formatTimeSec } from '../utils/lrcParser';

interface PlayerBarProps {
  currentTrack?: Track;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onPrevTrack: () => void;
  onNextTrack: () => void;
  playbackMode: PlaybackMode;
  onChangePlaybackMode: (mode: PlaybackMode) => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  volume: number;
  isMuted: boolean;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  playbackRate: number;
  onChangePlaybackRate: (rate: number) => void;
  activeLyricText?: string;
  activeLyricTranslation?: string;
  onToggleFullScreen: () => void;
  onToggleLyricsView: () => void;
  onToggleEqualizerModal: () => void;
  onToggleQueueDrawer: () => void;
  isQueueOpen: boolean;
  eqEnabled: boolean;
}

export const PlayerBar: React.FC<PlayerBarProps> = ({
  currentTrack,
  isPlaying,
  onTogglePlay,
  onPrevTrack,
  onNextTrack,
  playbackMode,
  onChangePlaybackMode,
  currentTime,
  duration,
  onSeek,
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute,
  playbackRate,
  onChangePlaybackRate,
  activeLyricText,
  activeLyricTranslation,
  onToggleFullScreen,
  onToggleLyricsView,
  onToggleEqualizerModal,
  onToggleQueueDrawer,
  isQueueOpen,
  eqEnabled,
}) => {
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<number>(0);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  const progressBarRef = useRef<HTMLDivElement>(null);

  // 循环模式迭代切换
  const handleNextPlaybackMode = () => {
    const modes: PlaybackMode[] = ['sequence', 'repeat-all', 'repeat-one', 'shuffle'];
    const currentIdx = modes.indexOf(playbackMode);
    const nextMode = modes[(currentIdx + 1) % modes.length];
    onChangePlaybackMode(nextMode);
  };

  // 进度条 Hover 预览时间计算
  const handleProgressMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !duration) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverPosition(e.clientX - rect.left);
    setHoverTime(pos * duration);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !duration) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onSeek(pos * duration);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <footer className="h-22 bg-slate-950/90 backdrop-blur-2xl border-t border-slate-800/80 px-4 md:px-6 flex flex-col justify-center select-none fixed bottom-0 left-0 right-0 z-30 shadow-2xl">
      {/* 顶部高精度进度条与悬浮时间 */}
      <div className="relative group -mt-3 mb-2">
        <div
          ref={progressBarRef}
          onClick={handleProgressClick}
          onMouseMove={handleProgressMouseMove}
          onMouseLeave={() => setHoverTime(null)}
          className="w-full h-1.5 hover:h-2.5 bg-slate-800 rounded-full cursor-pointer relative transition-all duration-200 overflow-visible"
        >
          {/* 已播放进度条 */}
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full relative"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-lg border-2 border-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity transform scale-110" />
          </div>

          {/* Hover 浮动时间提示 */}
          {hoverTime !== null && (
            <div
              className="absolute -top-8 px-2 py-0.5 bg-slate-900 border border-slate-700 text-slate-200 text-[10px] font-mono rounded-md shadow-xl -translate-x-1/2 pointer-events-none"
              style={{ left: `${hoverPosition}px` }}
            >
              {formatTimeSec(hoverTime)}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        {/* 左侧：当前曲目封面与实时双行歌词滚轴 */}
        <div className="flex items-center gap-3 w-1/4 min-w-[200px]">
          {currentTrack ? (
            <>
              <div
                onClick={onToggleLyricsView}
                className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-900 flex-shrink-0 cursor-pointer group shadow-md"
              >
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  referrerPolicy="no-referrer"
                  className={`w-full h-full object-cover transition-all ${isPlaying ? 'animate-spin-slow' : ''}`}
                />
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Mic2 className="w-5 h-5 text-emerald-400" />
                </div>
              </div>

              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-100 truncate">{currentTrack.title}</span>
                  {currentTrack.isLossless && (
                    <span className="px-1 py-0.2 text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 rounded border border-emerald-500/30">
                      Hi-Res
                    </span>
                  )}
                </div>
                
                {/* 实时双行歌词 Ticker */}
                {activeLyricText ? (
                  <div className="text-[11px] text-emerald-400/90 font-medium truncate animate-pulse flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                    <span className="truncate">{activeLyricText}</span>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 truncate">{currentTrack.artist}</p>
                )}
              </div>
            </>
          ) : (
            <div className="text-xs text-slate-500">未选择曲目</div>
          )}
        </div>

        {/* 中间：主控制按钮与时间 */}
        <div className="flex flex-col items-center gap-1 w-2/4 max-w-md">
          <div className="flex items-center gap-5">
            {/* 循环模式切换 */}
            <button
              onClick={handleNextPlaybackMode}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                playbackMode !== 'sequence' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 hover:text-slate-200'
              }`}
              title={
                playbackMode === 'sequence'
                  ? '顺序播放'
                  : playbackMode === 'repeat-all'
                  ? '列表循环'
                  : playbackMode === 'repeat-one'
                  ? '单曲循环'
                  : '随机播放'
              }
            >
              {playbackMode === 'repeat-one' ? (
                <Repeat1 className="w-4 h-4" />
              ) : playbackMode === 'shuffle' ? (
                <Shuffle className="w-4 h-4" />
              ) : (
                <Repeat className="w-4 h-4" />
              )}
            </button>

            {/* 上一曲 */}
            <button
              onClick={onPrevTrack}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-full transition-all cursor-pointer active:scale-90"
              title="上一曲"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            {/* 播放/暂停大按键 */}
            <button
              onClick={onTogglePlay}
              className="w-11 h-11 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/20 transform hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title={isPlaying ? '暂停' : '播放'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            {/* 下一曲 */}
            <button
              onClick={onNextTrack}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-full transition-all cursor-pointer active:scale-90"
              title="下一曲"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>

            {/* 歌词专视图按键 */}
            <button
              onClick={onToggleLyricsView}
              className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
              title="滚动歌词"
            >
              <Mic2 className="w-4 h-4" />
            </button>
          </div>

          {/* 时间数字显示 */}
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <span>{formatTimeSec(currentTime)}</span>
            <span>/</span>
            <span>{formatTimeSec(duration)}</span>
          </div>
        </div>

        {/* 右侧：倍速、DSP 均衡器、音量与沉浸全屏 */}
        <div className="flex items-center justify-end gap-3 w-1/4 min-w-[200px]">
          {/* 倍速 selector */}
          <div className="relative">
            <button
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className="px-2 py-1 text-[11px] font-mono text-slate-300 bg-slate-800/80 hover:bg-slate-700 rounded-lg border border-slate-700/60 flex items-center gap-1 cursor-pointer"
              title="播放倍速"
            >
              <Gauge className="w-3 h-3 text-emerald-400" />
              <span>{playbackRate}x</span>
            </button>

            {showSpeedMenu && (
              <div className="absolute bottom-10 right-0 w-24 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 z-40 text-xs text-slate-200">
                {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => {
                      onChangePlaybackRate(rate);
                      setShowSpeedMenu(false);
                    }}
                    className={`w-full px-3 py-1.5 text-left hover:bg-slate-800 font-mono text-xs ${
                      playbackRate === rate ? 'text-emerald-400 font-bold bg-emerald-500/10' : ''
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* DSP 10段均衡器入口 */}
          <button
            onClick={onToggleEqualizerModal}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              eqEnabled
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm'
                : 'bg-slate-800/60 text-slate-400 border-slate-700/50 hover:text-slate-200'
            }`}
            title="10段 EQ 均衡器与音效"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* 音量控制 Slider */}
          <div className="flex items-center gap-1.5 group">
            <button
              onClick={onToggleMute}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-20 h-1 bg-slate-800 accent-emerald-500 rounded-lg cursor-pointer"
            />
          </div>

          {/* 待播放队列 Drawer */}
          <button
            onClick={onToggleQueueDrawer}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              isQueueOpen ? 'text-emerald-400 bg-slate-800' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="播放队列"
          >
            <ListMusic className="w-4 h-4" />
          </button>

          {/* 沉浸全屏模式 Toggle */}
          <button
            onClick={onToggleFullScreen}
            className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
            title="全屏沉浸模式"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
};
