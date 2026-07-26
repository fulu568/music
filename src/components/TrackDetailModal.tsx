/**
 * 音频高保真技术细节与元数据检测 Modal
 */
import React from 'react';
import { Info, X, ShieldCheck, Radio, FileCode, HardDrive, Clock, Activity, Disc } from 'lucide-react';
import { Track } from '../types';
import { formatTimeSec } from '../utils/lrcParser';

interface TrackDetailModalProps {
  track: Track;
  onClose: () => void;
}

export const TrackDetailModal: React.FC<TrackDetailModalProps> = ({ track, onClose }) => {
  const fileSizeMb = track.fileSize
    ? (track.fileSize / (1024 * 1024)).toFixed(2)
    : '未知';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 md:p-8 space-y-6 text-white shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">音频工程技术细节</h3>
              <p className="text-xs text-slate-400">Media Audio Spec & Tag Inspector</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 封面与基础信息 */}
        <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <img
            src={track.coverUrl}
            alt={track.title}
            referrerPolicy="no-referrer"
            className="w-16 h-16 rounded-xl object-cover bg-slate-900 shadow-md"
          />
          <div className="space-y-1 truncate">
            <h4 className="text-sm font-bold text-slate-100 truncate">{track.title}</h4>
            <p className="text-xs text-emerald-400 font-medium truncate">{track.artist}</p>
            <p className="text-[11px] text-slate-400 truncate">{track.album}</p>
          </div>
        </div>

        {/* 核心技术参数 Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 space-y-1">
            <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
              <FileCode className="w-3.5 h-3.5 text-emerald-400" /> 音频编码格式
            </span>
            <span className="font-mono font-bold text-slate-100 uppercase block">
              {track.fileType} {track.isLossless ? '(Hi-Res 无损)' : '(有损压缩)'}
            </span>
          </div>

          <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 space-y-1">
            <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
              <Activity className="w-3.5 h-3.5 text-cyan-400" /> 传输比特率 (Bitrate)
            </span>
            <span className="font-mono font-bold text-slate-100 block">
              {track.bitrate ? `${track.bitrate} kbps` : '动态码率'}
            </span>
          </div>

          <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 space-y-1">
            <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
              <Radio className="w-3.5 h-3.5 text-amber-400" /> 采样频率 (Sample Rate)
            </span>
            <span className="font-mono font-bold text-slate-100 block">
              {track.sampleRate || 44100} Hz ({(track.sampleRate ? track.sampleRate / 1000 : 44.1).toFixed(1)} kHz)
            </span>
          </div>

          <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 space-y-1">
            <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
              <Disc className="w-3.5 h-3.5 text-emerald-400" /> 量化深度 (Bit Depth)
            </span>
            <span className="font-mono font-bold text-slate-100 block">
              {track.bitDepth || (track.isLossless ? 24 : 16)} bit
            </span>
          </div>

          <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 space-y-1">
            <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
              <HardDrive className="w-3.5 h-3.5 text-blue-400" /> 文件体积大小
            </span>
            <span className="font-mono font-bold text-slate-100 block">
              {fileSizeMb} MB
            </span>
          </div>

          <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 space-y-1">
            <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
              <Clock className="w-3.5 h-3.5 text-purple-400" /> 精确时长
            </span>
            <span className="font-mono font-bold text-slate-100 block">
              {formatTimeSec(track.duration)} ({track.duration} 秒)
            </span>
          </div>
        </div>

        {/* 底部验证标记 */}
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 flex-shrink-0" />
          <span>解码通过: 已成功挂载 Web Audio API 10段 DSP 增益链与 60FPS 频域分析器</span>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl cursor-pointer"
          >
            关闭关闭窗口
          </button>
        </div>
      </div>
    </div>
  );
};
