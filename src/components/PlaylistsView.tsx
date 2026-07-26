/**
 * 专属歌单管理视图 - 创建、编排、分类与批量管理
 */
import React, { useState } from 'react';
import { ListMusic, Plus, Play, Trash2, Music, Check, FolderPlus, Disc } from 'lucide-react';
import { Playlist, Track } from '../types';
import { formatTimeSec } from '../utils/lrcParser';

interface PlaylistsViewProps {
  playlists: Playlist[];
  tracks: Track[];
  currentTrackId?: string;
  isPlaying: boolean;
  onPlayTrack: (track: Track) => void;
  onPlayPlaylist: (playlist: Playlist) => void;
  onCreatePlaylist: (name: string, description?: string) => void;
  onDeletePlaylist: (playlistId: string) => void;
  onRemoveTrackFromPlaylist: (playlistId: string, trackId: string) => void;
}

export const PlaylistsView: React.FC<PlaylistsViewProps> = ({
  playlists,
  tracks,
  currentTrackId,
  isPlaying,
  onPlayTrack,
  onPlayPlaylist,
  onCreatePlaylist,
  onDeletePlaylist,
  onRemoveTrackFromPlaylist,
}) => {
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(
    playlists.length > 0 ? playlists[0].id : null
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');

  const selectedPlaylist = playlists.find((p) => p.id === selectedPlaylistId);
  const playlistTracks = selectedPlaylist
    ? tracks.filter((t) => selectedPlaylist.trackIds.includes(t.id))
    : [];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    onCreatePlaylist(newPlaylistName.trim(), newPlaylistDesc.trim());
    setNewPlaylistName('');
    setNewPlaylistDesc('');
    setShowCreateModal(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* 顶部标题与新建歌单按钮 */}
      <div className="flex items-center justify-between bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ListMusic className="w-5 h-5 text-emerald-400" />
            我的专属歌单
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            分类整理本地高保真曲目，自定义独特听觉向导
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          创建新歌单
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 左侧：歌单卡片列表 */}
        <div className="space-y-3">
          {playlists.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-500 text-xs">
              暂未创建任何歌单
            </div>
          ) : (
            playlists.map((pl) => {
              const isSelected = pl.id === selectedPlaylistId;
              return (
                <div
                  key={pl.id}
                  onClick={() => setSelectedPlaylistId(pl.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                    isSelected
                      ? 'bg-slate-800 border-emerald-500/60 shadow-lg'
                      : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-emerald-400 font-bold">
                      <Disc className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-100">{pl.name}</h4>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {pl.trackIds.length} 首曲目
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlayPlaylist(pl);
                      }}
                      className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 transition-all cursor-pointer"
                      title="顺序播放歌单"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePlaylist(pl.id);
                        if (selectedPlaylistId === pl.id) {
                          setSelectedPlaylistId(null);
                        }
                      }}
                      className="p-2 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                      title="删除歌单"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 右侧：当前选中歌单曲目明细 */}
        <div className="md:col-span-2 bg-slate-900/60 rounded-2xl border border-slate-800/80 p-5 space-y-4">
          {selectedPlaylist ? (
            <>
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedPlaylist.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {selectedPlaylist.description || '暂无歌单描述'}
                  </p>
                </div>

                <button
                  onClick={() => onPlayPlaylist(selectedPlaylist)}
                  disabled={playlistTracks.length === 0}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  播放全部
                </button>
              </div>

              {playlistTracks.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  歌单内尚无曲目，可在媒体库中选择歌曲添加至本歌单
                </div>
              ) : (
                <div className="space-y-2">
                  {playlistTracks.map((track, idx) => {
                    const isCurrent = currentTrackId === track.id;
                    return (
                      <div
                        key={track.id}
                        className={`flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/60 transition-all group ${
                          isCurrent ? 'bg-emerald-500/10 border-l-2 border-emerald-500' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-slate-500 w-6">{idx + 1}</span>
                          <img
                            src={track.coverUrl}
                            alt={track.title}
                            referrerPolicy="no-referrer"
                            className="w-9 h-9 rounded-lg object-cover bg-slate-950"
                          />
                          <div>
                            <h5 className={`text-xs font-semibold ${isCurrent ? 'text-emerald-400' : 'text-slate-100'}`}>
                              {track.title}
                            </h5>
                            <p className="text-[11px] text-slate-400">{track.artist}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-slate-400">
                            {formatTimeSec(track.duration)}
                          </span>

                          <button
                            onClick={() => onPlayTrack(track)}
                            className="p-1.5 text-slate-300 hover:text-emerald-400 cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                          </button>

                          <button
                            onClick={() => onRemoveTrackFromPlaylist(selectedPlaylist.id, track.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                            title="从歌单移出"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="py-20 text-center text-slate-500 text-xs">
              请在左侧选择或创建一个歌单
            </div>
          )}
        </div>
      </div>

      {/* 新建歌单 Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateSubmit}
            className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-4 text-white"
          >
            <h3 className="text-base font-bold flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-emerald-400" />
              创建新专属歌单
            </h3>

            <div className="space-y-1">
              <label className="text-xs text-slate-400">歌单名称 *</label>
              <input
                type="text"
                required
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="例如：深夜无损解压、赛博电音先锋..."
                className="w-full px-3 py-2 bg-slate-800 text-slate-100 text-xs rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400">歌单描述 (可选)</label>
              <textarea
                rows={3}
                value={newPlaylistDesc}
                onChange={(e) => setNewPlaylistDesc(e.target.value)}
                placeholder="简单记录歌单风格或听歌心情..."
                className="w-full px-3 py-2 bg-slate-800 text-slate-100 text-xs rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-xl"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl"
              >
                立即创建
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
