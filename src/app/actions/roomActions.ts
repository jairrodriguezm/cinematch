'use server'

import { createClient } from '@/lib/supabase/server'
import { getMoviesByIds } from '@/lib/tmdb'

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
  invite_token: string;
  created_at: string;
  matches: MatchedMovie[];
}

async function getAuthenticatedUser(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Action: Create a new matchmaking room.
 */
export async function createRoom(name: string, invitedEmail: string) {
  try {
    const supabase = await createClient();
    const user = await getAuthenticatedUser(supabase);

    if (!user) return { success: false, error: 'Debes iniciar sesión para crear una sala.' };

    if (!name || !invitedEmail) {
      return { success: false, error: 'Por favor complete todos los campos requeridos.' };
    }

    const { data: newRoom, error } = await supabase
      .from('rooms')
      .insert({
        name,
        invited_email: invitedEmail.trim().toLowerCase(),
        invite_token: crypto.randomUUID(),
        created_by: user.id,
        invited_user_id: null // Will map when the guest joins/claims it
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting room:', error);
      return { success: false, error: `Error al crear sala: ${error.message}` };
    }

    return { success: true, room: newRoom };
  } catch (error: unknown) {
    console.error('Exception in createRoom:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error interno al procesar la creación de sala.',
    };
  }
}

export async function joinRoomByToken(token: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(token)) {
    return { success: false, error: 'Invitación inválida.' };
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Debes iniciar sesión para unirte a una sala.' };
    }

    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('id, invited_user_id')
      .eq('invite_token', token)
      .single();

    if (roomError || !room) {
      return { success: false, error: 'Esta invitación no está disponible.' };
    }

    if (room.invited_user_id && room.invited_user_id !== user.id) {
      return { success: false, error: 'Esta invitación ya fue utilizada.' };
    }

    const { error: updateError } = await supabase
      .from('rooms')
      .update({ invited_user_id: user.id })
      .eq('id', room.id);

    if (updateError) {
      return { success: false, error: 'No fue posible unirte a la sala.' };
    }

    return { success: true, roomId: room.id };
  } catch {
    return { success: false, error: 'No fue posible procesar la invitación.' };
  }
}

/**
 * Action: Fetch all rooms associated with the user and compute matches.
 */
export async function fetchRoomsWithMatches(): Promise<RoomWithMatches[]> {
  try {
    const supabase = await createClient();
    const user = await getAuthenticatedUser(supabase);
    if (!user) return [];

    // Get rooms created by user OR rooms where user's email/id is invited
    const { data: rooms, error: roomsError } = await supabase
      .from('rooms')
      .select('*')
      .or(`created_by.eq.${user.id},invited_user_id.eq.${user.id},invited_email.eq.${user.email ?? ''}`);

    if (roomsError) {
      console.error('Error loading rooms:', roomsError);
      return [];
    }

    if (!rooms || rooms.length === 0) {
      return [];
    }

    const roomsWithMatches: RoomWithMatches[] = [];

    for (const room of rooms) {
      const memberIds = [room.created_by, room.invited_user_id].filter((id): id is string => Boolean(id));
      if (memberIds.length < 2) {
        roomsWithMatches.push({ ...room, matches: [] });
        continue;
      }

      // Ratings are user-owned, not room-owned. A room only determines its two members.
      const { data: interactions, error: interactionsError } = await supabase
        .from('user_interactions')
        .select('*')
        .in('user_id', memberIds);

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
        // Keep a single rating per user/movie pair.
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
        const ratingsByUser = new Map(votes.map((vote) => [vote.user_id, vote.rating]));
        if (memberIds.every((userId) => (ratingsByUser.get(userId) ?? 0) >= 7)) {
          matchedMovieIds.push({ movieId, matchType: 'PRIMARY' });
        }
      });

      if (matchedMovieIds.length === 0) {
        roomsWithMatches.push({ ...room, matches: [] });
        continue;
      }

      // Match metadata comes directly from TMDB, never from a Supabase movie catalog.
      const movieIds = matchedMovieIds.map(m => m.movieId);
      let moviesData: Awaited<ReturnType<typeof getMoviesByIds>>;
      try {
        moviesData = await getMoviesByIds(movieIds);
      } catch {
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
