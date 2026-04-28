# 功能开关配置说明

## 📝 配置文件位置

所有功能开关配置都在 `app/toggle/config.ts` 文件中。

## 🔧 如何控制开关

### 1. 打开配置文件

编辑文件: [`app/toggle/config.ts`](./config.ts)

### 2. 修改配置值

找到对应的配置项,修改值:

```typescript
export const CONFIG: {
  showLoadingAnimation: boolean
  show2FAPage: boolean
  showMusicPlayer: boolean
  blogDisplayMode: 'floating' | 'page'
} = {
  showLoadingAnimation: false,  // 👈 改为 true 可启用加载动画
  show2FAPage: false,           // 👈 改为 true 可启用2FA功能
  showMusicPlayer: true,        // 👈 改为 false 可隐藏音乐播放器
  blogDisplayMode: 'page',      // 👈 'floating'=主页弹窗, 'page'=独立页面
}
```

### 3. 保存并刷新

- 保存文件
- 刷新浏览器页面即可生效

## 📋 配置项说明

### showLoadingAnimation (页面加载动画)
- **true**: 显示 AG Logo 动画和进度条
- **false**: 直接进入主页,跳过动画

### show2FAPage (2FA 双重验证页面)
- **true**:
  - 显示主页上的 "2fa 验证" 入口按钮
  - 可以正常访问 `/2fa` 页面
- **false**:
  - **隐藏**主页上的 "2fa 验证" 入口按钮
  - 访问 `/2fa` 页面会显示"功能已禁用"提示

### showMusicPlayer (音乐播放器)
- **true**: 主页显示音乐播放器入口按钮，可打开弹窗播放音乐
- **false**: **隐藏**音乐播放器入口

### blogDisplayMode (博客列表展示模式)
- **`'floating'`**: 主页浮动弹窗显示博客列表（点击"文章"按钮打开）
- **`'page'`**: 独立页面 `/blog` 显示博客列表，文章详情页的返回按钮回到该页面

## 💡 示例

### 禁用加载动画和2FA，启用音乐播放器:
```typescript
export const CONFIG: { ... } = {
  showLoadingAnimation: false,
  show2FAPage: false,
  showMusicPlayer: true,
  blogDisplayMode: 'page',
}
```

### 全部启用 + 浮动弹窗模式:
```typescript
export const CONFIG: { ... } = {
  showLoadingAnimation: true,
  show2FAPage: true,
  showMusicPlayer: true,
  blogDisplayMode: 'floating',
}
```

## ⚠️ 注意事项

1. 修改配置后需要**刷新页面**才能看到效果
2. 配置是**全局生效**的,所有用户都会受到影响
3. 如果需要临时测试,可以在本地修改,不要提交到 Git
4. 配置查看页面:访问 `/toggle` 可以看到当前配置状态(只读)

## 📂 相关文件

- **配置文件**: [`app/toggle/config.ts`](./config.ts) - 功能开关配置
- **Toggle 页面**: [`app/toggle/page.tsx`](./page.tsx) - 配置状态展示页面
- **主页面**: [`app/page.tsx`](../page.tsx) - 根据配置动态显示博客入口、2FA入口、音乐播放器
- **2FA 页面**: [`app/2fa/page.tsx`](../../2fa/page.tsx) - 受控的2FA功能页面
- **博客页面**: [`app/blog/page.tsx`](../blog/page.tsx) - 独立博客列表页（仅 page 模式生效）
- **博客布局**: [`app/blog/layout.tsx`](../blog/layout.tsx) - 博客页面布局，含返回按钮
