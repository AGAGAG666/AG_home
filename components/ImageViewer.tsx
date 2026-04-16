'use client'

import { useEffect, useState, useRef } from 'react'

export function ImageViewer() {
  const [isOpen, setIsOpen] = useState(false)
  const [imageSrc, setImageSrc] = useState('')
  const [imageAlt, setImageAlt] = useState('')
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  
  // 双指缩放相关状态
  const initialDistance = useRef<number>(0)
  const initialScale = useRef<number>(1)
  const lastTouchPosition = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const handleOpenImage = (e: CustomEvent<{ src: string; alt: string }>) => {
      setImageSrc(e.detail.src)
      setImageAlt(e.detail.alt)
      setScale(1)
      setPosition({ x: 0, y: 0 })
      setIsOpen(true)
    }

    window.addEventListener('open-image-viewer', handleOpenImage as EventListener)
    
    return () => {
      window.removeEventListener('open-image-viewer', handleOpenImage as EventListener)
    }
  }, [])

  // 键盘缩放支持
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '+' || e.key === '=') {
        setScale(prev => Math.min(prev + 0.2, 5))
      } else if (e.key === '-' || e.key === '_') {
        setScale(prev => Math.max(prev - 0.2, 0.2))
      } else if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // 双指缩放手势
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault()
      initialDistance.current = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      )
      initialScale.current = scale
    } else if (e.touches.length === 1 && scale > 1) {
      // 单指拖动（仅在放大时）
      lastTouchPosition.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      }
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault()
      const currentDistance = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      )
      const newScale = Math.min(Math.max(initialScale.current * (currentDistance / initialDistance.current), 0.2), 5)
      setScale(newScale)
    } else if (e.touches.length === 1 && scale > 1 && lastTouchPosition.current) {
      // 单指拖动平移
      e.preventDefault()
      const deltaX = e.touches[0].clientX - lastTouchPosition.current.x
      const deltaY = e.touches[0].clientY - lastTouchPosition.current.y
      setPosition(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }))
      lastTouchPosition.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      }
    }
  }

  const handleTouchEnd = () => {
    lastTouchPosition.current = null
  }

  if (!isOpen) return null

  return (
    <dialog
      open
      className="fixed inset-0 z-50 m-0 w-full h-full bg-black/80 backdrop-blur-sm p-0"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setIsOpen(false)
        }
      }}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {/* 缩放控制按钮 - 固定在视口右上角 */}
        <div className="fixed right-4 top-4 z-[60] flex gap-2">
          <button
            onClick={() => setScale(prev => Math.min(prev + 0.2, 5))}
            className="rounded-full bg-white p-2 text-zinc-900 shadow-lg transition hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
            title="放大 (+)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
          <button
            onClick={() => setScale(prev => Math.max(prev - 0.2, 0.2))}
            className="rounded-full bg-white p-2 text-zinc-900 shadow-lg transition hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
            title="缩小 (-)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-full bg-white p-2 text-zinc-900 shadow-lg transition hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
            title="关闭 (ESC)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* 缩放提示 */}
        <div className="fixed left-4 top-4 z-[60] rounded-full bg-black/50 px-3 py-1 text-xs text-white backdrop-blur-sm">
          {Math.round(scale * 100)}%
        </div>

        {/* 图片容器 */}
        <div
          className="flex items-center justify-center touch-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <img
            src={imageSrc}
            alt={imageAlt}
            style={{
              maxHeight: '85vh',
              maxWidth: '85vw',
              objectFit: 'contain',
              transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
              transition: scale === 1 ? 'transform 0.2s ease-out' : 'none',
              cursor: scale > 1 ? 'grab' : 'default',
              userSelect: 'none',
            }}
            draggable={false}
          />
        </div>
      </div>
    </dialog>
  )
}
