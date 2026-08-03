'use server'

import { createClient } from '@/lib/supabase/server'
import { getMoviesByReleaseDate, type TMDBMovie } from '@/lib/tmdb'

interface RatingResponse {
  success: boolean;
  error?: string;
}

/**
 * Saves one user-owned numeric rating for a TMDB movie.
 */
export async function saveMovieInteraction(
  movieId: number,
  rating: number,
): Promise<RatingResponse> {
  try {
    if (!Number.isInteger(rating) || rating < 1 || rating > 10) {
      return { success: false, error: 'La puntuación debe estar entre 1 y 10.' }
    }
    const supabase = await createClient();

    // Authentication is required; movie data stays in TMDB, never in Supabase.
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
      error: error instanceof Error ? error.message : 'Ocurrió un error inesperado al procesar la interacción en el servidor.'
    };
  }
}

interface MovieQueueResponse {
  movies: TMDBMovie[]
  nextPage: number
}

export async function getUnratedMovieQueue(startPage: number): Promise<MovieQueueResponse> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { movies: [], nextPage: Math.max(1, startPage) }

  const { data: interactions, error } = await supabase
    .from('user_interactions')
    .select('movie_id')
    .eq('user_id', user.id)

  const ratedIds = error ? new Set<number>() : new Set((interactions ?? []).map(({ movie_id }) => movie_id))
  for (let page = Math.max(1, startPage); page <= 500; page += 1) {
    const movies = (await getMoviesByReleaseDate(page)).filter((movie) => !ratedIds.has(movie.id))
    if (movies.length > 0) return { movies, nextPage: page + 1 }
  }

  return { movies: [], nextPage: 501 }
}
