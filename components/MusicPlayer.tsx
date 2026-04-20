'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, Music, VolumeX, Volume2 } from 'lucide-react';
import { Magnetic } from '@/components/ui/magnetic';

interface Track {
  id: string;
  name: string;
  url: string;
  duration: number;
  author?: string;
  isServerFile?: boolean;
}

type PlayMode = 'sequence' | 'shuffle' | 'loopAll' | 'loopOne';

// 全局音频管理器 - 确保只有一个audio实例
let globalAudio: HTMLAudioElement | null = null;

// 从 localStorage 初始化全局状态（仅客户端）
function initGlobalState() {
  // 在服务端渲染时返回默认值
  if (typeof window === 'undefined') {
    return {
      isPlaying: false,
      currentTrackIndex: -1,
      volume: 0.7,
      isMuted: false,
    };
  }
  
  const savedIndex = localStorage.getItem('localMusicCurrentIndex');
  const savedVolume = localStorage.getItem('localMusicVolume');
  
  let currentIndex = -1;
  if (savedIndex !== null) {
    const index = parseInt(savedIndex);
    if (!isNaN(index) && index >= 0) {
      currentIndex = index;
    }
  }
  
  let volume = 0.7;
  if (savedVolume !== null) {
    const vol = parseFloat(savedVolume);
    if (!isNaN(vol) && vol >= 0 && vol <= 1) {
      volume = vol;
    }
  }
  
  return {
    isPlaying: false,
    currentTrackIndex: currentIndex,
    volume: volume,
    isMuted: false,
  };
}

// 全局状态追踪
let globalState = initGlobalState();

function getGlobalAudio(): HTMLAudioElement {
  if (!globalAudio) {
    globalAudio = new Audio();
    globalAudio.preload = 'metadata';
  }
  return globalAudio;
}

function MagneticButton({
  children,
  onClick,
  className,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) {
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    return (
      <button
        onClick={onClick}
        className={className}
        disabled={disabled}
      >
        {children}
      </button>
    );
  }

  return (
    <Magnetic springOptions={{ bounce: 0 }} intensity={0.3}>
      <button
        onClick={onClick}
        className={className}
        disabled={disabled}
      >
        {children}
      </button>
    </Magnetic>
  );
}

export function MusicPlayer() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [playMode, setPlayMode] = useState<PlayMode>('sequence');
  const [showPlaylist, setShowPlaylist] = useState(true);
  const [isLoadingServerFiles, setIsLoadingServerFiles] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<HTMLInputElement>(null);
  const prevTrackIndexRef = useRef<number>(-1);

  // 初始化全局audio引用并同步全局状态（只在组件挂载时执行一次）
  useEffect(() => {
    const audio = getGlobalAudio();
    audioRef.current = audio;
    
    // 立即读取当前音频状态
    setCurrentTime(audio.currentTime || 0);
    if (audio.duration && !isNaN(audio.duration)) {
      setDuration(audio.duration);
    }
    
    // 同步播放状态
    if (!audio.paused) {
      setIsPlaying(true);
      globalState.isPlaying = true;
    } else {
      setIsPlaying(globalState.isPlaying);
    }
    
    // 同步更新 prevTrackIndexRef
    if (globalState.currentTrackIndex >= 0) {
      prevTrackIndexRef.current = globalState.currentTrackIndex;
    }
  }, []); // 空依赖，只执行一次
  
  // 当 tracks 加载完成后，检查是否需要恢复音频源
  useEffect(() => {
    if (tracks.length === 0) return;
    
    const audio = audioRef.current;
    if (!audio) return;
    
    // 从localStorage读取保存的状态
    const savedIndex = localStorage.getItem('localMusicCurrentIndex');
    const savedIsPlaying = localStorage.getItem('localMusicIsPlaying');
    const savedCurrentTime = localStorage.getItem('localMusicCurrentTime');
    
    // 如果音频没有src或readyState为0，且localStorage有保存的状态
    if ((!audio.src || audio.readyState === 0) && savedIndex !== null) {
      const index = parseInt(savedIndex);
      if (!isNaN(index) && index >= 0 && index < tracks.length) {
        // 设置音频源
        audio.src = tracks[index].url;
        audio.load();
        
        // 等待元数据加载后恢复进度
        const handleLoadedMetadata = () => {
          setDuration(audio.duration);
          
          // 恢复进度
          if (savedCurrentTime !== null) {
            const time = parseFloat(savedCurrentTime);
            if (!isNaN(time) && time >= 0 && time < audio.duration) {
              audio.currentTime = time;
              setCurrentTime(time);
            }
          }
          
          // 如果之前在播放，继续播放
          if (savedIsPlaying === 'true') {
            audio.play().catch(() => {
              setIsPlaying(false);
            });
            setIsPlaying(true);
            globalState.isPlaying = true;
          }
          
          audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        };
        
        audio.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
        
        // 更新索引
        setCurrentTrackIndex(index);
        prevTrackIndexRef.current = index;
      }
    }
  }, [tracks]); // 依赖tracks，在tracks加载后执行

  // 从文件名提取作者名称（格式：歌曲名__作者名）
  const extractAuthor = (filename: string): string | undefined => {
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
    const parts = nameWithoutExt.split('__');
    if (parts.length >= 2) {
      return parts[parts.length - 1].trim();
    }
    return undefined;
  };

  // 验证服务器音乐文件是否存在
  const validateServerTracks = async (savedTracks: Track[]): Promise<Track[]> => {
    try {
      const response = await fetch('/api/music');
      const data = await response.json();
      
      if (!data.tracks || data.tracks.length === 0) {
        // 如果服务器没有音乐文件,删除所有标记为服务器的轨道
        return savedTracks.filter(t => !t.isServerFile);
      }
      
      // 获取服务器上存在的URL列表
      const serverUrls = new Set(data.tracks.map((t: Track) => t.url));
      
      // 过滤掉已不存在的服务器文件
      const validTracks = savedTracks.filter(track => {
        if (track.isServerFile) {
          return serverUrls.has(track.url);
        }
        return true; // 保留非服务器文件
      });
      
      return validTracks;
    } catch (error) {
      return savedTracks; // 验证失败时保留原列表
    }
  };

  // 从服务器加载 public/music/ 目录中的文件
  const loadServerMusicFiles = async () => {
    try {
      setIsLoadingServerFiles(true);
      const response = await fetch('/api/music');
      const data = await response.json();
      
      if (data.tracks && data.tracks.length > 0) {
        setTracks(prevTracks => {
          const existingUrls = new Set(prevTracks.map(t => t.url));
          const newTracks = data.tracks.map((t: Track) => ({
            ...t,
            author: extractAuthor(t.name)
          })).filter((t: Track) => !existingUrls.has(t.url));
          return [...prevTracks, ...newTracks];
        });
      }
    } catch (error) {
      // Ignore error
    } finally {
      setIsLoadingServerFiles(false);
    }
  };

  // 从 localStorage 加载播放列表和状态，并验证服务器文件
  useEffect(() => {
    const loadSavedState = async () => {
      const savedTracks = localStorage.getItem('localMusicTracks');
      const savedIndex = localStorage.getItem('localMusicCurrentIndex');
      const savedVolume = localStorage.getItem('localMusicVolume');
      const savedPlayMode = localStorage.getItem('localMusicPlayMode');

      let validTracks: Track[] = [];

      if (savedTracks) {
        try {
          const parsedTracks = JSON.parse(savedTracks);
          
          // 验证服务器文件是否存在
          validTracks = await validateServerTracks(parsedTracks);
          
          // 如果验证后列表有变化，更新localStorage
          if (validTracks.length !== parsedTracks.length) {
            localStorage.setItem('localMusicTracks', JSON.stringify(validTracks));
          }
          
          // 直接更新，不做比较（因为初始化时tracks是空数组）
          if (validTracks.length > 0) {
            setTracks(validTracks);
          }
        } catch (e) {
          // 解析保存的播放列表失败
        }
      }

      // 只有当全局状态没有有效的播放索引时，才从 localStorage 恢复
      if (globalState.currentTrackIndex < 0 && savedIndex !== null) {
        const index = parseInt(savedIndex);
        if (!isNaN(index)) {
          // 确保索引在有效范围内
          if (index < validTracks.length) {
            setCurrentTrackIndex(index);
          } else {
            setCurrentTrackIndex(-1);
          }
        }
      }

      // 只有当全局状态没有有效的音量时，才从 localStorage 恢复
      if (globalState.volume === 0.7 && savedVolume !== null) {
        const vol = parseFloat(savedVolume);
        if (!isNaN(vol) && vol >= 0 && vol <= 1) {
          setVolume(vol);
        }
      }

      if (savedPlayMode) {
        setPlayMode(savedPlayMode as PlayMode);
      }

      // 只有当播放列表为空时，才加载服务器音乐文件
      if (validTracks.length === 0) {
        await loadServerMusicFiles();
      }
    };

    loadSavedState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 保存播放列表到 localStorage
  useEffect(() => {
    if (tracks.length > 0) {
      localStorage.setItem('localMusicTracks', JSON.stringify(tracks));
    }
  }, [tracks]);

  useEffect(() => {
    localStorage.setItem('localMusicCurrentIndex', currentTrackIndex.toString());
  }, [currentTrackIndex]);

  useEffect(() => {
    localStorage.setItem('localMusicVolume', volume.toString());
  }, [volume]);

  useEffect(() => {
    localStorage.setItem('localMusicPlayMode', playMode);
  }, [playMode]);

  // 音频元素事件处理 - 独立于其他状态，确保始终监听
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      // 每5秒保存一次进度，避免频繁写入
      if (Math.floor(audio.currentTime) % 5 === 0) {
        localStorage.setItem('localMusicCurrentTime', audio.currentTime.toString());
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      handleTrackEnd();
    };

    const handleError = (e: Event) => {
      // Handle audio error silently or with a non-intrusive notification if needed
      console.warn('Audio playback error', e);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 空依赖数组，只在组件挂载/卸载时执行

  // 更新音频源 - 只在索引真正改变时执行
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || currentTrackIndex < 0 || !tracks[currentTrackIndex]) return;

    // 只有当曲目索引真正改变时才重新加载
    if (prevTrackIndexRef.current !== currentTrackIndex) {
      prevTrackIndexRef.current = currentTrackIndex;
      
      // 加载新的音频源
      audio.src = tracks[currentTrackIndex].url;
      audio.load();
      
      // 如果需要播放，等待元数据加载完成后再播放
      if (isPlaying) {
        const handleCanPlay = () => {
          audio.play().catch(() => {
            setIsPlaying(false);
          });
          audio.removeEventListener('canplay', handleCanPlay);
        };
        
        audio.addEventListener('canplay', handleCanPlay, { once: true });
      } else {
        // 如果不需要播放，确保暂停
        audio.pause();
      }
    } else if (isPlaying && audio.paused) {
      // 组件重新挂载但索引未变，如果应该是播放状态但实际暂停了，则恢复播放
      if (audio.readyState >= 2) {
        audio.play().catch(() => {
          setIsPlaying(false);
        });
      } else {
        const handleCanPlay = () => {
          audio.play().catch(() => {
            setIsPlaying(false);
          });
          audio.removeEventListener('canplay', handleCanPlay);
        };
        
        audio.addEventListener('canplay', handleCanPlay, { once: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrackIndex, tracks]); // 移除 isPlaying 依赖，避免组件挂载时因状态同步触发不必要的副作用

  // 更新音量
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // 同步全局状态
  useEffect(() => {
    globalState.isPlaying = isPlaying;
    globalState.currentTrackIndex = currentTrackIndex;
    globalState.volume = volume;
    globalState.isMuted = isMuted;
  }, [isPlaying, currentTrackIndex, volume, isMuted]);

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || currentTrackIndex < 0) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      globalState.isPlaying = false;
      // 保存播放状态到 localStorage
      localStorage.setItem('localMusicIsPlaying', 'false');
    } else {
      // 检查音频是否已准备好
      if (audio.readyState >= 2) {
        // HAVE_CURRENT_DATA，可以播放
        audio.play().catch(() => {
          setIsPlaying(false);
        });
        setIsPlaying(true);
        globalState.isPlaying = true;
        // 保存播放状态到 localStorage
        localStorage.setItem('localMusicIsPlaying', 'true');
      } else {
        // 等待音频加载完成
        const handleCanPlay = () => {
          audio.play().catch(() => {
            setIsPlaying(false);
          });
          audio.removeEventListener('canplay', handleCanPlay);
        };
        
        audio.addEventListener('canplay', handleCanPlay, { once: true });
        setIsPlaying(true);
        globalState.isPlaying = true;
        // 保存播放状态到 localStorage
        localStorage.setItem('localMusicIsPlaying', 'true');
      }
    }
  };

  const stop = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
  };

  const handleTrackEnd = () => {
    if (playMode === 'loopOne') {
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = 0;
        audio.play();
      }
      return;
    }

    if (tracks.length === 0) return;

    let nextIndex: number;

    if (playMode === 'shuffle') {
      nextIndex = Math.floor(Math.random() * tracks.length);
    } else {
      nextIndex = currentTrackIndex + 1;
    }

    if (nextIndex >= tracks.length) {
      if (playMode === 'loopAll') {
        nextIndex = 0;
      } else {
        setIsPlaying(false);
        return;
      }
    }

    setCurrentTrackIndex(nextIndex);
  };

  const nextTrack = () => {
    if (tracks.length === 0) return;

    let nextIndex: number;

    if (playMode === 'shuffle') {
      nextIndex = Math.floor(Math.random() * tracks.length);
    } else {
      nextIndex = currentTrackIndex + 1;
      if (nextIndex >= tracks.length) {
        nextIndex = 0;
      }
    }

    setCurrentTrackIndex(nextIndex);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    if (tracks.length === 0) return;

    let prevIndex: number;

    if (playMode === 'shuffle') {
      prevIndex = Math.floor(Math.random() * tracks.length);
    } else {
      prevIndex = currentTrackIndex - 1;
      if (prevIndex < 0) {
        prevIndex = tracks.length - 1;
      }
    }

    setCurrentTrackIndex(prevIndex);
    setIsPlaying(true);
  };

  const playTrack = (index: number) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const time = parseFloat(e.target.value);
    audio.currentTime = time;
    setCurrentTime(time);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (vol > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const togglePlayMode = () => {
    const modes: PlayMode[] = ['sequence', 'shuffle', 'loopAll', 'loopOne'];
    const currentIndex = modes.indexOf(playMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setPlayMode(modes[nextIndex]);
  };

  const currentTrack = currentTrackIndex >= 0 && currentTrackIndex < tracks.length 
    ? tracks[currentTrackIndex] 
    : null;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* 主播放器卡片 */}
      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg rounded-2xl p-4 sm:p-5 md:p-6 shadow-lg border border-zinc-200 dark:border-zinc-800">
        {/* 当前播放信息 */}
        <div className="mb-4 flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shrink-0">
            <Music className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xs sm:text-sm md:text-base font-medium truncate">
              {currentTrack ? currentTrack.name : '未选择歌曲'}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              {currentTrack?.author && (
                <span className="mr-2">{currentTrack.author}</span>
              )}
              {currentTrack ? formatTime(duration) : '--:--'}
            </p>
          </div>
        </div>

        {/* 进度条 */}
        <div className="flex items-center gap-2 w-full">
          <span className="text-xs text-zinc-500 w-8 text-right">{formatTime(currentTime)}</span>
          <input
            ref={progressRef}
            type="range"
            min="0"
            max={duration || 100}
            step="0.1"
            value={currentTime}
            onChange={handleProgressChange}
            disabled={!currentTrack}
            className="flex-1 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <span className="text-xs text-zinc-500 w-8">{formatTime(duration)}</span>
        </div>

        {/* 控制按钮 */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 mb-4 flex-wrap">
          <button
            onClick={togglePlayMode}
            className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
              playMode !== 'sequence'
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
            }`}
            title={
              playMode === 'sequence' ? '顺序播放' :
              playMode === 'shuffle' ? '随机播放' :
              playMode === 'loopAll' ? '列表循环' : '单曲循环'
            }
          >
            {playMode === 'shuffle' ? (
              <Shuffle className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : playMode === 'loopOne' ? (
              <Repeat1 className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <Repeat className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>

          <button
            onClick={prevTrack}
            disabled={tracks.length === 0}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="上一首"
          >
            <SkipBack className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <button
            onClick={togglePlay}
            disabled={!currentTrack}
            className="p-2.5 sm:p-3 md:p-4 rounded-full bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
            title={isPlaying ? '暂停' : '播放'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : (
              <Play className="w-5 h-5 sm:w-6 sm:h-6 ml-0.5" />
            )}
          </button>

          <button
            onClick={stop}
            disabled={!currentTrack}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="停止"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          </button>

          <button
            onClick={nextTrack}
            disabled={tracks.length === 0}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="下一首"
          >
            <SkipForward className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* 音量控制 */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={toggleMute}
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors hidden"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={1}
            onChange={handleVolumeChange}
            className="flex-1 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hidden"
          />
        </div>

        {/* 播放列表切换按钮 */}
        <div className="flex gap-2">
          <MagneticButton
            onClick={() => setShowPlaylist(!showPlaylist)}
            className="group relative inline-flex shrink-0 items-center gap-[1px] rounded-full bg-zinc-100 px-2 md:px-2.5 py-1 text-xs md:text-sm text-black transition-colors duration-200 hover:bg-zinc-950 hover:text-zinc-50 active:bg-zinc-950 active:text-zinc-50 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 dark:active:bg-zinc-700"
          >
            <span className="font-medium text-sm md:text-base">播放列表({tracks.length})</span>
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3"
            >
              <path
                d="M3.64645 11.3536C3.45118 11.1583 3.45118 10.8417 3.64645 10.6465L10.2929 4L6 4C5.72386 4 5.5 3.77614 5.5 3.5C5.5 3.22386 5.72386 3 6 3L11.5 3C11.6326 3 11.7598 3.05268 11.8536 3.14645C11.9473 3.24022 12 3.36739 12 3.5L12 9.00001C12 9.27615 11.7761 9.50001 11.5 9.50001C11.2239 9.50001 11 9.27615 11 9.00001V4.70711L4.35355 11.3536C4.15829 11.5488 3.84171 11.5488 3.64645 11.3536Z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
              />
            </svg>
          </MagneticButton>

          <MagneticButton
            onClick={loadServerMusicFiles}
            className="group relative inline-flex shrink-0 items-center gap-[1px] rounded-full bg-green-100 px-2 md:px-2.5 py-1 text-xs md:text-sm text-black transition-colors duration-200 hover:bg-green-950 hover:text-green-50 active:bg-green-950 active:text-green-50 dark:bg-green-800 dark:text-green-100 dark:hover:bg-green-700 dark:active:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoadingServerFiles}
          >
            {isLoadingServerFiles ? (
              <>
                <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="font-medium text-sm md:text-base">加载中...</span>
              </>
            ) : (
              <>
                <span className="font-medium text-sm md:text-base">加载服务器音乐</span>
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3"
                >
                  <path
                    d="M3.64645 11.3536C3.45118 11.1583 3.45118 10.8417 3.64645 10.6465L10.2929 4L6 4C5.72386 4 5.5 3.77614 5.5 3.5C5.5 3.22386 5.72386 3 6 3L11.5 3C11.6326 3 11.7598 3.05268 11.8536 3.14645C11.9473 3.24022 12 3.36739 12 3.5L12 9.00001C12 9.27615 11.7761 9.50001 11.5 9.50001C11.2239 9.50001 11 9.27615 11 9.00001V4.70711L4.35355 11.3536C4.15829 11.5488 3.84171 11.5488 3.64645 11.3536Z"
                    fill="currentColor"
                    fillRule="evenodd"
                    clipRule="evenodd"
                  />
                </svg>
              </>
            )}
          </MagneticButton>
        </div>
      </div>

      {/* 播放列表 */}
      {showPlaylist && tracks.length > 0 && (
        <div className="mt-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg rounded-2xl p-4 shadow-lg border border-zinc-200 dark:border-zinc-800">
          <h4 className="text-sm font-medium mb-3 text-zinc-700 dark:text-zinc-300">播放列表</h4>
          <ul className="space-y-1 max-h-60 overflow-y-auto">
            {tracks.map((track, index) => (
              <li
                key={track.id}
                onClick={() => playTrack(index)}
                className={`group flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                  index === currentTrackIndex
                    ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800'
                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-800'
                }`}
              >
                <span className="text-xs text-zinc-400 w-6 text-center">
                  {index === currentTrackIndex && isPlaying ? (
                    <div className="flex items-center justify-center gap-0.5">
                      <div className="w-0.5 h-3 bg-blue-500 animate-pulse" />
                      <div className="w-0.5 h-4 bg-blue-500 animate-pulse" style={{ animationDelay: '0.2s' }} />
                      <div className="w-0.5 h-2 bg-blue-500 animate-pulse" style={{ animationDelay: '0.4s' }} />
                    </div>
                  ) : (
                    index + 1
                  )}
                </span>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm truncate ${
                        index === currentTrackIndex
                          ? 'text-blue-600 dark:text-blue-400 font-medium'
                          : 'text-zinc-700 dark:text-zinc-300'
                      }`}>
                        {track.name}
                      </p>
                      {track.isServerFile && (
                        <span className="text-xs px-1.5 py-0.5 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded shrink-0">
                          服务器
                        </span>
                      )}
                    </div>
                    {track.author && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                        {track.author}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
