/**
 * 高精度 LRC 歌词解析器与时间同步逻辑
 */
import { LyricLine } from '../types';

export interface ParsedLrc {
  title?: string;
  artist?: string;
  album?: string;
  offset: number; // 毫秒
  lines: LyricLine[];
}

/**
 * 解析 LRC 歌词文本
 */
export function parseLrc(lrcText: string, userOffsetMs: number = 0): ParsedLrc {
  if (!lrcText || typeof lrcText !== 'string') {
    return { offset: 0, lines: [] };
  }

  const rawLines = lrcText.split(/\r?\n/);
  const lines: LyricLine[] = [];
  let title: string | undefined;
  let artist: string | undefined;
  let album: string | undefined;
  let lrcOffset = 0;

  // 正则匹配时间标签如 [01:23.45] 或 [01:23:45] 或 [01:23.456]
  const timeRegex = /\[(\d{2}):(\d{2})[.:](\d{2,3})\]/g;
  const tagRegex = /^\[(ti|ar|al|offset):(.*)\]$/i;

  rawLines.forEach((lineText, lineIdx) => {
    const trimmed = lineText.trim();
    if (!trimmed) return;

    // 检查元数据标签
    const tagMatch = trimmed.match(tagRegex);
    if (tagMatch) {
      const key = tagMatch[1].toLowerCase();
      const value = tagMatch[2].trim();
      if (key === 'ti') title = value;
      if (key === 'ar') artist = value;
      if (key === 'al') album = value;
      if (key === 'offset') {
        const parsedOffset = parseInt(value, 10);
        if (!isNaN(parsedOffset)) lrcOffset = parsedOffset;
      }
      return;
    }

    // 获取一行中的所有时间戳
    const timeMatches = Array.from(trimmed.matchAll(timeRegex));
    if (timeMatches.length > 0) {
      // 提取无时间戳的文本内容
      const cleanText = trimmed.replace(timeRegex, '').trim();
      
      // 分离中英文翻译（例如用 " / " 或 " | " 或 " (" 分隔的情况）
      let mainText = cleanText;
      let translation: string | undefined = undefined;

      if (cleanText.includes(' / ')) {
        const parts = cleanText.split(' / ');
        mainText = parts[0];
        translation = parts.slice(1).join(' / ');
      } else if (cleanText.includes(' // ')) {
        const parts = cleanText.split(' // ');
        mainText = parts[0];
        translation = parts.slice(1).join(' // ');
      }

      timeMatches.forEach((match, matchIdx) => {
        const minutes = parseInt(match[1], 10);
        const seconds = parseInt(match[2], 10);
        const msRaw = match[3];
        // 如果是2位数字则乘10为毫秒，如果是3位数字则直接为毫秒
        const milliseconds = msRaw.length === 2 ? parseInt(msRaw, 10) * 10 : parseInt(msRaw, 10);

        const totalSeconds = minutes * 60 + seconds + milliseconds / 1000;

        lines.push({
          id: `lrc-${lineIdx}-${matchIdx}-${totalSeconds}`,
          time: totalSeconds,
          text: mainText,
          translation,
        });
      });
    }
  });

  // 按照时间由小到大排序
  lines.sort((a, b) => a.time - b.time);

  // 应用 offset （包含文件内 offset 和用户设置的毫秒微调）
  const totalOffsetSec = (lrcOffset + userOffsetMs) / 1000;
  if (totalOffsetSec !== 0) {
    lines.forEach((l) => {
      l.time = Math.max(0, l.time + totalOffsetSec);
    });
  }

  return {
    title,
    artist,
    album,
    offset: lrcOffset,
    lines,
  };
}

/**
 * 根据当前播放时间查找匹配的歌词索引
 */
export function findActiveLyricIndex(lines: LyricLine[], currentTime: number): number {
  if (!lines || lines.length === 0) return -1;
  
  // 如果时间比第一句歌词还早
  if (currentTime < lines[0].time) return 0;

  for (let i = 0; i < lines.length; i++) {
    const currentLine = lines[i];
    const nextLine = lines[i + 1];

    if (currentTime >= currentLine.time && (!nextLine || currentTime < nextLine.time)) {
      return i;
    }
  }

  return lines.length - 1;
}

/**
 * 将秒数格式化为 [mm:ss.xx] 格式文本
 */
export function formatTimeSec(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const formattedMins = String(mins).padStart(2, '0');
  const formattedSecs = String(secs).padStart(2, '0');
  return `${formattedMins}:${formattedSecs}`;
}

/**
 * 格式化精确带毫秒的时间点
 */
export function formatTimeWithMs(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00.00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  const formattedMins = String(mins).padStart(2, '0');
  const formattedSecs = String(secs).padStart(2, '0');
  const formattedMs = String(ms).padStart(2, '0');
  return `${formattedMins}:${formattedSecs}.${formattedMs}`;
}
