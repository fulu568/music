/**
 * 内置优质高音质示例曲目与完整同步歌词 (包含 FLAC / WAV / MP3 格式示例)
 */
import { Track } from '../types';
import { generateSVGDataCover } from './metadataParser';

// 使用高质量且高可用的标准公开示例音频数据 URL 或网络流
const SOUND_SAMPLES = {
  piano: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=piano-moment-11488.mp3',
  cyber: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=synthwave-80s-110045.mp3',
  ambient: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=relaxing-mountains-rivers-141318.mp3',
};

export const DEFAULT_TRACKS: Track[] = [
  {
    id: 'demo-track-1',
    title: '星河夜曲 (Galactic Nocturne)',
    artist: '月光智音乐团',
    album: '无损深空漫游 Vol.1',
    duration: 185,
    coverUrl: generateSVGDataCover('星河夜曲', 'flac'),
    audioUrl: SOUND_SAMPLES.piano,
    fileSize: 38400000, // 38.4 MB
    fileType: 'flac',
    bitrate: 2304, // 2304 kbps Hi-Res
    sampleRate: 96000, // 96 kHz
    bitDepth: 24, // 24 bit
    isLossless: true,
    addedAt: Date.now() - 3600000,
    playCount: 12,
    isFavorite: true,
    fileName: '星河夜曲_HiRes_24bit_96kHz.flac',
    lyrics: `[ti:星河夜曲 (Galactic Nocturne)]
[ar:月光智音乐团]
[al:无损深空漫游 Vol.1]
[offset:0]
[00:00.00]星河夜曲 - 月光智音乐团
[00:04.50]专辑：无损深空漫游 Vol.1 (24bit/96kHz Hi-Res)
[00:09.00] 
[00:12.30]夜幕降临 繁星升起在无边的银河 / As night falls, stars rise in the endless galaxy
[00:19.80]微风轻轻吹过 带着琴音的脉动 / Soft breeze blows with the pulse of piano melodies
[00:27.40]闭上双眼 聆听高保真音质的震撼 / Close your eyes, listen to the fidelity of sound
[00:35.10]每一个音符 都在灵魂深处跳跃 / Every note leaps deep within the soul
[00:43.00] 
[00:48.20]琴键在指尖跳跃 宛如流星划过夜空 / Keys dance under fingertips like shooting stars
[00:56.00]低音沉稳有力 高音清澈透亮 / Deep resonant bass, crystal clear treble
[01:03.80]10段均衡器 调校出最完美的律动 / 10-band EQ shapes the ultimate harmony
[01:12.10]让这首夜曲 带你穿越无尽星云 / Let this nocturne lead you through endless nebulae
[01:21.00] 
[01:28.50]寂静的深夜 里只有音乐陪伴 / In the quiet midnight, music is my company
[01:36.20]把生活的喧嚣 统统隔离在外 / Shielding away the noise of everyday life
[01:44.00]用心感受纯粹的声学艺术 / Pure audio art crafted for the ear
[01:52.30]星光不熄 音乐永恒流转 / Stars shine bright, melody flows forever
[02:02.00]~ 音乐渐隐 ~
`,
  },
  {
    id: 'demo-track-2',
    title: '赛博霓虹 (Cyberpunk Neon Pulse)',
    artist: '合成器先锋 (Synthesizer Unit)',
    album: '赛博纪元 2088',
    duration: 142,
    coverUrl: generateSVGDataCover('赛博霓虹', 'wav'),
    audioUrl: SOUND_SAMPLES.cyber,
    fileSize: 25000000, // 25 MB
    fileType: 'wav',
    bitrate: 1411, // 1411 kbps Studio Master
    sampleRate: 44100,
    bitDepth: 16,
    isLossless: true,
    addedAt: Date.now() - 7200000,
    playCount: 28,
    isFavorite: false,
    fileName: 'Cyberpunk_Neon_Master.wav',
    lyrics: `[ti:赛博霓虹 (Cyberpunk Neon Pulse)]
[ar:合成器先锋]
[al:赛博纪元 2088]
[offset:0]
[00:00.00]赛博霓虹 - 合成器先锋
[00:03.00]母带级 1411kbps WAV 无损格式
[00:06.00] 
[00:08.50]穿过霓虹闪烁的雨夜街头 / Walking through rain-slicked neon streets
[00:14.20]电子鼓点 在耳畔强劲轰鸣 / Electronic drums pounding in my ears
[00:20.10]低音增强 (Bass Boost) 注入澎湃活力 / Bass Boost injects surging energy
[00:26.50]感受重低音震撼的每一次下潜 / Feel the power of deep sub-bass drops
[00:32.00] 
[00:38.00]3D空间环绕声 在脑海中回荡 / 3D spatial surround echoing in mind
[00:44.30]频域波形 随电音高低起伏跳动 / Spectrum visualizer pulsing with the beats
[00:51.00]打破传统的声学边界 / Breaking classical boundaries of sound
[00:57.20]进入全新的赛博听觉维度 / Step into the futuristic cyber realm
[01:05.00] 
[01:12.00]跟随节奏 释放灵魂深处的律动 / Rhythm unleashed, feeling the pulse
[01:18.50]高音质无损解析 还原母带细节 / Hi-Res playback revealing every detail
[01:26.00]霓虹永不熄灭 音乐即是信仰 / Neon lights never fade, music is our faith
`,
  },
  {
    id: 'demo-track-3',
    title: '云海远航 (Voyage Above Clouds)',
    artist: '吉他手阿杰 & 弦乐团',
    album: '自然之声集萃',
    duration: 168,
    coverUrl: generateSVGDataCover('云海远航', 'mp3'),
    audioUrl: SOUND_SAMPLES.ambient,
    fileSize: 6800000,
    fileType: 'mp3',
    bitrate: 320, // 320 kbps HD
    sampleRate: 48000,
    bitDepth: 16,
    isLossless: false,
    addedAt: Date.now() - 10800000,
    playCount: 5,
    isFavorite: true,
    fileName: 'Voyage_Above_Clouds_320k.mp3',
    lyrics: `[ti:云海远航 (Voyage Above Clouds)]
[ar:吉他手阿杰 & 弦乐团]
[al:自然之声集萃]
[offset:0]
[00:00.00]云海远航 - 吉他手阿杰 & 弦乐团
[00:04.00] 
[00:08.00]木吉他清脆的弦音 悄然拨响 / Crisp acoustic guitar strings gently plucking
[00:15.50]像一阵清风 抚平心中的波澜 / Like a breeze smoothing the waves within
[00:23.00]远方的云海 在阳光下熠熠生辉 / Sea of clouds shimmering under bright sunlight
[00:31.20]随心而动 开启属于你的音乐旅程 / Follow your heart on a musical journey
[00:39.00] 
[00:46.00]大提琴的加入 增添了沉稳与温情 / Cello join in, adding warmth and depth
[00:54.20]无缝滚动歌词 实时精准同步 / Synchronized lyrics scrolling seamlessly
[01:02.00]不论是在工作 学习 还是静心思考 / Whether working, studying, or meditating
[01:10.50]本地优质音乐 始终为你保驾护航 / Quality local music always by your side
[01:20.00] 
[01:28.00]向着远方漫游 在音符的海洋里 / Roaming far away in the ocean of notes
[01:36.50]舒缓的旋律 带来无尽的宁静 / Soothing melody brings peaceful harmony
[01:45.00]愿音乐与你相伴 每一时刻都是美好 / May music accompany your every golden moment
`,
  },
];
