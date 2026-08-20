'use client'

import React, { useEffect, useState } from 'react'
import { fetchMovieCast } from '@/app/actions/movieActions'
import { type TMDBCastMember } from '@/lib/tmdb'

interface MovieCastProps {
  movieId: number
}

export default function MovieCast({ movieId }: MovieCastProps) {
  const [cast, setCast] = useState<TMDBCastMember[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    let isMounted = true
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    setCast([])
    void fetchMovieCast(movieId).then((members) => {
      if (isMounted) {
        setCast(members || [])
        setLoading(false)
      }
    })
    return () => {
      isMounted = false
    }
  }, [movieId])

  if (loading) {
    return (
      <div className="reparto-section flex flex-col gap-2 mt-2">
        <h3 className="font-mono text-[12px] text-[#e4e1e7] uppercase tracking-widest text-left font-medium">
          Reparto
        </h3>
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 no-scrollbar w-full">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-6 w-20 bg-white/10 rounded-full animate-pulse shrink-0"
            />
          ))}
        </div>
      </div>
    )
  }

  if (!cast || cast.length === 0) {
    return null
  }

  return (
    <div className="reparto-section flex flex-col gap-2 mt-2">
      <h3 className="font-mono text-[12px] text-[#e4e1e7] uppercase tracking-widest text-left font-medium">
        Reparto
      </h3>
      <div className="flex items-center gap-2.5 overflow-x-auto pb-1 no-scrollbar w-full">
        {cast.map((actor) => (
          <div 
            key={actor.id}
            className="bg-white/10 border border-white/10 px-3 py-1 rounded-full text-white text-[12px] font-normal shrink-0 whitespace-nowrap"
          >
            {actor.name}
          </div>
        ))}
      </div>
    </div>
  )
}
