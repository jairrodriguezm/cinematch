'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ContentCard from './ContentCard'
import { TMDBMovie } from '@/lib/tmdb'
import { saveMovieInteraction } from '@/app/actions/movieActions'
import { Heart, X, HelpCircle, Star, Calendar, RefreshCw } from 'lucide-react'

// Spanish fallback mock list in case TMDB is not accessible or API key is not configured
export const MOCK_MOVIES: TMDBMovie[] = [
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

interface MovieMatcherProps {
  initialMovies: TMDBMovie[];
  isFallback: boolean;
}

export default function MovieMatcher({ initialMovies, isFallback }: MovieMatcherProps) {
  const movies = initialMovies.length > 0 ? initialMovies : MOCK_MOVIES;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | 'up' | null>(null);
  const [statusText, setStatusText] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const activeMovie = movies[currentIndex];

  const handleSwipe = async (action: 'LIKE' | 'MAYBE' | 'DISCARD') => {
    if (currentIndex >= movies.length || isPending) return;
    
    setIsPending(true);
    setDirection(action === 'LIKE' ? 'right' : action === 'DISCARD' ? 'left' : 'up');

    // Display temporary loading status in Spanish
    setStatusText(`Registrando "${action}"...`);

    // Execute the Server Action
    const result = await saveMovieInteraction(
      activeMovie.id,
      action === 'LIKE' ? 10 : action === 'MAYBE' ? 6 : 1
    );

    if (result.success) {
      setStatusText(`¡Interacción registrada con éxito!`);
    } else {
      console.error(result.error);
      setStatusText(`Error al guardar: ${result.error}`);
    }

    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setDirection(null);
      setStatusText(null);
      setIsPending(false);
    }, 400); // Allow card animation to complete
  };

  const resetStack = () => {
    setCurrentIndex(0);
    setDirection(null);
    setStatusText(null);
    setIsPending(false);
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6">
      {/* PWA App Bar / iOS Header */}
      <div className="flex flex-col gap-1 items-center justify-center text-center mt-2 mb-4">
        <h1 className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-orange-400 to-amber-300 drop-shadow-md">
          CINEMATCH
        </h1>
        <div className="flex gap-2 items-center bg-white/5 border border-white/10 px-3 py-1 rounded-full text-xs font-medium text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          {isFallback ? 'Modo de Demostración' : 'TMDB API Sincronizada'}
        </div>
      </div>

      {/* Main Swiper Container */}
      <div className="flex-1 flex items-center justify-center relative min-h-[380px] my-4">
        <AnimatePresence mode="wait">
          {currentIndex < movies.length ? (
            <motion.div
              key={activeMovie.id}
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ 
                x: direction === 'right' ? 300 : direction === 'left' ? -300 : 0,
                y: direction === 'up' ? -300 : 0,
                opacity: 0,
                scale: 0.9,
                rotate: direction === 'right' ? 15 : direction === 'left' ? -15 : 0
              }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="absolute w-full h-full max-w-[340px]"
            >
              <ContentCard className="w-full h-full p-4 flex flex-col justify-between select-none relative overflow-hidden">
                {/* Movie Poster Backdrop Glow */}
                <div 
                  className="absolute inset-0 -z-10 opacity-[0.12] blur-3xl scale-125"
                  style={{ backgroundImage: `url(${activeMovie.poster_path})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                />

                {/* Poster Display */}
                <div className="relative w-full h-[220px] rounded-2xl overflow-hidden shadow-lg border border-white/10">
                  {activeMovie.poster_path ? (
                    <img 
                      src={activeMovie.poster_path} 
                      alt={activeMovie.title}
                      className="w-full h-full object-cover"
                      draggable="false"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500 font-semibold text-sm">
                      Sin Póster
                    </div>
                  )}

                  {/* Rating Badge */}
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md border border-white/10 px-2 py-1 rounded-lg flex items-center gap-1 text-amber-400 font-bold text-xs">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    {activeMovie.vote_average.toFixed(1)}
                  </div>
                </div>

                {/* Movie Details */}
                <div className="flex-1 flex flex-col justify-between mt-3 text-left">
                  <div>
                    <h2 className="text-lg font-bold text-slate-50 line-clamp-1 leading-tight">
                      {activeMovie.title}
                    </h2>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-1 font-medium">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      Lanzamiento: {activeMovie.release_date || 'N/A'}
                    </p>
                  </div>
                  
                  <p className="text-[12px] text-slate-300 line-clamp-3 mt-2 font-normal leading-relaxed">
                    {activeMovie.overview || 'Sin descripción disponible.'}
                  </p>
                </div>
              </ContentCard>
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center p-6 flex flex-col items-center justify-center w-full max-w-[320px]"
            >
              <ContentCard className="p-8 flex flex-col items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-400 to-amber-300 flex items-center justify-center shadow-lg animate-float">
                  <Star className="w-8 h-8 text-slate-900 fill-current" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-slate-100">¡Eso es todo por ahora!</h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Has revisado todas las películas de esta sesión. Puedes reiniciar para verlas nuevamente o esperar nuevas actualizaciones.
                  </p>
                </div>
                <button
                  onClick={resetStack}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 transition-all text-xs font-bold text-slate-100 hover:shadow-lg active:scale-95"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Volver a Empezar
                </button>
              </ContentCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Status Overlay */}
      <div className="h-6 text-center text-xs text-slate-400 font-medium mb-2">
        {statusText ? (
          <span className="px-3 py-1 rounded-full bg-slate-900/60 border border-white/5 animate-pulse">
            {statusText}
          </span>
        ) : currentIndex < movies.length ? (
          <span>Tarjeta {currentIndex + 1} de {movies.length}</span>
        ) : null}
      </div>

      {/* Swiping Buttons */}
      <div className="flex justify-center items-center gap-5 safe-pb mb-2">
        <button
          onClick={() => handleSwipe('DISCARD')}
          disabled={currentIndex >= movies.length || isPending}
          className="w-14 h-14 rounded-full bg-red-500/10 hover:bg-red-500/20 active:scale-90 border border-red-500/30 flex items-center justify-center text-red-400 transition-all shadow-lg hover:shadow-red-500/10 disabled:opacity-30 disabled:scale-100 cursor-pointer"
          title="Descartar"
        >
          <X className="w-6 h-6 stroke-[2.5]" />
        </button>

        <button
          onClick={() => handleSwipe('MAYBE')}
          disabled={currentIndex >= movies.length || isPending}
          className="w-12 h-12 rounded-full bg-amber-500/10 hover:bg-amber-500/20 active:scale-90 border border-amber-500/30 flex items-center justify-center text-amber-400 transition-all shadow-md hover:shadow-amber-500/10 disabled:opacity-30 disabled:scale-100 cursor-pointer"
          title="Tal Vez"
        >
          <HelpCircle className="w-5.5 h-5.5 stroke-[2.5]" />
        </button>

        <button
          onClick={() => handleSwipe('LIKE')}
          disabled={currentIndex >= movies.length || isPending}
          className="w-14 h-14 rounded-full bg-blue-500/10 hover:bg-blue-500/20 active:scale-90 border border-blue-500/30 flex items-center justify-center text-blue-400 transition-all shadow-lg hover:shadow-blue-500/10 disabled:opacity-30 disabled:scale-100 cursor-pointer"
          title="Me Gusta"
        >
          <Heart className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>
    </div>
  )
}
