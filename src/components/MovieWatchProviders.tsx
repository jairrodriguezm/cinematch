'use client'

import React, { useEffect, useState, memo } from 'react'
import { fetchWatchProviders } from '@/app/actions/movieActions'
import { type TMDBWatchProvider } from '@/lib/tmdb'

interface MovieWatchProvidersProps {
  movieId: number
}

const MovieWatchProviders = memo(function MovieWatchProviders({ movieId }: MovieWatchProvidersProps) {
  const [providers, setProviders] = useState<TMDBWatchProvider[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setProviders([])
    void fetchWatchProviders(movieId).then((res) => {
      if (isMounted) {
        setProviders(res || [])
        setLoading(false)
      }
    })
    return () => {
      isMounted = false
    }
  }, [movieId])

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-md border border-white/15 px-3 py-1 rounded-full text-xs font-medium text-white/60 animate-pulse shrink-0">
        Cargando...
      </div>
    )
  }

  if (providers.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-md border border-white/15 px-3 py-1 rounded-full text-xs font-medium text-white/60 shadow-sm shrink-0">
        Sin streaming
      </div>
    )
  }

  return (
    <>
      {providers.slice(0, 3).map((provider) => (
        <div
          key={provider.provider_id}
          className="bg-white/10 backdrop-blur-md border border-white/15 px-2.5 py-1 rounded-full flex items-center gap-1.5 text-xs font-medium text-white/90 shadow-sm shrink-0"
          title={provider.provider_name}
        >
          {provider.logo_path ? (
            <img
              src={provider.logo_path}
              alt={provider.provider_name}
              className="w-4 h-4 rounded object-cover shrink-0"
            />
          ) : null}
          <span>{provider.provider_name}</span>
        </div>
      ))}
    </>
  )
})

export default MovieWatchProviders
