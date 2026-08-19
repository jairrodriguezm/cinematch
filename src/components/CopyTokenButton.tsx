'use client'
import { Copy } from 'lucide-react'

export default function CopyTokenButton({ token }: { token: string }) {
  return (
    <button
      onClick={() => navigator.clipboard.writeText(token)}
      className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#bc96ff] to-[#ff4365] px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-white transition-all hover:opacity-90 active:scale-95 shadow-[0_0_15px_rgba(188,150,255,0.4)] relative"
    >
      <Copy className="h-4 w-4" />
      <span className="relative z-10">Código: {token.split('-')[0]}...</span>
      <div className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 text-[10px] backdrop-blur-sm transition-opacity">
         Copiar al Portapapeles
      </div>
    </button>
  )
}
