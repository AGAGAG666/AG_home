'use client'

import React from 'react'
import { Magnetic } from './ui/magnetic'

interface MagneticWrapperProps {
  children: React.ReactNode
  springOptions?: { bounce?: number }
  intensity?: number
}

export default function MagneticWrapper({
  children,
  springOptions,
  intensity,
}: MagneticWrapperProps) {
  return (
    <Magnetic springOptions={springOptions} intensity={intensity}>
      {children}
    </Magnetic>
  )
}
