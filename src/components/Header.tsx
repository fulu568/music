/**
 * 顶部导航与搜索筛选栏 - 兼具音频技术指标与快捷调校
 */
import React from 'react';
import { Search, SlidersHorizontal, HelpCircle, Sparkles, FolderPlus, Disc, Monitor } from 'lucide-react';
import { Track } from '../types';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedFormatFilter: string;
  onSelectFormatFilter: (format: string) => void;
  currentTrack?: Track;
  eqEnabled: boolean;
  spatialEnabled: boolean;
  onOpenShortcuts: () => void;
  onOpenExportWindows: () => void;
  onImportFiles: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  selectedFormatFilter,
  onSelectFormatFilter,
  currentTrack,
  eqEnabled,
  spatialEnabled,
  onOpenShortcuts,
  onOpenExportWindows,
  onImportFiles,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const formatFilters = [
    { id: 'all', label: '全部格式' },
    { id: 'lossless', label: 'Hi-Res 无损' },
    { id: 'flac', label: 'FLAC' },
    { id: 'wav', label: 'WAV' },
    { id: 'mp3', label: 'MP3' },
    { id: 'm4a', label: 'AAC/M4A' },
  ];

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between gap-4 z-10 sticky top-0">
      {/* 隐蔽文件导入 */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="audio/*,.mp3,.flac,.wav,.ogg,.aac,.m4a,.webm,.opus,.aiff,.lrc"
        onChange={onImportFiles}
        className="hidden"
      />

      {/* 搜索框与筛选 */}
      <div className="flex items-center gap-3 flex-1 max-w-2xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="搜索歌名、歌手、专辑或扩展名..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800/70 text-slate-100 text-xs rounded-xl border border-slate-700/50 focus:outline-none focus:border-emerald-500/60 focus:bg-slate-800 placeholder-slate-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* 格式快捷筛选标签 */}
        <div className="hidden md:flex items-center gap-1.5 overflow-x-auto custom-scrollbar py-1">
          {formatFilters.map((filter) => {
            const isSelected = selectedFormatFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => onSelectFormatFilter(filter.id)}
                className={`px-2.5 py-1 text-[11px] rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 右侧：技术指标与快捷按钮 */}
      <div className="flex items-center gap-3">
        {/* 当前播放曲目音频技术参数 Bar */}
        {currentTrack ? (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-950/60 rounded-xl border border-slate-800 text-xs font-mono">
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
              currentTrack.isLossless
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
            }`}>
              {currentTrack.fileType.toUpperCase()}
            </span>
            <span className="text-slate-300 font-semibold">{currentTrack.bitrate || 320} kbps</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">{(currentTrack.sampleRate ? currentTrack.sampleRate / 1000 : 44.1).toFixed(1)} kHz</span>
            {currentTrack.bitDepth && (
              <>
                <span className="text-slate-500">|</span>
                <span className="text-slate-400">{currentTrack.bitDepth} bit</span>
              </>
            )}
            {(eqEnabled || spatialEnabled) && (
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-amber-500/20 text-amber-400 rounded border border-amber-500/30">
                DSP {eqEnabled ? 'EQ' : ''}{spatialEnabled ? '+3D' : ''}
              </span>
            )}
          </div>
        ) : (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-950/40 rounded-xl border border-slate-800/60 text-[11px] text-slate-500">
            <Disc className="w-3.5 h-3.5 text-slate-600 animate-spin-slow" />
            <span>无损 Audio Engine 就绪</span>
          </div>
        )}

        {/* Windows 客户端打包入口 */}
        <button
          onClick={onOpenExportWindows}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm"
          title="打包为 Windows 桌面安装包 (.exe)"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">打包 Windows 客户端</span>
        </button>

        {/* 导入文件快捷入口 */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
          title="导入音频"
        >
          <FolderPlus className="w-4 h-4" />
        </button>

        {/* 快捷键帮助 Modal 按钮 */}
        <button
          onClick={onOpenShortcuts}
          className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
          title="键盘快捷键帮助"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
