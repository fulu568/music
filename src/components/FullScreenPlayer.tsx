/**
 * 沉浸式全屏音乐播放器 - 高斯模糊弥散背景、实时黑胶唱片与全屏高保真歌词
 */
import React from 'react';
import { 
  X, 
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
  Heart, 
  Sparkles, 
  Disc3, 
  Activity 
} from 'lucide-react';
import { PlaybackMode, Track } from '../types';
import { LyricLine } from '../types';
import { parseLrc, findActiveLyricIndex, formatTimeSec } from '../utils/lrcParser';
import { VisualizerCanvas } from './VisualizerCanvas';

interface FullScreenPlayerProps {
  currentTrack?: Track;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onPrevTrack: () => void;
  onNextTrack: () => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  volume: number;
  isMuted: boolean;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  playbackMode: PlaybackMode;
  onChangePlaybackMode: (mode: PlaybackMode) => void;
  onClose: () => void;
  onToggleFavorite: (trackId: string) => void;
  eqEnabled: boolean;
  lyricOffset: number;
}

export const FullScreenPlayer: React.FC<FullScreenPlayerProps> = ({
  currentTrack,
  isPlaying,
  onTogglePlay,
  onPrevTrack,
  onNextTrack,
  currentTime,
  duration,
  onSeek,
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute,
  playbackMode,
  onChangePlaybackMode,
  onClose,
  onToggleFavorite,
  eqEnabled,
  lyricOffset,
}) => {
  const [parsedLrc, setParsedLrc] = React.useState<LyricLine[]>([]);
  const [activeIdx, setActiveIdx] = React.useState<number>(0);

  // 解析歌词
  React.useEffect(() => {
    if (currentTrack?.lyrics) {
      const parsed = parseLrc(currentTrack.lyrics, lyricOffset);
      setParsedLrc(parsed.lines);
    } else {
      setParsedLrc([]);
    }
  }, [currentTrack?.lyrics, lyricOffset]);

  // 高亮索引
  React.useEffect(() => {
    if (parsedLrc.length > 0) {
      setActiveIdx(findActiveLyricIndex(parsedLrc, currentTime));
    }
  }, [currentTime, parsedLrc]);

  if (!currentTrack) return null;

  const currentLyricLine = parsedLrc[activeIdx];
  const nextLyricLine = parsedLrc[activeIdx + 1];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between p-8 overflow-hidden select-none animate-fade-in">
      {/* 动态高斯模糊唱片色彩弥散背景 */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-30 scale-125 transition-all duration-1000 -z-20"
        style={{ backgroundImage: `url(${currentTrack.coverUrl})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/80 to-slate-950 -z-10" />

      {/* 背景 60FPS 频谱波纹 Canvas */}
      <div className="absolute inset-0 opacity-25 pointer-events-none -z-10">
        <VisualizerCanvas mode="particles" height={800} />
      </div>

      {/* 顶部：关闭全屏与技术指标 Bar */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <span className="p-2 bg-slate-900/80 rounded-2xl border border-slate-800 text-emerald-400">
            <Disc3 className={`w-5 h-5 ${isPlaying ? 'animate-spin-slow' : ''}`} />
          </span>
          <div>
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest block">
              Hi-Fi 沉浸试听模式
            </span>
            <span className="text-[11px] text-slate-400">
              {currentTrack.fileType.toUpperCase()} · {currentTrack.bitrate || 320}kbps · {currentTrack.sampleRate || 44100}Hz
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-3 bg-slate-900/80 hover:bg-slate-800 rounded-full border border-slate-700/60 text-slate-300 hover:text-white transition-all cursor-pointer"
          title="退出全屏 (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 中间：黑胶唱片与全屏滚动歌词 */}
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 my-6 z-10">
        {/* 黑胶唱片机 */}
        <div className="relative group">
          <div className={`w-72 h-72 md:w-80 md:h-80 rounded-full bg-slate-950 border-8 border-slate-900/90 shadow-2xl flex items-center justify-center p-4 transition-all duration-700 ${
            isPlaying ? 'animate-spin-slow shadow-emerald-500/20' : ''
          }`}>
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              referrerPolicy="no-referrer"
              className="w-full h-full rounded-full object-cover"
            />
            <div className="absolute w-14 h-14 rounded-full bg-slate-950 border-4 border-slate-900 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          </div>
        </div>

        {/* 歌词展示 */}
        <div className="max-w-2xl text-center lg:text-left space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">{currentTrack.title}</h1>
            <p className="text-lg font-medium text-emerald-400">{currentTrack.artist} — <span className="text-slate-400 text-sm">{currentTrack.album}</span></p>
          </div>

          {/* 全屏聚焦歌词卡片 */}
          <div className="py-6 px-8 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl space-y-4 shadow-2xl">
            {currentLyricLine ? (
              <>
                <p className="text-xl md:text-2xl font-bold text-emerald-300 leading-snug animate-fade-in">
                  {currentLyricLine.text}
                </p>
                {currentLyricLine.translation && (
                  <p className="text-sm md:text-base text-slate-300">
                    {currentLyricLine.translation}
                  </p>
                )}
                {nextLyricLine && (
                  <p className="text-xs text-slate-500 pt-2 border-t border-slate-800/60">
                    下一句: {nextLyricLine.text}
                  </p>
                )}
              </>
            ) : (
              <p className="text-slate-400 text-sm py-4">无匹配歌词行或纯音乐试听中</p>
            )}
          </div>
        </div>
      </div>

      {/* 底部控制面板 */}
      <div className="max-w-3xl mx-auto w-full bg-slate-900/80 backdrop-blur-2xl border border-slate-800 p-6 rounded-3xl space-y-4 z-10 shadow-2xl">
        {/* 进度条 */}
        <div className="space-y-1">
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 accent-emerald-500 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-xs font-mono text-slate-400">
            <span>{formatTimeSec(currentTime)}</span>
            <span>{formatTimeSec(duration)}</span>
          </div>
        </div>

        {/* 按钮区域 */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onToggleFavorite(currentTrack.id)}
            className="p-2 text-slate-400 hover:text-rose-500 transition-all cursor-pointer"
          >
            <Heart className={`w-5 h-5 ${currentTrack.isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>

          <div className="flex items-center gap-6">
            <button
              onClick={onPrevTrack}
              className="p-2 text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              <SkipBack className="w-6 h-6 fill-current" />
            </button>

            <button
              onClick={onTogglePlay}
              className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shadow-lg cursor-pointer transform hover:scale-105 active:scale-95 transition-all"
            >
              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
            </button>

            <button
              onClick={onNextTrack}
              className="p-2 text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              <SkipForward className="w-6 h-6 fill-current" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleMute}
              className="p-2 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
