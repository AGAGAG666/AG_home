'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

interface Post {
  slug: string
  title: string
  description: string
  date: string | null
  cover: string | null
  tags: string[]
}

type ViewMode = 'list' | 'archive' | 'tags'

const POSTS_PER_PAGE = 5

export function BlogModalContentClient() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

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
        post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
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

  // 归档视图：按日期分组
  const groupedPosts = filteredPosts.reduce((groups, post) => {
    if (!post.date) {
      if (!groups['未分类']) groups['未分类'] = []
      groups['未分类'].push(post)
      return groups
    }
    
    const date = new Date(post.date)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const key = `${year}-${month}-${day}`
    
    if (!groups[key]) groups[key] = []
    groups[key].push(post)
    return groups
  }, {} as Record<string, Post[]>)

  // 按日期排序（从新到旧）
  const sortedDates = Object.keys(groupedPosts).sort((a, b) => {
    if (a === '未分类') return 1
    if (b === '未分类') return -1
    return b.localeCompare(a)
  })

  // 提取年份用于归档视图显示
  const getYearFromKey = (key: string) => {
    if (key === '未分类') return null
    return key.split('-')[0]
  }

  // 标签统计：计算每个标签的文章数量
  const tagCounts = posts.reduce((counts, post) => {
    post.tags.forEach(tag => {
      counts[tag] = (counts[tag] || 0) + 1
    })
    return counts
  }, {} as Record<string, number>)

  // 获取所有标签（去重并排序）
  const allTags = Object.keys(tagCounts).sort()

  // 标签视图的筛选逻辑
  const tagViewFilteredPosts = selectedTag
    ? filteredPosts.filter(post => post.tags.includes(selectedTag))
    : filteredPosts

  // 切换标签筛选
  const handleTagClick = (tag: string) => {
    setSelectedTag(selectedTag === tag ? null : tag)
    setCurrentPage(1)
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
      {/* 视图切换按钮 */}
      <div className="flex gap-2">
        <button
          onClick={() => setViewMode('list')}
          className={`flex-1 rounded-2xl px-3 py-2 text-sm transition ${
            viewMode === 'list'
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
              : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
          }`}
        >
          列表
        </button>
        <button
          onClick={() => setViewMode('archive')}
          className={`flex-1 rounded-2xl px-3 py-2 text-sm transition ${
            viewMode === 'archive'
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
              : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
          }`}
        >
          归档
        </button>
        <button
          onClick={() => setViewMode('tags')}
          className={`flex-1 rounded-2xl px-3 py-2 text-sm transition ${
            viewMode === 'tags'
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
              : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
          }`}
        >
          标签
        </button>
      </div>

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

      {/* 列表视图 */}
      {viewMode === 'list' && (
        <>
          <div className="grid grid-cols-1 gap-4">
            {paginatedPosts.map((post) => (
              <article
                key={post.slug}
                onDoubleClick={() => window.location.href = `/blog/${post.slug}`}
                className="group cursor-pointer overflow-hidden rounded-3xl border border-zinc-200 bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
              >
                {post.cover && (
                  <div className="mb-4 overflow-hidden rounded-2xl">
                    <img
                      src={post.cover}
                      alt={post.title}
                      className="w-full h-48 object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                  </div>
                )}
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
        </>
      )}

      {/* 归档视图 */}
      {viewMode === 'archive' && (
        <div className="space-y-6">
          {sortedDates.map((dateKey) => {
            const year = getYearFromKey(dateKey)
            const posts = groupedPosts[dateKey]
            
            return (
              <div key={dateKey}>
                {/* 年份标题 */}
                {year && (
                  <h3 className="mb-3 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                    {year}
                  </h3>
                )}
                
                {/* 日期和文章 */}
                <div className="ml-4 space-y-3">
                  <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    {dateKey === '未分类' ? '未分类' : dateKey.slice(5)}
                  </div>
                  
                  {posts.map((post) => (
                    <Link
                      key={post.slug}
                      href={`/blog/${post.slug}`}
                      className="block rounded-xl border border-zinc-200 bg-white p-3 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
                    >
                      <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {post.title}
                      </h4>
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                        {post.description}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 标签视图 */}
      {viewMode === 'tags' && (
        <div className="space-y-6">
          {allTags.length === 0 ? (
            <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
              暂无标签
            </div>
          ) : (
            <>
              {/* 标签列表 */}
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className={`rounded-full px-3 py-1 text-xs transition ${
                      selectedTag === tag
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                        : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {tag}{tagCounts[tag] > 1 ? ` ${tagCounts[tag]}` : ''}
                  </button>
                ))}
                {selectedTag && (
                  <button
                    onClick={() => setSelectedTag(null)}
                    className="rounded-full bg-red-100 px-3 py-1 text-xs text-red-700 transition hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                  >
                    清除筛选
                  </button>
                )}
              </div>

              {/* 选中标签后的文章列表 */}
              {selectedTag && (
                <div className="space-y-2">
                  {tagViewFilteredPosts.length === 0 ? (
                    <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
                      暂无相关文章
                    </div>
                  ) : (
                    tagViewFilteredPosts.map((post) => (
                      <Link
                        key={post.slug}
                        href={`/blog/${post.slug}`}
                        className="block rounded-xl border border-zinc-200 bg-white p-3 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
                      >
                        <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {post.title}
                        </h4>
                        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                          {post.description}
                        </p>
                      </Link>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
