/**
 * 实时同步滚动歌词与唱片视图 - 支持卡拉OK逐行高亮、点击跳转与毫秒微调
 */
import React, { useEffect, useRef, useState } from 'react';
import { 
  Disc, 
  Sparkles, 
  Sliders, 
  Clock, 
  Plus, 
  Minus, 
  Edit3, 
  Download, 
  Music, 
  Heart, 
  Volume2, 
  Mic2 
} from 'lucide-react';
import { LyricLine, Track } from '../types';
import { parseLrc, findActiveLyricIndex, formatTimeSec, formatTimeWithMs } from '../utils/lrcParser';

interface LyricsViewProps {
  currentTrack?: Track;
  currentTime: number;
  isPlaying: boolean;
  onSeek: (time: number) => void;
  lyricOffset: number; // 毫秒
  onChangeLyricOffset: (offset: number) => void;
  lyricFontSize: number; // px
  onChangeLyricFontSize: (size: number) => void;
  onOpenEditLyrics: (track: Track) => void;
  onToggleFavorite: (trackId: string) => void;
}

export const LyricsView: React.FC<LyricsViewProps> = ({
  currentTrack,
  currentTime,
  isPlaying,
  onSeek,
  lyricOffset,
  onChangeLyricOffset,
  lyricFontSize,
  onChangeLyricFontSize,
  onOpenEditLyrics,
  onToggleFavorite,
}) => {
  const [parsedLrcLines, setParsedLrcLines] = useState<LyricLine[]>([]);
  const [activeLineIdx, setActiveLineIdx] = useState<number>(0);
  const activeLineRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 解析歌词
  useEffect(() => {
    if (currentTrack && currentTrack.lyrics) {
      const parsed = parseLrc(currentTrack.lyrics, lyricOffset);
      setParsedLrcLines(parsed.lines);
    } else {
      setParsedLrcLines([]);
    }
  }, [currentTrack?.id, currentTrack?.lyrics, lyricOffset]);

  // 匹配高亮当前歌词索引
  useEffect(() => {
    if (parsedLrcLines.length > 0) {
      const idx = findActiveLyricIndex(parsedLrcLines, currentTime);
      setActiveLineIdx(idx);
    }
  }, [currentTime, parsedLrcLines]);

  // 自动平滑滚动到当前高亮歌词行
  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeLineIdx]);

  if (!currentTrack) {
    return (
      <div className="h-[calc(100vh-10rem)] flex flex-col items-center justify-center text-slate-500 space-y-3">
        <Music className="w-12 h-12 text-slate-600 animate-pulse" />
        <p className="text-sm">尚未播放任何音乐</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-10rem)] p-6 md:p-10 flex flex-col lg:flex-row items-center justify-center gap-10 overflow-hidden relative">
      {/* 渐变艺术背景遮罩 */}
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-950 -z-10" />

      {/* 左侧：发光黑胶唱片与歌曲元数据 */}
      <div className="flex flex-col items-center justify-center lg:w-1/2 max-w-md text-center space-y-6 flex-shrink-0">
        <div className="relative group">
          {/* 外围氛围发光环 */}
          <div className={`absolute inset-0 rounded-full bg-emerald-500/20 blur-2xl transition-all duration-1000 ${
            isPlaying ? 'scale-110 opacity-100' : 'scale-90 opacity-40'
          }`} />

          {/* 唱片黑胶盘体 */}
          <div className={`relative w-64 h-64 sm:w-72 sm:h-72 rounded-full bg-slate-950 border-8 border-slate-900 shadow-2xl flex items-center justify-center p-3 transition-transform duration-700 ${
            isPlaying ? 'animate-spin-slow' : ''
          }`}>
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              referrerPolicy="no-referrer"
              className="w-full h-full rounded-full object-cover shadow-inner"
            />
            {/* 唱片中心黑洞 */}
            <div className="absolute w-12 h-12 rounded-full bg-slate-950 border-4 border-slate-900 shadow-inner flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
            </div>
          </div>
        </div>

        {/* 歌曲信息与格式 Badge */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-2xl font-bold text-white tracking-wide">{currentTrack.title}</h2>
            <button
              onClick={() => onToggleFavorite(currentTrack.id)}
              className="p-1.5 text-slate-400 hover:text-rose-500 transition-all cursor-pointer"
            >
              <Heart className={`w-5 h-5 ${currentTrack.isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>

          <p className="text-sm font-medium text-emerald-400">{currentTrack.artist}</p>
          <p className="text-xs text-slate-400">{currentTrack.album}</p>

          <div className="pt-2 flex items-center justify-center gap-2">
            <span className={`px-2 py-0.5 text-xs font-mono font-bold rounded-md ${
              currentTrack.isLossless
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-slate-800 text-slate-300'
            }`}>
              {currentTrack.fileType.toUpperCase()} {currentTrack.isLossless ? '无损' : ''}
            </span>
            <span className="text-xs font-mono text-slate-400">
              {currentTrack.bitrate || 320} kbps · {currentTrack.sampleRate || 44100} Hz
            </span>
          </div>
        </div>
      </div>

      {/* 右侧：同步卡拉OK滚动歌词区域 */}
      <div className="w-full lg:w-1/2 h-full flex flex-col justify-between max-w-xl bg-slate-900/40 rounded-3xl border border-slate-800/80 p-6 backdrop-blur-md">
        {/* 顶部歌词微调控制栏 */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Mic2 className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-200">同步滚动歌词</span>
          </div>

          <div className="flex items-center gap-3">
            {/* 字号加减 */}
            <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700/60">
              <button
                onClick={() => onChangeLyricFontSize(Math.max(14, lyricFontSize - 2))}
                className="hover:text-white"
                title="缩小字号"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="font-mono text-[11px] px-1">{lyricFontSize}px</span>
              <button
                onClick={() => onChangeLyricFontSize(Math.min(32, lyricFontSize + 2))}
                className="hover:text-white"
                title="放大字号"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {/* 歌词时间偏移 (微调 ms) */}
            <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700/60">
              <Clock className="w-3 h-3 text-cyan-400" />
              <button
                onClick={() => onChangeLyricOffset(lyricOffset - 200)}
                className="hover:text-white text-[10px]"
                title="提前200ms"
              >
                -0.2s
              </button>

              <span className="font-mono text-[10px] text-emerald-400 px-1">
                {lyricOffset >= 0 ? `+${lyricOffset}ms` : `${lyricOffset}ms`}
              </span>

              <button
                onClick={() => onChangeLyricOffset(lyricOffset + 200)}
                className="hover:text-white text-[10px]"
                title="延后200ms"
              >
                +0.2s
              </button>
            </div>

            {/* 编辑歌词按钮 */}
            <button
              onClick={() => onOpenEditLyrics(currentTrack)}
              className="p-1.5 text-slate-300 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
              title="录入/修改 LRC 歌词"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 歌词内容滚动容器 */}
        <div
          ref={containerRef}
          className="flex-1 my-4 overflow-y-auto custom-scrollbar px-4 space-y-6 text-center scroll-smooth py-20"
        >
          {parsedLrcLines.length === 0 ? (
            <div className="py-20 space-y-4">
              <p className="text-slate-400 text-sm">暂无匹配的 LRC 歌词文件</p>
              <button
                onClick={() => onOpenEditLyrics(currentTrack)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                点击录入或粘贴 LRC 歌词
              </button>
            </div>
          ) : (
            parsedLrcLines.map((line, idx) => {
              const isActive = idx === activeLineIdx;
              return (
                <div
                  key={line.id}
                  ref={isActive ? activeLineRef : null}
                  onClick={() => onSeek(line.time)}
                  className={`transition-all duration-300 cursor-pointer p-2 rounded-2xl hover:bg-slate-800/40 select-none ${
                    isActive
                      ? 'text-emerald-400 font-bold scale-105 drop-shadow-md'
                      : 'text-slate-400 opacity-60 hover:opacity-100'
                  }`}
                  style={{ fontSize: `${lyricFontSize}px` }}
                >
                  <p className="leading-snug">{line.text}</p>
                  {line.translation && (
                    <p className="text-xs text-slate-400 font-normal mt-1 opacity-80">
                      {line.translation}
                    </p>
                  )}
                  {isActive && (
                    <span className="inline-block text-[9px] font-mono text-emerald-500/80 bg-emerald-500/10 px-2 py-0.5 rounded-full mt-1">
                      {formatTimeWithMs(line.time)}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
