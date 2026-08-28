'use server'

import { createClient } from '@/lib/supabase/server'
import { getMoviesByReleaseDate, getMovieCredits, type TMDBMovie, type TMDBCastMember } from '@/lib/tmdb'

interface RatingResponse {
  success: boolean;
  error?: string;
}

export async function saveMovieInteraction(
  movieId: number,
  rating: number,
): Promise<RatingResponse> {
  try {
    if (!Number.isInteger(rating) || rating < 1 || rating > 10) {
      return { success: false, error: 'La puntuación debe estar entre 1 y 10.' }
    }
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Debes iniciar sesión para votar.' }

    const { error: ratingError } = await supabase
      .from('user_interactions')
      .upsert({
        movie_id: movieId,
        rating,
        user_id: user.id,
      }, { onConflict: 'user_id,movie_id' })

    if (ratingError) {
      console.error('Error al guardar la puntuación:', ratingError);
      return { 
        success: false, 
        error: `No se pudo guardar la puntuación: ${ratingError.message}`
      };
    }

    return { success: true };
  } catch (error: unknown) {
    console.error('Error al guardar la puntuación:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Ocurrió un error inesperado al procesar la interacción.'
    };
  }
}

interface MovieQueueResponse {
  movies: TMDBMovie[]
  nextPage: number
}

const FALLBACK_MOVIES: TMDBMovie[] = [
  {
    id: 101,
    title: "Duna: Parte Dos",
    overview: "Paul Atreides se une a Chani y a los Fremen mientras busca venganza contra los conspiradores que destruyeron a su familia.",
    poster_path: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80",
    release_date: "2024-03-01",
    vote_average: 8.4
  },
  {
    id: 102,
    title: "Interestelar",
    overview: "Un grupo de exploradores espaciales viaja a través de un agujero de gusano para encontrar un nuevo hogar para la humanidad.",
    poster_path: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=80",
    release_date: "2014-11-07",
    vote_average: 8.6
  },
  {
    id: 103,
    title: "El Origen",
    overview: "Un especialista en robar secretos del subconsciente durante los sueños se enfrenta a una última misión para redimirse.",
    poster_path: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80",
    release_date: "2010-07-16",
    vote_average: 8.8
  }
];

export async function getUnratedMovieQueue(startPage: number): Promise<MovieQueueResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    for (let page = Math.max(1, startPage); page <= 50; page += 1) {
      try {
        const fetched = await getMoviesByReleaseDate(page)

        if (!user) {
          if (fetched.length > 0) return { movies: fetched, nextPage: page + 1 }
          continue;
        }

        // ⚡ Bolt Optimization: Constrained database querying inside loop
        // What: Fetch movies from TMDB first, then query Supabase restricted to those specific IDs using .in().
        // Why: Prevents fetching the user's entire interaction history at once, solving an O(total_ratings) bottleneck.
        // Impact: Keeps memory minimal and ensures constant query time regardless of the user's lifetime movie ratings.
        const currentIds = fetched.map(m => m.id);
        const { data: interactions } = await supabase
          .from('user_interactions')
          .select('movie_id')
          .eq('user_id', user.id)
          .in('movie_id', currentIds)

        let ratedIds = new Set<number>()
        if (interactions) {
          ratedIds = new Set(interactions.map(({ movie_id }) => movie_id))
        }

        const unrated = fetched.filter((movie) => !ratedIds.has(movie.id))
        if (unrated.length > 0) return { movies: unrated, nextPage: page + 1 }
      } catch (e) {
        console.error(`Error fetching page ${page}:`, e)
      }
    }
  } catch (error) {
    console.error("Error in getUnratedMovieQueue:", error)
  }

  return { movies: FALLBACK_MOVIES, nextPage: 1 }
}

export async function fetchMovieCast(movieId: number): Promise<TMDBCastMember[]> {
  try {
    const cast = await getMovieCredits(movieId);
    if (cast && cast.length > 0) return cast;
  } catch (error) {
    console.error('Error fetching movie cast in server action:', error);
  }
  return [];
}

export async function fetchWatchProviders(movieId: number): Promise<import('@/lib/tmdb').TMDBWatchProvider[]> {
  try {
    const providers = await import('@/lib/tmdb').then((m) => m.getWatchProviders(movieId));
    if (providers && providers.length > 0) return providers;
  } catch (error) {
    console.error('Error fetching watch providers in server action:', error);
  }
  return [];
}
