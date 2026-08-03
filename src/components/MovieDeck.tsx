'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ChevronUp, ChevronDown, Calendar, RotateCcw, Users } from 'lucide-react'
import ContentCard from './ContentCard'
import { type TMDBMovie } from '@/lib/tmdb'
import { getUnratedMovieQueue, saveMovieInteraction } from '@/app/actions/movieActions'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import TopNavigation from './TopNavigation'
import RatingSlider from './RatingSlider'


const EMPTY_MOVIES: TMDBMovie[] = [];

interface MovieDeckProps {
  roomId?: string;
}

export default function MovieDeck({ roomId }: MovieDeckProps) {
  const [movies, setMovies] = useState<TMDBMovie[]>(EMPTY_MOVIES);
  const [nextPage, setNextPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [statusText, setStatusText] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [rating, setRating] = useState(7);

  const activeMovie = movies[currentIndex];

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const queue = await getUnratedMovieQueue(1)
        if (cancelled) return
        setMovies(queue.movies)
        setNextPage(queue.nextPage)
        setCurrentIndex(0)
        setLoadError(null)
      } catch (error) {
        if (!cancelled) setLoadError(error instanceof Error ? error.message : 'No se pudieron cargar películas.')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [roomId])

  const loadNextQueue = async () => {
    setIsLoading(true)
    try {
      const queue = await getUnratedMovieQueue(nextPage)
      setMovies(queue.movies)
      setNextPage(queue.nextPage)
      setCurrentIndex(0)
      setLoadError(null)
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'No se pudieron cargar más películas.')
    } finally {
      setIsLoading(false)
    }
  }

  const submitRating = async (selectedRating = rating) => {
    if (currentIndex >= movies.length || isPending || !activeMovie) return;
    setIsPending(true);
    setStatusText(`Guardando puntuación: ${selectedRating}/10`);

    try {
      const result = await saveMovieInteraction(activeMovie.id, selectedRating);
      if (!result.success) throw new Error(result.error);
    } catch (error) {
      console.error("Error al guardar la puntuación:", error);
      setStatusText(error instanceof Error ? error.message : 'No se pudo guardar tu voto.');
      setIsPending(false);
      return;
    }

    setIsExpanded(false);
    setCurrentIndex((prev) => prev + 1);
    setStatusText(null);
    setIsPending(false);
  }

  return (
    <div className="flex-1 flex flex-col justify-between p-6 h-full select-none">
      {/* iOS App Navigation Header */}
      <div className="flex flex-col gap-3 text-center mt-2 mb-3">
        <header className="flex w-full items-center justify-between gap-3 rounded-2xl border border-white/70 bg-white/75 px-3 py-2.5 shadow-[0_8px_24px_rgba(15,15,16,0.06)] backdrop-blur-xl">
          <h1 className="shrink-0 text-lg font-black tracking-[0.16em] text-[#1A1A1A]">
            CINEMATCH
          </h1>
          <TopNavigation />
        </header>
        
        {roomId && (
          <p className="text-[9px] text-[#7C3AED] font-black tracking-widest uppercase bg-violet-50 border border-violet-100 px-2.5 py-0.5 rounded-md">
            Modo de Sala Activo 👥
          </p>
        )}

        <div className="flex gap-2 items-center mt-1">
          <div className="flex gap-1.5 items-center bg-[#FAFAFA] border border-[#F3F4F6] px-3 py-1 rounded-full text-[10px] font-semibold text-neutral-500 tracking-wide uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            {isLoading ? 'Cargando' : 'En Directo'}
          </div>
          <Link 
            href="/rooms" 
            className="flex gap-1 items-center bg-white hover:bg-violet-50 border border-[#E5E7EB] px-3 py-1.5 rounded-full text-[10px] font-black text-[#1A1A1A] tracking-wide uppercase cursor-pointer transition-all active:scale-95"
          >
            <Users className="w-3 h-3 text-[#7C3AED]" />
            Salas
          </Link>
        </div>
      </div>

      {/* Movie Deck Viewport */}
      <div className="flex-1 flex items-center justify-center relative min-h-[380px] my-2">
        <AnimatePresence mode="wait">
          {currentIndex < movies.length ? (
            <motion.div
              key={activeMovie.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="absolute w-full max-w-[330px] aspect-[9/14] z-10"
            >
              <ContentCard className="w-full h-full p-3 flex flex-col justify-between relative overflow-hidden rounded-2xl">

                {/* Movie Poster Screen */}
                <div className="relative w-full flex-1 rounded-2xl overflow-hidden shadow-sm bg-neutral-100 flex flex-col justify-end">
                  {activeMovie.poster_path ? (
                    <img 
                      src={activeMovie.poster_path} 
                      alt={activeMovie.title}
                      className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                      draggable="false"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-neutral-500 font-semibold text-xs bg-neutral-100">
                      Póster no disponible
                    </div>
                  )}

                  {/* Rating indicator */}
                  <div className="absolute top-3 right-3 bg-white/95 border border-[#F3F4F6] px-2 py-0.5 rounded-lg flex items-center gap-1 text-amber-500 font-black text-[11px] z-20 shadow-sm">
                    <Star className="w-3 h-3 fill-current" />
                    {activeMovie.vote_average.toFixed(1)}
                  </div>

                  {/* Collapsible Info Glass Panel */}
                  <motion.div
                    layout
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    className={cn(
                      "relative z-20 m-3 p-3.5 rounded-2xl",
                      "bg-white/95 border border-neutral-200/70 shadow-[0_8px_30px_rgb(0,0,0,0.08)]",
                      "flex flex-col justify-end overflow-hidden transition-all duration-300"
                    )}
                    style={{ maxHeight: isExpanded ? '280px' : '90px' }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0 pr-2 text-left">
                        <h3 className="text-sm font-semibold text-[#0F0F10] truncate leading-snug">
                          {activeMovie.title}
                        </h3>
                        <p className="text-[9px] text-neutral-500 flex items-center gap-1 mt-0.5 font-medium">
                          <Calendar className="w-2.5 h-2.5 text-slate-500" />
                          {activeMovie.release_date || 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Expand Detail trigger button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(!isExpanded);
                      }}
                      className="mt-1.5 py-0.5 w-full flex items-center justify-center text-neutral-500 hover:text-[#7C3AED] transition-colors cursor-pointer"
                    >
                      {isExpanded ? (
                        <span className="text-[9px] font-bold flex items-center gap-1 uppercase tracking-wider">
                          Ocultar descripción <ChevronDown className="w-3 h-3 text-slate-400" />
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold flex items-center gap-1 uppercase tracking-wider">
                          Ver descripción <ChevronUp className="w-3 h-3 text-slate-400" />
                        </span>
                      )}
                    </button>

                    {/* Collapsible details content */}
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-2 overflow-y-auto no-scrollbar max-h-[140px] text-left border-t border-white/5 pt-1.5"
                      >
                        <p className="text-[11px] text-neutral-600 leading-relaxed font-normal">
                          {activeMovie.overview || 'Sin descripción disponible.'}
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                </div>
              </ContentCard>
            </motion.div>
          ) : (
            /* Depleted Empty Deck State */
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center p-6 flex flex-col items-center justify-center w-full max-w-[310px]"
            >
              <ContentCard className="p-8 flex flex-col items-center gap-5">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-500 to-amber-400 flex items-center justify-center shadow-lg animate-float">
                  <Star className="w-7 h-7 text-slate-900 fill-current" />
                </div>
                <div className="space-y-1.5">
                  <h2 className="text-lg font-bold text-[#1A1A1A]">¡Fin de la lista!</h2>
                  <p className="text-[11px] text-neutral-500 leading-relaxed max-w-[220px]">
                    {loadError || 'Has visto todas las películas de esta página. Carga más recomendaciones.'}
                  </p>
                </div>
                <button
                  onClick={loadNextQueue}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-violet-700 transition-all text-xs font-bold text-white shadow-sm active:scale-95 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {isLoading ? 'Cargando...' : 'Cargar más películas'}
                </button>
              </ContentCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Status Display */}
      <div className="h-6 text-center text-[11px] text-neutral-500 font-bold tracking-wider uppercase mb-1">
        {statusText ? (
          <span className="px-3 py-1 rounded-full bg-[#FAFAFA] border border-[#F3F4F6] animate-pulse text-neutral-500">
            {statusText}
          </span>
        ) : currentIndex < movies.length ? (
          <span>Película {currentIndex + 1} de {movies.length}</span>
        ) : null}
      </div>

      <div className="safe-pb">
        <RatingSlider
          value={rating}
          onChange={setRating}
          onCommit={submitRating}
          disabled={isPending || isLoading || !activeMovie}
        />
        {isPending && <p className="mt-3 text-center text-xs font-semibold text-neutral-500">Guardando puntuación...</p>}
      </div>
    </div>
  )
}
