/**
 * LRC 歌词实时录入与校验 Modal
 */
import React, { useState } from 'react';
import { Mic2, X, Check, FileText, Sparkles } from 'lucide-react';
import { Track } from '../types';

interface EditLyricsModalProps {
  track: Track;
  onSaveLyrics: (trackId: string, lyrics: string) => void;
  onClose: () => void;
}

export const EditLyricsModal: React.FC<EditLyricsModalProps> = ({
  track,
  onSaveLyrics,
  onClose,
}) => {
  const [lrcText, setLrcText] = useState<string>(track.lyrics || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveLyrics(track.id, lrcText);
    onClose();
  };

  const sampleTemplate = `[ti:${track.title}]
[ar:${track.artist}]
[al:${track.album}]
[00:00.00]${track.title} - ${track.artist}
[00:05.00]在此处录入或粘贴带有时间戳的 LRC 歌词文本
[00:10.00]例如: [00:12.34]第一句歌词 / Translation
`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl p-6 md:p-8 space-y-4 text-white shadow-2xl relative"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <Mic2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">录入 / 编辑 LRC 歌词</h3>
              <p className="text-xs text-slate-400">曲目: {track.title} — {track.artist}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>支持标准 [mm:ss.xx] 格式与双语翻译 (用 " / " 分隔)</span>
            <button
              type="button"
              onClick={() => setLrcText(sampleTemplate)}
              className="text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              填充模板
            </button>
          </div>

          <textarea
            rows={12}
            value={lrcText}
            onChange={(e) => setLrcText(e.target.value)}
            placeholder={`在此处直接粘贴 LRC 歌词文本...\n[00:01.00]歌词第一行\n[00:05.50]歌词第二行 / 双语翻译内容`}
            className="w-full p-4 bg-slate-950 text-slate-100 text-xs font-mono rounded-2xl border border-slate-800 focus:outline-none focus:border-emerald-500/80 custom-scrollbar leading-relaxed"
          />
        </div>

        <div className="flex justify-between items-center border-t border-slate-800 pt-4">
          <button
            type="button"
            onClick={() => setLrcText('')}
            className="text-xs text-slate-500 hover:text-rose-400"
          >
            清空内容
          </button>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              保存同步歌词
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
