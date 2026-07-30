import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { fetchRoomsWithMatches } from '@/app/actions/roomActions'
import RoomsDashboard from '@/components/RoomsDashboard'

// Disable static generation to force dynamic credentials lookup
export const dynamic = 'force-dynamic';

export default async function RoomsPage() {
  const supabase = await createClient();
  
  // Resolve current active session or persistent guest profile
  const { data: { user } } = await supabase.auth.getUser();
  const cookieStore = await cookies();
  
  let guestId = cookieStore.get('cinematch_user_id')?.value;
  let guestEmail = cookieStore.get('cinematch_guest_email')?.value || 'invitado@cinematch.com';

  if (!guestId) {
    guestId = crypto.randomUUID();
    cookieStore.set('cinematch_user_id', guestId, { maxAge: 60 * 60 * 24 * 365, path: '/' });
  }

  const currentUserId = user?.id || guestId;
  const currentUserEmail = user?.email || guestEmail;

  // Fetch initial room structures with movie matches
  const initialRooms = await fetchRoomsWithMatches();

  return (
    <RoomsDashboard 
      initialRooms={initialRooms} 
      currentUserEmail={currentUserEmail} 
      currentUserId={currentUserId} 
    />
  );
}
