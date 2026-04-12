import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'

interface BlogPostProps {
  params: Promise<{ slug: string }>
}

export default async function BlogPost({ params }: BlogPostProps) {
  const { slug } = await params
  const blogDir = path.join(process.cwd(), 'app/blog')
  const filePath = path.join(blogDir, `${slug}.md`)

  if (!fs.existsSync(filePath)) {
    return <div>文章不存在: {slug}</div>
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(fileContent)

  return (
    <article className="animate-fade-in-up-delayed prose prose-gray max-w-none px-4 dark:prose-invert md:px-0">
      <h1>{data.title || slug}</h1>
      {data.description && <p className="lead">{data.description}</p>}
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          img: ({ src, alt }) => {
            const srcStr = typeof src === 'string' ? src : '';
            const finalSrc = srcStr.startsWith('/') ? srcStr : `/${srcStr}`;
            return <img src={finalSrc} alt={alt} style={{ maxWidth: '100%', height: 'auto' }} />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  )
}

export async function generateStaticParams() {
  const blogDir = path.join(process.cwd(), 'app/blog')
  if (!fs.existsSync(blogDir)) return []
  const files = fs.readdirSync(blogDir)
  return files
    .filter((file) => file.endsWith('.md'))
    .map((file) => ({ slug: file.replace(/\.md$/, '') }))
}