/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AudioFormat = 'mp3' | 'flac' | 'wav' | 'ogg' | 'aac' | 'm4a' | 'webm' | 'opus' | 'aiff' | 'other';

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // 秒为单位
  coverUrl: string;
  audioUrl: string;
  fileSize?: number;
  fileType: AudioFormat;
  bitrate?: number; // kbps
  sampleRate?: number; // Hz (如 44100, 96000)
  bitDepth?: number; // bit (如 16, 24)
  isLossless: boolean;
  lyrics?: string; // LRC 格式文本
  addedAt: number;
  playCount: number;
  isFavorite: boolean;
  fileName?: string;
}

export interface LyricLine {
  id: string;
  time: number; // 秒为单位
  text: string;
  translation?: string;
}

export type PlaybackMode = 'sequence' | 'repeat-one' | 'repeat-all' | 'shuffle';

export interface EQPreset {
  id: string;
  name: string;
  values: number[]; // 10-band增益值 (-12dB ~ +12dB)
}

export type VisualizerMode = 'bars' | 'circle' | 'waveform' | 'particles';

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  trackIds: string[];
  createdAt: number;
  coverUrl?: string;
}

export interface PlayerSettings {
  volume: number; // 0 ~ 1
  isMuted: boolean;
  playbackRate: number; // 0.5 ~ 2.0
  lyricFontSize: number; // px, 默认 18
  lyricOffset: number; // 毫秒偏移 (用于微调歌词对齐)
  theme: 'dark' | 'light' | 'glass';
  visualizerMode: VisualizerMode;
  eqEnabled: boolean;
  spatialReverbEnabled: boolean;
  bassBoost: number; // 0 ~ 100
  preampGain: number; // -10dB ~ +10dB
  currentEqValues: number[]; // 10段数值
  selectedEqPresetId: string;
}

export type ViewTab = 'library' | 'playlists' | 'favorites' | 'lyrics' | 'equalizer' | 'visualizer' | 'history';

export interface TechnicalAudioStats {
  format: string;
  bitrateKbps: number;
  sampleRateHz: number;
  channels: number;
  isLossless: boolean;
  audioBufferLoaded: boolean;
  decodeTimeMs?: number;
}
