'use client'

import { Share2, Check } from 'lucide-react'
import { useState } from 'react'

interface ShareRoomButtonProps {
  token: string
  roomName: string
}

export default function ShareRoomButton({ token, roomName }: ShareRoomButtonProps) {
  const [copied, setCopied] = useState(false)

  const shareRoom = async () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || 'https://cinematch-five-mu.vercel.app')
    const url = `${origin}/rooms/join?token=${encodeURIComponent(token)}`
    const shareData = {
      title: `Sala ${roomName}`,
      text: `Únete a mi sala de Movie Match: ${roomName}`,
      url,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
        return
      } catch (err) {
        // Fallback to clipboard if share is cancelled or fails
      }
    }

    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={() => void shareRoom()}
      aria-label="Compartir enlace de la sala"
      className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-[#f5c518] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider text-black transition-colors hover:bg-amber-400 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#f5c518] shadow-sm min-w-[90px] justify-center"
    >
      {copied ? <Check className="h-3 w-3 text-black" /> : <Share2 className="h-3 w-3 text-black" />}
      {copied ? '¡Copiado!' : 'Compartir'}
    </button>
  )
}
