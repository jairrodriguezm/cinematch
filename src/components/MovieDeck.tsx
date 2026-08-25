'use client';

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ChevronDown, ChevronUp, Radio, User, AlertCircle, RefreshCw, SkipForward } from 'lucide-react'
import RatingSlider from './RatingSlider'
import MovieCast from './MovieCast'
import { type TMDBMovie, type TMDBWatchProvider } from '@/lib/tmdb'
import { getUnratedMovieQueue, saveMovieInteraction, fetchWatchProviders } from '@/app/actions/movieActions'
import { useAuth } from '@/context/AuthContext'

interface MovieDeckProps {
  roomId?: string
}

export default function MovieDeck({ roomId }: MovieDeckProps) {
  const { user } = useAuth()
  const [queue, setQueue] = useState<TMDBMovie[]>([])
  const [nextPage, setNextPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [providers, setProviders] = useState<TMDBWatchProvider[]>([])
  const [loadingProviders, setLoadingProviders] = useState<boolean>(false)

  const activeMovie = queue[0] ?? null

  useEffect(() => {
    let isMounted = true
    if (activeMovie?.id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoadingProviders(true)
      setProviders([])
      void fetchWatchProviders(activeMovie.id).then((res) => {
        if (isMounted) {
          setProviders(res || [])
          setLoadingProviders(false)
        }
      })
    } else {
      setProviders([])
      setLoadingProviders(false)
    }
    return () => {
      isMounted = false
    }
  }, [activeMovie?.id])

  const fetchMoreMovies = useCallback(async (pageToFetch: number) => {
    console.log('[MovieDeck] Fetching movie queue for page:', pageToFetch)
    try {
      setLoading(true)
      setErrorMessage(null)
      const res = await getUnratedMovieQueue(pageToFetch)
      console.log('[MovieDeck] Received movies count:', res.movies.length)
      setQueue((prev) => {
        const existingIds = new Set(prev.map((m) => m.id))
        const newMovies = res.movies.filter((m) => !existingIds.has(m.id))
        return [...prev, ...newMovies]
      })
      setNextPage(res.nextPage)
    } catch (err: unknown) {
      console.error('[MovieDeck] Error loading movie queue:', err)
      setErrorMessage('No se pudieron obtener películas del servidor.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchMoreMovies(1)
  }, [fetchMoreMovies])

  const handleRatingSubmit = (scoreToSubmit: number) => {
    if (!activeMovie) return
    console.log('[MovieDeck] Submitting rating:', scoreToSubmit, 'for movie:', activeMovie.title)
    setErrorMessage(null)

    // ⚡ Bolt Optimization: Optimistic UI
    // What: Removed 'await' and submitting state blocker to instantly advance to the next movie.
    // Why: Network latency for saveMovieInteraction was causing the UI to freeze for hundreds of ms on every rating.
    // Impact: Makes interaction instantly responsive (0ms perceived latency).

    const targetMovie = activeMovie

    // Instantly advance the UI
    setQueue((prev) => prev.slice(1))
    setIsExpanded(false)

    // Background server call (fire-and-forget style)
    saveMovieInteraction(targetMovie.id, Math.round(scoreToSubmit)).then(res => {
      if (!res.success) {
        console.error('[MovieDeck] Save interaction failed:', res.error)
        // Optionally show toast/error in a non-blocking way if needed.
        // We avoid reverting queue because it disrupts flow.
      }
    }).catch(err => {
      console.error('[MovieDeck] Save interaction exception:', err)
    })

    if (queue.length <= 3 && !loading) {
      void fetchMoreMovies(nextPage)
    }
  }

  const handleSkip = () => {
    if (!activeMovie) return
    handleRatingSubmit(5) // Default neutral skip rating
  }

  const releaseYear = activeMovie?.release_date ? activeMovie.release_date.split('-')[0] : ''

  return (
    <div className="w-full h-screen max-h-screen bg-black text-white flex flex-col justify-between items-center relative overflow-hidden font-sans select-none">
      {/* Fullscreen Hero Background Poster */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {activeMovie?.poster_path ? (
          <img
            src={activeMovie.poster_path}
            alt={activeMovie.title}
            className="w-full h-full object-cover transition-all duration-700 filter brightness-95"
          />
        ) : (
          <div className="w-full h-full bg-black" />
        )}
        {/* Dynamic Dark Vignette Gradient Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.15) 30%, rgba(0,0,0,0.4) 55%, rgba(0,0,0,0.92) 85%, #000000 100%)'
          }}
        />
      </div>

      {/* Top Navigation Bar */}
      <header className="fixed top-0 inset-x-0 z-40 flex justify-between items-center px-5 py-3.5 max-w-[550px] mx-auto w-full">
        <button
          type="button"
          aria-label="Sensores en vivo"
          className="text-[#f5c518] hover:opacity-80 transition-opacity cursor-pointer"
        >
          <Radio className="w-6 h-6" />
        </button>

        <div className="flex flex-col items-center">
          <h1 className="font-display text-lg font-extrabold tracking-widest text-white uppercase drop-shadow-md">
            CINEMATCH
          </h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]"></div>
            <span className="font-mono text-[10px] font-semibold text-[#f5c518] uppercase tracking-wider drop-shadow-md">
              EN DIRECTO
            </span>
          </div>
        </div>

        <div
          className="w-9 h-9 rounded-full overflow-hidden border border-white/20 bg-black/40 backdrop-blur-md flex items-center justify-center text-white font-bold text-xs shadow-md"
          title={user?.email || 'Perfil'}
        >
          {user?.email ? user.email[0].toUpperCase() : <User className="w-4 h-4 text-white/80" />}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col justify-end pt-[12vh] pb-[130px] px-5 md:px-8 max-w-[550px] mx-auto w-full overflow-y-auto no-scrollbar">
        {errorMessage && (
          <div className="mb-3 p-3 rounded-xl bg-red-900/80 border border-red-500 text-red-100 text-xs font-medium flex items-center justify-between gap-2 shadow-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => void fetchMoreMovies(1)}
              className="underline text-white font-bold hover:text-red-200 text-xs"
            >
              Reintentar
            </button>
          </div>
        )}

        {loading && queue.length === 0 ? (
          /* Loading Spinner Skeleton */
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center my-auto">
            <div className="w-12 h-12 border-4 border-[#f5c518] border-t-transparent rounded-full animate-spin shadow-lg"></div>
            <p className="text-xs font-semibold text-[#e4e1e7] uppercase tracking-wider">Cargando películas...</p>
          </div>
        ) : activeMovie ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMovie.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-3 w-full"
            >
              {/* Movie Info Overlay (Inspiration layout) */}
              <div className="flex flex-col gap-2 w-full text-left">
                {/* Title + Year + Active Status Dot */}
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-display text-3xl md:text-4xl leading-tight font-extrabold text-white tracking-tight drop-shadow-lg">
                    {activeMovie.title}
                  </h2>
                  {releaseYear && (
                    <span className="font-sans font-light text-2xl md:text-3xl text-white/80 drop-shadow-md">
                      {releaseYear}
                    </span>
                  )}
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399] animate-pulse shrink-0 self-center ml-0.5" />
                </div>

                {/* Glassmorphic Genre / Info & Watch Provider Chips */}
                <div className="flex items-center gap-2 flex-wrap mt-0.5">
                  {/* Rating Star Chip */}
                  <div className="bg-white/15 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full flex items-center gap-1 text-xs font-bold text-white shadow-sm shrink-0">
                    <Star className="w-3.5 h-3.5 fill-[#38bdf8] text-[#38bdf8]" />
                    <span>{activeMovie.vote_average ? activeMovie.vote_average.toFixed(1) : 'N/A'}</span>
                  </div>

                  {/* Watch Provider Chips next to Rating Star */}
                  {loadingProviders ? (
                    <div className="bg-white/10 backdrop-blur-md border border-white/15 px-3 py-1 rounded-full text-xs font-medium text-white/60 animate-pulse shrink-0">
                      Cargando...
                    </div>
                  ) : providers.length > 0 ? (
                    providers.slice(0, 3).map((provider) => (
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
                    ))
                  ) : (
                    <div className="bg-white/10 backdrop-blur-md border border-white/15 px-3 py-1 rounded-full text-xs font-medium text-white/60 shadow-sm shrink-0">
                      Sin streaming
                    </div>
                  )}
                </div>

                {/* Description Overview with Strict Toggle Logic */}
                <div className="mt-1 flex flex-col gap-0.5">
                  <p className={`text-xs md:text-sm text-white/90 leading-relaxed font-normal drop-shadow-sm ${isExpanded ? '' : 'line-clamp-2'}`}>
                    {activeMovie.overview && activeMovie.overview.trim() ? activeMovie.overview : 'Sin descripción disponible.'}
                  </p>
                  {activeMovie.overview && activeMovie.overview.trim().length > 120 && (
                    <button
                      type="button"
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="text-[#f5c518] font-mono text-[11px] font-semibold uppercase tracking-wider text-left flex items-center gap-0.5 mt-0.5 cursor-pointer hover:underline"
                    >
                      {isExpanded ? (
                        <>VER MENOS <ChevronUp className="w-3 h-3" /></>
                      ) : (
                        <>VER MÁS <ChevronDown className="w-3 h-3" /></>
                      )}
                    </button>
                  )}
                </div>

                {/* Cast / Reparto Section */}
                <MovieCast movieId={activeMovie.id} />
              </div>

              {/* Original Interactive Rating Slider with Updated Styling */}
              <RatingSlider
                key={activeMovie.id}
                initialValue={activeMovie.vote_average ? Math.max(1, Math.min(10, Math.round(activeMovie.vote_average))) : 7}
                onCommit={(v) => handleRatingSubmit(v)}
              />

              <div className="flex justify-center mt-2">
                <button
                  type="button"
                  onClick={handleSkip}
                  className="flex items-center gap-1.5 text-xs font-semibold text-white/60 hover:text-white transition-colors py-2 px-4 rounded-full border border-transparent hover:border-white/20 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                >
                  Saltar película <SkipForward className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center text-center p-8 my-auto bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-[#38bdf8]/20 text-[#38bdf8] flex items-center justify-center mb-4">
              <Star className="w-8 h-8 fill-current" />
            </div>
            <h3 className="font-display text-xl font-bold text-white mb-2">No hay más películas disponibles por ahora</h3>
            <p className="text-xs text-[#e4e1e7] mb-6 max-w-[260px] leading-relaxed">
              Has calificado todas las películas disponibles en este momento.
            </p>
            <button
              type="button"
              onClick={() => void fetchMoreMovies(1)}
              className="px-8 py-3 rounded-full text-black font-extrabold text-xs transition-all flex items-center gap-2 shadow-lg cursor-pointer active:scale-95 bg-[#f5c518] shadow-[0_0_25px_rgba(245,197,24,0.5)]"
            >
              <RefreshCw className="w-4 h-4 text-black" />
              Reintentar
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
