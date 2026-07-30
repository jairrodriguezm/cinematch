'use client'

import { Share2 } from 'lucide-react'

interface ShareRoomButtonProps {
  token: string
  roomName: string
}

export default function ShareRoomButton({ token, roomName }: ShareRoomButtonProps) {
  const shareRoom = async () => {
    const url = `${window.location.origin}/rooms/join?token=${encodeURIComponent(token)}`
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
      className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-[#7C3AED] transition-colors hover:bg-violet-100 active:scale-95"
    >
      <Share2 className="h-3 w-3" />
      Compartir
    </button>
  )
}
