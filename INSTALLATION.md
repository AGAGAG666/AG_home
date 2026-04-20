# 安装和使用指南

## 系统要求

- Node.js 18 或更高版本

## 安装步骤

### 1. 克隆项目

```bash
git clone https://github.com/AGAGAG666/AG_home.git
cd AG_home
```

### 2. 安装依赖

```bash
pnpm install 
```

### 3. 启动开发服务器

```bash
pnpm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看你的网站。

## 功能开关配置系统

### 配置文件位置

功能开关配置都在 `app/toggle/config.ts` 文件中。

---

## 自定义网站

### 编辑个人信息

编辑 `app/page.tsx` 中的自我介绍部分

### 更换头像

1. 准备一张头像图片（建议 400x400px 或更大）
2. 保存为 `public/avatar.jpg`

### 修改联系信息

编辑 `app/data.ts`：


### 更改网页标题和描述以及颜色

编辑 `app/layout.tsx`
颜色编辑: `app/globals.css`

### 修改网站上线时间

编辑 `app/footer.tsx` 中的 `launchDate`

### 修改主题色

编辑 `app/layout.tsx` 中的 `viewport`

### 修改跳转链接组件

在 `app/data.ts` 中修改

### 添加博客文章

在 `app/blog` 目录下创建 .md 文件，必须包含下述描述

```md
---
title: 文章标题
description: 简短描述
date: 2026-04-16
cover: /blog/your-image.jpg
tags: ["标签1", "标签2"]
---

# 正文（Markdown 格式）
```

**Frontmatter 字段说明：**
- `title`: 文章标题（必填）
- `description`: 文章描述，用于列表展示和搜索（必填）
- `date`: 发布日期，格式 YYYY-MM-DD，用于归档视图排序
- `cover`: 封面图片路径，相对于 `public` 目录，用于列表视图显示
- `tags`: 标签数组，用于标签视图筛选和搜索

#### 博客视图

- 完整卡片网格布局
- 显示封面图、标题、描述
- 支持分页（默认每页 5 篇）
- 配置位置：`components/BlogModalContentClient.tsx`
  ```typescript
  const POSTS_PER_PAGE = 5  // 修改每页显示数量
  ```

#### 图片功能

**在文章添加图片引用**
把图片移动到(`./public/blog/`)
并在文章引用的图片链接写为(./blog/你的图片文件)

**图片放大查看器**
- **触发方式**: 点击文章内任意图片即可放大查看
- **桌面端操作**:
  - 键盘 `+` / `-` 键：放大/缩小
  - 右上角 +/- 按钮：控制缩放
  - ESC 键或点击背景：关闭查看器
- **移动端操作**:
  - 双指捏合手势：缩放图片（20% ~ 500%）
  - 单指拖动：平移查看细节（放大后可用）
  - 点击背景：关闭查看器
- **UI 特性**:
  - 半透明黑色背景完全覆盖视口
  - 图片居中显示，自适应尺寸
  - 左上角实时显示缩放百分比
  - 控制按钮固定在右上角，不被图片覆盖
  - Dark/Light 主题自适应

**技术实现**:
- Server Component (`app/blog/[slug]/page.tsx`): 负责数据读取
- Client Components:
  - `MarkdownContent.tsx`: Markdown 渲染及图片点击交互
  - `ImageViewer.tsx`: 图片查看器模态框
- 通信机制: `window.dispatchEvent` + `CustomEvent`

### 修改博客列表淡出淡入以及速度

编辑 `components/ui/simple-modal.tsx` 中的 transition

编辑 `app/globals.css` 中的 .animate-fade-in-up

### 博客列表搜索和分页功能

#### 配置每页显示文章数

编辑 `components/BlogModalContentClient.tsx`：

```typescript
const POSTS_PER_PAGE = 5  // 修改此值改变每页显示数量
```

**博客页面** (`app/blog/layout.tsx`):
```
<Link
  href="/"
  onClick={() => {
    // 注释掉这行来禁用跳过动画
    sessionStorage.setItem('skipLoadingAnimation', 'true');
  }}
>
  返回
</Link>
```

# **在文章内添加图片引用**
把图片移动到(`./public/blog/`)
并在文章引用的图片链接写为(./blog/你的图片文件)


### 2FA 页面主题自定义

#### 自定义按钮颜色

编辑 `app/2fa/page.tsx`，修改"我的记录"按钮类名：

**Light 主题（白色背景）**：
```typescript
className="... bg-blue-600 hover:bg-blue-700 text-white border-blue-200 ..."
```

**Dark 主题（深色背景）**：
```typescript
className="... dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-600 dark:border-blue-800 ..."
```

#### 自定义隐私保护提示框颜色

编辑提示框 div 元素的类名：

```typescript
className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 ... text-blue-800 dark:text-blue-300"
```

可替换的颜色组合：
- 蓝色系：`blue-600` / `blue-900/20`
- 紫色系：`purple-600` / `purple-900/20`
- 绿色系：`green-600` / `green-900/20`

### 自定义页面加载动画

#### 修改 Logo 文字和版本号

编辑 `components/ui/loading-screen.tsx`：

```typescript
// 修改 AG 主标识
<span className="...">A</span>
<span className="...">G</span>

// 修改版本号
<span className="...">v1</span>
```

#### 调整 Logo 字体大小

修改 AG 和 v1 的 Tailwind 类名：

```typescript
// AG 字体大小 (当前 text-6xl)
className="relative text-6xl font-black ..."

// v1 字体大小 (当前 text-4xl)
className="relative text-4xl font-bold ..."
```

可选字号：`text-4xl`, `text-5xl`, `text-6xl`, `text-7xl`

#### 修改 Logo 颜色渐变

编辑渐变色类名：

```typescript
// 当前：蓝色渐变 (from-blue-600 to-blue-400)
className="... bg-gradient-to-r from-blue-600 to-blue-400 ..."

// 可替换为其他颜色组合：
// 紫色系：from-purple-600 to-purple-400
// 绿色系：from-green-600 to-green-400
// 红色系：from-red-600 to-red-400
```

#### 调整加载动画时长

编辑进度条动画持续时间：

```
components/ui/loading-screen.tsx
const duration = 800; // 修改此值改变加载时长(毫秒)
```

#### 修改进度条颜色

编辑渐变色配置：

```
background: 'linear-gradient(90deg, #1e40af, #3b82f6, #60a5fa, #3b82f6, #1e40af)'
```

可自定义颜色值，保持 5 个颜色点以实现循环流动效果。

#### 调整容器尺寸

修改响应式容器宽度：

```
className="w-[320px] sm:w-[360px] md:w-[400px] ..."
```

- `320px` - 手机端宽度
- `360px` - 平板端宽度
- `400px` - 电脑端宽度

#### 禁用加载动画

如果不需要加载动画，编辑 `app/page.tsx`：

```typescript
export default function Personal() {
  const [isLoading, setIsLoading] = useState(false); // 改为 false
  
  // 或者直接移除 LoadingScreen 组件的使用
}
```


## 音乐播放器功能

### 功能概述

内置本地音乐播放器，支持播放服务器上的音频文件，具备全局播放、智能缓存清理等功能。

### 启用/禁用音乐播放器

编辑 `app/toggle/config.ts`：

**生效方式**：保存后刷新页面即可，无需重启服务器。

### 添加音乐

复制音频文件`public/music/` 目录：

**支持的格式**：`.mp3`, `.wav`, `.ogg`, `.flac`, `.m4a`, `.aac`

### 作者名称自动提取

**命名规则**：在文件名中使用 `__`（双下划线）分隔歌曲名和作者名

**示例**：
- `歌曲A__Bm.mp3` → 显示为：歌曲A，作者 Bm
- `音乐__张三.wav` → 显示为：音乐，作者 张三
- `纯音乐.mp3` → 无作者信息

## 构建和部署

### 构建生产版本

```bash
pnpm run build
```

### 本地运行生产版本

```bash
pnpm run start
```

### 部署到 Vercel

1. 推送代码到 GitHub
2. 访问 [Vercel](https://vercel.com)
3. 导入你的 GitHub 仓库
4. Vercel 会自动部署和构建

## 常见问题

如遇到问题，请检查：

- [Next.js 文档](https://nextjs.org/docs)
- 项目的 GitHub Issues
