'use client'

import { motion } from 'framer-motion'

export default function LiquidBackground() {
  return (
    <div className="absolute inset-0 -z-20 overflow-hidden bg-[#050508] pointer-events-none">
      {/* Primary ambient lighting overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(30,41,59,0.2),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(15,23,42,0.35),transparent)]" />
      
      {/* Liquid Blobs */}
      {/* Blob 1: Soft Blue */}
      <motion.div
        animate={{
          x: [0, 40, -30, 0],
          y: [0, -60, 50, 0],
          scale: [1, 1.15, 0.9, 1],
        }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -top-[10%] -left-[10%] w-[85%] aspect-square rounded-full bg-blue-500/10 blur-[90px] md:blur-[110px]"
      />

      {/* Blob 2: Amber */}
      <motion.div
        animate={{
          x: [0, -50, 30, 0],
          y: [0, 40, -60, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-[35%] -right-[25%] w-[90%] aspect-square rounded-full bg-amber-500/08 blur-[100px] md:blur-[120px]"
      />

      {/* Blob 3: Soft Orange */}
      <motion.div
        animate={{
          x: [0, 35, -45, 0],
          y: [0, 70, -35, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -bottom-[15%] left-[5%] w-[80%] aspect-square rounded-full bg-orange-500/09 blur-[95px] md:blur-[115px]"
      />

      {/* Blob 4: Soft White / Cyan */}
      <motion.div
        animate={{
          x: [0, -25, 25, 0],
          y: [0, -35, 45, 0],
          scale: [1, 1.1, 0.85, 1],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-[10%] left-[25%] w-[65%] aspect-square rounded-full bg-cyan-100/06 blur-[80px] md:blur-[100px]"
      />
    </div>
  )
}
