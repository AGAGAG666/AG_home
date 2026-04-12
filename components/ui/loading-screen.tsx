'use client';

import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  onComplete?: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // 0.8秒内从0到100的进度动画,由快到慢
    const duration = 800; // 0.8秒
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const linearProgress = Math.min(elapsed / duration, 1);
      
      // 使用 ease-out 曲线,开始快,后面慢
      // quadratic ease-out: 1 - (1-t)^2
      const easedProgress = 1 - Math.pow(1 - linearProgress, 2);
      const newProgress = easedProgress * 100;
      
      setProgress(newProgress);

      if (newProgress < 100) {
        requestAnimationFrame(animate);
      } else {
        // 进度完成后,等待一小段时间再淡出
        setTimeout(() => {
          setIsComplete(true);
          setTimeout(() => {
            onComplete?.();
          }, 300); // 淡出动画时间
        }, 200);
      }
    };

    requestAnimationFrame(animate);
  }, [onComplete]);

  return (
    <motion.div
      data-component="loading-screen"
      initial={{ opacity: 1 }}
      animate={{ opacity: isComplete ? 0 : 1 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-zinc-950 loading-screen-container"
      data-loading-screen="true"
    >
      {/* 居中的圆角长方形容器 */}
      <motion.div
        data-component="loading-container"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          duration: 0.4,
          ease: [0.16, 1, 0.3, 1]
        }}
        className="w-[320px] sm:w-[360px] md:w-[400px] p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-900 shadow-xl border border-zinc-200 dark:border-zinc-800 loading-screen-content"
        data-loading-content="true"
      >
        {/* AG Logo - 纯文字风格,字母依次出现 */}
        <motion.div
          className="flex justify-center mb-5"
        >
          <div className="relative flex items-baseline">
            {/* 外发光效果 */}
            <div className="absolute inset-0 bg-blue-500 blur-xl opacity-40"></div>
            
            {/* A 字母 */}
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                delay: 0.05, 
                duration: 0.2,
                ease: [0.34, 1.56, 0.64, 1] // elastic easing
              }}
              className="relative text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400 tracking-tight"
            >
              A
            </motion.span>
            
            {/* G 字母 */}
            <motion.span
              initial={{ opacity: 0, scale: 0.5, x: -5 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ 
                delay: 0.15, 
                duration: 0.2,
                ease: [0.34, 1.56, 0.64, 1] // elastic easing
              }}
              className="relative text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400 tracking-tight"
            >
              G
            </motion.span>
            
            {/* v1 字样 */}
            <motion.span
              initial={{ opacity: 0, scale: 0.5, x: -3 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ 
                delay: 0.25, 
                duration: 0.2,
                ease: [0.34, 1.56, 0.64, 1] // elastic easing
              }}
              className="relative text-4xl font-bold text-blue-500 ml-1 align-super"
            >
              v1
            </motion.span>
          </div>
        </motion.div>

        {/* 进度条背景 */}
        <div className="relative h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
          {/* 进度条填充 - 循环渐变动画 */}
          <motion.div
            className="absolute left-0 top-0 h-full rounded-full"
            style={{ 
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #1e40af, #3b82f6, #60a5fa, #3b82f6, #1e40af)',
              backgroundSize: '200% 100%',
            }}
            animate={{
              backgroundPosition: ['0% 0%', '100% 0%', '0% 0%']
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
