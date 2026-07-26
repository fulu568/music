/**
 * IndexedDB 持久化存储引擎 - 支持大体积本地音频 File/Blob 存储、歌单与用户偏好
 */
import { Playlist, PlayerSettings, Track } from '../types';

const DB_NAME = 'RhymeLocalMusicDB';
const DB_VERSION = 1;

export interface StoredTrackBlob {
  trackId: string;
  blob: Blob;
  lyrics?: string;
}

class MusicDB {
  private db: IDBDatabase | null = null;

  public async init(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 音轨元数据 Store
        if (!db.objectStoreNames.contains('tracks')) {
          db.createObjectStore('tracks', { keyPath: 'id' });
        }

        // 音频 Blob 实体 Store
        if (!db.objectStoreNames.contains('audioBlobs')) {
          db.createObjectStore('audioBlobs', { keyPath: 'trackId' });
        }

        // 歌单 Store
        if (!db.objectStoreNames.contains('playlists')) {
          db.createObjectStore('playlists', { keyPath: 'id' });
        }

        // 偏好设置 Store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onerror = (event) => {
        console.error('IndexedDB 打开失败:', (event.target as IDBOpenDBRequest).error);
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  }

  // --- Track 元数据操作 ---
  public async saveTrack(track: Track, blob?: Blob): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(['tracks', 'audioBlobs'], 'readwrite');
      
      // 保存元数据 (不要存储可变的 audioUrl blob 引用，每次读取时恢复)
      const trackMeta = { ...track, audioUrl: '' };
      tx.objectStore('tracks').put(trackMeta);

      if (blob) {
        tx.objectStore('audioBlobs').put({
          trackId: track.id,
          blob,
          lyrics: track.lyrics,
        });
      }

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  public async getAllTracks(): Promise<{ tracks: Track[]; blobs: Map<string, Blob> }> {
    await this.init();
    if (!this.db) return { tracks: [], blobs: new Map() };

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(['tracks', 'audioBlobs'], 'readonly');
      const tracksStore = tx.objectStore('tracks');
      const blobsStore = tx.objectStore('audioBlobs');

      const tracksReq = tracksStore.getAll();
      const blobsReq = blobsStore.getAll();

      tx.oncomplete = () => {
        const rawTracks: Track[] = tracksReq.result || [];
        const rawBlobs: StoredTrackBlob[] = blobsReq.result || [];

        const blobsMap = new Map<string, Blob>();
        const lyricsMap = new Map<string, string>();

        rawBlobs.forEach((item) => {
          if (item.blob) blobsMap.set(item.trackId, item.blob);
          if (item.lyrics) lyricsMap.set(item.trackId, item.lyrics);
        });

        const restoredTracks = rawTracks.map((t) => {
          const blob = blobsMap.get(t.id);
          const audioUrl = blob ? URL.createObjectURL(blob) : t.audioUrl;
          const lyrics = lyricsMap.get(t.id) || t.lyrics;
          return {
            ...t,
            audioUrl,
            lyrics,
          };
        });

        resolve({ tracks: restoredTracks, blobs: blobsMap });
      };

      tx.onerror = () => reject(tx.error);
    });
  }

  public async deleteTrack(trackId: string): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(['tracks', 'audioBlobs'], 'readwrite');
      tx.objectStore('tracks').delete(trackId);
      tx.objectStore('audioBlobs').delete(trackId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  public async saveLyrics(trackId: string, lyrics: string): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(['tracks', 'audioBlobs'], 'readwrite');
      const tracksStore = tx.objectStore('tracks');
      const blobsStore = tx.objectStore('audioBlobs');

      const getReq = tracksStore.get(trackId);
      getReq.onsuccess = () => {
        if (getReq.result) {
          const updated = { ...getReq.result, lyrics };
          tracksStore.put(updated);
        }
      };

      const getBlobReq = blobsStore.get(trackId);
      getBlobReq.onsuccess = () => {
        if (getBlobReq.result) {
          const updatedBlob = { ...getBlobReq.result, lyrics };
          blobsStore.put(updatedBlob);
        }
      };

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // --- 歌单操作 ---
  public async savePlaylist(playlist: Playlist): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(['playlists'], 'readwrite');
      tx.objectStore('playlists').put(playlist);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  public async getAllPlaylists(): Promise<Playlist[]> {
    await this.init();
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(['playlists'], 'readonly');
      const req = tx.objectStore('playlists').getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  public async deletePlaylist(playlistId: string): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(['playlists'], 'readwrite');
      tx.objectStore('playlists').delete(playlistId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // --- 设置操作 ---
  public async saveSettings(settings: PlayerSettings): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(['settings'], 'readwrite');
      tx.objectStore('settings').put(settings, 'user_settings');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  public async getSettings(): Promise<PlayerSettings | null> {
    await this.init();
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(['settings'], 'readonly');
      const req = tx.objectStore('settings').get('user_settings');
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }
}

export const musicDB = new MusicDB();
