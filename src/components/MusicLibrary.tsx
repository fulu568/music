/**
 * 音乐媒体库视图 - 网格/列表展示、排序、拖拽导入与高音质标签显示
 */
import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Heart, 
  MoreVertical, 
  LayoutGrid, 
  List, 
  ArrowUpDown, 
  Plus, 
  FolderDown, 
  Sparkles, 
  FileAudio, 
  Mic2, 
  Info, 
  Trash2, 
  Music2,
  Check
} from 'lucide-react';
import { Track, Playlist } from '../types';
import { formatTimeSec } from '../utils/lrcParser';

interface MusicLibraryProps {
  tracks: Track[];
  currentTrackId?: string;
  isPlaying: boolean;
  onPlayTrack: (track: Track) => void;
  onTogglePause: () => void;
  onToggleFavorite: (trackId: string) => void;
  onDeleteTrack: (trackId: string) => void;
  onOpenEditLyrics: (track: Track) => void;
  onOpenInspectTrack: (track: Track) => void;
  playlists: Playlist[];
  onAddTrackToPlaylist: (playlistId: string, trackId: string) => void;
  onImportFiles: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const MusicLibrary: React.FC<MusicLibraryProps> = ({
  tracks,
  currentTrackId,
  isPlaying,
  onPlayTrack,
  onTogglePause,
  onToggleFavorite,
  onDeleteTrack,
  onOpenEditLyrics,
  onOpenInspectTrack,
  playlists,
  onAddTrackToPlaylist,
  onImportFiles,
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy] = useState<'addedAt' | 'title' | 'artist' | 'bitrate' | 'duration' | 'playCount'>('addedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [activeMenuTrackId, setActiveMenuTrackId] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // 排序算法
  const sortedTracks = [...tracks].sort((a, b) => {
    let comp = 0;
    if (sortBy === 'title') comp = a.title.localeCompare(b.title, 'zh-CN');
    else if (sortBy === 'artist') comp = a.artist.localeCompare(b.artist, 'zh-CN');
    else if (sortBy === 'bitrate') comp = (a.bitrate || 0) - (b.bitrate || 0);
    else if (sortBy === 'duration') comp = a.duration - b.duration;
    else if (sortBy === 'playCount') comp = a.playCount - b.playCount;
    else comp = a.addedAt - b.addedAt;

    return sortOrder === 'asc' ? comp : -comp;
  });

  // 拖拽文件处理
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const syntheticEvent = {
        target: { files: e.dataTransfer.files },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      onImportFiles(syntheticEvent);
    }
  };

  return (
    <div 
      className="p-6 space-y-6 relative min-h-[calc(100vh-8rem)]"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="audio/*,.mp3,.flac,.wav,.ogg,.aac,.m4a,.webm,.opus,.aiff,.lrc"
        onChange={onImportFiles}
        className="hidden"
      />

      {/* 拖拽导入悬浮遮罩 */}
      {isDragOver && (
        <div className="absolute inset-4 z-50 bg-emerald-500/20 backdrop-blur-md rounded-2xl border-2 border-dashed border-emerald-400 flex flex-col items-center justify-center text-emerald-300 pointer-events-none animate-fade-in">
          <FolderDown className="w-16 h-16 animate-bounce mb-3" />
          <p className="text-lg font-bold">释放文件即可直接导入本地高音质曲目与歌词</p>
          <p className="text-xs opacity-80 mt-1">支持 MP3, FLAC, WAV, OGG, AAC, M4A, WEBM, OPUS, AIFF, LRC</p>
        </div>
      )}

      {/* 媒体库工具栏：标题、视效切换与排序 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Music2 className="w-5 h-5 text-emerald-400" />
            本地音乐媒体库
            <span className="text-xs font-mono font-normal text-slate-400 px-2 py-0.5 bg-slate-800 rounded-full">
              共 {tracks.length} 首曲目
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            可拖拽本地音乐文件或文件夹至页面直接解析导入，支持无损 FLAC & WAV 母带
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* 排序 Selector */}
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="addedAt" className="bg-slate-900">按添加时间</option>
              <option value="title" className="bg-slate-900">按歌曲名称</option>
              <option value="artist" className="bg-slate-900">按歌手名字</option>
              <option value="bitrate" className="bg-slate-900">按码率高低</option>
              <option value="duration" className="bg-slate-900">按时长长短</option>
              <option value="playCount" className="bg-slate-900">按播放次数</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="text-slate-400 hover:text-emerald-400 font-mono text-[10px] uppercase font-bold"
            >
              {sortOrder === 'asc' ? '↑ 升序' : '↓ 降序'}
            </button>
          </div>

          {/* 视图切换 (列表 vs 网格) */}
          <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'list' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
              title="列表视图"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
              title="网格视图"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 空媒体库提示 */}
      {sortedTracks.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center bg-slate-900/40 rounded-3xl border border-dashed border-slate-800 p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-emerald-400">
            <FileAudio className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-200">未检索到匹配的本地音频</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">
              可直接拖拽 MP3, FLAC, WAV, OGG, M4A 文件至窗口，或点击下方按钮导入
            </p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            立即导入本地音频
          </button>
        </div>
      ) : viewMode === 'list' ? (
        /* --- 列表视图 --- */
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800/80 overflow-hidden shadow-xl">
          <div className="grid grid-cols-12 px-5 py-3 border-b border-slate-800/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <div className="col-span-1">#</div>
            <div className="col-span-5 md:col-span-4">歌曲标题</div>
            <div className="col-span-3 hidden md:block">歌手 / 专辑</div>
            <div className="col-span-3 md:col-span-2">格式 / 码率</div>
            <div className="col-span-3 md:col-span-2 text-right">时长 / 操作</div>
          </div>

          <div className="divide-y divide-slate-800/50">
            {sortedTracks.map((track, idx) => {
              const isCurrent = currentTrackId === track.id;
              return (
                <div
                  key={track.id}
                  className={`grid grid-cols-12 items-center px-5 py-3 hover:bg-slate-800/50 transition-all group ${
                    isCurrent ? 'bg-emerald-500/10 border-l-2 border-emerald-500' : ''
                  }`}
                >
                  {/* 序号与播放态 */}
                  <div className="col-span-1 flex items-center text-xs font-mono text-slate-400">
                    {isCurrent ? (
                      <button
                        onClick={() => (isPlaying ? onTogglePause() : onPlayTrack(track))}
                        className="text-emerald-400 hover:scale-110 transition-all cursor-pointer"
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                      </button>
                    ) : (
                      <span className="group-hover:hidden">{idx + 1}</span>
                    )}
                    {!isCurrent && (
                      <button
                        onClick={() => onPlayTrack(track)}
                        className="hidden group-hover:block text-slate-200 hover:text-emerald-400 cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-current" />
                      </button>
                    )}
                  </div>

                  {/* 封面与歌曲标题 */}
                  <div className="col-span-5 md:col-span-4 flex items-center gap-3 pr-2 overflow-hidden">
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-lg object-cover bg-slate-800 flex-shrink-0 shadow-sm"
                    />
                    <div className="truncate">
                      <div className={`text-xs font-medium truncate flex items-center gap-1.5 ${
                        isCurrent ? 'text-emerald-400 font-bold' : 'text-slate-100'
                      }`}>
                        <span className="truncate">{track.title}</span>
                        {track.lyrics && (
                          <span title="包含 LRC 歌词">
                            <Mic2 className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate md:hidden">
                        {track.artist}
                      </div>
                    </div>
                  </div>

                  {/* 歌手与专辑 */}
                  <div className="col-span-3 hidden md:block truncate pr-2">
                    <div className="text-xs text-slate-300 truncate">{track.artist}</div>
                    <div className="text-[11px] text-slate-500 truncate">{track.album}</div>
                  </div>

                  {/* 格式与码率 Tag */}
                  <div className="col-span-3 md:col-span-2 flex items-center gap-1.5 flex-wrap">
                    <span className={`px-1.5 py-0.5 text-[10px] font-mono font-bold rounded ${
                      track.isLossless
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}>
                      {track.fileType.toUpperCase()}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {track.bitrate ? `${track.bitrate}k` : ''}
                    </span>
                  </div>

                  {/* 时长与右侧菜单操作 */}
                  <div className="col-span-3 md:col-span-2 flex items-center justify-end gap-2 text-right">
                    <button
                      onClick={() => onToggleFavorite(track.id)}
                      className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                        track.isFavorite
                          ? 'text-rose-500 hover:text-rose-400'
                          : 'text-slate-500 hover:text-slate-300 opacity-0 group-hover:opacity-100'
                      }`}
                      title={track.isFavorite ? '取消喜欢' : '添加喜欢'}
                    >
                      <Heart className={`w-4 h-4 ${track.isFavorite ? 'fill-current' : ''}`} />
                    </button>

                    <span className="text-xs font-mono text-slate-400 w-12 text-right">
                      {formatTimeSec(track.duration)}
                    </span>

                    {/* 操作菜单 */}
                    <div className="relative">
                      <button
                        onClick={() => setActiveMenuTrackId(activeMenuTrackId === track.id ? null : track.id)}
                        className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {activeMenuTrackId === track.id && (
                        <div className="absolute right-0 top-8 w-48 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl py-1.5 z-30 text-xs text-slate-200">
                          <button
                            onClick={() => {
                              onOpenEditLyrics(track);
                              setActiveMenuTrackId(null);
                            }}
                            className="w-full px-3.5 py-2 text-left hover:bg-slate-800 flex items-center gap-2 text-slate-300"
                          >
                            <Mic2 className="w-3.5 h-3.5 text-cyan-400" />
                            编辑 / 录入 LRC 歌词
                          </button>
                          
                          <button
                            onClick={() => {
                              onOpenInspectTrack(track);
                              setActiveMenuTrackId(null);
                            }}
                            className="w-full px-3.5 py-2 text-left hover:bg-slate-800 flex items-center gap-2 text-slate-300"
                          >
                            <Info className="w-3.5 h-3.5 text-emerald-400" />
                            查看音频技术参数
                          </button>

                          {/* 添加至歌单子菜单 */}
                          {playlists.length > 0 && (
                            <div className="border-t border-slate-800 my-1 pt-1">
                              <div className="px-3 py-1 text-[10px] text-slate-500 uppercase font-semibold">
                                添加至歌单
                              </div>
                              {playlists.map((pl) => {
                                const inPlaylist = pl.trackIds.includes(track.id);
                                return (
                                  <button
                                    key={pl.id}
                                    onClick={() => {
                                      onAddTrackToPlaylist(pl.id, track.id);
                                      setActiveMenuTrackId(null);
                                    }}
                                    className="w-full px-3.5 py-1.5 text-left hover:bg-slate-800 flex items-center justify-between text-slate-300"
                                  >
                                    <span className="truncate">{pl.name}</span>
                                    {inPlaylist && <Check className="w-3 h-3 text-emerald-400" />}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          <div className="border-t border-slate-800 my-1" />

                          <button
                            onClick={() => {
                              onDeleteTrack(track.id);
                              setActiveMenuTrackId(null);
                            }}
                            className="w-full px-3.5 py-2 text-left hover:bg-rose-500/20 text-rose-400 flex items-center gap-2"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            从媒体库移除
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* --- 网格视图 --- */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {sortedTracks.map((track) => {
            const isCurrent = currentTrackId === track.id;
            return (
              <div
                key={track.id}
                className={`bg-slate-900/80 hover:bg-slate-800/80 p-3.5 rounded-2xl border transition-all duration-300 group flex flex-col justify-between ${
                  isCurrent ? 'border-emerald-500/80 shadow-lg shadow-emerald-500/10' : 'border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-slate-950">
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* 格式 Tag */}
                  <div className="absolute top-2 left-2 flex gap-1">
                    <span className={`px-1.5 py-0.5 text-[9px] font-mono font-bold rounded shadow-md ${
                      track.isLossless
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-900/80 text-slate-200 backdrop-blur-md'
                    }`}>
                      {track.fileType.toUpperCase()}
                    </span>
                  </div>

                  {/* 悬浮播放 Hover Overlay */}
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                    <button
                      onClick={() => (isCurrent && isPlaying ? onTogglePause() : onPlayTrack(track))}
                      className="w-11 h-11 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shadow-lg transform hover:scale-110 transition-all cursor-pointer"
                    >
                      {isCurrent && isPlaying ? (
                        <Pause className="w-5 h-5 fill-current" />
                      ) : (
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      )}
                    </button>
                  </div>

                  {/* 红心喜欢按钮 */}
                  <button
                    onClick={() => onToggleFavorite(track.id)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/60 backdrop-blur-md text-slate-300 hover:text-rose-500 transition-all cursor-pointer"
                  >
                    <Heart className={`w-3.5 h-3.5 ${track.isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>
                </div>

                {/* 文字元数据 */}
                <div className="space-y-1">
                  <h4 className={`text-xs font-semibold truncate ${isCurrent ? 'text-emerald-400' : 'text-slate-100'}`}>
                    {track.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate">{track.artist}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                    <span>{track.bitrate ? `${track.bitrate}kbps` : 'HD'}</span>
                    <span>{formatTimeSec(track.duration)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
