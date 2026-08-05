'use client';

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ChevronDown, ChevronUp, Radio, User, RotateCcw, AlertCircle, RefreshCw } from 'lucide-react'
import RatingSlider from './RatingSlider'
import MovieCast from './MovieCast'
import { type TMDBMovie } from '@/lib/tmdb'
import { getUnratedMovieQueue, saveMovieInteraction } from '@/app/actions/movieActions'
import { useAuth } from '@/context/AuthContext'

interface MovieDeckProps {
  roomId?: string
}

export default function MovieDeck({ roomId }: MovieDeckProps) {
  const { user } = useAuth()
  const [queue, setQueue] = useState<TMDBMovie[]>([])
  const [nextPage, setNextPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [rating, setRating] = useState<number>(7)
  const [showOverview, setShowOverview] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const activeMovie = queue[0] ?? null

  useEffect(() => {
    if (activeMovie && activeMovie.vote_average !== undefined) {
      const nearestInt = Math.max(1, Math.min(10, Math.round(activeMovie.vote_average)))
      setRating(nearestInt)
    }
  }, [activeMovie?.id, activeMovie?.vote_average])

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
    void fetchMoreMovies(1)
  }, [fetchMoreMovies])

  const handleRatingSubmit = async (scoreToSubmit: number) => {
    if (!activeMovie || submitting) return
    console.log('[MovieDeck] Submitting rating:', scoreToSubmit, 'for movie:', activeMovie.title)
    setSubmitting(true)
    setErrorMessage(null)

    const targetMovie = activeMovie
    setQueue((prev) => prev.slice(1))
    setShowOverview(false)

    try {
      const res = await saveMovieInteraction(targetMovie.id, Math.round(scoreToSubmit))
      if (!res.success) {
        console.error('[MovieDeck] Save interaction failed:', res.error)
        setErrorMessage(res.error || 'Error al guardar la calificación.')
        setQueue((prev) => [targetMovie, ...prev])
      }
    } catch (err: unknown) {
      console.error('[MovieDeck] Save interaction exception:', err)
      setErrorMessage('Error al conectar con el servidor.')
      setQueue((prev) => [targetMovie, ...prev])
    } finally {
      setSubmitting(false)
    }

    if (queue.length <= 3 && !loading) {
      void fetchMoreMovies(nextPage)
    }
  }

  return (
    <div className="w-full min-h-screen bg-[#371f7d] text-white flex flex-col justify-between items-center relative overflow-hidden font-sans select-none">
      {/* Fullscreen Hero Background Poster */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {activeMovie?.poster_path ? (
          <img
            src={activeMovie.poster_path}
            alt={activeMovie.title}
            className="w-full h-full object-cover transition-all duration-500"
          />
        ) : (
          <div className="w-full h-full bg-[#371f7d]" />
        )}
        {/* Gradient Overlay for legibility */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, #371f7d 30%, rgba(55, 31, 125, 0.8) 65%, transparent)'
          }}
        />
      </div>

      {/* Header (TopAppBar) */}
      <header className="bg-transparent backdrop-blur-md fixed top-0 w-full z-50 flex justify-between items-center px-5 py-3.5 border-b border-white/5">
        <button
          type="button"
          aria-label="Sensores en vivo"
          className="text-[#bc96ff] hover:opacity-80 transition-opacity cursor-pointer"
        >
          <Radio className="w-6 h-6" />
        </button>

        <div className="flex flex-col items-center">
          <h1 className="font-display text-lg font-extrabold tracking-widest text-white uppercase drop-shadow-md">
            CINEMATCH
          </h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="w-2 h-2 rounded-full bg-[#bc96ff] pulse-dot"></div>
            <span className="font-mono text-[10px] font-semibold text-[#bc96ff] uppercase tracking-wider drop-shadow-md">
              EN DIRECTO
            </span>
          </div>
        </div>

        <div
          className="w-9 h-9 rounded-full overflow-hidden border border-white/10 hover:opacity-80 transition-opacity bg-[#1f1f23] flex items-center justify-center text-white font-bold text-xs"
          title={user?.email || 'Perfil'}
        >
          {user?.email ? user.email[0].toUpperCase() : <User className="w-4 h-4 text-white/80" />}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col justify-end pt-[15vh] pb-[130px] px-5 md:px-10 max-w-[550px] mx-auto w-full">
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
          /* Glassmorphic Loading Spinner Skeleton */
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center my-auto">
            <div className="w-12 h-12 border-4 border-[#bc96ff] border-t-transparent rounded-full animate-spin shadow-lg"></div>
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
              {/* Movie Info Overlay */}
              <div className="flex flex-col gap-2 w-full text-left">
                <div className="flex flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-display text-3xl md:text-[36px] leading-tight font-extrabold text-white mb-0.5 drop-shadow-md line-clamp-1">
                      {activeMovie.title}
                    </h2>
                    <div
                      className="glass-panel rounded-full px-3.5 py-1.5 flex items-center gap-1 backdrop-blur-md shrink-0 shadow-lg"
                      style={{
                        background: 'rgba(188, 150, 255, 0.15)',
                        backdropFilter: 'blur(40px)',
                        border: '1px solid rgba(188, 150, 255, 0.2)'
                      }}
                    >
                      <Star className="w-3.5 h-3.5 fill-[#bc96ff] text-[#bc96ff]" />
                      <span className="font-bold text-base text-white">
                        {activeMovie.vote_average ? activeMovie.vote_average.toFixed(1) : 'N/A'}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-[#e4e1e7] font-medium">
                    {activeMovie.release_date ? activeMovie.release_date.split('-')[0] : ''}
                  </p>

                  <div className="mt-1 flex flex-col gap-0.5">
                    <p className={`text-xs text-white/80 leading-relaxed font-normal ${showOverview ? '' : 'line-clamp-2'}`}>
                      {activeMovie.overview || 'Sin descripción disponible.'}
                    </p>
                    {activeMovie.overview && (
                      <button
                        type="button"
                        onClick={() => setShowOverview(!showOverview)}
                        className="text-[#bc96ff] font-mono text-[11px] font-semibold uppercase tracking-wider text-left flex items-center gap-0.5 mt-0.5 cursor-pointer hover:underline"
                      >
                        {showOverview ? (
                          <>Ver menos <ChevronUp className="w-3 h-3" /></>
                        ) : (
                          <>Ver más <ChevronDown className="w-3 h-3" /></>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Cast / Reparto Section */}
                  <MovieCast movieId={activeMovie.id} />
                </div>
              </div>

              {/* Interactive Rating Slider */}
              <RatingSlider
                value={rating}
                onChange={(v) => setRating(v)}
                onCommit={(v) => handleRatingSubmit(v)}
                disabled={submitting}
              />
            </motion.div>
          </AnimatePresence>
        ) : (
          /* Empty State with Retry Button */
          <div className="flex flex-col items-center justify-center text-center p-8 my-auto bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-[#bc96ff]/20 text-[#bc96ff] flex items-center justify-center mb-4">
              <Star className="w-8 h-8 fill-current" />
            </div>
            <h3 className="font-display text-xl font-bold text-white mb-2">No hay más películas disponibles por ahora</h3>
            <p className="text-xs text-[#e4e1e7] mb-6 max-w-[260px] leading-relaxed">
              Has calificado todas las películas disponibles en este momento.
            </p>
            <button
              type="button"
              onClick={() => void fetchMoreMovies(1)}
              className="px-8 py-3 rounded-full text-white font-bold text-xs transition-all flex items-center gap-2 shadow-lg cursor-pointer active:scale-95"
              style={{ backgroundColor: '#ff4365', boxShadow: '0 0 25px rgba(255, 67, 101, 0.6)' }}
            >
              <RefreshCw className="w-4 h-4" />
              Reintentar
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
