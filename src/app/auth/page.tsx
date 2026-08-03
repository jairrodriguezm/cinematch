import { redirect } from 'next/navigation'

interface AuthPageProps {
  searchParams: Promise<{ next?: string | string[] }>
}

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const { next } = await searchParams
  const destination = typeof next === 'string' && next.startsWith('/') && !next.startsWith('//') ? next : ''
  redirect(`/login${destination ? `?next=${encodeURIComponent(destination)}` : ''}`)
}
