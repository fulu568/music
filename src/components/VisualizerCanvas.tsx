/**
 * 60FPS 实时音频频谱与波形可视化 Canvas 组件
 * 连接 Web Audio API AnalyserNode，支持 4 种动态渲染模式
 */
import React, { useEffect, useRef } from 'react';
import { audioDSP } from '../utils/audioEngine';
import { VisualizerMode } from '../types';

interface VisualizerCanvasProps {
  mode: VisualizerMode;
  height?: number;
}

export const VisualizerCanvas: React.FC<VisualizerCanvasProps> = ({ mode, height = 320 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const binCount = audioDSP.getFrequencyBinCount();
    const freqData = new Uint8Array(binCount);
    const timeData = new Uint8Array(binCount);

    const render = () => {
      animId = requestAnimationFrame(render);

      // 自适应画布尺寸
      if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }

      const width = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, width, h);

      if (mode === 'bars') {
        // --- 模式 1: 32段柱状频谱条 ---
        audioDSP.getFrequencyData(freqData);
        const barCount = 36;
        const barWidth = (width / barCount) * 0.7;
        const gap = (width / barCount) * 0.3;

        for (let i = 0; i < barCount; i++) {
          const dataIdx = Math.floor((i / barCount) * (freqData.length * 0.7));
          const val = freqData[dataIdx] || 0;
          const percent = val / 255;
          const barHeight = Math.max(4, percent * (h * 0.85));

          const x = i * (barWidth + gap) + gap / 2;
          const y = h - barHeight;

          // 颜色渐变
          const grad = ctx.createLinearGradient(x, h, x, y);
          grad.addColorStop(0, '#10b981'); // Emerald
          grad.addColorStop(0.6, '#06b6d4'); // Cyan
          grad.addColorStop(1, '#3b82f6'); // Blue

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]);
          ctx.fill();

          // 顶部小闪光点
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x, Math.max(0, y - 4), barWidth, 2);
        }
      } else if (mode === 'circle') {
        // --- 模式 2: 环形放射电音霓虹 ---
        audioDSP.getFrequencyData(freqData);
        const centerX = width / 2;
        const centerY = h / 2;
        const radius = Math.min(centerX, centerY) * 0.45;
        const numRays = 64;

        ctx.save();
        ctx.translate(centerX, centerY);

        for (let i = 0; i < numRays; i++) {
          const angle = (i / numRays) * Math.PI * 2;
          const dataIdx = Math.floor((i / numRays) * (freqData.length * 0.75));
          const val = freqData[dataIdx] || 0;
          const rayLen = (val / 255) * (radius * 1.2);

          const x1 = Math.cos(angle) * radius;
          const y1 = Math.sin(angle) * radius;
          const x2 = Math.cos(angle) * (radius + rayLen);
          const y2 = Math.sin(angle) * (radius + rayLen);

          ctx.strokeStyle = `hsl(${(i / numRays) * 280 + 120}, 85%, 60%)`;
          ctx.lineWidth = 3;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }

        // 中心半透明发光圆环
        ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      } else if (mode === 'waveform') {
        // --- 模式 3: 示波器连续平滑波形 ---
        audioDSP.getTimeDomainData(timeData);
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#10b981';
        ctx.beginPath();

        const sliceWidth = width / timeData.length;
        let x = 0;

        for (let i = 0; i < timeData.length; i++) {
          const v = timeData[i] / 128.0;
          const y = (v * h) / 2;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);

          x += sliceWidth;
        }

        ctx.lineTo(width, h / 2);
        ctx.stroke();
      } else if (mode === 'particles') {
        // --- 模式 4: 浮动声波流体粒子 ---
        audioDSP.getFrequencyData(freqData);
        const count = 40;
        const time = Date.now() * 0.002;

        for (let i = 0; i < count; i++) {
          const val = freqData[i * 2] || 0;
          const radius = (val / 255) * 20 + 4;
          const px = (Math.sin(time + i * 0.5) * 0.4 + 0.5) * width;
          const py = (Math.cos(time * 0.8 + i * 0.3) * 0.4 + 0.5) * h;

          ctx.fillStyle = `hsla(${(i * 10) % 360}, 80%, 60%, ${Math.max(0.2, val / 255)})`;
          ctx.beginPath();
          ctx.arc(px, py, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [mode]);

  return (
    <div className="w-full relative overflow-hidden rounded-2xl bg-slate-950/80 border border-slate-800" style={{ height }}>
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
