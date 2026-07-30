'use client'

import React from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ContentCardProps extends Omit<HTMLMotionProps<'div'>, 'className'> {
  children: React.ReactNode
  className?: string
  hoverable?: boolean
  delay?: number
}

export default function ContentCard({ children, className, hoverable = false, delay = 0, ...props }: ContentCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: 'easeOut' }}
      whileHover={hoverable ? { y: -2, boxShadow: '0 18px 40px rgba(15, 23, 42, 0.09)' } : undefined}
      whileTap={hoverable ? { scale: 0.99 } : undefined}
      className={cn(
        'rounded-3xl border border-neutral-200/70 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-shadow duration-200',
        hoverable && 'cursor-pointer select-none',
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}
