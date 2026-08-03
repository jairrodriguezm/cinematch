import MovieDeck from '@/components/MovieDeck';

// Ensure the page does not cache environment variables statically
export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const roomParam = resolvedParams.room;
  const roomId = typeof roomParam === 'string' ? roomParam : undefined;

  return (
    <main className="flex-1 flex flex-col justify-between h-full">
      <MovieDeck roomId={roomId} />
    </main>
  );
}
