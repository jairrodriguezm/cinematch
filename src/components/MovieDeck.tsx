'use client'

import React, { useState, useEffect } from 'react'
import { motion, useMotionValue, useTransform, useAnimation, AnimatePresence } from 'framer-motion'
import { Heart, X, Bookmark, Star, ChevronUp, ChevronDown, Calendar, RotateCcw, Users } from 'lucide-react'
import GlassCard from './GlassCard'
import { TMDBMovie } from '@/lib/tmdb'
import { saveMovieInteraction } from '@/app/actions/movieActions'
import { cn } from '@/lib/utils'
import Link from 'next/link'


// Beautiful Unsplash backup pictures for Spanish localized fallback cards
export const MOCK_DECK_MOVIES: TMDBMovie[] = [
  {
    id: 101,
    title: "El Origen",
    overview: "Un especialista en robar secretos del subconsciente durante los sueños se enfrenta a una última misión para redimirse: implantar una idea en lugar de robarla.",
    poster_path: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80",
    release_date: "2010-07-16",
    vote_average: 8.8
  },
  {
    id: 102,
    title: "Interestelar",
    overview: "Un grupo de exploradores espaciales viaja a través de un agujero de gusano para encontrar un nuevo hogar para la humanidad ante el inminente colapso de la Tierra.",
    poster_path: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=80",
    release_date: "2014-11-07",
    vote_average: 8.6
  },
  {
    id: 103,
    title: "Mad Max: Furia en el Camino",
    overview: "En un futuro post-apocalíptico, una mujer rebelde y un vagabundo solitario se alían para escapar de un tirano despiadado y cruzar el desierto en busca de su hogar.",
    poster_path: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80",
    release_date: "2015-05-15",
    vote_average: 8.1
  },
  {
    id: 104,
    title: "Parásitos",
    overview: "Una familia de escasos recursos se infiltra astutamente en la vida de una adinerada familia, desencadenando una serie de eventos extraños e imprevistos.",
    poster_path: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80",
    release_date: "2019-05-30",
    vote_average: 8.5
  },
  {
    id: 105,
    title: "Spider-Man: Un Nuevo Universo",
    overview: "El joven Miles Morales descubre sus poderes arácnidos y debe unirse a versiones alternativas de Spider-Man para detener una amenaza que pone en peligro todo el multiverso.",
    poster_path: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=500&auto=format&fit=crop&q=80",
    release_date: "2018-12-14",
    vote_average: 8.7
  }
];

interface MovieDeckProps {
  movies: TMDBMovie[];
  isFallback: boolean;
  roomId?: string;
}

export default function MovieDeck({ movies: initialMovies, isFallback, roomId }: MovieDeckProps) {
  const moviesList = initialMovies.length > 0 ? initialMovies : MOCK_DECK_MOVIES;
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [statusText, setStatusText] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const activeMovie = moviesList[currentIndex];

  // Motion Values for Gestures
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const controls = useAnimation();

  // Dynamically map position to style properties
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0.6, 1, 1, 1, 0.6]);

  // Swipe Action Icons Indicators Overlay
  const likeIndicatorOpacity = useTransform(x, [0, 100], [0, 1]);
  const discardIndicatorOpacity = useTransform(x, [-100, 0], [1, 0]);
  const maybeIndicatorOpacity = useTransform(y, [-100, 0], [1, 0]);

  // Reset info collapse on movie change
  useEffect(() => {
    setIsExpanded(false);
  }, [currentIndex]);

  const handleSwipeAction = async (
    action: 'LIKE' | 'MAYBE' | 'DISCARD', 
    flyDirection?: 'left' | 'right' | 'up'
  ) => {
    if (currentIndex >= moviesList.length || isPending) return;
    setIsPending(true);

    const actionText = action === 'LIKE' ? 'Me gusta' : action === 'DISCARD' ? 'Descartado' : 'Tal vez';
    setStatusText(`Registrando "${actionText}"...`);

    // 1. Programmatic fly-out animation
    if (flyDirection) {
      if (flyDirection === 'right') {
        await controls.start({ x: 350, opacity: 0, rotate: 20, transition: { duration: 0.3, ease: 'easeOut' } });
      } else if (flyDirection === 'left') {
        await controls.start({ x: -350, opacity: 0, rotate: -20, transition: { duration: 0.3, ease: 'easeOut' } });
      } else if (flyDirection === 'up') {
        await controls.start({ y: -350, opacity: 0, transition: { duration: 0.3, ease: 'easeOut' } });
      }
    }

    // 2. Call server action for Supabase record
    try {
      await saveMovieInteraction(activeMovie.id, activeMovie.title, action, roomId);
    } catch (error) {
      console.error("Error al registrar la acción:", error);
    }

    // 3. Render next card and reset motion properties
    setCurrentIndex((prev) => prev + 1);
    x.set(0);
    y.set(0);
    controls.set({ x: 0, y: 0, opacity: 1, rotate: 0 });
    setStatusText(null);
    setIsPending(false);
  };

  const handleDragEnd = async (event: any, info: any) => {
    const swipeThreshold = 120;
    const dragX = info.offset.x;
    const dragY = info.offset.y;

    if (dragX > swipeThreshold) {
      // Swiped Right -> LIKE
      await handleSwipeAction('LIKE', 'right');
    } else if (dragX < -swipeThreshold) {
      // Swiped Left -> DISCARD
      await handleSwipeAction('DISCARD', 'left');
    } else if (dragY < -swipeThreshold && Math.abs(dragX) < swipeThreshold) {
      // Swiped Up -> MAYBE
      await handleSwipeAction('MAYBE', 'up');
    } else {
      // Snap back to center
      controls.start({ x: 0, y: 0, rotate: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } });
    }
  };

  const resetDeck = () => {
    setCurrentIndex(0);
    setIsExpanded(false);
    setStatusText(null);
    setIsPending(false);
    controls.set({ x: 0, y: 0, opacity: 1, rotate: 0 });
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 h-full select-none">
      {/* iOS App Navigation Header */}
      <div className="flex flex-col gap-1 items-center justify-center text-center mt-2 mb-3">
        <h1 className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-orange-400 to-amber-300 drop-shadow-md">
          CINEMATCH
        </h1>
        
        {roomId && (
          <p className="text-[9px] text-orange-400 font-black tracking-widest uppercase bg-orange-400/10 border border-orange-500/20 px-2.5 py-0.5 rounded-md">
            Modo de Sala Activo 👥
          </p>
        )}

        <div className="flex gap-2 items-center mt-1">
          <div className="flex gap-1.5 items-center bg-white/5 border border-white/10 px-3 py-1 rounded-full text-[10px] font-semibold text-slate-300 tracking-wide uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            {isFallback ? 'Demostración' : 'En Directo'}
          </div>
          <Link 
            href="/rooms" 
            className="flex gap-1 items-center bg-white/10 hover:bg-white/15 border border-white/10 px-3 py-1.5 rounded-full text-[10px] font-black text-slate-300 tracking-wide uppercase cursor-pointer transition-all active:scale-95"
          >
            <Users className="w-3 h-3 text-slate-400" />
            Salas
          </Link>
        </div>
      </div>

      {/* Movie Deck Viewport */}
      <div className="flex-1 flex items-center justify-center relative min-h-[380px] my-2">
        <AnimatePresence mode="wait">
          {currentIndex < moviesList.length ? (
            <motion.div
              key={activeMovie.id}
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0.7}
              onDragEnd={handleDragEnd}
              animate={controls}
              style={{ x, y, rotate, opacity }}
              className="absolute w-full max-w-[330px] aspect-[9/14] cursor-grab active:cursor-grabbing z-10 touch-none"
            >
              <GlassCard className="w-full h-full p-3 flex flex-col justify-between border-white/20 shadow-2xl relative overflow-hidden bg-white/[0.06] rounded-[32px]">
                {/* Visual Glow Backdrop */}
                <div 
                  className="absolute inset-0 -z-10 opacity-[0.15] blur-3xl scale-125"
                  style={{ backgroundImage: `url(${activeMovie.poster_path})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                />

                {/* Gesture Swipe HUD Overlay Indicators */}
                <motion.div 
                  style={{ opacity: likeIndicatorOpacity }}
                  className="absolute top-6 left-6 -rotate-12 bg-blue-500/90 text-white font-black text-sm tracking-widest border border-blue-400/50 px-3 py-1 rounded-xl shadow-md z-30 pointer-events-none uppercase"
                >
                  Me Gusta
                </motion.div>
                
                <motion.div 
                  style={{ opacity: discardIndicatorOpacity }}
                  className="absolute top-6 right-6 rotate-12 bg-red-500/90 text-white font-black text-sm tracking-widest border border-red-400/50 px-3 py-1 rounded-xl shadow-md z-30 pointer-events-none uppercase"
                >
                  Descartar
                </motion.div>

                <motion.div 
                  style={{ opacity: maybeIndicatorOpacity }}
                  className="absolute bottom-[130px] left-1/2 -translate-x-1/2 bg-amber-500/90 text-white font-black text-sm tracking-widest border border-amber-400/50 px-3 py-1 rounded-xl shadow-md z-30 pointer-events-none uppercase"
                >
                  Tal Vez
                </motion.div>

                {/* Movie Poster Screen */}
                <div className="relative w-full flex-1 rounded-[24px] overflow-hidden shadow-inner border border-white/10 bg-slate-950 flex flex-col justify-end">
                  {activeMovie.poster_path ? (
                    <img 
                      src={activeMovie.poster_path} 
                      alt={activeMovie.title}
                      className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                      draggable="false"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-500 font-semibold text-xs bg-slate-900">
                      Póster no disponible
                    </div>
                  )}

                  {/* Rating indicator */}
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-lg flex items-center gap-1 text-amber-400 font-black text-[11px] z-20 shadow">
                    <Star className="w-3 h-3 fill-current" />
                    {activeMovie.vote_average.toFixed(1)}
                  </div>

                  {/* Collapsible Info Glass Panel */}
                  <motion.div
                    layout
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    className={cn(
                      "relative z-20 m-3 p-3.5 rounded-[20px]",
                      "bg-[#0a0a0f]/80 backdrop-blur-xl border border-white/10 shadow-lg",
                      "flex flex-col justify-end overflow-hidden transition-all duration-300"
                    )}
                    style={{ maxHeight: isExpanded ? '280px' : '90px' }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0 pr-2 text-left">
                        <h3 className="text-sm font-bold text-slate-50 truncate leading-snug">
                          {activeMovie.title}
                        </h3>
                        <p className="text-[9px] text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
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
                      className="mt-1.5 py-0.5 w-full flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
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
                        <p className="text-[11px] text-slate-200 leading-relaxed font-normal">
                          {activeMovie.overview || 'Sin descripción disponible.'}
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                </div>
              </GlassCard>
            </motion.div>
          ) : (
            /* Depleted Empty Deck State */
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center p-6 flex flex-col items-center justify-center w-full max-w-[310px]"
            >
              <GlassCard className="p-8 border-white/10 bg-white/5 flex flex-col items-center gap-5 shadow-2xl rounded-[28px]">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-500 to-amber-400 flex items-center justify-center shadow-lg animate-float">
                  <Star className="w-7 h-7 text-slate-900 fill-current" />
                </div>
                <div className="space-y-1.5">
                  <h2 className="text-lg font-bold text-slate-100">¡Fin de la lista!</h2>
                  <p className="text-[11px] text-slate-400 leading-relaxed max-w-[220px]">
                    Has visto todas las películas recomendadas por hoy. ¿Quieres volver a explorar?
                  </p>
                </div>
                <button
                  onClick={resetDeck}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 transition-all text-xs font-bold text-slate-100 hover:shadow-lg active:scale-95 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Recargar Catálogo
                </button>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Status Display */}
      <div className="h-6 text-center text-[11px] text-slate-500 font-bold tracking-wider uppercase mb-1">
        {statusText ? (
          <span className="px-3 py-1 rounded-full bg-slate-950/80 border border-white/5 animate-pulse text-slate-400">
            {statusText}
          </span>
        ) : currentIndex < moviesList.length ? (
          <span>Película {currentIndex + 1} de {moviesList.length}</span>
        ) : null}
      </div>

      {/* iOS Swiping Interactive Action Buttons */}
      <div className="flex justify-center items-center gap-5 safe-pb">
        {/* Discard Button (X icon, soft red/orange tone) */}
        <button
          onClick={() => handleSwipeAction('DISCARD', 'left')}
          disabled={currentIndex >= moviesList.length || isPending}
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center transition-all bg-red-500/10 hover:bg-red-500/20 active:scale-90 border border-red-500/30 text-red-400 shadow-lg hover:shadow-red-500/10",
            "cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
          )}
          title="Descartar"
        >
          <X className="w-6 h-6 stroke-[2.5]" />
        </button>

        {/* Give a Chance / Maybe Button (Bookmark icon, soft amber tone) */}
        <button
          onClick={() => handleSwipeAction('MAYBE', 'up')}
          disabled={currentIndex >= moviesList.length || isPending}
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-all bg-amber-500/10 hover:bg-amber-500/20 active:scale-90 border border-amber-500/30 text-amber-400 shadow-md hover:shadow-amber-500/10",
            "cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
          )}
          title="Tal vez"
        >
          <Bookmark className="w-5 h-5 fill-current stroke-[2]" />
        </button>

        {/* Like Button (Heart icon, soft green/blue tone) */}
        <button
          onClick={() => handleSwipeAction('LIKE', 'right')}
          disabled={currentIndex >= moviesList.length || isPending}
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center transition-all bg-blue-500/10 hover:bg-blue-500/20 active:scale-90 border border-blue-500/30 text-blue-400 shadow-lg hover:shadow-blue-500/10",
            "cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
          )}
          title="Me gusta"
        >
          <Heart className="w-6 h-6 fill-current stroke-[2]" />
        </button>
      </div>
    </div>
  )
}
