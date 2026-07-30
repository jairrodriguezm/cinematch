'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'

export interface MatchedMovie {
  id: number;
  title: string;
  overview: string | null;
  poster_path: string | null;
  release_date: string | null;
  vote_average: number | null;
  matchType: 'PRIMARY' | 'SECONDARY';
}

export interface RoomWithMatches {
  id: string;
  name: string;
  invited_email: string;
  created_by: string | null;
  invited_user_id: string | null;
  created_at: string;
  matches: MatchedMovie[];
}

/**
 * Ensures a persistent guest user ID exists in the cookies if not logged in.
 */
async function getOrRegisterUserId(supabase: any): Promise<{ userId: string; email: string }> {
  // Check if authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    return { userId: user.id, email: user.email || '' };
  }

  // Fallback to guest cookie ID
  const cookieStore = await cookies();
  let guestId = cookieStore.get('cinematch_user_id')?.value;
  let guestEmail = cookieStore.get('cinematch_guest_email')?.value || 'invitado@cinematch.com';
  
  if (!guestId) {
    guestId = crypto.randomUUID();
    cookieStore.set('cinematch_user_id', guestId, { maxAge: 60 * 60 * 24 * 365, path: '/' });
  }

  return { userId: guestId, email: guestEmail };
}

/**
 * Action: Create a new matchmaking room.
 */
export async function createRoom(name: string, invitedEmail: string) {
  try {
    const supabase = await createClient();
    const { userId } = await getOrRegisterUserId(supabase);

    if (!name || !invitedEmail) {
      return { success: false, error: 'Por favor complete todos los campos requeridos.' };
    }

    const { data: newRoom, error } = await supabase
      .from('rooms')
      .insert({
        name,
        invited_email: invitedEmail.trim().toLowerCase(),
        created_by: userId,
        invited_user_id: null // Will map when the guest joins/claims it
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting room:', error);
      return { success: false, error: `Error al crear sala: ${error.message}` };
    }

    return { success: true, room: newRoom };
  } catch (error: any) {
    console.error('Exception in createRoom:', error);
    return { success: false, error: error.message || 'Error interno al procesar la creación de sala.' };
  }
}

/**
 * Action: Fetch all rooms associated with the user and compute matches.
 */
export async function fetchRoomsWithMatches(): Promise<RoomWithMatches[]> {
  try {
    const supabase = await createClient();
    const { userId, email } = await getOrRegisterUserId(supabase);

    // Get rooms created by user OR rooms where user's email/id is invited
    const { data: rooms, error: roomsError } = await supabase
      .from('rooms')
      .select('*')
      .or(`created_by.eq.${userId},invited_user_id.eq.${userId},invited_email.eq.${email}`);

    if (roomsError) {
      console.error('Error loading rooms:', roomsError);
      return [];
    }

    if (!rooms || rooms.length === 0) {
      return [];
    }

    const roomsWithMatches: RoomWithMatches[] = [];

    for (const room of rooms) {
      // 1. Fetch all user interactions in this room
      const { data: interactions, error: interactionsError } = await supabase
        .from('user_interactions')
        .select('*')
        .eq('room_id', room.id);

      if (interactionsError || !interactions) {
        roomsWithMatches.push({ ...room, matches: [] });
        continue;
      }

      // Group interactions by movie_id
      const movieInteractionsMap: { [key: number]: typeof interactions } = {};
      interactions.forEach(interaction => {
        if (!movieInteractionsMap[interaction.movie_id]) {
          movieInteractionsMap[interaction.movie_id] = [];
        }
        // Avoid duplicate votes from the same user on the same movie
        const alreadyExists = movieInteractionsMap[interaction.movie_id].some(
          existing => existing.user_id === interaction.user_id
        );
        if (!alreadyExists) {
          movieInteractionsMap[interaction.movie_id].push(interaction);
        }
      });

      const matchedMovieIds: { movieId: number; matchType: 'PRIMARY' | 'SECONDARY' }[] = [];

      Object.entries(movieInteractionsMap).forEach(([movieIdStr, votes]) => {
        const movieId = parseInt(movieIdStr);
        // We need exactly two different members' votes to form a match in this room
        if (votes.length >= 2) {
          const vote1 = votes[0];
          const vote2 = votes[1];

          const isPrimary = vote1.action === 'LIKE' && vote2.action === 'LIKE';
          const isSecondary = 
            (vote1.action === 'LIKE' || vote1.action === 'MAYBE') &&
            (vote2.action === 'LIKE' || vote2.action === 'MAYBE') &&
            !isPrimary;

          if (isPrimary) {
            matchedMovieIds.push({ movieId, matchType: 'PRIMARY' });
          } else if (isSecondary) {
            matchedMovieIds.push({ movieId, matchType: 'SECONDARY' });
          }
        }
      });

      if (matchedMovieIds.length === 0) {
        roomsWithMatches.push({ ...room, matches: [] });
        continue;
      }

      // Fetch matching movies descriptions
      const movieIds = matchedMovieIds.map(m => m.movieId);
      const { data: moviesData, error: moviesError } = await supabase
        .from('movies')
        .select('*')
        .in('id', movieIds);

      if (moviesError || !moviesData) {
        roomsWithMatches.push({ ...room, matches: [] });
        continue;
      }

      // Map matching type back to movies details
      const matches: MatchedMovie[] = moviesData.map(movie => {
        const matchInfo = matchedMovieIds.find(m => m.movieId === movie.id);
        return {
          ...movie,
          matchType: matchInfo?.matchType || 'SECONDARY'
        };
      });

      roomsWithMatches.push({
        ...room,
        matches
      });
    }

    return roomsWithMatches;
  } catch (err) {
    console.error('Exception fetching rooms with matches:', err);
    return [];
  }
}

/**
 * Action: Set guest email in cookies for local testing.
 */
export async function setGuestEmail(email: string) {
  try {
    const cookieStore = await cookies();
    cookieStore.set('cinematch_guest_email', email.trim().toLowerCase(), { maxAge: 60 * 60 * 24 * 365, path: '/' });
    return { success: true };
  } catch (error: any) {
    console.error('Error saving guest email:', error);
    return { success: false, error: error.message || 'Error al guardar el correo de invitado.' };
  }
}

