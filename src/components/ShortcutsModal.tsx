/**
 * 键盘快捷键指南 Modal
 */
import React from 'react';
import { HelpCircle, X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ onClose }) => {
  const shortcuts = [
    { key: 'Space (空格)', desc: '播放 / 暂停音频' },
    { key: '← / → (方向键)', desc: '快退 -5s / 快进 +5s' },
    { key: '↑ / ↓ (方向键)', desc: '增加音量 +5% / 减小音量 -5%' },
    { key: 'L', desc: '打开 / 切换滚动歌词视图' },
    { key: 'F', desc: '开启 / 退出沉浸全屏模式' },
    { key: 'M', desc: '静音 / 恢复音量' },
    { key: 'E', desc: '调出 10段 DSP 均衡器' },
    { key: 'Q', desc: '展开 / 隐藏待播队列' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 space-y-6 text-white shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">键盘快捷键指南</h3>
              <p className="text-xs text-slate-400">本地播放快捷掌控</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          {shortcuts.map((sc) => (
            <div
              key={sc.key}
              className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs"
            >
              <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {sc.key}
              </span>
              <span className="text-slate-300">{sc.desc}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
          >
            知道了
          </button>
        </div>
      </div>
    </div>
  );
};
