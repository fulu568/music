/**
 * 侧边导航栏 - 功能模块分类与快捷文件导入
 */
import React from 'react';
import { 
  Music, 
  FolderPlus, 
  ListMusic, 
  Heart, 
  Mic2, 
  Sliders, 
  Activity, 
  History, 
  Plus, 
  Radio, 
  Sparkles,
  Disc3
} from 'lucide-react';
import { ViewTab } from '../types';

interface SidebarProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  trackCount: number;
  favoriteCount: number;
  playlistCount: number;
  onImportFiles: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImportFolder: () => void;
  onCreatePlaylist: () => void;
  isPlaying: boolean;
  currentTrackTitle?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  trackCount,
  favoriteCount,
  playlistCount,
  onImportFiles,
  onImportFolder,
  onCreatePlaylist,
  isPlaying,
  currentTrackTitle,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const navItems = [
    { id: 'library' as ViewTab, label: '音乐媒体库', icon: Music, badge: trackCount },
    { id: 'playlists' as ViewTab, label: '专属歌单', icon: ListMusic, badge: playlistCount },
    { id: 'favorites' as ViewTab, label: '我喜欢的', icon: Heart, badge: favoriteCount },
    { id: 'lyrics' as ViewTab, label: '歌词与唱片', icon: Mic2 },
    { id: 'equalizer' as ViewTab, label: '10段 DSP 均衡器', icon: Sliders, highlight: 'EQ' },
    { id: 'visualizer' as ViewTab, label: '音源频谱视图', icon: Activity, highlight: '60FPS' },
    { id: 'history' as ViewTab, label: '播放历史', icon: History },
  ];

  return (
    <aside className="w-64 bg-slate-900/90 backdrop-blur-xl border-r border-slate-800/80 flex flex-col justify-between select-none z-20 transition-all duration-300">
      {/* 顶部 Brand 标志 */}
      <div className="p-5">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Disc3 className={`w-6 h-6 text-white ${isPlaying ? 'animate-spin-slow' : ''}`} />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent tracking-wide">
              韵律音乐
            </h1>
            <p className="text-xs text-emerald-400/90 font-mono tracking-tight flex items-center gap-1">
              <Sparkles className="w-3 h-3 inline" /> 本地 Hi-Fi 播放器
            </p>
          </div>
        </div>

        {/* 导入操作按钮 */}
        <div className="mt-6 space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="audio/*,.mp3,.flac,.wav,.ogg,.aac,.m4a,.webm,.opus,.aiff,.lrc"
            onChange={onImportFiles}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 px-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20 active:scale-98 cursor-pointer"
          >
            <FolderPlus className="w-4 h-4" />
            导入本地音频文件
          </button>
          
          <button
            onClick={onCreatePlaylist}
            className="w-full py-2 px-3 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-xs rounded-xl flex items-center justify-center gap-2 border border-slate-700/50 transition-all active:scale-98 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            新建专属歌单
          </button>
        </div>
      </div>

      {/* 导航菜单列表 */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          主菜单
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {item.badge !== undefined && (
                  <span className={`px-2 py-0.5 text-[10px] font-mono rounded-full ${
                    isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {item.highlight && (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/30">
                    {item.highlight}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {/* 底部音质支持标识卡片 */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/40 text-slate-400 text-[11px] space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <Radio className="w-3.5 h-3.5 text-emerald-400" /> 支持格式
            </span>
            <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 rounded">
              Hi-Res
            </span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            FLAC · WAV · MP3 · OGG · AAC · M4A · WEBM · OPUS
          </p>
          {isPlaying && currentTrackTitle && (
            <div className="pt-2 border-t border-slate-700/50 flex items-center gap-2 text-emerald-400 text-[10px] truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="truncate font-mono">正在播放: {currentTrackTitle}</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
