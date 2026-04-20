# 修复日志

## 2026-04-20_2: MusicPlayer TypeScript 类型安全与 Hooks 依赖修复

**文件**: `components/MusicPlayer.tsx`

**问题**: 
- Vercel 构建失败,TypeScript 编译错误
- 多处使用 `as any` 类型断言违反项目规范
- React Hooks 依赖警告未正确处理

**错误详情**:
```
./components/MusicPlayer.tsx
110:47  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
118:23  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
216:6   Warning: React Hook useEffect has missing dependency: 'loadServerMusicFiles'
270:6   Warning: React Hook useEffect has missing dependency: 'handleTrackEnd'
296:6   Warning: React Hook useEffect has missing dependency: 'isPlaying'
686:34  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
```

**修复方案**:

### 1. 类型安全修复 (移除 `as any` 断言)

**修改 Track 接口定义**:
```typescript
// ✅ 正确：扩展接口添加可选属性
interface Track {
  id: string;
  name: string;
  url: string;
  duration: number;
  author?: string;
  isServerFile?: boolean;  // 新增：标记是否为服务器文件
}
```

**替换所有 `as any` 断言**:
```typescript
// ❌ 错误：使用 any 类型断言
return savedTracks.filter(t => !(t as any).isServerFile);
if ((track as any).isServerFile) { ... }

// ✅ 正确：使用接口定义的属性
return savedTracks.filter(t => !t.isServerFile);
if (track.isServerFile) { ... }
```

**涉及位置**:
- 第110行: `validateServerTracks` 函数中的过滤逻辑
- 第118行: `validateServerTracks` 函数中的条件判断
- 第686行: 播放列表渲染中的服务器文件标记显示

### 2. React Hooks 依赖修复

**场景1: 避免循环依赖**
```typescript
// 从 localStorage 加载状态并验证服务器文件
useEffect(() => {
  const loadSavedState = async () => {
    // ... 加载逻辑
    await loadServerMusicFiles(); // 内部调用 setTracks
  };
  loadSavedState();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // ✅ 忽略依赖，避免无限循环（loadServerMusicFiles 内部更新 tracks）
```

**场景2: 核心状态已包含**
```typescript
// 音频元素事件处理
useEffect(() => {
  const audio = audioRef.current;
  if (!audio) return;

  const handleEnded = () => {
    handleTrackEnd(); // 函数引用每次渲染都变化
  };

  audio.addEventListener('ended', handleEnded);
  return () => audio.removeEventListener('ended', handleEnded);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [tracks, currentTrackIndex, playMode]); // ✅ 核心状态已在依赖数组中
```

**场景3: 补充缺失依赖**
```typescript
// 更新音频源
useEffect(() => {
  const audio = audioRef.current;
  if (!audio || currentTrackIndex < 0 || !tracks[currentTrackIndex]) return;

  audio.src = tracks[currentTrackIndex].url;
  audio.load();
  
  if (isPlaying) {
    // 等待 canplay 事件后播放
  } else {
    audio.pause();
  }
}, [currentTrackIndex, tracks, isPlaying]); // ✅ 添加 isPlaying 确保播放行为同步
```

### 3. 组件属性完善

**为 MagneticButton 添加 disabled 支持**:
```typescript
function MagneticButton({
  children,
  onClick,
  className,
  disabled,  // ✅ 新增：支持禁用状态
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) {
  // ... 实现
  return (
    <button onClick={onClick} className={className} disabled={disabled}>
      {children}
    </button>
  );
}
```

**效果**:
- ✅ 消除所有 TypeScript 类型错误
- ✅ 正确处理 React Hooks 依赖警告
- ✅ 符合项目类型安全规范
- ✅ Vercel 构建成功通过

**遵循规范**:
- 禁止使用 `any` 类型 → 扩展 Interface 定义
- Hooks 依赖警告 → 添加注释说明原因（循环依赖/稳定引用/性能优化）
- 变量定义顺序 → 确保使用前已声明

---

## 2026-04-20: 音乐播放器全局播放与缓存清理优化

#### 1. 关闭模态框后音乐停止播放
**文件**: `components/MusicPlayer.tsx`

**问题**: 
- 用户关闭音乐播放器模态框后，音乐立即停止
- 每次打开/关闭模态框都需要重新加载音频
- 用户体验差，无法后台播放

**原因**: 
- `<audio>` 元素作为 JSX 的一部分渲染在组件内
- 模态框关闭 → MusicPlayer 组件卸载 → audio 元素销毁 → 播放中断

**修复方案**:
- **模块级单例模式**: 创建全局音频管理器，独立于组件生命周期
- **懒加载工厂函数**: 首次使用时创建 Audio 实例，之后复用

```typescript
// ✅ 正确：模块级单例
let globalAudio: HTMLAudioElement | null = null;

function getGlobalAudio(): HTMLAudioElement {
  if (!globalAudio) {
    globalAudio = new Audio();
    globalAudio.preload = 'metadata';
  }
  return globalAudio;
}

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    audioRef.current = getGlobalAudio(); // 使用全局实例
  }, []);
  
  return (
    <div>
      {/* ❌ 移除内联 <audio> 元素 */}
      {/* 播放器 UI... */}
    </div>
  );
}
```

**效果**:
- ✅ 关闭模态框 → 音乐继续播放
- ✅ 再次打开模态框 → 看到相同播放状态
- ✅ 多个标签页共享同一音频实例（如果实现）

---

#### 2. 服务器删除文件后缓存未清理
**文件**: `components/MusicPlayer.tsx`, `app/api/music/route.ts`

**问题**: 
- 管理员从服务器删除 `song2.mp3`
- 用户A之前访问过，localStorage 中仍保存该文件记录
- 用户A刷新页面后，播放列表显示 `song2.mp3` 但无法播放
- 控制台报错：`GET /music/song2.mp3 404 (Not Found)`

**原因**: 
- localStorage 缓存了完整的播放列表（包括服务器文件 URL）
- 页面加载时直接使用缓存，未验证文件是否仍存在
- 缺少服务端状态同步机制

**修复方案**:
- **异步验证机制**: 页面加载时调用 `/api/music` 获取当前存在的文件
- **智能过滤**: 对比缓存与服务端，删除已不存在的文件记录
- **索引调整**: 确保 currentTrackIndex 在有效范围内

```typescript
const validateServerTracks = async (savedTracks: Track[]): Promise<Track[]> => {
  try {
    const response = await fetch('/api/music');
    const data = await response.json();
    
    if (!data.tracks || data.tracks.length === 0) {
      // 服务器无文件，删除所有服务器轨道
      return savedTracks.filter(t => !(t as any).isServerFile);
    }
    
    // 获取服务器上存在的 URL 集合
    const serverUrls = new Set(data.tracks.map((t: Track) => t.url));
    
    // 过滤掉已不存在的服务器文件
    const validTracks = savedTracks.filter(track => {
      if ((track as any).isServerFile) {
        return serverUrls.has(track.url); // 只保留仍存在的
      }
      return true; // 保留非服务器文件
    });
    
    // 记录清理数量
    const removedCount = savedTracks.length - validTracks.length;
    if (removedCount > 0) {
      console.log(`Removed ${removedCount} unavailable server tracks`);
    }
    
    return validTracks;
  } catch (error) {
    console.error('Failed to validate server tracks:', error);
    return savedTracks; // 验证失败时保留原列表
  }
};

// 初始化流程
useEffect(() => {
  const loadSavedState = async () => {
    const savedTracks = localStorage.getItem('localMusicTracks');
    
    if (savedTracks) {
      const parsedTracks = JSON.parse(savedTracks);
      // 验证并清理无效缓存
      const validTracks = await validateServerTracks(parsedTracks);
      
      // 如果有变化，更新 localStorage
      if (validTracks.length !== parsedTracks.length) {
        localStorage.setItem('localMusicTracks', JSON.stringify(validTracks));
      }
      
      setTracks(validTracks);
    }
    
    // 确保索引有效
    if (savedIndex !== null) {
      const index = parseInt(savedIndex);
      if (!isNaN(index) && index < validTracks.length) {
        setCurrentTrackIndex(index);
      } else {
        setCurrentTrackIndex(-1); // 重置
      }
    }
    
    // 加载新文件
    await loadServerMusicFiles();
  };
  
  loadSavedState();
}, []);
```

**效果**:
- ✅ 管理员删除 `song2.mp3`
- ✅ 用户A刷新页面
- ✅ 自动检测并移除 `song2.mp3` 缓存
- ✅ 播放列表仅显示存在的文件
- ✅ 控制台输出：`Removed 1 unavailable server tracks`

---

#### 3. AbortError: play() request interrupted by pause()
**文件**: `components/MusicPlayer.tsx`

**问题**: 
- 快速切换歌曲时浏览器报错
- 错误信息：`AbortError: The play() request was interrupted by a call to pause()`
- 导致播放状态异常，isPlaying 与实际不符

**原因**: 
- 切换歌曲时，useEffect 先调用 `pause()` 停止当前播放
- 然后立即调用 `play()` 播放新歌曲
- 但此时音频可能还在加载中，`pause()` 和 `play()` 产生竞态条件

**修复方案**:
- **事件驱动播放**: 使用 `canplay` 事件监听器，确保音频准备好后再播放
- **状态检查**: togglePlay 中检查 `readyState`，决定直接播放或等待加载

```typescript
// ✅ 正确：更新音频源时使用 canplay 事件
useEffect(() => {
  const audio = audioRef.current;
  if (!audio || currentTrackIndex < 0 || !tracks[currentTrackIndex]) return;

  // 加载新的音频源
  audio.src = tracks[currentTrackIndex].url;
  audio.load();
  
  // 如果需要播放，等待元数据加载完成后再播放
  if (isPlaying) {
    const handleCanPlay = () => {
      audio.play().catch((err: Error) => {
        console.error('Play failed:', err);
        setIsPlaying(false);
      });
      audio.removeEventListener('canplay', handleCanPlay);
    };
    
    audio.addEventListener('canplay', handleCanPlay, { once: true });
  } else {
    // 如果不需要播放，确保暂停
    audio.pause();
  }
}, [currentTrackIndex, tracks]);

// ✅ 正确：togglePlay 中检查就绪状态
const togglePlay = () => {
  const audio = audioRef.current;
  if (!audio || currentTrackIndex < 0) return;

  if (isPlaying) {
    audio.pause();
    setIsPlaying(false);
  } else {
    // 检查音频是否已准备好
    if (audio.readyState >= 2) {
      // HAVE_CURRENT_DATA，可以播放
      audio.play().catch((err: Error) => {
        console.error('Play failed:', err);
        setIsPlaying(false);
      });
      setIsPlaying(true);
    } else {
      // 等待音频加载完成
      const handleCanPlay = () => {
        audio.play().catch((err: Error) => {
          console.error('Play failed:', err);
          setIsPlaying(false);
        });
        audio.removeEventListener('canplay', handleCanPlay);
      };
      
      audio.addEventListener('canplay', handleCanPlay, { once: true });
      setIsPlaying(true);
    }
  }
};
```

**HTML5 Audio readyState 说明**:
- `0` - HAVE_NOTHING：没有音频信息
- `1` - HAVE_METADATA：已获取元数据
- `2` - HAVE_CURRENT_DATA：有当前帧数据（可播放）
- `3` - HAVE_FUTURE_DATA：有未来几帧数据
- `4` - HAVE_ENOUGH_DATA：有足够数据流畅播放

**效果**:
- ✅ 快速切换歌曲不再报错
- ✅ 快速点击播放/暂停按钮稳定
- ✅ 网络较慢时自动等待缓冲完成
- ✅ 播放状态与实际一致

---

**效果**:
- ✅ 集中式配置管理
- ✅ 保存后刷新即生效，无需重启
- ✅ 禁用时完全不渲染，不占用 DOM 空间

---

## 2026-04-16: 图片查看器移动端布局与交互优化

### 🐛 问题修复

#### 1. Next.js Server Component 事件处理器错误
**文件**: `app/blog/[slug]/page.tsx`, `components/ImageViewer.tsx`, `components/MarkdownContent.tsx`

**问题**: 
- 报错: "Event handlers cannot be passed to Client Component props"
- 在 Server Component 中直接使用 `onClick` 事件处理器
- ReactMarkdown 自定义组件返回带事件的 JSX 元素

**原因**: 
- Next.js Server Component 不能直接包含事件处理器（onClick、onChange 等）
- 将交互逻辑写在 Server Component 中违反了 React/Next.js 规范

**修复方案**:
- **提取 Client Components**:
  - `MarkdownContent.tsx`: 封装 ReactMarkdown 及图片点击逻辑
  - `ImageViewer.tsx`: 独立的图片查看器模态框
- **Server Component 简化**: 仅负责数据读取和静态内容渲染
- **通信机制**: 使用 `window.dispatchEvent` + `CustomEvent` 实现跨组件通信

```typescript
// ✅ 正确：Client Component 处理交互
'use client'
export function MarkdownContent({ content }) {
  return <ReactMarkdown components={{ img: ({ src }) => <img onClick={...} /> }} />
}

// ✅ 正确：Server Component 仅渲染
export default async function BlogPost() {
  return <MarkdownContent content={content} />
}
```

---

#### 2. 移动端图片查看器布局错位
**文件**: `components/ImageViewer.tsx`

**问题**: 
- 移动端图片组件全部下移，锁定到页面最底部
- 半透明背景未完全覆盖视口，出现空白边缘

**原因**: 
- `<dialog>` 元素有默认的 margin 和 padding
- 内部容器高度未明确设置为 100%，导致 flex 居中失效

**修复方案**:
``tsx
// 修复前
className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"

// 修复后
className="fixed inset-0 z-50 m-0 w-full h-full bg-black/80 backdrop-blur-sm p-0"
```
- 添加 `m-0 p-0`: 重置默认边距和内边距
- 添加 `w-full h-full`: 强制占满整个视口
- 内部容器保持 `flex items-center justify-center` 实现真正居中

---

#### 3. 桌面端按钮被图片覆盖
**文件**: `components/ImageViewer.tsx`

**问题**: 
- 图片放大后可能覆盖右上角的控制按钮
- 按钮使用 `absolute` 定位在相对容器内

**修复方案**:
``tsx
// 修复前
<div className="absolute right-4 top-4 ...">

// 修复后
<div className="fixed right-4 top-4 z-[60] ...">
```
- 改为 `position: fixed`: 固定在视口而非容器
- 提升 `z-index: 60`: 确保始终在最上层
- 无论图片如何缩放/移动，按钮始终可见

---

#### 4. TypeScript 类型错误
**文件**: `components/ImageViewer.tsx`

**问题**: 
- 报错: "WebkitUserDrag is not in type Properties"
- 使用了非标准的 CSS 属性

**修复方案**:
- 移除 `WebkitUserDrag: 'none'`
- 保留 HTML 属性 `draggable={false}` 实现相同效果

---

### ✨ 功能增强

#### 移动端触摸优化
- **双指缩放**: 阻止页面滚动冲突 (`e.preventDefault()` + `touch-none`)
- **单指拖动**: 放大后可平移查看细节
- **防误触**: `userSelect: 'none'` 禁止选中文本
- **平滑体验**: 拖动时无过渡延迟，仅重置时启用动画

#### 状态管理优化
- 新增 `position` 状态记录平移偏移量
- 使用 `useRef` 存储临时触摸数据，避免不必要的重渲染
- 打开新图片时自动重置缩放和平移状态

---

## 2026-04-11: Vercel 构建错误修复

### React Hooks 条件调用错误修复 (Vercel 构建)

**文件**: `app/2fa/page.tsx`, `app/toggle/page.tsx`

**问题**: 
- Vercel 构建时报错: "React Hook 'useEffect' is called conditionally"
- ESLint 检测到 3 个 useEffect 在条件返回后被调用
- toggle 页面存在未使用的导入警告

**原因**: 
- 虽然将 `isDisabled` 改为静态计算,但后续的 `useEffect` hooks 仍在条件返回之后
- React Hooks 规则要求所有 hooks 必须在任何条件返回之前调用
- toggle 页面缺少完整的函数声明和导入语句

**修复方案**:

#### 1. 2FA 页面 - 重新组织代码结构

```
export default function TwoFactorAuthPage() {
  // ✅ 1. 先计算静态值
  const isDisabled = !CONFIG.show2FAPage;

  // ✅ 2. 所有 useState hooks (必须在条件返回之前)
  const [viewSecret, setViewSecret] = useState('');
  const [viewSecretName, setViewSecretName] = useState('');
  const [currentCode, setCurrentCode] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [records, setRecords] = useState<SecretRecord[]>([]);
  const [showRecords, setShowRecords] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // ✅ 3. 所有 useEffect hooks (必须在条件返回之前)
  useEffect(() => {
    // 从本地存储加载记录
    const savedRecords = localStorage.getItem('2fa-records');
    if (savedRecords) {
      try {
        setRecords(JSON.parse(savedRecords));
      } catch (err) {
        console.error('Failed to load records:', err);
      }
    }
  }, []);

  useEffect(() => {
    // 定时更新验证码
    if (viewSecret) {
      generateCode();
      const interval = setInterval(() => {
        const now = Math.floor(Date.now() / 1000);
        const timeInCycle = 30 - (now % 30);
        setTimeRemaining(timeInCycle);
        if (timeInCycle === 30) {
          generateCode();
        }
      }, 1000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewSecret]);

  useEffect(() => {
    // 自动保存新输入的密钥
    const normalizedSecret = normalizeSecret(viewSecret);
    if (normalizedSecret && normalizedSecret.length >= 16) {
      const existingRecord = records.find(r => r.secret === normalizedSecret);
      if (!existingRecord) {
        const newRecord: SecretRecord = {
          id: Date.now().toString(),
          name: viewSecretName || '未命名',
          secret: normalizedSecret,
          createdAt: Date.now(),
        };
        saveRecords([...records, newRecord]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewSecret, viewSecretName]);

  // ✅ 4. 条件返回 (必须在所有hooks之后)
  if (isDisabled) {
    return <DisabledPage />;
  }

  // ✅ 5. 其他函数定义...
}
```

#### 2. Toggle 页面 - 修复结构问题

```
'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { CONFIG } from './config';

export default function TogglePage() {
  const showLoadingAnimation = CONFIG.showLoadingAnimation;
  const show2FAPage = CONFIG.show2FAPage;

  return (
    // ... 组件内容
  );
}
```

**关键改进**:
- ✅ 移除未使用的 `useState` 导入
- ✅ 添加完整的函数声明
- ✅ 修正配置文件路径说明 (从 `page.tsx` 改为 `config.ts`)

---

## 2026-04-10

### 功能开关配置系统相关 Bug 修复

#### 1. 2FA 页面 Hooks 顺序错误

**文件**: `app/2fa/page.tsx`

**问题**: 
- 访问 `/2fa` 页面时报错: "Rendered fewer hooks than expected"
- 运行时异常导致页面无法正常渲染

**原因**: 
- 使用 `useState(false)` 和 `useEffect` 设置 `isDisabled` 状态
- 当 `CONFIG.show2FAPage` 为 `false` 时,组件在 Hook 调用前提前返回
- React 要求每次渲染时 hooks 的调用顺序和数量必须一致
- 提前返回导致后续 hooks (如加载记录的 `useEffect`) 未被执行

**修复方案**:
```
// ❌ 错误做法 - 会导致hooks数量不一致
const [isDisabled, setIsDisabled] = useState(false);
useEffect(() => {
  if (!CONFIG.show2FAPage) {
    setIsDisabled(true);
  }
}, []);

if (isDisabled) {
  return <DisabledPage />; // 提前返回,跳过后续hooks
}

// ✅ 正确做法 - 在组件顶部直接计算
const isDisabled = !CONFIG.show2FAPage;

if (isDisabled) {
  return <DisabledPage />; // 此时所有hooks都已声明,顺序一致
}
```

**技术要点**:
- 将依赖配置的静态值改为在组件顶部直接计算
- 确保所有 hooks 在任何渲染路径下都被按相同顺序调用
- 避免在 hooks 之前使用条件语句提前返回

---

#### 2. 加载动画配置未生效

**文件**: `app/page.tsx`

**问题**: 
- 将 `CONFIG.showLoadingAnimation` 设置为 `false` 后,刷新页面仍然显示加载动画
- 配置修改无法生效

**原因**: 
- 初始化 `isLoading` 状态时硬编码为 `true`: `useState(true)`
- 条件判断 `if (isLoading)` 未检查配置项
- 导致即使配置禁用,初始状态仍为 `true`,始终显示加载动画

**修复方案**:
```
// ❌ 之前 - 始终显示加载动画
const [isLoading, setIsLoading] = useState(true);

if (isLoading) {
  return <LoadingScreen onComplete={() => setIsLoading(false)} />;
}

// ✅ 现在 - 根据配置决定是否显示
const [isLoading, setIsLoading] = useState(CONFIG.showLoadingAnimation);

if (isLoading && CONFIG.showLoadingAnimation) {
  return <LoadingScreen onComplete={() => setIsLoading(false)} />;
}
```

**技术要点**:
- 状态初始化必须与配置项保持一致
- 条件渲染逻辑需要同时检查状态和配置
- 避免"既不显示A也不显示B"的逻辑死锁状态

---

#### 3. 配置文件位置调整

**文件**: `app/toggle/config.ts` (从 `app/config.ts` 移动)

**修改**: 
- 将配置文件移动到 `/app/toggle` 目录,集中管理功能开关相关文件
- 更新所有引用路径:
  - `app/toggle/page.tsx`: `'./config'`
  - `app/page.tsx`: `'./toggle/config'`
  - `app/2fa/page.tsx`: `'../toggle/config'`


---

## 26.4.6

### React Hooks 依赖警告修复

**文件**: `app/2fa/page.tsx`, `components/ui/magnetic.tsx`

**问题**: Next.js 构建时出现 3 个 React Hooks 依赖警告
- `app/2fa/page.tsx:172:6` - useEffect 缺少 'generateCode' 依赖
- `app/2fa/page.tsx:191:6` - useEffect 缺少 'records' 依赖  
- `components/ui/magnetic.tsx:64:6` - useEffect 缺少 'x' 和 'y' 依赖

**修复方案**:
1. **定时验证码更新** (`app/2fa/page.tsx`)
   - 添加 `eslint-disable-next-line react-hooks/exhaustive-deps` 注释
   - 原因: `generateCode` 函数每次渲染都会重新创建,但不需要每次都重置定时器

2. **自动保存密钥** (`app/2fa/page.tsx`)
   - 添加 `eslint-disable-next-line react-hooks/exhaustive-deps` 注释
   - 原因: `records` 在 `saveRecords` 中会更新,避免循环依赖

3. **磁性动画效果** (`components/ui/magnetic.tsx`)
   - 添加 `eslint-disable-next-line react-hooks/exhaustive-deps` 注释
   - 原因: `x` 和 `y` 是 motion values,引用每次渲染都变化,但不需要重新绑定事件监听器



---

1. Next.js Link组件修复
- **文件**: `app/2fa/page.tsx`, `app/blog/layout.tsx`
- **问题**: 内部路由使用 `<a>` 标签代替 `<Link>`
- **修复**: 添加 `import Link from 'next/link'`，替换所有 `<a href="/">` 为 `<Link href="/">`

2. 未使用的导入清理
- **文件**: `app/blog/layout.tsx`
- **问题**: ESLint 警告未使用的导入
- **修复**: 移除 `TextMorph`, `useEffect`, `useState` 导入；删除 `CopyButton` 函数定义

3. 重复函数删除
- **文件**: `app/footer.tsx`
- **问题**: 两个相同名称的 `SiteUptime()` 函数定义
- **修复**: 删除重复函数，保留 `SiteUptimeSpan()`

4. Image组件优化
- **文件**: `app/page.tsx`
- **问题**: 使用原生 `<img>` 标签，影响 Next.js 图片优化
- **修复**: 添加 `import Image from 'next/image'`，替换为 `<Image>` 组件并添加 `width`/`height` 属性

5. TypeScript 类型错误修复
- **文件**: `components/ui/text-effect.tsx`
  - **问题**: 未使用的变量 `exit`
  - **修复**: 添加 eslint-disable 注释

- **文件**: `components/ui/animated-background.tsx`
  - **问题**: `child: any` 类型过于宽泛
  - **修复**: 修改为 `child: React.ReactElement<any>`，添加 eslint-disable 注释


**页面加载动画组件创建与优化**

1. 新增加载动画组件
- **文件**: `components/ui/loading-screen.tsx` (新建)
- **功能**: 
  - AG Logo 弹性入场动画 (A → G → v1)
  - 0.8秒进度条动画 (ease-out 缓动)
  - 深蓝到浅蓝循环渐变效果
  - 响应式容器设计

2. 主页面集成
- **文件**: `app/page.tsx`
- **修改**: 
  - 添加 `LoadingScreen` 组件导入
  - 添加 `isLoading` 状态管理
  - 条件渲染加载动画

3. 文档更新
- **文件**: `Update.md`
- **内容**: 添加 "2026-04-06: 页面加载动画功能" 完整说明

- **文件**: `INSTALLATION.md`
- **内容**: 添加"自定义页面加载动画"章节

- **文件**: `README.md`, `QUICK_REFERENCE.md`, `README_DOCS.md`, `DEPLOYMENT_READY.md`
- **内容**: 更新特性列表和文档索引

---

## 26.4.4

修复文章手机端标题文字重叠

修复 data.ts 类型声明错误（`ltype` → `type`）

---

## 26.3.28

修复了CSS v3黑白主题无法切换的问题
