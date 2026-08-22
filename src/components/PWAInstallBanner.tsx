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
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border border-[#F3F4F6] shadow-[0_12px_32px_rgba(15,23,42,0.10)]">
            <div className="w-9 h-9 rounded-xl bg-[#f5c518] flex items-center justify-center shrink-0 shadow-sm">
              <Download className="w-4 h-4 text-black" />
            </div>

            <div className="flex-1 min-w-0 text-left">
              <p className="text-[11px] font-bold text-[#1A1A1A] leading-tight">
                Instalar Movie Match
              </p>
              <p className="text-[10px] text-neutral-500 leading-snug mt-0.5">
                Agregar a tu pantalla de inicio para acceso rápido.
              </p>
            </div>

            <button
              onClick={handleInstall}
              className="shrink-0 px-3 py-1.5 rounded-xl bg-[#f5c518] hover:bg-amber-400 text-[10px] font-black text-black transition-all active:scale-95 cursor-pointer shadow-sm"
            >
              Instalar
            </button>

            <button
              onClick={() => setVisible(false)}
              aria-label="Cerrar banner de instalación"
              className="shrink-0 p-1.5 rounded-xl text-neutral-400 hover:text-[#1A1A1A] transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
