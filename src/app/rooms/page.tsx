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
  
  const guestId = cookieStore.get('cinematch_user_id')?.value || crypto.randomUUID();
  const guestEmail = cookieStore.get('cinematch_guest_email')?.value || 'invitado@cinematch.com';

  const currentUserId = user?.id || guestId;
  const currentUserEmail = user?.email || guestEmail;

  // Fetch initial room structures with movie matches
  const initialRooms = await fetchRoomsWithMatches(currentUserId, currentUserEmail);

  return (
    <RoomsDashboard 
      initialRooms={initialRooms} 
      currentUserEmail={currentUserEmail} 
      currentUserId={currentUserId} 
    />
  );
}
