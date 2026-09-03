'use client'
import { Copy, Check } from 'lucide-react'
import { useState } from 'react'

export default function CopyTokenButton({ token }: { token: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(token)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      aria-label="Copiar código de la sala"
      className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#bc96ff] to-[#ff4365] px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-white transition-all hover:opacity-90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:ring-[#bc96ff] shadow-[0_0_15px_rgba(188,150,255,0.4)] relative"
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      <span className="relative z-10">{copied ? '¡Copiado!' : `Código: ${token.split('-')[0]}...`}</span>
      {!copied && (
        <div className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 text-[10px] backdrop-blur-sm transition-opacity">
          Copiar al Portapapeles
        </div>
      )}
    </button>
  )
}
