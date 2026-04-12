'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { CONFIG } from '../toggle/config';

type SecretRecord = {
  id: string;
  name: string;
  secret: string;
  createdAt: number;
};

export default function TwoFactorAuthPage() {
  // 检查2FA页面是否被禁用 - 必须在所有hooks之前计算
  const isDisabled = !CONFIG.show2FAPage;

  // 所有hooks必须在任何条件返回之前调用
  const [viewSecret, setViewSecret] = useState('');
  const [viewSecretName, setViewSecretName] = useState('');
  const [currentCode, setCurrentCode] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [records, setRecords] = useState<SecretRecord[]>([]);
  const [showRecords, setShowRecords] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const normalizeSecret = (secret: string) => {
  return secret.replace(/\s/g, '').toUpperCase();
};

  // 从本地存储加载记录
  useEffect(() => {
    const savedRecords = localStorage.getItem('2fa-records');
    if (savedRecords) {
      try {
        setRecords(JSON.parse(savedRecords));
      } catch (err) {
        console.error('Failed to load records:', err);
      }
    }
  }, []);

  // 定时更新验证码
  useEffect(() => {
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

  // 自动保存新输入的密钥（不更新已有记录）
  useEffect(() => {
    const normalizedSecret = normalizeSecret(viewSecret);
    if (normalizedSecret && normalizedSecret.length >= 16) {
      const existingRecord = records.find(r => r.secret === normalizedSecret);

      // 只保存新记录，不更新已有记录
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

  // 如果页面被禁用,显示提示信息 - 必须在所有hooks之后
  if (isDisabled) {
    return (
      <div className="py-12 px-4 md:px-6">
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
          <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-6 md:p-8 shadow-lg ring-1 ring-zinc-200 dark:ring-zinc-800 text-center">
            <div className="mb-6">
              <svg className="w-16 h-16 mx-auto text-zinc-400 dark:text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">
              功能已禁用
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              2FA 双重验证页面已被管理员禁用。
            </p>
            <Link
              href="/toggle"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors"
            >
              前往设置页面
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // 保存记录到本地存储
  const saveRecords = (newRecords: SecretRecord[]) => {
    setRecords(newRecords);
    localStorage.setItem('2fa-records', JSON.stringify(newRecords));
  };


// 添加或更新记录
const addRecord = (name: string, secret: string) => {
  const normalized = normalizeSecret(secret);  // ✅ 使用 secret 参数并标准化
  const existingIndex = records.findIndex(r => r.secret === normalized);

  if (existingIndex !== -1) {
    // 更新已有记录的名称
    const updatedRecords = [...records];
    updatedRecords[existingIndex] = {
      ...updatedRecords[existingIndex],
      name: name || '未命名',
    };
    saveRecords(updatedRecords);
  } else {
    // 添加新记录
    const newRecord: SecretRecord = {
      id: Date.now().toString(),
      name: name || '未命名',
      secret: normalized,
      createdAt: Date.now(),
    };
    saveRecords([...records, newRecord]);
  }
};

  // 删除记录
  const deleteRecord = (id: string) => {
    const newRecords = records.filter(r => r.id !== id);
    saveRecords(newRecords);
    // 如果删除的是当前查看的记录，清空视图
    if (records.find(r => r.id === id)?.secret === viewSecret) {
      setViewSecret('');
      setViewSecretName('');
    }
  };

  // 删除所有记录
  const deleteAllRecords = () => {
    saveRecords([]);
    setViewSecret('');
    setViewSecretName('');
    setCurrentCode('');
    setShowDeleteConfirm(false);
  };

  // 使用已有记录
  const selectRecord = (record: SecretRecord) => {
    setViewSecret(record.secret);
    setViewSecretName(record.name);
    setShowRecords(false);
  };

  const copyCode = async () => {
    if (currentCode) {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(currentCode);
        } else {
          // 回退方案：使用 document.execCommand
          const textArea = document.createElement('textarea');
          textArea.value = currentCode;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('复制失败:', err);
      }
    }
  };

  const generateCode = async () => {
    if (!viewSecret) {
      setError('请输入密钥');
      return;
    }

    setError('');

    try {
      const response = await fetch('/api/2fa/generate-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secret: viewSecret,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '生成失败');
      }

      setCurrentCode(data.code);
      setTimeRemaining(30);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成验证码失败，请重试');
    }
  };

  // 保存当前密钥为记录
  const saveCurrentRecord = () => {
    if (!viewSecret) {
      setError('请先输入密钥');
      return;
    }
    addRecord(viewSecretName || '未命名', viewSecret);
    setError('');
  };

  // 清空输入框
  const clearInputs = () => {
    setViewSecret('');
    setViewSecretName('');
    setCurrentCode('');
  };

  return (
    <div data-component="2fa-page" className="py-12 px-4 md:px-6">
      {/* 返回按钮 */}
      <div className="-mt-8 mb-4">
        <Link
          href="/"
          onClick={() => {
            // 设置标记,表示从2FA页面返回主页
            sessionStorage.setItem('skipLoadingAnimation', 'true');
          }}
          className="inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
        >
          ← 返回
        </Link>
      </div>

      <motion.div
        data-component="2fa-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto pb-8 page-2fa-container"
        data-page="2fa"
      >
        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-6 md:p-8 shadow-lg ring-1 ring-zinc-200 dark:ring-zinc-800">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-zinc-900 dark:text-zinc-100">
              2FA 双重验证
            </h1>
          <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400">
            输入您的 2FA 密钥，查看当前验证码
          </p>
          </div>

          {/* 记录管理按钮 */}
          <button
            onClick={() => setShowRecords(!showRecords)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-600 rounded-lg font-medium text-sm transition-all shadow-sm hover:shadow-md mb-6 border border-blue-200 dark:border-blue-800"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            我的记录 ({records.length})
          </button>

          {/* 记录列表 */}
          <AnimatePresence>
            {showRecords && records.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden"
              >
                <div className="p-4 space-y-3">
                  {records.map((record) => (
                    <motion.div
                      key={record.id}
                      layout
                      className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg group hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                    >
                      <div className="flex-1">
                        {record.name && record.name !== '未命名' && (
                          <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100 mb-1">
                            {record.name}
                          </div>
                        )}
                        <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                          {record.secret}
                        </div>
                      </div>
                      <button
                        onClick={() => selectRecord(record)}
                        className="px-3 py-1.5 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                      >
                        查看
                      </button>
                      <button
                        onClick={() => deleteRecord(record.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </motion.div>
                  ))}
                </div>

                {/* 删除全部按钮 */}
                <div className="border-t border-zinc-200 dark:border-zinc-700 pt-3">
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg font-medium text-sm transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    删除全部记录
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 删除确认弹窗 */}
          <AnimatePresence>
            {showDeleteConfirm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                onClick={() => setShowDeleteConfirm(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white dark:bg-zinc-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="text-center">
                    <div className="mx-auto mb-4 w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                      确认删除全部记录？
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
                      此操作将删除所有已保存的 2FA 密钥记录，且无法恢复。
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg font-medium text-sm transition-colors"
                      >
                        取消
                      </button>
                      <button
                        onClick={deleteAllRecords}
                        className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors"
                      >
                        确认删除
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm"
            >
              {error}
            </motion.div>
          )}

          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>提示:</strong> 输入您已有的 2FA 密钥，系统将实时生成当前的验证码
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">
                名称 (可选)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={viewSecretName}
                  onChange={(e) => setViewSecretName(e.target.value)}
                  placeholder="例如: Google, GitHub"
                  className="w-full px-4 py-3 pr-10 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                />
                {viewSecretName && (
                  <button
                    type="button"
                    onClick={() => setViewSecretName('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">
                2FA 密钥
              </label>
              <div className="relative">
              <input
                type="text"
                value={viewSecret}
                onChange={(e) => setViewSecret(e.target.value)}
                placeholder="例如: JBSWY3DPEHPK3PXP"
                className="w-full px-4 py-3 pr-10 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all font-mono tracking-wider"
              />
                {viewSecret && (
                  <button
                    type="button"
                    onClick={() => setViewSecret('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {(viewSecret || viewSecretName) && (
              <div className="flex gap-3">
                <button
                  onClick={saveCurrentRecord}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800 hover:bg-zinc-900 text-white rounded-lg font-medium text-sm transition-all shadow-sm hover:shadow-md"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  保存
                </button>
                <button
                  onClick={clearInputs}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 rounded-lg font-medium text-sm transition-all shadow-sm hover:shadow-md"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  清空
                </button>
              </div>
            )}

            {viewSecret && currentCode && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800"
              >
                {viewSecretName && (
                  <div className="text-center mb-4">
                    <span className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                      {viewSecretName}
                    </span>
                  </div>
                )}
                <div className="text-center">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">当前验证码</p>
                  <div className="text-5xl md:text-6xl font-mono font-bold text-zinc-900 dark:text-zinc-100 tracking-[0.2em] mb-4">
                    {currentCode}
                  </div>
                  <button
                    onClick={copyCode}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg font-medium text-sm text-zinc-700 dark:text-zinc-300 transition-all shadow-sm hover:shadow-md mb-4 border border-zinc-200 dark:border-zinc-700"
                  >
                    {copied ? (
                      <>
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        已复制
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        复制验证码
                      </>
                    )}
                  </button>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-32 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                      <motion.div
                        layoutId="progress"
                        animate={{ width: `${(timeRemaining / 30) * 100}%` }}
                        transition={{ duration: 1 }}
                        className="h-full bg-purple-600 dark:bg-purple-400"
                      />
                    </div>
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      {timeRemaining}秒后刷新
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-700">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-sm text-green-800 dark:text-green-200">
                <strong>🔒 隐私保护：</strong>您的 2FA 密钥仅保存在本地浏览器中，不会上传到服务器，确保您的密钥安全。
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
