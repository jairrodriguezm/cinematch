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

export default function ContentCard({
  children,
  className,
  hoverable = false,
  delay = 0,
  ...props
}: ContentCardProps) {
  const animationProps = hoverable
    ? {
        whileHover: { 
          y: -2,
          boxShadow: "0 14px 35px rgba(0, 0, 0, 0.07)",
        },
        whileTap: { 
          scale: 0.99,
        },
        transition: { type: "spring" as const, stiffness: 400, damping: 25 }
      }
    : {}

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: delay, ease: "easeOut" }}
      className={cn(
        "bg-white border border-[#F3F4F6] shadow-[0_10px_30px_rgba(0,0,0,0.05)] rounded-2xl p-5",
        "transition-all duration-200",
        hoverable && "cursor-pointer select-none",
        className
      )}
      {...animationProps}
      {...props}
    >
      {children}
    </motion.div>
  )
}
