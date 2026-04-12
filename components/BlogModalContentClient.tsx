'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

interface Post {
  slug: string
  title: string
  description: string
}

const POSTS_PER_PAGE = 5

export function BlogModalContentClient() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetch('/api/posts')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data) => {
        setPosts(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('获取博客列表失败:', err)
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const filteredPosts = searchQuery
    ? posts.filter((post) =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : posts

  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE)
  const startIdx = (currentPage - 1) * POSTS_PER_PAGE
  const paginatedPosts = filteredPosts.slice(startIdx, startIdx + POSTS_PER_PAGE)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
  }

  if (loading)
    return (
      <div className="rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-5 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
        加载中...
      </div>
    )

  if (error)
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-5 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
        加载失败：{error}
      </div>
    )

  if (posts.length === 0)
    return (
      <div className="rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-5 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
        暂无博客
      </div>
    )

  return (
    <div className="space-y-4">
      {isSearching ? (
        <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <input
            type="text"
            placeholder="输入标题关键词搜索..."
            value={searchQuery}
            onChange={handleSearch}
            autoFocus
            className="w-full rounded-2xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-400"
          />
          <button
            onClick={() => {
              setIsSearching(false)
              setSearchQuery('')
              setCurrentPage(1)
            }}
            className="mt-2 w-full rounded-2xl bg-zinc-200 px-3 py-2 text-sm text-zinc-700 transition hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            关闭搜索
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsSearching(true)}
          className="w-full rounded-3xl border border-zinc-200 bg-zinc-100 p-4 text-left text-sm text-zinc-700 transition hover:bg-zinc-150 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          <div className="flex items-center justify-between">
            <span className="font-medium">共 {posts.length} 篇文章</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-500">点击搜索 →</span>
          </div>
        </button>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {paginatedPosts.map((post) => (
          <article
            key={post.slug}
            onDoubleClick={() => window.location.href = `/blog/${post.slug}`}
            className="group cursor-pointer overflow-hidden rounded-3xl border border-zinc-200 bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
          >
            <h3 className="text-base font-semibold text-zinc-900 transition-colors group-hover:text-zinc-950 dark:text-zinc-100 dark:group-hover:text-white">
              <Link href={`/blog/${post.slug}`} className="block">
                {post.title}
              </Link>
            </h3>
            <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              {post.description}
            </p>
            <div className="mt-4 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span className="rounded-full border border-zinc-200 bg-zinc-100 px-2 py-1 dark:border-zinc-800 dark:bg-zinc-900">
                阅读详情
              </span>
              <span className="font-mono text-[11px] text-zinc-400 dark:text-zinc-500">{post.slug}</span>
            </div>
          </article>
        ))}
      </div>

      {filteredPosts.length > POSTS_PER_PAGE && (
        <div className="flex items-center justify-between rounded-3xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-1 text-sm text-zinc-700 transition disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
          >
            ← 上一页
          </button>
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-1 text-sm text-zinc-700 transition disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
          >
            下一页 →
          </button>
        </div>
      )}
    </div>
  )
}
