'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PWAInstallBanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
      setVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!prompt) return
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="fixed bottom-6 inset-x-4 z-50 max-w-md mx-auto"
        >
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#0d0d14]/80 backdrop-blur-xl border border-white/10 shadow-2xl">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500/30 to-amber-400/30 border border-white/10 flex items-center justify-center shrink-0">
              <Download className="w-4 h-4 text-slate-200" />
            </div>

            <div className="flex-1 min-w-0 text-left">
              <p className="text-[11px] font-bold text-slate-100 leading-tight">
                Instalar Movie Match
              </p>
              <p className="text-[10px] text-slate-400 leading-snug mt-0.5">
                Agregar a tu pantalla de inicio para acceso rápido.
              </p>
            </div>

            <button
              onClick={handleInstall}
              className="shrink-0 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-500/20 to-amber-500/20 border border-white/10 text-[10px] font-black text-slate-100 hover:border-white/20 transition-all active:scale-95 cursor-pointer"
            >
              Instalar
            </button>

            <button
              onClick={() => setVisible(false)}
              className="shrink-0 p-1.5 rounded-xl text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
