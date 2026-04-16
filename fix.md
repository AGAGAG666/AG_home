# 修复日志

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
