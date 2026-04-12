'use client'
import { ScrollProgress } from '@/components/ui/scroll-progress'
import Link from 'next/link'

export default function LayoutBlogPost({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <div className="pointer-events-none fixed left-0 top-0 z-10 h-12 w-full bg-gray-100 to-transparent backdrop-blur-xl [-webkit-mask-image:linear-gradient(to_bottom,black,transparent)] dark:bg-zinc-950" />
      <ScrollProgress
        className="fixed top-0 z-20 h-0.5 bg-gray-300 dark:bg-zinc-600"
        springOptions={{
          bounce: 0,
        }}
      />

      {/* 返回键使用首页相同的按钮样式 */}
<div className="absolute left-4 top-32 md:top-40 animate-fade-in-up-delayed">
  <Link
    href="/"
    onClick={() => {
      // 设置标记,表示从博客页面返回主页
      sessionStorage.setItem('skipLoadingAnimation', 'true');
    }}
    className="group relative inline-flex shrink-0 items-center gap-[1px] rounded-full bg-zinc-100 px-2 md:px-2.5 py-1 text-xs md:text-sm text-black transition-colors duration-200 hover:bg-zinc-950 hover:text-zinc-50 active:bg-zinc-950 active:text-zinc-50 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 dark:active:bg-zinc-700"
  >
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 rotate-180">
      <path d="M3.64645 11.3536C3.45118 11.1583 3.45118 10.8417 3.64645 10.6465L10.2929 4L6 4C5.72386 4 5.5 3.77614 5.5 3.5C5.5 3.22386 5.72386 3 6 3L11.5 3C11.6326 3 11.7598 3.05268 11.8536 3.14645C11.9473 3.24022 12 3.36739 12 3.5L12 9.00001C12 9.27615 11.7761 9.50001 11.5 9.50001C11.2239 9.50001 11 9.27615 11 9.00001V4.70711L4.35355 11.3536C4.15829 11.5488 3.84171 11.5488 3.64645 11.3536Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/>
    </svg>
    返回
  </Link>
</div>

      {/* 添加响应式内边距，手机端留白，电脑端无额外内边距 */}
      <main className="prose prose-gray mt-24 pb-8 px-4 md:px-0 prose-h4:prose-base dark:prose-invert prose-h1:text-xl prose-h1:font-medium prose-h2:mt-12 prose-h2:scroll-m-20 prose-h2:text-lg prose-h2:font-medium prose-h3:text-base prose-h3:font-medium prose-h4:text-base prose-h4:font-medium prose-h5:text-base prose-h5:font-medium prose-h6:text-base prose-h6:font-medium prose-strong:font-medium">
        {children}
      </main>
    </>
  )
}