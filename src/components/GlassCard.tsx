'use client'

import React from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'className'> {
  children: React.ReactNode
  className?: string
  hoverable?: boolean
  delay?: number
}

export default function GlassCard({
  children,
  className,
  hoverable = false,
  delay = 0,
  ...props
}: GlassCardProps) {
  // If hoverable is true, apply spring scaling and subtle hover glow transitions
  const animationProps = hoverable
    ? {
        whileHover: { 
          scale: 1.02, 
          y: -4, 
          backgroundColor: "rgba(255, 255, 255, 0.12)",
          borderColor: "rgba(255, 255, 255, 0.28)",
          boxShadow: "0 20px 40px 0 rgba(0, 0, 0, 0.35)"
        },
        whileTap: { 
          scale: 0.98,
          y: 0,
          backgroundColor: "rgba(255, 255, 255, 0.08)"
        },
        transition: { type: "spring" as const, stiffness: 400, damping: 25 }
      }
    : {}

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay, ease: "easeOut" }}
      className={cn(
        "bg-white/10 backdrop-blur-md border border-white/20 shadow-xl rounded-3xl p-6",
        "dark:bg-slate-900/35 dark:border-white/10 dark:shadow-2xl",
        "transition-colors duration-300",
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
