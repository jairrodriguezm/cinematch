import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { fetchRoomsWithMatches } from '@/app/actions/roomActions'
import RoomsDashboard from '@/components/RoomsDashboard'

// Disable static generation to force dynamic credentials lookup
export const dynamic = 'force-dynamic';

export default async function RoomsPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/rooms');

  // Fetch initial room structures with movie matches
  const initialRooms = await fetchRoomsWithMatches();

  return <RoomsDashboard initialRooms={initialRooms} />;
}
