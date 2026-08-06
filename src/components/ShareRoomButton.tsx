'use client'

import { Share2 } from 'lucide-react'

interface ShareRoomButtonProps {
  token: string
  roomName: string
}

export default function ShareRoomButton({ token, roomName }: ShareRoomButtonProps) {
  const shareRoom = async () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || 'https://cinematch-five-mu.vercel.app')
    const url = `${origin}/rooms/join?token=${encodeURIComponent(token)}`
    const shareData = {
      title: `Sala ${roomName}`,
      text: `Únete a mi sala de Movie Match: ${roomName}`,
      url,
    }

    if (navigator.share) {
      await navigator.share(shareData)
      return
    }

    await navigator.clipboard.writeText(url)
  }

  return (
    <button
      type="button"
      onClick={() => void shareRoom()}
      className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-[#f5c518] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider text-black transition-colors hover:bg-amber-400 active:scale-95 shadow-sm"
    >
      <Share2 className="h-3 w-3 text-black" />
      Compartir
    </button>
  )
}
