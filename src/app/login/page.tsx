'use client'

import { FormEvent, Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'

export const dynamic = 'force-dynamic'

function getSafeNext(value: string | null) {
  return value?.startsWith('/') && !value.startsWith('//') ? value : '/'
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading } = useAuth()
  const next = getSafeNext(searchParams.get('next'))
  const [email, setEmail] = useState('')
  const [pending, setPending] = useState<'magic' | 'google' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSent, setIsSent] = useState(false)

  useEffect(() => {
    if (!isLoading && user) router.replace(next)
  }, [isLoading, next, router, user])

  const callbackUrl = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || 'https://cinematch-five-mu.vercel.app')
    const url = new URL('/auth/callback', origin)
    url.searchParams.set('next', next)
    return url.toString()
  }

  const handleMagicLink = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail) {
      setError('Enter your email address.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError('Enter a valid email address.')
      return
    }

    setError(null)
    setIsSent(false)
    setPending('magic')
    const { error } = await createClient().auth.signInWithOtp({
      email: normalizedEmail,
      options: { emailRedirectTo: callbackUrl() },
    })
    setPending(null)
    if (error) {
      setError(error.message || 'We could not send your magic link. Please try again.')
      return
    }
    setIsSent(true)
  }

  const handleGoogle = async () => {
    setError(null)
    setIsSent(false)
    setPending('google')
    const { error } = await createClient().auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: callbackUrl() },
    })
    if (error) {
      setPending(null)
      setError(error.message || 'We could not start Google authentication. Please try again.')
    }
  }

  return (
    <section className="w-full rounded-3xl border border-neutral-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,15,16,0.06)] text-black">
      <p className="text-sm font-bold text-[#f5c518]">Movie Match</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#0F0F10]">Inicia sesión</h1>
      <p className="mt-2 text-sm leading-6 text-neutral-500">Recibe un enlace seguro o continúa con tu cuenta de Google.</p>

      <form noValidate onSubmit={handleMagicLink} className="mt-6 space-y-3">
        <label className="block text-sm font-medium text-[#0F0F10]">
          Correo electrónico
          <input
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)
              setError(null)
            }}
            placeholder="tu@correo.com"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'login-error' : undefined}
            className="mt-2 w-full rounded-xl border border-neutral-200 px-3.5 py-3 text-sm outline-none transition focus:border-[#f5c518] focus:ring-4 focus:ring-amber-100 aria-[invalid=true]:border-red-400"
          />
        </label>
        <button type="submit" disabled={pending !== null} className="w-full rounded-xl bg-[#f5c518] px-4 py-3 text-sm font-extrabold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60 shadow-md">
          {pending === 'magic' ? 'Enviando enlace...' : 'Enviar enlace mágico'}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-neutral-400"><span className="h-px flex-1 bg-neutral-200" />o<span className="h-px flex-1 bg-neutral-200" /></div>
      <button type="button" onClick={handleGoogle} disabled={pending !== null} className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 px-4 py-3 text-sm font-semibold text-[#0F0F10] transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60">
        <span aria-hidden="true" className="text-base font-bold text-[#4285F4]">G</span>
        {pending === 'google' ? 'Autenticando...' : 'Continuar con Google'}
      </button>

      {isSent && <p className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-center text-sm text-emerald-700">¡Revisa tu bandeja de entrada!</p>}
      {error && <p id="login-error" role="alert" className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
    </section>
  )
}

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center px-6 py-10">
      <Suspense fallback={<div className="text-xs text-neutral-400">Cargando...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  )
}
