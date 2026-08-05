'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Compass, Heart, Users } from 'lucide-react'

export default function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'Inicio', icon: Home },
    { href: '/?explore=true', label: 'Explorar', icon: Compass },
    { href: '/rooms', label: 'Salas', icon: Users },
    { href: '/login', label: 'Perfil', icon: Heart },
  ]

  return (
    <nav className="bg-zinc-900/90 backdrop-blur-2xl border border-[#f5c518]/40 shadow-[0_4px_30px_rgba(245,197,24,0.25)] fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-[450px] rounded-full z-50 flex justify-around items-center py-2.5 px-4">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
        
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            className={`p-2.5 rounded-full transition-all flex items-center justify-center ${
              isActive 
                ? 'bg-[#f5c518] text-black shadow-[0_0_20px_rgba(245,197,24,0.6)] scale-105 font-bold' 
                : 'text-white/70 hover:text-white hover:bg-white/10 active:scale-95'
            }`}
          >
            <Icon className="w-5 h-5" />
          </Link>
        )
      })}
    </nav>
  )
}
