'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'

interface MarkdownContentProps {
  content: string
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkBreaks]}
      components={{
        img: ({ src, alt }) => {
          const srcStr = typeof src === 'string' ? src : '';
          const finalSrc = srcStr.startsWith('/') ? srcStr : `/${srcStr}`;
          return (
            <img 
              src={finalSrc} 
              alt={alt} 
              style={{ maxWidth: '100%', height: 'auto', cursor: 'pointer' }}
              onClick={() => {
                window.dispatchEvent(new CustomEvent('open-image-viewer', {
                  detail: { src: finalSrc, alt: alt || '' }
                }))
              }}
            />
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
