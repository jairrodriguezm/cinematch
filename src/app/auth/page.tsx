'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function getSafeNext(value: string | null) {
  return value?.startsWith('/') && !value.startsWith('//') ? value : '/'
}

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = getSafeNext(searchParams.get('next'))
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sent' | 'error'>('idle')

  useEffect(() => {
    const supabase = createClient()
    void supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.replace(next)
    })
  }, [next, router])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus('idle')

    const callbackUrl = new URL('/auth/callback', window.location.origin)
    callbackUrl.searchParams.set('next', next)
    const { error } = await createClient().auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: callbackUrl.toString() },
    })

    setStatus(error ? 'error' : 'sent')
  }

  return (
    <main className="flex min-h-screen items-center px-6 py-10">
      <form onSubmit={submit} className="mx-auto w-full max-w-sm space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-[#7C3AED]">Movie Match</p>
          <h1 className="text-3xl font-semibold tracking-tight text-[#0F0F10]">Inicia sesión</h1>
          <p className="text-sm leading-6 text-neutral-500">Te enviaremos un enlace seguro para continuar.</p>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-[#0F0F10]">Correo electrónico</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="tu@correo.com"
            required
            className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-[#0F0F10] outline-none transition focus:border-[#7C3AED] focus:ring-4 focus:ring-violet-100"
          />
        </label>

        <button type="submit" className="w-full rounded-2xl bg-[#7C3AED] px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 active:scale-[0.98]">
          Enviarme enlace mágico
        </button>

        {status === 'sent' && <p className="text-center text-sm text-emerald-600">Revisa tu correo para continuar.</p>}
        {status === 'error' && <p className="text-center text-sm text-red-600">No fue posible enviar el enlace. Inténtalo de nuevo.</p>}
      </form>
    </main>
  )
}
