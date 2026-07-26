/**
 * Web Audio API 高保真音频处理引擎
 * 包含 10段图形均衡器、Bass Boost 低音增强、3D空间环绕声、频谱分析器 (AnalyserNode)
 */
import { EQPreset } from '../types';

export const EQ_FREQUENCIES = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

export const DEFAULT_EQ_PRESETS: EQPreset[] = [
  { id: 'flat', name: '平直 (默认)', values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { id: 'pop', name: '流行乐 Pop', values: [1, 2, 4, 3, 0, -1, 1, 2, 3, 2] },
  { id: 'rock', name: '摇滚乐 Rock', values: [5, 4, 2, -1, -2, 0, 2, 4, 5, 4] },
  { id: 'jazz', name: '爵士乐 Jazz', values: [3, 2, 1, 2, -1, -1, 0, 1, 3, 4] },
  { id: 'classical', name: '古典乐 Classical', values: [4, 3, 2, 2, -1, -1, 0, 2, 3, 4] },
  { id: 'bass', name: '重低音 Bass Boost', values: [8, 7, 5, 2, 0, -1, -2, -2, -1, 0] },
  { id: 'vocal', name: '人声增强 Vocal', values: [-2, -1, 0, 3, 5, 5, 4, 2, 0, -1] },
  { id: 'electronic', name: '电子乐 Electronic', values: [5, 4, 2, 0, -2, 2, 1, 3, 4, 5] },
];

class AudioDSPCore {
  private ctx: AudioContext | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private preampNode: GainNode | null = null;
  private eqFilters: BiquadFilterNode[] = [];
  private bassBoostFilter: BiquadFilterNode | null = null;
  private spatialDelayNode: DelayNode | null = null;
  private spatialGainNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private pannerNode: StereoPannerNode | null = null;
  private attachedElement: HTMLAudioElement | null = null;

  /**
   * 将 HTML5 Audio 元素与 Web Audio DSP 链路绑定
   */
  public attachAudioElement(audioEl: HTMLAudioElement): void {
    if (this.attachedElement === audioEl && this.ctx) return;

    try {
      this.attachedElement = audioEl;
      
      // 创建 AudioContext
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();

      // 创建媒体源节点
      this.sourceNode = this.ctx.createMediaElementSource(audioEl);

      // 1. 前置放大 GainNode
      this.preampNode = this.ctx.createGain();
      this.preampNode.gain.value = 1.0;

      // 2. 10段 BiquadFilter 均衡器节点
      this.eqFilters = EQ_FREQUENCIES.map((freq) => {
        const filter = this.ctx!.createBiquadFilter();
        filter.type = freq <= 250 ? 'lowshelf' : freq >= 8000 ? 'highshelf' : 'peaking';
        filter.frequency.value = freq;
        filter.Q.value = 1.4;
        filter.gain.value = 0; // 默认 0dB
        return filter;
      });

      // 3. Bass Boost (低音增强)
      this.bassBoostFilter = this.ctx.createBiquadFilter();
      this.bassBoostFilter.type = 'lowshelf';
      this.bassBoostFilter.frequency.value = 100; // 100Hz 截止
      this.bassBoostFilter.gain.value = 0;

      // 4. 声道立体声/声相
      if (this.ctx.createStereoPanner) {
        this.pannerNode = this.ctx.createStereoPanner();
        this.pannerNode.pan.value = 0;
      }

      // 5. 空间环绕效果 (微小延时 + 反相混响模拟)
      this.spatialDelayNode = this.ctx.createDelay();
      this.spatialDelayNode.delayTime.value = 0.018; // 18ms 模拟双耳哈斯效应
      this.spatialGainNode = this.ctx.createGain();
      this.spatialGainNode.gain.value = 0; // 默认关闭

      // 6. 频谱分析器 AnalyserNode
      this.analyserNode = this.ctx.createAnalyser();
      this.analyserNode.fftSize = 256;
      this.analyserNode.smoothingTimeConstant = 0.82;

      // --- 构建链式连接 ---
      // Source -> Preamp -> EQ[0..9] -> BassBoost -> Panner -> Analyser -> Destination
      let currentNode: AudioNode = this.sourceNode;

      currentNode.connect(this.preampNode);
      currentNode = this.preampNode;

      // 连接 10段均衡器
      this.eqFilters.forEach((filter) => {
        currentNode.connect(filter);
        currentNode = filter;
      });

      // 连接 Bass Boost
      currentNode.connect(this.bassBoostFilter);
      currentNode = this.bassBoostFilter;

      // 连接 空间环绕 (并联支路)
      currentNode.connect(this.spatialDelayNode);
      this.spatialDelayNode.connect(this.spatialGainNode);
      this.spatialGainNode.connect(this.analyserNode);

      // 主路连接 Panner
      if (this.pannerNode) {
        currentNode.connect(this.pannerNode);
        currentNode = this.pannerNode;
      }

      // 连接 Analyser
      currentNode.connect(this.analyserNode);

      // 最终输出到扬声器
      this.analyserNode.connect(this.ctx.destination);
    } catch (err) {
      console.warn('Web Audio DSP 初始化提示 (某些浏览器可能限制了自动重连):', err);
    }
  }

  /**
   * 触发恢复 AudioContext (用户手势交互时)
   */
  public resumeContext(): void {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * 设置 10段均衡器增益
   */
  public setEQGains(gains: number[]): void {
    if (!this.eqFilters || this.eqFilters.length === 0) return;
    gains.forEach((gainVal, idx) => {
      if (this.eqFilters[idx]) {
        // 限制在 -12dB ~ +12dB 范围
        const clamped = Math.max(-12, Math.min(12, gainVal));
        this.eqFilters[idx].gain.setTargetAtTime(clamped, this.ctx?.currentTime || 0, 0.02);
      }
    });
  }

  /**
   * 设置前置增益 Preamp (-10dB ~ +10dB)
   */
  public setPreampGain(db: number): void {
    if (!this.preampNode || !this.ctx) return;
    // dB 转换为线性增益数值 linear = 10^(db/20)
    const linear = Math.pow(10, db / 20);
    this.preampNode.gain.setTargetAtTime(linear, this.ctx.currentTime, 0.02);
  }

  /**
   * 设置重低音 Boost 强度 (0 ~ 100)
   */
  public setBassBoost(amount: number): void {
    if (!this.bassBoostFilter || !this.ctx) return;
    // 将 0~100 映射到 0dB ~ +12dB 增益
    const gainDb = (amount / 100) * 12;
    this.bassBoostFilter.gain.setTargetAtTime(gainDb, this.ctx.currentTime, 0.02);
  }

  /**
   * 开关 3D 空间环绕立体声
   */
  public setSpatialReverb(enabled: boolean): void {
    if (!this.spatialGainNode || !this.ctx) return;
    const targetGain = enabled ? 0.35 : 0;
    this.spatialGainNode.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
  }

  /**
   * 获取频域可视化数据 byteFrequencyData (0~255)
   */
  public getFrequencyData(array: Uint8Array): void {
    if (this.analyserNode) {
      this.analyserNode.getByteFrequencyData(array);
    }
  }

  /**
   * 获取时域波形数据 byteTimeDomainData (0~255)
   */
  public getTimeDomainData(array: Uint8Array): void {
    if (this.analyserNode) {
      this.analyserNode.getByteTimeDomainData(array);
    }
  }

  /**
   * 获取 Analyser 频段数量
   */
  public getFrequencyBinCount(): number {
    return this.analyserNode ? this.analyserNode.frequencyBinCount : 128;
  }
}

export const audioDSP = new AudioDSPCore();
