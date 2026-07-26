/**
 * Windows 桌面客户端打包与生成指南 Modal
 */
import React, { useState } from 'react';
import { Monitor, X, Download, Terminal, Package, ShieldCheck, Check, Copy, Laptop, Sparkles, FolderArchive, Cpu } from 'lucide-react';

interface ExportWindowsModalProps {
  onClose: () => void;
}

export const ExportWindowsModal: React.FC<ExportWindowsModalProps> = ({ onClose }) => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(label);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const winBuildScript = `npm run build:win`;
  const winPortableScript = `npm run build:win-exe`;
  const githubActionsYaml = `name: Build Windows App (.exe)

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build:win
      - name: Upload Windows Artifact
        uses: actions/upload-artifact@v4
        with:
          name: AudioMaster-Pro-Windows-Installer
          path: release/*.exe
`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in select-text">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl p-6 md:p-8 space-y-6 text-white shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Modal 头部 */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-500/20 text-cyan-400 rounded-2xl border border-cyan-500/30">
              <Monitor className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2">
                Windows 桌面应用打包指南
                <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full font-mono border border-emerald-500/30">
                  Electron 30.x Ready
                </span>
              </h3>
              <p className="text-xs text-slate-400">AudioMaster Pro .exe 安装包 & 免安装便携版一键编译</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 核心打包产物说明 Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 text-sm font-bold">
              <Package className="w-4 h-4" />
              1. NSIS 标准 Windows 安装包 (.exe)
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              包含完整安装向导、桌面快捷方式、开始菜单图标与自动卸载脚本，适合普通 Windows 用户开箱即用。
            </p>
            <div className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
              产物位置: <span className="text-slate-200">release/AudioMaster Pro Setup 1.0.0.exe</span>
            </div>
          </div>

          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
              <Cpu className="w-4 h-4" />
              2. Portable 绿色免安装版 (.exe)
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              无须安装，双击直接运行，可随意存放在 U 盘或移动硬盘中，本地 IndexedDB 音频库完全独立隔离。
            </p>
            <div className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
              产物位置: <span className="text-slate-200">release/AudioMaster Pro 1.0.0.exe</span>
            </div>
          </div>
        </div>

        {/* 本地打包指令区 */}
        <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-emerald-400" />
              本地 Windows 命令行打包指令 (PowerShell / CMD)
            </span>
            <span className="text-[10px] text-slate-400">项目根目录下直接执行</span>
          </div>

          {/* 指令 1 */}
          <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800 font-mono text-xs">
            <span className="text-emerald-400">{winBuildScript}</span>
            <button
              onClick={() => copyToClipboard(winBuildScript, 'cmd1')}
              className="flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-sans transition-all cursor-pointer"
            >
              {copiedCmd === 'cmd1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedCmd === 'cmd1' ? '已复制' : '复制命令'}
            </button>
          </div>

          {/* 指令 2 */}
          <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800 font-mono text-xs">
            <span className="text-cyan-400">{winPortableScript}</span>
            <button
              onClick={() => copyToClipboard(winPortableScript, 'cmd2')}
              className="flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-sans transition-all cursor-pointer"
            >
              {copiedCmd === 'cmd2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedCmd === 'cmd2' ? '已复制' : '复制命令'}
            </button>
          </div>
        </div>

        {/* GitHub Actions 自动构建方案 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              自动化构建: GitHub Actions CI/CD (.github/workflows/build-win.yml)
            </span>
            <button
              onClick={() => copyToClipboard(githubActionsYaml, 'ci')}
              className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer font-normal"
            >
              {copiedCmd === 'ci' ? '已复制 CI 脚本' : '复制 GitHub Actions 工作流'}
            </button>
          </div>
          <p className="text-xs text-slate-400">
            将本项目导出或提交至 GitHub 后，推送到主分支或 Tag 标签即可利用 GitHub 免费云端服务器自动编译出 Windows 安装包！
          </p>
        </div>

        {/* 底部提示与关闭 */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>项目中的 package.json 与 electron/main.js 均已配置完成！</span>
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            关闭对话框
          </button>
        </div>
      </div>
    </div>
  );
};
