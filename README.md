# AG的个人页

欢迎来到我的的个人页！这里用于分享以及介绍

## 特性

- 📱 支持在ZeroTermux本地部署
- 🎨 精美的响应式设计，完美适配手机端
- 📝 博客系统（动态路由 + Markdown 渲染）
- 🔐 2FA 双重要素验证系统
- 🌓 深色/浅色主题切换

## 最近更新
- 2026-04-27: 博客独立页面（`/blog`），新增 `blogDisplayMode` 配置（浮动弹窗/独立页面），SimpleModal flex 布局优化
- 2026-04-20: 添加音乐播放器
- 2026-04-16: 博客系统增强 - 标签视图、图片放大查看器（双指缩放/按钮控制/键盘快捷键）
- 2026-04-10: 添加博客系统和 2FA 功能，开关配置系统
- 2026-04-06: 添加博客搜索功能，页面加载动画


- 更新详见[update文档](Update.md)

## fix

[点击查看修复](./fix.md)

## 快速开始

```bash
# 克隆项目
git clone https://github.com/AGAGAG666/AG_home.git
cd AG_home

# 安装依赖
pnpm install 

# 启动开发服务器
pnpm run dev
```

在浏览器中打开 [localhost:3000](http://localhost:3000/) 查看效果
在浏览器打开[loveag.dpdns.org](https:loveag.dpdns.org)预览

## 不想要某些设置？

详见 [开关配置](./app/toggle/config.ts)

## 自定义配置

详见 [安装和使用指南](./INSTALLATION.md)


### 🚀 快速开始

- **[安装和使用指南](./INSTALLATION.md)** - 环境配置、安装步骤、自定义方法
- **[快速参考](./QUICK_REFERENCE.md)** - 核心改进总结、技术实现要点

### 📊 技术文档

- **[移动端优化详解](./MOBILE_OPTIMIZATION.md)** - 响应式设计原理、最佳实践
- **[变更详情](./CHANGES_DETAIL.md)** - 代码修改对比、优化成果分析

### 🛠️ 维护工具

- **[修复记录](./fix.md)** - Bug修复历史、版本更新日志
- **[文档索引](./README_DOCS.md)** - 完整文档导航、学习路径推荐

## 技术栈

- **框架**: Next.js 15
- **UI 库**: React 19
- **样式**: Tailwind CSS v3 + @tailwindcss/typography
- **动画**: Motion Primitives
- **图标**: Lucide React
- **主题**: next-themes
- **Markdown解析**: gray-matter + react-markdown + remark-gfm

用AI写的，不要拷打我QWQ
