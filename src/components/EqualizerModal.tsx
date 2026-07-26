/**
 * 10段 DSP 图形均衡器调校与音效面板
 */
import React from 'react';
import { Sliders, RotateCcw, Volume2, Sparkles, X, Radio, Layers } from 'lucide-react';
import { EQPreset, PlayerSettings } from '../types';
import { DEFAULT_EQ_PRESETS, EQ_FREQUENCIES, audioDSP } from '../utils/audioEngine';

interface EqualizerModalProps {
  settings: PlayerSettings;
  onUpdateSettings: (newSettings: Partial<PlayerSettings>) => void;
  onClose: () => void;
}

export const EqualizerModal: React.FC<EqualizerModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  // 切换 Enable/Bypass EQ
  const handleToggleEq = (enabled: boolean) => {
    onUpdateSettings({ eqEnabled: enabled });
    if (!enabled) {
      audioDSP.setEQGains(EQ_FREQUENCIES.map(() => 0));
    } else {
      audioDSP.setEQGains(settings.currentEqValues);
    }
  };

  // 选择预设
  const handleSelectPreset = (preset: EQPreset) => {
    onUpdateSettings({
      selectedEqPresetId: preset.id,
      currentEqValues: [...preset.values],
      eqEnabled: true,
    });
    audioDSP.setEQGains(preset.values);
  };

  // 单频段滑动条调节
  const handleBandGainChange = (index: number, dbVal: number) => {
    const updatedValues = [...settings.currentEqValues];
    updatedValues[index] = dbVal;
    onUpdateSettings({
      currentEqValues: updatedValues,
      selectedEqPresetId: 'custom',
      eqEnabled: true,
    });
    audioDSP.setEQGains(updatedValues);
  };

  // 重置 EQ
  const handleReset = () => {
    const flat = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    onUpdateSettings({
      currentEqValues: flat,
      selectedEqPresetId: 'flat',
      bassBoost: 0,
      preampGain: 0,
      spatialReverbEnabled: false,
    });
    audioDSP.setEQGains(flat);
    audioDSP.setBassBoost(0);
    audioDSP.setPreampGain(0);
    audioDSP.setSpatialReverb(false);
  };

  // 前置增益调节
  const handlePreampChange = (db: number) => {
    onUpdateSettings({ preampGain: db });
    audioDSP.setPreampGain(db);
  };

  // 低音重低音调节
  const handleBassBoostChange = (amount: number) => {
    onUpdateSettings({ bassBoost: amount });
    audioDSP.setBassBoost(amount);
  };

  // 3D 空间环绕声切换
  const handleSpatialToggle = (enabled: boolean) => {
    onUpdateSettings({ spatialReverbEnabled: enabled });
    audioDSP.setSpatialReverb(enabled);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-3xl shadow-2xl p-6 md:p-8 space-y-6 relative text-white">
        {/* 标题与开关 */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2">
                10段高保真 DSP 图形均衡器
                <span className="text-xs font-normal text-slate-400">(-12dB ~ +12dB)</span>
              </h3>
              <p className="text-xs text-slate-400">实时对 31Hz ~ 16kHz 频段进行硬件级滤波增益校准</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* EQ 开关 Toggle */}
            <label className="flex items-center gap-2 cursor-pointer bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
              <input
                type="checkbox"
                checked={settings.eqEnabled}
                onChange={(e) => handleToggleEq(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
              <span className="text-xs font-semibold text-slate-200">
                {settings.eqEnabled ? 'EQ 开启' : 'EQ 直通 (Bypass)'}
              </span>
            </label>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 预设列表 Preset Chips */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-400" /> 音效预设 (Presets)
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {DEFAULT_EQ_PRESETS.map((preset) => {
              const isSelected = settings.selectedEqPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {preset.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* 10段增益滑动控件 31Hz -> 16kHz */}
        <div className="bg-slate-950/80 p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="grid grid-cols-10 gap-2 text-center h-48 items-end">
            {EQ_FREQUENCIES.map((freq, idx) => {
              const gainVal = settings.currentEqValues[idx] || 0;
              return (
                <div key={freq} className="flex flex-col items-center justify-end h-full group">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold mb-1">
                    {gainVal > 0 ? `+${gainVal}` : gainVal}dB
                  </span>

                  <input
                    type="range"
                    min="-12"
                    max="12"
                    step="1"
                    value={gainVal}
                    disabled={!settings.eqEnabled}
                    onChange={(e) => handleBandGainChange(idx, parseInt(e.target.value, 10))}
                    className="h-32 w-1.5 accent-emerald-500 bg-slate-800 rounded-lg cursor-pointer transform -rotate-180 writing-mode-vertical"
                  />

                  <span className="text-[10px] font-mono text-slate-400 mt-2">
                    {freq >= 1000 ? `${freq / 1000}k` : freq}Hz
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 额外扩展 DSP 音效 (重低音 Bass Boost, 3D空间环绕, 前置增益) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* 低音重低音 Boost */}
          <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200">重低音 (Bass Boost)</span>
              <span className="font-mono text-emerald-400 font-bold">{settings.bassBoost}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.bassBoost}
              onChange={(e) => handleBassBoostChange(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-slate-900 accent-emerald-500 rounded-lg cursor-pointer"
            />
          </div>

          {/* 前置增益 Preamp */}
          <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200">前置放大幅 (Preamp)</span>
              <span className="font-mono text-emerald-400 font-bold">
                {settings.preampGain > 0 ? `+${settings.preampGain}` : settings.preampGain}dB
              </span>
            </div>
            <input
              type="range"
              min="-10"
              max="10"
              value={settings.preampGain}
              onChange={(e) => handlePreampChange(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-slate-900 accent-emerald-500 rounded-lg cursor-pointer"
            />
          </div>

          {/* 3D 空间环绕 */}
          <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-200">3D 空间声场环绕</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">拓展立体声延时与沉浸混响</p>
            </div>
            <button
              onClick={() => handleSpatialToggle(!settings.spatialReverbEnabled)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                settings.spatialReverbEnabled
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              {settings.spatialReverbEnabled ? '已开启' : '未开启'}
            </button>
          </div>
        </div>

        {/* 底部重置按钮 */}
        <div className="flex justify-between items-center border-t border-slate-800 pt-4">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            重置参数为默认平直
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            完成设置
          </button>
        </div>
      </div>
    </div>
  );
};
