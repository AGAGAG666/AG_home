import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export async function GET() {
  const blogDir = path.join(process.cwd(), 'app/blog')
  // 目录不存在则返回空数组
  if (!fs.existsSync(blogDir)) {
    return NextResponse.json([])
  }

  const files = fs.readdirSync(blogDir)
  const posts = files
    .filter((file) => file.endsWith('.mdx') || file.endsWith('.md'))
    .map((file) => {
      const filePath = path.join(blogDir, file)
      const source = fs.readFileSync(filePath, 'utf-8')
      const { data } = matter(source)
      const slug = file.replace(/\.mdx?$/, '')
      return {
        slug,
        title: data.title || slug,
        description: data.description || '暂无描述',
      }
    })
  // 按 slug 排序（可按需改为按日期）
  posts.sort((a, b) => a.slug.localeCompare(b.slug))
  return NextResponse.json(posts)
}
