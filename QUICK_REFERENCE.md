# 🚀 快速参考 - 手机适配要点 
---

## 核心优化要点（5分钟速读）

### 🎯 主要改进

| 区域         | 旧设计     | 新设计                      | 好处         |
| ------------ | ---------- | --------------------------- | ------------ |
| **头像**     | 32×32 固定 | 24×24 (手机) → 32×32 (桌面) | 手机空间充足 |
| **文本排列** | 水平固定   | 竖直 (手机) → 水平 (md)     | 手机友好     |
| **间距**     | 统一 96px  | 64px (手机) → 96px (md)     | 紧凑布局     |
| **卡片**     | 1-2列混合  | 1列 (手机) → 2列 (md)       | 清晰呈现     |
| **磁吸效果** | 手机启用   | 仅桌面启用                  | 省性能       |
| **链接排列** | 固定行     | 自动换行 (手机)             | 不溢出       |

---

## 💻 技术实现

### 关键 CSS 类

```css
/* 响应式间距 */
space-y-16 md:space-y-24

/* 图片自适应 */
w-24 h-24 md:w-32 md:h-32

/* 弹性布局切换 */
flex-col-reverse md:flex-row

/* 网格自适应 */
grid-cols-1 sm:grid-cols-2

/* 文本处理 */
text-sm md:text-base
line-clamp-2
truncate
break-all
```

### 关键 JavaScript

```jsx
// 检测移动设备
const [isMobile, setIsMobile] = useState(false)
useEffect(() => {
  setIsMobile(window.matchMedia('(max-width: 768px)').matches)
}, [])

// 条件渲染
const Wrapper = isMobile ? Fragment : Magnetic
<Wrapper>内容</Wrapper>
```

---

## 📱 屏幕尺寸标准

```
手机竖屏    : 375px  (iPhone SE)
手机横屏    : 640px  (sm: 断点)
平板        : 820px  (md: 768px 断点)
桌面小屏    : 1024px (lg: 断点)
桌面大屏    : 1920px+
```

---

## ✨ 改进检查清单

### 移动端 (手机)

- ✅ 文字可读 (14px 最小)
- ✅ 按钮可点 (44×44px 最小推荐)
- ✅ 无水平滚动条
- ✅ 图片正确缩放
- ✅ 触摸反馈明显 (active 状态)

### 平板端

- ✅ 两列布局启用
- ✅ 字体逐步放大
- ✅ 间距逐步增加
- ✅ 磁吸效果可选

### 桌面端

- ✅ 宽敞布局
- ✅ 完整磁吸效果
- ✅ 最优视觉效果
- ✅ 无超宽问题

---

## 🎨 关键样式模式

### 模式 1: 条件显示

```tsx
// 不同屏幕显示不同内容/样式
<div className="text-sm md:text-lg">{/* 手机: 12px, 桌面: 18px */}</div>
```

### 模式 2: 方向切换

```tsx
<div className="flex flex-col md:flex-row">{/* 手机: 竖直, 桌面: 水平 */}</div>
```

### 模式 3: 网格自适应

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
  {/* 手机: 1列, 640px: 2列, 768px: 3列 */}
</div>
```

### 模式 4: 功能切换

```tsx
const Wrapper = isMobile ? Fragment : MagneticComponent
<Wrapper>
  {/* 手机不执行动画, 桌面执行 */}
</Wrapper>
```

---

## 🧪 本地测试

### 启动项目

```bash
npm install
npm run dev
# 访问 http://localhost:3001
```

### Chrome DevTools 测试

1. F12 打开开发者工具
2. 点击设备切换按钮 (移动设备图标)
3. 选择设备或自定义尺寸
4. 测试各个屏幕尺寸

### 推荐测试设备

- iPhone SE (375×667)
- iPhone 14 (390×844)
- iPad (768×1024)
- Desktop (1920×1080)

---

## 📊 文件修改统计

| 文件             | 改动数   | 影响         |
| ---------------- | -------- | ------------ |
| `app/page.tsx`   | 5 处     | 主要逻辑     |
| `app/header.tsx` | 1 处     | 导航适配     |
| `app/footer.tsx` | 1 处     | 页脚适配     |
| `app/layout.tsx` | 1 处     | 全局布局     |
| **总计**         | **8 处** | **完整适配** |

---

## 🎯 优化目标达成

- ✅ **响应式设计** - 完全适配移动端
- ✅ **性能优化** - 移动端禁用不必要动画
- ✅ **用户体验** - 大按钮、清晰排版
- ✅ **代码质量** - 使用标准框架，易维护
- ✅ **测试就绪** - 可立即部署

---

## 📚 参考资源

- [Tailwind CSS 响应式设计](https://tailwindcss.com/docs/responsive-design)
- [MDN 媒体查询](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Media_Queries)
- [Next.js 最佳实践](https://nextjs.org/docs/pages/building-your-application)
- [WCAG 可访问性指南](https://www.w3.org/WAI/WCAG21/quickref/)

---

**最后更新**: 2026-04-06  
**项目**: AG_home (AG 个人主页)  
**状态**: ✅ 优化完成，可部署
