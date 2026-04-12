'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { CONFIG } from './config';

export default function TogglePage() {
  const showLoadingAnimation = CONFIG.showLoadingAnimation;
  const show2FAPage = CONFIG.show2FAPage;

  return (
    <div className="py-12 px-4 md:px-6">
      {/* 返回按钮 */}
      <div className="-mt-8 mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
        >
          ← 返回
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto pb-8"
      >
        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-6 md:p-8 shadow-lg ring-1 ring-zinc-200 dark:ring-zinc-800">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-zinc-900 dark:text-zinc-100">
              功能开关配置
            </h1>
            <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400">
              请在文件中直接修改 CONFIG 对象的值来控制功能
            </p>
          </div>

          <div className="space-y-6">
            {/* 加载动画状态显示 */}
            <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 border border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                    页面加载动画
                  </h2>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    控制首页进入时的 AG Logo 动画和进度条
                  </p>
                </div>
                <div className={`px-4 py-2 rounded-lg font-medium text-sm ${
                  showLoadingAnimation 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {showLoadingAnimation ? '已启用' : '已禁用'}
                </div>
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded">
                <strong>修改方法:</strong> 在 <code className="px-2 py-1 bg-zinc-200 dark:bg-zinc-700 rounded text-xs">app/toggle/config.ts</code> 文件中找到 <code className="px-2 py-1 bg-zinc-200 dark:bg-zinc-700 rounded text-xs">CONFIG.showLoadingAnimation</code>,将其值改为 <code className="px-2 py-1 bg-zinc-200 dark:bg-zinc-700 rounded text-xs">true</code> 或 <code className="px-2 py-1 bg-zinc-200 dark:bg-zinc-700 rounded text-xs">false</code>
              </div>
            </div>

            {/* 2FA页面状态显示 */}
            <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 border border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                    2FA 双重验证页面
                  </h2>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    控制 2FA 页面的访问权限和入口按钮显示
                  </p>
                </div>
                <div className={`px-4 py-2 rounded-lg font-medium text-sm ${
                  show2FAPage 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {show2FAPage ? '已启用' : '已禁用'}
                </div>
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded">
                <strong>修改方法:</strong> 在 <code className="px-2 py-1 bg-zinc-200 dark:bg-zinc-700 rounded text-xs">app/toggle/config.ts</code> 文件中找到 <code className="px-2 py-1 bg-zinc-200 dark:bg-zinc-700 rounded text-xs">CONFIG.show2FAPage</code>,将其值改为 <code className="px-2 py-1 bg-zinc-200 dark:bg-zinc-700 rounded text-xs">true</code> 或 <code className="px-2 py-1 bg-zinc-200 dark:bg-zinc-700 rounded text-xs">false</code>
              </div>
            </div>

            {/* 说明信息 */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>💡 提示:</strong> 修改配置文件后,刷新页面即可生效。当 2FA 功能禁用时,主页上的入口按钮会自动隐藏。
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
