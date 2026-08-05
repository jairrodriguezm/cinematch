'use client'

import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'

export default function TopNavigation() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const avatarUrl = typeof user?.user_metadata.avatar_url === 'string' ? user.user_metadata.avatar_url : null

  const handleSignOut = async () => {
    await createClient().auth.signOut()
    router.replace('/login')
    router.refresh()
  }

  return (
    !isLoading && user ? (
        <div className="flex min-w-0 items-center gap-1.5">
          {avatarUrl ? (
            // Avatar hosts vary by OAuth provider, so it is rendered without image optimization.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="size-7 shrink-0 rounded-full object-cover ring-2 ring-white" referrerPolicy="no-referrer" />
          ) : (
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-[#f5c518] ring-2 ring-white">
              {user.email?.charAt(0).toUpperCase() ?? 'U'}
            </span>
          )}
          <span className="max-w-16 truncate text-[10px] font-medium text-neutral-500 sm:max-w-24">{user.email}</span>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-full border border-neutral-200/80 bg-white/60 px-2 py-1 text-[10px] font-semibold text-neutral-600 transition hover:bg-white hover:text-[#0F0F10]"
            aria-label="Sign out"
          >
            <span className="flex items-center gap-1"><LogOut className="size-3" />Sign Out</span>
          </button>
        </div>
      ) : null
  )
}
