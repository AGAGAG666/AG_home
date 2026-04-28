'use client'

import { BlogModalContentClient } from '@/components/BlogModalContentClient'
import { TextEffect } from '@/components/ui/text-effect'
import { motion } from 'motion/react'

const VARIANTS_CONTAINER = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const VARIANTS_SECTION = {
  hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
}

const TRANSITION_SECTION = {
  duration: 0.3,
}

export default function BlogListPage() {
  return (
    <motion.div
      className="mx-auto max-w-2xl px-4 pb-16 md:px-0 [&_a]:!text-inherit [&_a]:no-underline [&_h3]:mt-0 [&_h4]:m-0 [&_p]:mb-0"
      variants={VARIANTS_CONTAINER}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="mb-6"
        variants={VARIANTS_SECTION}
        transition={TRANSITION_SECTION}
      >
        <TextEffect
          as="h1"
          preset="fade"
          per="char"
          className="text-xl font-semibold text-zinc-900 dark:text-zinc-100"
          delay={0.5}
        >
          随便写写
        </TextEffect>
      </motion.div>
      <motion.div
        variants={VARIANTS_SECTION}
        transition={TRANSITION_SECTION}
      >
        <BlogModalContentClient />
      </motion.div>
    </motion.div>
  )
}
