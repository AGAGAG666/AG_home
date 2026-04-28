// ============================================
// 功能开关配置 - 在此处直接修改 true/false 来控制功能
// ============================================
export const CONFIG: {
  showLoadingAnimation: boolean
  show2FAPage: boolean
  showMusicPlayer: boolean

  blogDisplayMode: 'floating' | 'page'
} = {
  showLoadingAnimation: false,  //页面加载动画开关 (true=启用, false=禁用)
  show2FAPage: false,  // 2FA 双重验证页面开关 (true=启用, false=禁用)
  showMusicPlayer: true,   // 音乐播放器开关 (true=启用, false=禁用)
  blogDisplayMode: 'page',    // 博客列表展示模式: 'floating'=主页浮动弹窗, 'page'=独立页面
}
// ============================================
