'use client';

import Image from 'next/image';
import { BlogModalContentClient } from '@/components/BlogModalContentClient';
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Magnetic } from '@/components/ui/magnetic';
import { SimpleModal } from '@/components/ui/simple-modal';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { EMAIL, SOCIAL_LINKS, PROJECTS, BLOGS } from './data';
import { CONFIG } from './toggle/config';

const VARIANTS_CONTAINER = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const VARIANTS_SECTION = {
  hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
};

const TRANSITION_SECTION = {
  duration: 0.3,
};

function MagneticSocialLink({
  children,
  link,
}: {
  children: React.ReactNode;
  link: string;
}) {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    setIsMobile(window.matchMedia('(max-width: 768px)').matches);
  }, []);

  // 移动端直接用 a 标签，避免向 Fragment 传递多余 props
  if (isMobile) {
    return (
      <a
        href={link}
        className="group relative inline-flex shrink-0 items-center gap-[1px] rounded-full bg-zinc-100 px-2 md:px-2.5 py-1 text-xs md:text-sm text-black transition-colors duration-200 hover:bg-zinc-950 hover:text-zinc-50 active:bg-zinc-950 active:text-zinc-50 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 dark:active:bg-zinc-700"
      >
        {children}
        <svg
          width="15"
          height="15"
          viewBox="0 0 15 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-3 w-3"
        >
          <path
            d="M3.64645 11.3536C3.45118 11.1583 3.45118 10.8417 3.64645 10.6465L10.2929 4L6 4C5.72386 4 5.5 3.77614 5.5 3.5C5.5 3.22386 5.72386 3 6 3L11.5 3C11.6326 3 11.7598 3.05268 11.8536 3.14645C11.9473 3.24022 12 3.36739 12 3.5L12 9.00001C12 9.27615 11.7761 9.50001 11.5 9.50001C11.2239 9.50001 11 9.27615 11 9.00001V4.70711L4.35355 11.3536C4.15829 11.5488 3.84171 11.5488 3.64645 11.3536Z"
            fill="currentColor"
            fillRule="evenodd"
            clipRule="evenodd"
          />
        </svg>
      </a>
    );
  }

  // 非移动端使用磁吸效果组件
  return (
    <Magnetic springOptions={{ bounce: 0 }} intensity={0.3}>
      <a
        href={link}
        className="group relative inline-flex shrink-0 items-center gap-[1px] rounded-full bg-zinc-100 px-2 md:px-2.5 py-1 text-xs md:text-sm text-black transition-colors duration-200 hover:bg-zinc-950 hover:text-zinc-50 active:bg-zinc-950 active:text-zinc-50 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 dark:active:bg-zinc-700"
      >
        {children}
        <svg
          width="15"
          height="15"
          viewBox="0 0 15 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-3 w-3"
        >
          <path
            d="M3.64645 11.3536C3.45118 11.1583 3.45118 10.8417 3.64645 10.6465L10.2929 4L6 4C5.72386 4 5.5 3.77614 5.5 3.5C5.5 3.22386 5.72386 3 6 3L11.5 3C11.6326 3 11.7598 3.05268 11.8536 3.14645C11.9473 3.24022 12 3.36739 12 3.5L12 9.00001C12 9.27615 11.7761 9.50001 11.5 9.50001C11.2239 9.50001 11 9.27615 11 9.00001V4.70711L4.35355 11.3536C4.15829 11.5488 3.84171 11.5488 3.64645 11.3536Z"
            fill="currentColor"
            fillRule="evenodd"
            clipRule="evenodd"
          />
        </svg>
      </a>
    </Magnetic>
  );
}

function MagneticButton({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    setIsMobile(window.matchMedia('(max-width: 768px)').matches);
  }, []);

  // 移动端直接用 button 标签
  if (isMobile) {
    return (
      <button
        onClick={onClick}
        className={className}
      >
        {children}
      </button>
    );
  }

  // 非移动端使用磁吸效果
  return (
    <Magnetic springOptions={{ bounce: 0 }} intensity={0.3}>
      <button
        onClick={onClick}
        className={className}
      >
        {children}
      </button>
    </Magnetic>
  );
}

export default function Personal() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(CONFIG.showLoadingAnimation);

  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('modal') === 'open') {
      setIsModalOpen(true);
    }
  }, []);

  React.useEffect(() => {
    const skipLoading = sessionStorage.getItem('skipLoadingAnimation');
    
    if (skipLoading === 'true') {
      sessionStorage.removeItem('skipLoadingAnimation');
      setIsLoading(false);
      return;
    }
    
    const navigationEntries = performance.getEntriesByType('navigation');
    
    if (navigationEntries.length > 0) {
      const nav = navigationEntries[0] as PerformanceNavigationTiming;
      
      if (nav.type === 'back_forward') {
        const referrer = document.referrer;
        if (referrer.includes('/2fa') || referrer.includes('/blog')) {
          setIsLoading(false);
          return;
        }
      }
    }
  }, []);
  if (isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} />;
  }

  const filteredProjects = PROJECTS.filter(project => {
    if (project.link === '/2fa') {
      return CONFIG.show2FAPage;
    }
    return true;
  });

  return (
    <motion.main
      className="space-y-16 md:space-y-24"
      variants={VARIANTS_CONTAINER}
      initial="hidden"
      animate="visible"
    >
      <motion.section
        variants={VARIANTS_SECTION}
        transition={TRANSITION_SECTION}
      >
        <div className="flex flex-col-reverse gap-4 md:flex-row md:gap-8 md:items-start">
          <div className="flex-1">
            <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
              一只喜欢听歌和玩游戏的小可爱，偶尔琢磨一些有趣的小东西呢～ ( ´▽`) <br/>
              热爱交流，与你互动时会竭尽温柔 (˃ ᗝ ˂) <br/>
              甜食爱好者，绝对讨厌苦苦的味道！！！ (´；ω；`) <br/>
              欢迎来一起探索有趣的想法吧！✨ ( ´▽` )
            </p>
          </div>

          <div className="shrink-0">
            <Image
              src="/avatar.jpg"
              alt="用户头像"
              width={128}
              height={128}
              className="w-24 h-24 md:w-32 md:h-32 rounded-xl object-cover ring-1 ring-zinc-200 dark:ring-zinc-800"
            />
          </div>
        </div>
      </motion.section>

      <motion.section
         variants={VARIANTS_SECTION}
         transition={TRANSITION_SECTION}
      >
        <h3 className="mb-4 md:mb-5 text-base md:text-lg font-medium">📚 文章...喵?</h3>
        <div className="flex flex-wrap gap-2 md:gap-3 max-w-4xl">
          {BLOGS.map((blog) => (
            blog.link === '#' ? (
              <MagneticButton
                key={blog.name}
                onClick={() => setIsModalOpen(true)}
                className="group relative inline-flex shrink-0 items-center gap-[1px] rounded-full bg-zinc-100 px-2 md:px-2.5 py-1 text-xs md:text-sm text-black transition-colors duration-200 hover:bg-zinc-950 hover:text-zinc-50 active:bg-zinc-950 active:text-zinc-50 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 dark:active:bg-zinc-700"
              >
                <span className="font-medium text-sm md:text-base">{blog.name}</span>
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3"
                >
                  <path
                    d="M3.64645 11.3536C3.45118 11.1583 3.45118 10.8417 3.64645 10.6465L10.2929 4L6 4C5.72386 4 5.5 3.77614 5.5 3.5C5.5 3.22386 5.72386 3 6 3L11.5 3C11.6326 3 11.7598 3.05268 11.8536 3.14645C11.9473 3.24022 12 3.36739 12 3.5L12 9.00001C12 9.27615 11.7761 9.50001 11.5 9.50001C11.2239 9.50001 11 9.27615 11 9.00001V4.70711L4.35355 11.3536C4.15829 11.5488 3.84171 11.5488 3.64645 11.3536Z"
                    fill="currentColor"
                    fillRule="evenodd"
                    clipRule="evenodd"
                  />
                </svg>
              </MagneticButton>
            ) : (
              <MagneticSocialLink key={blog.name} link={blog.link}>
                <span className="font-medium text-sm md:text-base">{blog.name}</span>
              </MagneticSocialLink>
            )
          ))}
        </div>
      </motion.section>
       <SimpleModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <h2 className="text-lg font-semibold mb-4">博客列表</h2>
          <BlogModalContentClient />
       </SimpleModal>

      <motion.section
        variants={VARIANTS_SECTION}
        transition={TRANSITION_SECTION}
      >
        <h3 className="mb-4 md:mb-5 text-base md:text-lg font-medium">✨ 小玩意…?</h3>
        <div className="flex flex-wrap gap-2 md:gap-3 max-w-4xl">
          {filteredProjects.map((project) => (
            <MagneticSocialLink key={project.name} link={project.link}>
              <span className="font-medium text-sm md:text-base">{project.name}</span>
            </MagneticSocialLink>
          ))}
        </div>
      </motion.section>

      <motion.section
        variants={VARIANTS_SECTION}
        transition={TRANSITION_SECTION}
      >
        <h3 className="mb-4 md:mb-5 text-base md:text-lg font-medium">💌 与我联系</h3>
        <p className="mb-4 md:mb-5 text-sm md:text-base text-zinc-600 dark:text-zinc-400 break-all">
          邮箱：
          <a
            className="underline dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100"
            href={`mailto:${EMAIL}`}
          >
            {EMAIL}
          </a>
        </p>
        <div className="flex flex-wrap items-center justify-start gap-2 md:gap-3">
          {SOCIAL_LINKS.map((link) => (
            <MagneticSocialLink key={link.label} link={link.link}>
              <span className="text-xs md:text-sm">{link.label}</span>
            </MagneticSocialLink>
          ))}
        </div>
      </motion.section>

    </motion.main>
  );
}
