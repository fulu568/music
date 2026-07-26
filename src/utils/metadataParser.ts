/**
 * 本地音频文件元数据解析器 (MP3, FLAC, WAV, OGG, AAC, M4A)
 */
import * as mmb from 'music-metadata-browser';
import { AudioFormat, Track } from '../types';

/**
 * 将 File 对象解析为标准 Track 对象
 */
export async function parseAudioFile(file: File): Promise<Track> {
  const fileName = file.name;
  const fileExt = fileName.split('.').pop()?.toLowerCase() || '';
  const fileType = getAudioFormatFromExt(fileExt, file.type);
  const isLossless = ['flac', 'wav', 'aiff'].includes(fileType);

  let title = fileName.replace(/\.[^/.]+$/, '');
  let artist = '未知歌手';
  let album = '未知专辑';
  let duration = 0;
  let coverUrl = generateSVGDataCover(title, fileType);
  let bitrate: number | undefined = undefined;
  let sampleRate: number | undefined = undefined;
  let bitDepth: number | undefined = undefined;
  let lyrics: string | undefined = undefined;

  // 默认使用 File URL
  const audioUrl = URL.createObjectURL(file);

  try {
    // 尝试使用 music-metadata-browser 解析 ID3 / FLAC Vorbis / MP4 元数据
    const metadata = await mmb.parseBlob(file, { duration: true });

    if (metadata.common) {
      if (metadata.common.title) title = metadata.common.title;
      if (metadata.common.artist) artist = metadata.common.artist;
      if (metadata.common.album) album = metadata.common.album;
      if (metadata.common.lyrics && metadata.common.lyrics.length > 0) {
        lyrics = metadata.common.lyrics.join('\n');
      }

      // 提取内嵌封面图片
      if (metadata.common.picture && metadata.common.picture.length > 0) {
        const pic = metadata.common.picture[0];
        const blob = new Blob([pic.data], { type: pic.format });
        coverUrl = URL.createObjectURL(blob);
      }
    }

    if (metadata.format) {
      if (metadata.format.duration) {
        duration = metadata.format.duration;
      }
      if (metadata.format.bitrate) {
        bitrate = Math.round(metadata.format.bitrate / 1000); // 转换为 kbps
      }
      if (metadata.format.sampleRate) {
        sampleRate = metadata.format.sampleRate;
      }
      if (metadata.format.bitsPerSample) {
        bitDepth = metadata.format.bitsPerSample;
      }
    }
  } catch (err) {
    console.warn('music-metadata-browser 自动解析元数据警示，降级为音频元素时长测算:', err);
  }

  // 如果无法通过 metadata 获取精确时长，使用 Audio 元素测试获取
  if (!duration || duration <= 0) {
    duration = await getAudioDurationFromElement(audioUrl);
  }

  // 计算估计码率（若未获取）
  if (!bitrate && duration > 0) {
    bitrate = Math.round((file.size * 8) / (duration * 1000));
  }

  return {
    id: `track-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title,
    artist,
    album,
    duration: Math.round(duration),
    coverUrl,
    audioUrl,
    fileSize: file.size,
    fileType,
    bitrate: bitrate || (isLossless ? 1411 : 320),
    sampleRate: sampleRate || 44100,
    bitDepth: bitDepth || (isLossless ? 24 : 16),
    isLossless,
    lyrics,
    addedAt: Date.now(),
    playCount: 0,
    isFavorite: false,
    fileName,
  };
}

/**
 * 根据文件扩展名与 MIME 类型判断音频格式
 */
export function getAudioFormatFromExt(ext: string, mimeType: string): AudioFormat {
  const e = ext.toLowerCase();
  if (e === 'mp3') return 'mp3';
  if (e === 'flac') return 'flac';
  if (e === 'wav') return 'wav';
  if (e === 'ogg' || e === 'oga') return 'ogg';
  if (e === 'aac') return 'aac';
  if (e === 'm4a' || e === 'mp4') return 'm4a';
  if (e === 'webm') return 'webm';
  if (e === 'opus') return 'opus';
  if (e === 'aiff' || e === 'aif') return 'aiff';

  if (mimeType.includes('audio/mpeg') || mimeType.includes('audio/mp3')) return 'mp3';
  if (mimeType.includes('audio/flac')) return 'flac';
  if (mimeType.includes('audio/wav') || mimeType.includes('audio/x-wav')) return 'wav';
  if (mimeType.includes('audio/ogg')) return 'ogg';

  return 'other';
}

/**
 * 通过 HTML5 Audio 元素异步获取音频时长
 */
function getAudioDurationFromElement(url: string): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.src = url;
    
    const cleanup = () => {
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('error', onError);
    };

    const onLoaded = () => {
      cleanup();
      resolve(audio.duration || 0);
    };

    const onError = () => {
      cleanup();
      resolve(0);
    };

    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('error', onError);
  });
}

/**
 * 生成充满艺术感的动态 SVG 默认唱片封面
 */
export function generateSVGDataCover(title: string, format: string): string {
  // 生成基于标题散列的精美渐变色
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue1 = Math.abs(hash) % 360;
  const hue2 = (hue1 + 50) % 360;
  const isLossless = ['flac', 'wav', 'aiff'].includes(format.toLowerCase());

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
    <defs>
      <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="hsl(${hue1}, 75%, 25%)"/>
        <stop offset="100%" stop-color="hsl(${hue2}, 85%, 15%)"/>
      </linearGradient>
      <radialGradient id="vinyl-shine" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.15"/>
        <stop offset="60%" stop-color="#ffffff" stop-opacity="0.02"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0.6"/>
      </radialGradient>
    </defs>

    <rect width="400" height="400" fill="url(#bg-grad)" rx="24"/>

    <!-- 唱片黑胶纹理 -->
    <g transform="translate(200, 200)">
      <circle r="150" fill="#111115" stroke="#2a2a32" stroke-width="2"/>
      <circle r="135" fill="none" stroke="#222228" stroke-width="1.5" stroke-dasharray="8 4"/>
      <circle r="120" fill="none" stroke="#222228" stroke-width="1"/>
      <circle r="105" fill="none" stroke="#2a2a30" stroke-width="1.5"/>
      <circle r="90" fill="none" stroke="#222228" stroke-width="1"/>
      <circle r="75" fill="none" stroke="#282830" stroke-width="1.5"/>
      
      <!-- 光泽遮罩 -->
      <circle r="150" fill="url(#vinyl-shine)"/>
      
      <!-- 唱片中心标贴 -->
      <circle r="55" fill="hsl(${hue1}, 65%, 45%)" />
      <circle r="12" fill="#0d0d11"/>
      
      <!-- 音符图标 -->
      <path d="M-6 -8 L10 -14 L10 6 A10 10 0 1 1 -2 -2 L-2 -10 L10 -14" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    </g>

    ${isLossless ? `
    <g transform="translate(24, 24)">
      <rect width="88" height="28" rx="6" fill="#10b981" fill-opacity="0.9"/>
      <text x="44" y="18" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">Hi-Res 无损</text>
    </g>
    ` : ''}

    <text x="200" y="375" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="600" fill="#ffffff" fill-opacity="0.8" text-anchor="middle">${format.toUpperCase()}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
