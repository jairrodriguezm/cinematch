export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
}

/**
 * Fetches popular and recent movies sorted by primary release date descending from TMDB.
 * Returns only the specified fields with localized Spanish metadata.
 */
export async function getMoviesByReleaseDate(page: number): Promise<TMDBMovie[]> {
  const apiKey = process.env.TMDB_API_KEY;
  const imageBaseUrl = process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p/w500';

  if (!apiKey || apiKey === 'tu_api_key_de_tmdb') {
    console.warn('TMDB API key is missing or set to placeholder.');
    throw new Error('La clave API de TMDB no está configurada correctamente en las variables de entorno.');
  }

  // Get current date to avoid future unreleased placeholders
  const today = new Date().toISOString().split('T')[0];

  const params = new URLSearchParams({
    api_key: apiKey,
    language: 'es-ES',
    sort_by: 'primary_release_date.desc',
    include_adult: 'false',
    page: String(page),
    'primary_release_date.lte': today,
    'vote_count.gte': '5', // ensure we fetch movies with basic reviews/visibility
  });

  const url = `https://api.themoviedb.org/3/discover/movie?${params.toString()}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 }, // Cache the fetch for 1 hour
    });

    if (!res.ok) {
      throw new Error(`Error de TMDB API: código de respuesta ${res.status}`);
    }

    const data = await res.json();
    
    if (!data.results || !Array.isArray(data.results)) {
      return [];
    }

    return data.results.map((movie: any) => ({
      id: movie.id,
      title: movie.title,
      overview: movie.overview || 'Sin descripción disponible.',
      poster_path: movie.poster_path ? `${imageBaseUrl}${movie.poster_path}` : null,
      release_date: movie.release_date || '',
      vote_average: movie.vote_average || 0,
    }));
  } catch (error: any) {
    console.error('Error in getMoviesByReleaseDate:', error);
    throw new Error(error.message || 'Error al conectar con la API de películas TMDB');
  }
}
