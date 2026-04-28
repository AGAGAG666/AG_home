# 更新日志

## 2026-04-27: 博客独立页面与配置重构

### ✨ 新增功能

#### 1. 博客独立页面
- **新增路由**: `app/blog/page.tsx` — 独立博客列表页，路径 `/blog`
- **入口自适应**: 根据 `blogDisplayMode` 配置决定主页博客按钮行为
  - `'page'` 模式：Link 跳转到 `/blog`
  - `'floating'` 模式：MagneticButton 打开弹窗
- **动画效果**: TextEffect 逐字淡入标题 "随便写写" + motion 逐段淡入动画
- **Header 隐藏**: 在 `/blog` 路径下自动隐藏导航栏
- **返回按钮增强**: 根据当前页面和配置智能调整位置与链接
  - 博客列表页：右上角（`right-4 top-24`），小尺寸
  - 文章详情页：左上角（`left-4 top-32`），小尺寸
  - 详情页返回目标：`blogDisplayMode === 'page'` → `/blog`，否则 → `/`

#### 2. 新增配置项 `blogDisplayMode`
- **配置文件**: `app/toggle/config.ts`
- **类型定义**: `'floating' | 'page'`
- **配置结构重构**: 从 `as const` 改为带显式类型的 `export const CONFIG: { ... } = { ... }`

### 🎨 UI 优化

#### SimpleModal 布局重构
- **弹性布局**: `flex flex-col` 替换固定高度
- **独立滚动**: 内容区 `<div className="min-h-0 flex-1 overflow-auto">`，标题栏不受影响
- **效果**: 弹窗标题始终可见，内容过长时内容区单独滚动

#### 博客网格固定单列
- 网格显式声明 `grid grid-cols-1 gap-4`，确保始终单列显示

#### 行内代码深色主题修复
- 背景改为灰色，文字粉色
- 移除反引号伪元素，避免视觉重叠

#### 博客页面间距调整
- `<main>` 上边距从 `mt-24` 缩为 `mt-16`
- 页面整体更紧凑

### 🔧 技术实现

#### 配置感知架构
```
blogDisplayMode: 'page'
  ├── 主页按钮 → <Link href="/blog"> (React Router)
  ├── Header → pathname === '/blog' 时返回 null
  └── 详情页返回 → <Link href="/blog">

blogDisplayMode: 'floating'
  ├── 主页按钮 → MagneticButton → open modal
  ├── Header → 正常显示
  └── 详情页返回 → <Link href="/">
```

#### 关键代码模式
- **条件渲染**: 使用 `usePathname()` 和配置值决定渲染路径
- **Link vs 按钮**: 根据配置选择 `<Link>` 或 `<MagneticButton>`
- **模式切换**: 修改 `config.ts` 后刷新页面立即生效，无需重启

### 📁 文件清单

**新增文件**:
- `app/blog/page.tsx` — 博客列表独立页面

**修改文件**:
- `app/toggle/config.ts` — 添加 `blogDisplayMode`，重构类型定义
- `app/page.tsx` — 博客按钮根据配置条件渲染
- `app/header.tsx` — 在 `/blog` 路径隐藏
- `app/blog/layout.tsx` — 返回按钮位置/链接自适应
- `app/blog/[slug]/page.tsx` — 配合布局调整
- `components/ui/simple-modal.tsx` — flex 布局重构
- `components/BlogModalContentClient.tsx` — 显式 `grid-cols-1`
- `app/toggle/README.md` — 更新配置文档
- `INSTALLATION.md` — 更新配置示例

---

## 2026-04-20: 音乐播放器功能完整实现

...（以下内容不变）

### ✨ 新增功能

#### 1. 本地音乐播放器系统
- **核心组件**: `components/MusicPlayer.tsx`
- **API 路由**: `app/api/music/route.ts` - 自动读取 `public/music/` 目录
- **支持的格式**: `.mp3`, `.wav`, `.ogg`, `.flac`, `.m4a`, `.aac`

**播放控制**:
- 播放/暂停、上一首/下一首、停止
- 可拖动进度条调节播放位置
- 音量滑块 + 静音切换
- 单一按钮循环切换四种播放模式：
  - 顺序播放 → 随机播放 → 列表循环 → 单曲循环

**UI 特性**:
- 当前播放信息（歌曲名、作者、时长）
- 播放列表显示/隐藏切换
- 当前播放项高亮 + 动画指示器
- 响应式设计，适配移动端和桌面端

**作者名称提取**:
- 从文件名 `__`（双下划线）后自动提取作者
- 示例：`歌曲A__Bm.mp3` → 作者 `Bm`
- 显示位置：当前播放区 + 播放列表项第二行

---

#### 2. 全局播放功能
- **技术实现**: 模块级单例音频管理器
- **核心优势**: 关闭模态框后音乐继续播放，不受组件卸载影响
- **生命周期**: 音频实例独立于 UI 组件，整个应用共享同一实例

```typescript
// 全局音频管理器
let globalAudio: HTMLAudioElement | null = null;

function getGlobalAudio(): HTMLAudioElement {
  if (!globalAudio) {
    globalAudio = new Audio();
    globalAudio.preload = 'metadata';
  }
  return globalAudio;
}
```

---

#### 3. 智能缓存清理
- **问题场景**: 服务器删除文件后，用户缓存中仍存在无效记录
- **解决方案**: 页面加载时验证服务器文件存在性
- **工作流程**:
  1. 读取 localStorage 缓存的播放列表
  2. 调用 `/api/music` 获取当前存在的文件
  3. 对比 URL，过滤掉已不存在的服务器文件
  4. 自动更新 localStorage 和播放状态
  5. 调整 currentTrackIndex（防止索引越界）

**效果**:
- ✅ 管理员删除 `song2.mp3`
- ✅ 用户刷新页面
- ✅ `song2.mp3` 自动从播放列表移除
- ✅ 不会显示无法播放的歌曲

---

#### 4. AbortError 修复
- **问题**: `The play() request was interrupted by a call to pause()`
- **原因**: 快速切换歌曲时，`pause()` 和 `play()` 产生竞态条件
- **解决方案**: 使用 `canplay` 事件监听器，确保音频准备好后再播放

```typescript
// 优化后的播放逻辑
if (isPlaying) {
  const handleCanPlay = () => {
    audio.play().catch((err: Error) => {
      console.error('Play failed:', err);
      setIsPlaying(false);
    });
    audio.removeEventListener('canplay', handleCanPlay);
  };
  
  audio.addEventListener('canplay', handleCanPlay, { once: true });
}
```

---

#### 5. 功能开关配置
- **配置文件**: `app/toggle/config.ts`
- **配置项**: `showMusicPlayer: true/false`
- **生效方式**: 保存后刷新页面即可，无需重启服务器

**使用方法**:
```typescript
export const CONFIG = {
  showLoadingAnimation: false,
  show2FAPAPage: false,
  showMusicPlayer: true,  // 修改此值控制音乐播放器显示
} as const;
```

---

### 🔧 技术实现

#### 架构设计
- **Server Component** (`app/api/music/route.ts`): 读取文件系统，返回 JSON
- **Client Components**:
  - `MusicPlayer.tsx`: 主播放器组件，包含所有交互逻辑
  - `page.tsx`: 集成播放器入口和模态框

#### 关键技术点
- **模块级单例**: 全局音频实例，避免组件卸载导致播放中断
- **异步验证**: `async/await` 确保缓存清理完成后再加载新文件
- **事件驱动**: `canplay` 事件解决竞态条件
- **状态持久化**: localStorage 保存播放列表、索引、音量、模式
- **条件渲染**: 根据配置动态显示/隐藏播放器入口

#### 数据流
```
页面加载
  ↓
读取 localStorage 缓存
  ↓
验证服务器文件存在性 (/api/music)
  ↓
过滤无效缓存，更新 localStorage
  ↓
加载新文件到播放列表
  ↓
恢复播放状态（索引、音量、模式）
  ↓
用户可以操作播放器
```

---

### 📁 文件清单

**新增文件**:
- `components/MusicPlayer.tsx` - 播放器组件
- `app/api/music/route.ts` - 音乐文件 API
- `public/music/` - 音频文件存放目录

**修改文件**:
- `app/page.tsx` - 添加播放器入口按钮和模态框
- `app/toggle/config.ts` - 添加 `showMusicPlayer` 配置项
- `INSTALLATION.md` - 添加音乐播放器使用说明

---

## 2026-04-16: 博客更新 - 标签视图与图片查看器

### ✨ 新增功能

#### 1. 博客三视图模式
- **列表视图**: 完整卡片网格，支持分页，显示封面图
- **归档视图**: 时间线布局，按年-月-日分组，年份醒目显示
- **标签视图**: 标签列表 + 选中后文章展示
  - 标签显示规则：单篇文章不显示数字，多篇显示纯数字（如 `Cloudflare 3`）
  - 点击标签筛选文章，再次点击取消
  - 提供"清除筛选"按钮

#### 2. 图片放大查看器
- **触发方式**: 点击文章内任意图片
- **核心特性**:
  - 半透明黑色背景 + 模糊效果，完全覆盖视口
  - 图片居中显示，自适应尺寸（max 85vh × 85vw）
  - 缩放范围：20% ~ 500%，步长 20%
  
- **交互方式**:
  - **桌面端**: 
    - 键盘 `+`/`-` 键缩放
    - 右上角 +/- 按钮控制
    - ESC 键或点击背景关闭
  - **移动端**:
    - 双指捏合手势缩放
    - 单指拖动平移（放大后可用）
    - 触摸事件阻止页面滚动冲突
  
- **UI 优化**:
  - 控制按钮固定在视口右上角（z-index: 60），不被图片覆盖
  - 左上角实时显示缩放百分比
  - 平滑过渡动画（仅重置时启用）
  - Dark/Light 主题自适应

### 🔧 技术实现

#### 架构设计
- **Server Component** (`app/blog/[slug]/page.tsx`): 负责数据读取和静态渲染
- **Client Components**:
  - `MarkdownContent.tsx`: 封装 ReactMarkdown 及图片点击交互
  - `ImageViewer.tsx`: 图片查看器模态框，使用原生 `<dialog>` 元素
  
#### 关键技术点
- 使用 `window.dispatchEvent` + `CustomEvent` 实现组件间通信
- 移动端触摸事件处理：`touchstart`/`touchmove`/`touchend`
- CSS `transform: scale() translate()` 组合实现缩放和平移
- `position: fixed` + `z-index` 确保控件始终可见

### 📝 API 与数据结构
- Post 接口新增字段：
  - `date: string | null` (YYYY-MM-DD 格式)
  - `cover: string | null` (图片路径)
  - `tags: string[]` (标签数组)

---

## 2026-04-10

#### 更新内容
1. **新增博客系统** - 完整的博客文章管理、搜索和分页功能
2. **新增 2FA 双重验证** - 支持 TOTP 的二次验证页面
3. **新增网页进入动画** - AG Logo 弹性入场 + 进度条加载动画
4. **CSS 版本更换** - 从 Tailwind CSS V4 更换为 V3
5. **包管理器** - 使用 pnpm 进行依赖管理

#### 核心特性
- ✅ 集中式功能开关配置系统 (`app/toggle/config.ts`)
- ✅ 可动态启用/禁用加载动画和 2FA 功能
- ✅ 响应式设计,适配手机/平板/电脑
- ✅ Dark/Light 双主题支持
- ✅ 音乐播放器功能(网易云音乐 API + Howler.js)

---

## 2026-04-11: 功能开关配置系统

### ✨ 新增功能开关配置系统

#### 🎯 核心功能
- **集中式配置管理**: 创建统一的配置文件,通过修改代码控制功能开关
- **加载动画开关**: 可启用/禁用首页的 AG Logo 加载动画和进度条
- **2FA 页面开关**: 可启用/禁用 2FA 双重验证功能,禁用时自动隐藏入口按钮
u历史 |



---

## 2026-04-06: 博客和 2FA 功能升级 

### 博客列表组件功能增强

#### 🔍 搜索功能
- 点击"共 X 篇文章"按钮切换到搜索模式
- 支持按标题和描述关键词进行实时模糊搜索
- 搜索结果自动分页，分页器自动重置到第1页

#### 📄 分页功能
- 每页显示 5 篇文章（可配置）
- 搜索结果超过 5 篇时自动显示分页控件
- 支持上一页/下一页导航，到达首页/末页时自动禁用

### 博客列表交互优化

#### ⚡ 新增交互方式
- **单击标题**：直接进入文章（原有功能）
- **双击空白区域**：双击卡片任何空白位置也可进入文章
- 光标样式优化：`cursor-pointer` 提示用户可交互

### 2FA 页面视觉升级

#### 🌈 Light 主题（白色背景）
| 组件 | 背景色 | 文字色 | 边框色 |
|------|--------|--------|--------|
| "我的记录"按钮 | `blue-600` | `white` | `blue-200` |
| 隐私保护提示框 | `blue-50` | `blue-800` | `blue-200` |

#### 🌙 Dark 主题（深色背景）
| 组件 | 背景色 | 文字色 | 边框色 |
|------|--------|--------|--------|
| "我的记录"按钮 | `blue-900/20` | `blue-600` | `blue-800` |
| 隐私保护提示框 | `blue-900/20` | `blue-300` | `blue-800` |


## 技术改动

### 修改文件清单

| 文件 | 类型 | 改动描述 |
|------|------|---------|
| `components/BlogModalContentClient.tsx` | 功能增强 | 新增搜索/分页功能，修改交互逻辑 |
| `app/2fa/page.tsx` | 样式优化 | 更新主题颜色配置，增强视觉对比 |

## 页面加载动画功能

### ✨ 新增页面加载动画

#### 🎨 视觉设计
- **居中圆角容器**: 响应式设计,适配手机端(320px)、平板端(360px)、电脑端(400px)
- **AG Logo 标志**: 纯文字风格,参考 Minecraft Vape 设计美学
  - "AG" 主标识使用 text-6xl 超大字体
  - "v1" 版本号使用 text-4xl,上标显示
  - 蓝色渐变文字效果 (from-blue-600 to-blue-400)
  - 外发光特效营造科技感

#### 🎬 字母入场动画
- **从左到右依次出现**: A → G → v1,递进延迟 (0.05s, 0.15s, 0.25s)
- **弹性缩放效果**: 从 0.5 倍缩小状态弹跳到正常大小
- **弹性缓动曲线**: `[0.34, 1.56, 0.64, 1]` 模拟按钮点击的弹跳反馈
- **紧凑偏移距离**: G 字母 x:-5, v1 x:-3,动画更加自然流畅
- **快速完成**: 所有字母在约 0.5 秒内完成入场

#### 📊 进度条动画
- **加载时长**: 精确 0.8 秒完成
- **缓动曲线**: ease-out (从快到慢),营造冲刺后减速的自然感
- **循环渐变**: 深蓝→中蓝→浅蓝→中蓝→深蓝,2秒周期无限循环
- **动态流光**: backgroundPosition 动画实现颜色流动效果


#### 💫 整体交互
- **淡入淡出**: 加载完成后 0.3 秒优雅淡出,无缝切换到主内容
- **深色模式支持**: 完美适配 light/dark 主题切换

### 🔧 技术实现

**新增文件**:
- `components/ui/loading-screen.tsx` - 页面加载动画组件

**修改文件**:
- `app/page.tsx` - 集成 LoadingScreen 组件,添加加载状态管理



## 📚 相关文档

- [功能更新详解](./README_test.md) - 详细技术实现说明
- [快速参考](./QUICK_REFERENCE.md) - 核心功能快速查阅
- [安装和使用指南](./INSTALLATION.md) - 环境配置和自定义方法
