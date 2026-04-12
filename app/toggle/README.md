# 功能开关配置说明

## 📝 配置文件位置

所有功能开关配置都在 `app/toggle/config.ts` 文件中。

## 🔧 如何控制开关

### 1. 打开配置文件

编辑文件: [`app/toggle/config.ts`](./config.ts)

### 2. 修改配置值

找到对应的配置项,将 `true` 改为 `false` (或反之):

```typescript
export const CONFIG = {
  // 页面加载动画开关 (true=启用, false=禁用)
  showLoadingAnimation: true,  // 👈 改为 false 可禁用加载动画
  
  // 2FA 双重验证页面开关 (true=启用, false=禁用)
  show2FAPage: true,           // 👈 改为 false 可禁用2FA功能
} as const;
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

## 💡 示例

### 禁用加载动画:
```typescript
showLoadingAnimation: false,
```

### 禁用2FA功能:
```typescript
show2FAPage: false,
```

### 同时禁用两个功能:
```typescript
export const CONFIG = {
  showLoadingAnimation: false,
  show2FAPage: false,
} as const;
```

## ⚠️ 注意事项

1. 修改配置后需要**刷新页面**才能看到效果
2. 配置是**全局生效**的,所有用户都会受到影响
3. 如果需要临时测试,可以在本地修改,不要提交到 Git
4. 配置查看页面:访问 `/toggle` 可以看到当前配置状态(只读)

## 📂 相关文件

- **配置文件**: [`app/toggle/config.ts`](./config.ts) - 功能开关配置
- **Toggle 页面**: [`app/toggle/page.tsx`](./page.tsx) - 配置状态展示页面
- **主页面**: [`app/page.tsx`](../page.tsx) - 根据配置动态显示/隐藏2FA入口
- **2FA 页面**: [`app/2fa/page.tsx`](../../2fa/page.tsx) - 受控的2FA功能页面
