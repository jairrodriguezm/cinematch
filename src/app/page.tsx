import MovieDeck from '@/components/MovieDeck';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const roomParam = resolvedParams.room;
  const roomId = typeof roomParam === 'string' ? roomParam : undefined;

  return (
    <main className="flex-1 flex flex-col justify-between h-full overflow-hidden bg-black">
      <MovieDeck roomId={roomId} />
    </main>
  );
}
