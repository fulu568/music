/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MusicLibrary } from './components/MusicLibrary';
import { PlayerBar } from './components/PlayerBar';
import { LyricsView } from './components/LyricsView';
import { FullScreenPlayer } from './components/FullScreenPlayer';
import { EqualizerModal } from './components/EqualizerModal';
import { VisualizerCanvas } from './components/VisualizerCanvas';
import { PlaylistsView } from './components/PlaylistsView';
import { EditLyricsModal } from './components/EditLyricsModal';
import { TrackDetailModal } from './components/TrackDetailModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { ExportWindowsModal } from './components/ExportWindowsModal';
import { QueueDrawer } from './components/QueueDrawer';

import { Track, Playlist, PlayerSettings, ViewTab, PlaybackMode, VisualizerMode } from './types';
import { DEFAULT_TRACKS } from './utils/defaultTracks';
import { musicDB } from './utils/indexedDB';
import { audioDSP } from './utils/audioEngine';
import { parseAudioFile } from './utils/metadataParser';
import { parseLrc, findActiveLyricIndex } from './utils/lrcParser';
import { Sparkles, Activity, Layers, Disc3 } from 'lucide-react';

const DEFAULT_SETTINGS: PlayerSettings = {
  volume: 0.8,
  isMuted: false,
  playbackRate: 1.0,
  lyricFontSize: 20,
  lyricOffset: 0,
  theme: 'dark',
  visualizerMode: 'bars',
  eqEnabled: true,
  spatialReverbEnabled: false,
  bassBoost: 20,
  preampGain: 0,
  currentEqValues: [0, 1, 2, 1, 0, 0, 1, 2, 2, 1],
  selectedEqPresetId: 'pop',
};

export default function App() {
  // --- 状态集合 ---
  const [tracks, setTracks] = useState<Track[]>(DEFAULT_TRACKS);
  const [currentTrack, setCurrentTrack] = useState<Track | undefined>(DEFAULT_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(DEFAULT_TRACKS[0]?.duration || 180);
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>('sequence');
  const [currentTab, setCurrentTab] = useState<ViewTab>('library');
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFormatFilter, setSelectedFormatFilter] = useState<string>('all');
  const [settings, setSettings] = useState<PlayerSettings>(DEFAULT_SETTINGS);

  // 模态框与抽屉 Toggle
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [showEqModal, setShowEqModal] = useState<boolean>(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState<boolean>(false);
  const [showExportWindowsModal, setShowExportWindowsModal] = useState<boolean>(false);
  const [showQueueDrawer, setShowQueueDrawer] = useState<boolean>(false);
  const [editingLyricsTrack, setEditingLyricsTrack] = useState<Track | null>(null);
  const [inspectingTrack, setInspectingTrack] = useState<Track | null>(null);

  // 当前实时歌词文本
  const [activeLyricText, setActiveLyricText] = useState<string>('');
  const [activeLyricTranslation, setActiveLyricTranslation] = useState<string | undefined>();

  const audioRef = useRef<HTMLAudioElement>(null);

  // --- 初始化加载持久化数据 ---
  useEffect(() => {
    const loadPersistedData = async () => {
      try {
        await musicDB.init();
        const { tracks: dbTracks } = await musicDB.getAllTracks();
        if (dbTracks && dbTracks.length > 0) {
          // 合并默认内置曲目与用户导入的 IndexedDB 曲目
          const mergedMap = new Map<string, Track>();
          DEFAULT_TRACKS.forEach((t) => mergedMap.set(t.id, t));
          dbTracks.forEach((t) => mergedMap.set(t.id, t));
          const allTracks = Array.from(mergedMap.values());
          setTracks(allTracks);
          setCurrentTrack(allTracks[0]);
        }

        const savedPlaylists = await musicDB.getAllPlaylists();
        if (savedPlaylists) setPlaylists(savedPlaylists);

        const savedSettings = await musicDB.getSettings();
        if (savedSettings) {
          setSettings(savedSettings);
          audioDSP.setEQGains(savedSettings.currentEqValues);
          audioDSP.setBassBoost(savedSettings.bassBoost);
          audioDSP.setPreampGain(savedSettings.preampGain);
          audioDSP.setSpatialReverb(savedSettings.spatialReverbEnabled);
        }
      } catch (err) {
        console.warn('IndexedDB 数据加载提醒:', err);
      }
    };

    loadPersistedData();
  }, []);

  // --- 绑定 Web Audio DSP 节点 ---
  useEffect(() => {
    if (audioRef.current) {
      audioDSP.attachAudioElement(audioRef.current);
    }
  }, []);

  // --- 同步音频元素属性 (音量、倍速) ---
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = settings.isMuted ? 0 : settings.volume;
      audioRef.current.playbackRate = settings.playbackRate;
    }
  }, [settings.volume, settings.isMuted, settings.playbackRate]);

  // --- 实时更新高亮歌词 ---
  useEffect(() => {
    if (currentTrack && currentTrack.lyrics) {
      const parsed = parseLrc(currentTrack.lyrics, settings.lyricOffset);
      if (parsed.lines.length > 0) {
        const idx = findActiveLyricIndex(parsed.lines, currentTime);
        if (idx >= 0 && parsed.lines[idx]) {
          setActiveLyricText(parsed.lines[idx].text);
          setActiveLyricTranslation(parsed.lines[idx].translation);
        }
      } else {
        setActiveLyricText('');
        setActiveLyricTranslation(undefined);
      }
    } else {
      setActiveLyricText('');
      setActiveLyricTranslation(undefined);
    }
  }, [currentTime, currentTrack?.id, currentTrack?.lyrics, settings.lyricOffset]);

  // --- 键盘快捷键监听器 ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 忽略 Input / Textarea 中的输入
      const targetTag = (e.target as HTMLElement).tagName.toLowerCase();
      if (targetTag === 'input' || targetTag === 'textarea') return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleSeek(Math.max(0, currentTime - 5));
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleSeek(Math.min(duration, currentTime + 5));
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        const newVol = Math.min(1, settings.volume + 0.05);
        updateSettings({ volume: newVol, isMuted: false });
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        const newVol = Math.max(0, settings.volume - 0.05);
        updateSettings({ volume: newVol });
      } else if (e.code === 'KeyL') {
        setCurrentTab((prev) => (prev === 'lyrics' ? 'library' : 'lyrics'));
      } else if (e.code === 'KeyF') {
        setIsFullScreen((prev) => !prev);
      } else if (e.code === 'KeyM') {
        updateSettings({ isMuted: !settings.isMuted });
      } else if (e.code === 'KeyE') {
        setShowEqModal((prev) => !prev);
      } else if (e.code === 'KeyQ') {
        setShowQueueDrawer((prev) => !prev);
      } else if (e.code === 'Escape') {
        setIsFullScreen(false);
        setShowEqModal(false);
        setShowShortcutsModal(false);
        setShowQueueDrawer(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTime, duration, settings.volume, settings.isMuted]);

  // --- 播放控制逻辑 ---
  const handlePlayTrack = (track: Track) => {
    audioDSP.resumeContext();
    setCurrentTrack(track);
    if (audioRef.current) {
      audioRef.current.src = track.audioUrl;
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.warn('播放中断提醒:', err);
      });
    }

    // 增加播放计数
    setTracks((prev) =>
      prev.map((t) => (t.id === track.id ? { ...t, playCount: t.playCount + 1 } : t))
    );
  };

  const handleTogglePlay = () => {
    audioDSP.resumeContext();
    if (!currentTrack && tracks.length > 0) {
      handlePlayTrack(tracks[0]);
      return;
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch((err) => console.warn('播放重试:', err));
      }
    }
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  // 上一曲 / 下一曲算法
  const handlePrevTrack = () => {
    if (tracks.length === 0) return;
    const currentIdx = tracks.findIndex((t) => t.id === currentTrack?.id);
    let prevIdx = currentIdx - 1;
    if (prevIdx < 0) prevIdx = tracks.length - 1;
    handlePlayTrack(tracks[prevIdx]);
  };

  const handleNextTrack = () => {
    if (tracks.length === 0) return;
    if (playbackMode === 'shuffle') {
      const randIdx = Math.floor(Math.random() * tracks.length);
      handlePlayTrack(tracks[randIdx]);
      return;
    }

    const currentIdx = tracks.findIndex((t) => t.id === currentTrack?.id);
    let nextIdx = (currentIdx + 1) % tracks.length;
    handlePlayTrack(tracks[nextIdx]);
  };

  // 播放结束处理
  const handleAudioEnded = () => {
    if (playbackMode === 'repeat-one' && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      return;
    }
    handleNextTrack();
  };

  // --- 本地文件/文件夹批量导入解析 ---
  const handleImportFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const filesArray = Array.from(e.target.files) as File[];
    
    // 区分 LRC 歌词文件与音频文件
    const audioFiles = filesArray.filter((f) => !f.name.endsWith('.lrc'));
    const lrcFiles = filesArray.filter((f) => f.name.endsWith('.lrc'));

    const lrcMap = new Map<string, string>();
    for (const lrcFile of lrcFiles) {
      try {
        const text = await lrcFile.text();
        const baseName = lrcFile.name.replace(/\.lrc$/i, '').toLowerCase();
        lrcMap.set(baseName, text);
      } catch (err) {
        console.warn('LRC 读取警示:', err);
      }
    }

    const newTracks: Track[] = [];

    for (const file of audioFiles) {
      try {
        const parsedTrack = await parseAudioFile(file);
        
        // 尝试自动关联对应的 LRC 歌词
        const baseName = file.name.replace(/\.[^/.]+$/, '').toLowerCase();
        if (lrcMap.has(baseName)) {
          parsedTrack.lyrics = lrcMap.get(baseName);
        }

        newTracks.push(parsedTrack);
        // 保存至 IndexedDB 持久化
        await musicDB.saveTrack(parsedTrack, file);
      } catch (err) {
        console.error('音频文件解析失败:', file.name, err);
      }
    }

    if (newTracks.length > 0) {
      setTracks((prev) => [...newTracks, ...prev]);
      if (!isPlaying) {
        handlePlayTrack(newTracks[0]);
      }
    }
  };

  // --- 设置更新 ---
  const updateSettings = (newPartial: Partial<PlayerSettings>) => {
    const updated = { ...settings, ...newPartial };
    setSettings(updated);
    musicDB.saveSettings(updated);
  };

  // --- 红心喜欢 ---
  const handleToggleFavorite = (trackId: string) => {
    setTracks((prev) =>
      prev.map((t) => {
        if (t.id === trackId) {
          const updated = { ...t, isFavorite: !t.isFavorite };
          musicDB.saveTrack(updated);
          return updated;
        }
        return t;
      })
    );
  };

  // --- 删除音轨 ---
  const handleDeleteTrack = async (trackId: string) => {
    setTracks((prev) => prev.filter((t) => t.id !== trackId));
    await musicDB.deleteTrack(trackId);
    if (currentTrack?.id === trackId) {
      handleNextTrack();
    }
  };

  // --- 保存编辑的歌词 ---
  const handleSaveLyrics = async (trackId: string, lyrics: string) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === trackId ? { ...t, lyrics } : t))
    );
    if (currentTrack?.id === trackId) {
      setCurrentTrack((prev) => (prev ? { ...prev, lyrics } : prev));
    }
    await musicDB.saveLyrics(trackId, lyrics);
  };

  // --- 歌单操作 ---
  const handleCreatePlaylist = async (name: string, description?: string) => {
    const newPlaylist: Playlist = {
      id: `pl-${Date.now()}`,
      name,
      description,
      trackIds: [],
      createdAt: Date.now(),
    };
    setPlaylists((prev) => [...prev, newPlaylist]);
    await musicDB.savePlaylist(newPlaylist);
  };

  const handleDeletePlaylist = async (playlistId: string) => {
    setPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
    await musicDB.deletePlaylist(playlistId);
  };

  const handleAddTrackToPlaylist = async (playlistId: string, trackId: string) => {
    setPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id === playlistId && !pl.trackIds.includes(trackId)) {
          const updated = { ...pl, trackIds: [...pl.trackIds, trackId] };
          musicDB.savePlaylist(updated);
          return updated;
        }
        return pl;
      })
    );
  };

  const handleRemoveTrackFromPlaylist = async (playlistId: string, trackId: string) => {
    setPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id === playlistId) {
          const updated = { ...pl, trackIds: pl.trackIds.filter((id) => id !== trackId) };
          musicDB.savePlaylist(updated);
          return updated;
        }
        return pl;
      })
    );
  };

  // 歌单播放全清单
  const handlePlayPlaylist = (playlist: Playlist) => {
    const plTracks = tracks.filter((t) => playlist.trackIds.includes(t.id));
    if (plTracks.length > 0) {
      handlePlayTrack(plTracks[0]);
    }
  };

  // --- 搜索与格式过滤 ---
  const filteredTracks = tracks.filter((t) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      t.title.toLowerCase().includes(query) ||
      t.artist.toLowerCase().includes(query) ||
      t.album.toLowerCase().includes(query) ||
      t.fileType.toLowerCase().includes(query);

    if (!matchesSearch) return false;

    if (selectedFormatFilter === 'lossless') return t.isLossless;
    if (selectedFormatFilter !== 'all') return t.fileType === selectedFormatFilter;

    return true;
  });

  const favoriteTracks = tracks.filter((t) => t.isFavorite);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden select-none">
      {/* HTML5 Audio 媒体元素 */}
      <audio
        ref={audioRef}
        onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
        onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
        onEnded={handleAudioEnded}
      />

      {/* 侧边导航 */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        trackCount={tracks.length}
        favoriteCount={favoriteTracks.length}
        playlistCount={playlists.length}
        onImportFiles={handleImportFiles}
        onImportFolder={() => {}}
        onCreatePlaylist={() => handleCreatePlaylist('新未命名歌单')}
        isPlaying={isPlaying}
        currentTrackTitle={currentTrack?.title}
      />

      {/* 主界面内容与 Header */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden pb-24">
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedFormatFilter={selectedFormatFilter}
          onSelectFormatFilter={setSelectedFormatFilter}
          currentTrack={currentTrack}
          eqEnabled={settings.eqEnabled}
          spatialEnabled={settings.spatialReverbEnabled}
          onOpenShortcuts={() => setShowShortcutsModal(true)}
          onOpenExportWindows={() => setShowExportWindowsModal(true)}
          onImportFiles={handleImportFiles}
        />

        {/* 核心视图切换 */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          {currentTab === 'library' && (
            <MusicLibrary
              tracks={filteredTracks}
              currentTrackId={currentTrack?.id}
              isPlaying={isPlaying}
              onPlayTrack={handlePlayTrack}
              onTogglePause={handleTogglePlay}
              onToggleFavorite={handleToggleFavorite}
              onDeleteTrack={handleDeleteTrack}
              onOpenEditLyrics={setEditingLyricsTrack}
              onOpenInspectTrack={setInspectingTrack}
              playlists={playlists}
              onAddTrackToPlaylist={handleAddTrackToPlaylist}
              onImportFiles={handleImportFiles}
            />
          )}

          {currentTab === 'playlists' && (
            <PlaylistsView
              playlists={playlists}
              tracks={tracks}
              currentTrackId={currentTrack?.id}
              isPlaying={isPlaying}
              onPlayTrack={handlePlayTrack}
              onPlayPlaylist={handlePlayPlaylist}
              onCreatePlaylist={handleCreatePlaylist}
              onDeletePlaylist={handleDeletePlaylist}
              onRemoveTrackFromPlaylist={handleRemoveTrackFromPlaylist}
            />
          )}

          {currentTab === 'favorites' && (
            <MusicLibrary
              tracks={favoriteTracks}
              currentTrackId={currentTrack?.id}
              isPlaying={isPlaying}
              onPlayTrack={handlePlayTrack}
              onTogglePause={handleTogglePlay}
              onToggleFavorite={handleToggleFavorite}
              onDeleteTrack={handleDeleteTrack}
              onOpenEditLyrics={setEditingLyricsTrack}
              onOpenInspectTrack={setInspectingTrack}
              playlists={playlists}
              onAddTrackToPlaylist={handleAddTrackToPlaylist}
              onImportFiles={handleImportFiles}
            />
          )}

          {currentTab === 'lyrics' && (
            <LyricsView
              currentTrack={currentTrack}
              currentTime={currentTime}
              isPlaying={isPlaying}
              onSeek={handleSeek}
              lyricOffset={settings.lyricOffset}
              onChangeLyricOffset={(offset) => updateSettings({ lyricOffset: offset })}
              lyricFontSize={settings.lyricFontSize}
              onChangeLyricFontSize={(size) => updateSettings({ lyricFontSize: size })}
              onOpenEditLyrics={setEditingLyricsTrack}
              onToggleFavorite={handleToggleFavorite}
            />
          )}

          {currentTab === 'equalizer' && (
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-emerald-400" />
                    10段 DSP 硬件级图形均衡器
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    实时调校 31Hz 至 16kHz 频段，结合重低音增强与 3D 空间环绕声
                  </p>
                </div>
                <button
                  onClick={() => setShowEqModal(true)}
                  className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  打开全屏 DSP 调音台
                </button>
              </div>

              <VisualizerCanvas mode={settings.visualizerMode} height={360} />
            </div>
          )}

          {currentTab === 'visualizer' && (
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-400" />
                    60FPS 高保真音源频谱试图
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">实时捕获音频 FFT 采样频域与时域波形</p>
                </div>

                <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-xl">
                  {(['bars', 'circle', 'waveform', 'particles'] as VisualizerMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => updateSettings({ visualizerMode: mode })}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        settings.visualizerMode === mode
                          ? 'bg-emerald-500 text-slate-950 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {mode === 'bars' ? '频段柱状' : mode === 'circle' ? '霓虹圆盘' : mode === 'waveform' ? '示波波形' : '浮动粒子'}
                    </button>
                  ))}
                </div>
              </div>

              <VisualizerCanvas mode={settings.visualizerMode} height={480} />
            </div>
          )}

          {currentTab === 'history' && (
            <MusicLibrary
              tracks={tracks.filter((t) => t.playCount > 0)}
              currentTrackId={currentTrack?.id}
              isPlaying={isPlaying}
              onPlayTrack={handlePlayTrack}
              onTogglePause={handleTogglePlay}
              onToggleFavorite={handleToggleFavorite}
              onDeleteTrack={handleDeleteTrack}
              onOpenEditLyrics={setEditingLyricsTrack}
              onOpenInspectTrack={setInspectingTrack}
              playlists={playlists}
              onAddTrackToPlaylist={handleAddTrackToPlaylist}
              onImportFiles={handleImportFiles}
            />
          )}
        </main>
      </div>

      {/* 底部固定播放控制 Bar */}
      <PlayerBar
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        onPrevTrack={handlePrevTrack}
        onNextTrack={handleNextTrack}
        playbackMode={playbackMode}
        onChangePlaybackMode={setPlaybackMode}
        currentTime={currentTime}
        duration={duration}
        onSeek={handleSeek}
        volume={settings.volume}
        isMuted={settings.isMuted}
        onVolumeChange={(vol) => updateSettings({ volume: vol })}
        onToggleMute={() => updateSettings({ isMuted: !settings.isMuted })}
        playbackRate={settings.playbackRate}
        onChangePlaybackRate={(rate) => updateSettings({ playbackRate: rate })}
        activeLyricText={activeLyricText}
        activeLyricTranslation={activeLyricTranslation}
        onToggleFullScreen={() => setIsFullScreen(true)}
        onToggleLyricsView={() => setCurrentTab('lyrics')}
        onToggleEqualizerModal={() => setShowEqModal(true)}
        onToggleQueueDrawer={() => setShowQueueDrawer(!showQueueDrawer)}
        isQueueOpen={showQueueDrawer}
        eqEnabled={settings.eqEnabled}
      />

      {/* 沉浸式全屏播放器 */}
      {isFullScreen && (
        <FullScreenPlayer
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
          onPrevTrack={handlePrevTrack}
          onNextTrack={handleNextTrack}
          currentTime={currentTime}
          duration={duration}
          onSeek={handleSeek}
          volume={settings.volume}
          isMuted={settings.isMuted}
          onVolumeChange={(vol) => updateSettings({ volume: vol })}
          onToggleMute={() => updateSettings({ isMuted: !settings.isMuted })}
          playbackMode={playbackMode}
          onChangePlaybackMode={setPlaybackMode}
          onClose={() => setIsFullScreen(false)}
          onToggleFavorite={handleToggleFavorite}
          eqEnabled={settings.eqEnabled}
          lyricOffset={settings.lyricOffset}
        />
      )}

      {/* 10段 EQ 面板 Modal */}
      {showEqModal && (
        <EqualizerModal
          settings={settings}
          onUpdateSettings={updateSettings}
          onClose={() => setShowEqModal(false)}
        />
      )}

      {/* LRC 歌词编辑 Modal */}
      {editingLyricsTrack && (
        <EditLyricsModal
          track={editingLyricsTrack}
          onSaveLyrics={handleSaveLyrics}
          onClose={() => setEditingLyricsTrack(null)}
        />
      )}

      {/* 音频元数据技术 Inspector Modal */}
      {inspectingTrack && (
        <TrackDetailModal
          track={inspectingTrack}
          onClose={() => setInspectingTrack(null)}
        />
      )}

      {/* 快捷键帮助 Modal */}
      {showShortcutsModal && (
        <ShortcutsModal onClose={() => setShowShortcutsModal(false)} />
      )}

      {/* Windows 客户端打包 Modal */}
      {showExportWindowsModal && (
        <ExportWindowsModal onClose={() => setShowExportWindowsModal(false)} />
      )}

      {/* 待播队列 Drawers */}
      {showQueueDrawer && (
        <QueueDrawer
          queue={tracks}
          currentTrackId={currentTrack?.id}
          onPlayTrack={handlePlayTrack}
          onRemoveFromQueue={handleDeleteTrack}
          onClearQueue={() => setTracks([])}
          onClose={() => setShowQueueDrawer(false)}
        />
      )}
    </div>
  );
}
