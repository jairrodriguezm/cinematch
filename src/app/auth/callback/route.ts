import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/types/database'

function getSafeNext(value: string | null) {
  return value?.startsWith('/') && !value.startsWith('//') ? value : '/'
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const next = getSafeNext(request.nextUrl.searchParams.get('next'))
  const origin = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin || 'https://cinematch-five-mu.vercel.app'
  const response = NextResponse.redirect(new URL(next, origin))

  if (!code) return response

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    },
  )

  await supabase.auth.exchangeCodeForSession(code)
  return response
}
