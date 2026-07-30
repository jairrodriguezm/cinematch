import { getMoviesByReleaseDate, TMDBMovie } from '@/lib/tmdb';
import MovieDeck, { MOCK_DECK_MOVIES } from '@/components/MovieDeck';

// Ensure the page does not cache environment variables statically
export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home({ searchParams }: PageProps) {
  let initialMovies: TMDBMovie[] = [];
  let isFallback = false;

  const resolvedParams = await searchParams;
  const roomParam = resolvedParams.room;
  const roomId = typeof roomParam === 'string' ? roomParam : undefined;

  try {
    initialMovies = await getMoviesByReleaseDate(1);
  } catch (error) {
    console.warn("Cargando películas locales de respaldo debido a un error de conexión o API key:", error);
    initialMovies = MOCK_DECK_MOVIES;
    isFallback = true;
  }

  return (
    <main className="flex-1 flex flex-col justify-between h-full">
      <MovieDeck movies={initialMovies} isFallback={isFallback} roomId={roomId} />
    </main>
  );
}
