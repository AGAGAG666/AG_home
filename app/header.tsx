'use client'
import { TextEffect } from '@/components/ui/text-effect'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Header() {
  const pathname = usePathname()

  // 博客列表独立页面不显示站点标题
  if (pathname === '/blog') return null

  return (
    <header className="mb-6 flex items-center justify-between md:mb-8">
      <div>
        <Link
          href="/"
          className="animate-fade-in-delayed text-xl font-medium text-black dark:text-white md:text-2xl"
        >
          AGAGAG666
        </Link>
        <TextEffect
          as="p"
          preset="fade"
          per="char"
          className="text-sm text-zinc-600 dark:text-zinc-500 md:text-lg"
          delay={0.5}
        >
          学生
        </TextEffect>
      </div>
    </header>
  )
}
