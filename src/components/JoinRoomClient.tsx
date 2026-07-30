'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { joinRoomByToken } from '@/app/actions/roomActions'
import { createClient } from '@/lib/supabase/client'

interface JoinRoomClientProps {
  token: string
}

export default function JoinRoomClient({ token }: JoinRoomClientProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const join = async () => {
      localStorage.setItem('cinematch_pending_room_token', token)
      document.cookie = `cinematch_pending_room_token=${encodeURIComponent(token)}; Path=/; Max-Age=86400; SameSite=Lax`

      const { data: { user } } = await createClient().auth.getUser()
      if (!user) {
        router.replace(`/auth?next=${encodeURIComponent(`/rooms/join?token=${token}`)}`)
        return
      }

      const result = await joinRoomByToken(token)
      if (!result.success || !result.roomId) {
        setError(result.error || 'No fue posible unirte a la sala.')
        return
      }

      localStorage.removeItem('cinematch_pending_room_token')
      document.cookie = 'cinematch_pending_room_token=; Path=/; Max-Age=0; SameSite=Lax'
      router.replace(`/?room=${result.roomId}`)
    }

    void join()
  }, [router, token])

  return (
    <main className="flex min-h-screen items-center justify-center px-6 text-center">
      <p className="text-sm font-medium text-neutral-500">{error || 'Preparando tu sala...'}</p>
    </main>
  )
}
