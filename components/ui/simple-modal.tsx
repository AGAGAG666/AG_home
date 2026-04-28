'use client'

import React, { useRef, RefObject, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import useClickOutside from '@/hooks/useClickOutside'

interface SimpleModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
}

export function SimpleModal({
  isOpen,
  onClose,
  children,
  className,
}: SimpleModalProps) {
  const [mounted, setMounted] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  useClickOutside(modalRef as RefObject<HTMLElement>, onClose)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  /*动画速度*/
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={cn(
              'relative flex max-h-[80vh] max-w-[90vw] flex-col rounded-lg bg-white p-6 shadow-lg dark:bg-zinc-900',
              className,
            )}
          >
            <div className="min-h-0 flex-1 overflow-auto">
              {children}
            </div>
            <button
              onClick={onClose}
              className="absolute right-2 top-2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              ✕
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
