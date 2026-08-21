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
export async function createRoom(roomName: string) {
  try {
    const supabase = await createClient();
    const user = await getAuthenticatedUser(supabase);

    if (!user) return { success: false, error: 'Debes iniciar sesión para crear una sala.' };

    if (!roomName) {
      return { success: false, error: 'Por favor complete todos los campos requeridos.' };
    }

    const { data: newRoom, error } = await supabase
      .from('rooms')
      .insert({
        name: roomName,
        invited_email: '',
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

export async function joinRoom(roomCode: string) {
  if (!roomCode) {
    return { success: false, error: 'Código inválido.' };
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
      .eq('invite_token', roomCode)
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

    // ⚡ Bolt Optimization: Batching user interactions and TMDB queries
    // What: Gather all unique member IDs and fetch interactions in one query, then fetch all unique matched movies in one TMDB call.
    // Why: Prevents the N+1 query problem where each room triggers a separate DB query and API call.
    // Impact: Changes O(N) database and API operations to O(1), dramatically improving dashboard load time and realtime sync speed.

    // 1. Gather all unique member IDs across all rooms
    const allMemberIds = new Set<string>();
    rooms.forEach(room => {
      if (room.created_by) allMemberIds.add(room.created_by);
      if (room.invited_user_id) allMemberIds.add(room.invited_user_id);
    });

    const uniqueMemberIds = Array.from(allMemberIds);
    let allInteractions: { user_id: string | null, movie_id: number, rating: number, [key: string]: any }[] = [];

    if (uniqueMemberIds.length > 0) {
      // 2. Fetch all interactions in a single query
      const { data: interactionsData, error: interactionsError } = await supabase
        .from('user_interactions')
        .select('*')
        .in('user_id', uniqueMemberIds);

      if (!interactionsError && interactionsData) {
        allInteractions = interactionsData;
      }
    }

    // 3. Pre-calculate matched movies for each room
    const roomMatchesMap = new Map<string, { movieId: number; matchType: 'PRIMARY' | 'SECONDARY' }[]>();
    const allMatchedMovieIds = new Set<number>();

    for (const room of rooms) {
      const memberIds = [room.created_by, room.invited_user_id].filter((id): id is string => Boolean(id));
      if (memberIds.length < 2) {
        roomMatchesMap.set(room.id, []);
        continue;
      }

      const roomInteractions = allInteractions.filter(i => i.user_id !== null && memberIds.includes(i.user_id));

      // Group interactions by movie_id
      const movieInteractionsMap: { [key: number]: typeof roomInteractions } = {};
      roomInteractions.forEach(interaction => {
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
          allMatchedMovieIds.add(movieId);
        }
      });

      roomMatchesMap.set(room.id, matchedMovieIds);
    }

    // 4. Fetch all matched movies from TMDB in a single batched call
    let globalMoviesData: Awaited<ReturnType<typeof getMoviesByIds>> = [];
    if (allMatchedMovieIds.size > 0) {
      try {
        globalMoviesData = await getMoviesByIds(Array.from(allMatchedMovieIds));
      } catch (e) {
        console.error('Error fetching batched movies from TMDB:', e);
      }
    }

    // 5. Distribute matches back to rooms
    for (const room of rooms) {
      const matchedMovieIds = roomMatchesMap.get(room.id) || [];
      if (matchedMovieIds.length === 0) {
        roomsWithMatches.push({ ...room, matches: [] });
        continue;
      }

      const movieIds = matchedMovieIds.map(m => m.movieId);
      const roomMoviesData = globalMoviesData.filter(movie => movieIds.includes(movie.id));

      const matches: MatchedMovie[] = roomMoviesData.map(movie => {
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

export async function getRoomMatches(roomId: string): Promise<RoomWithMatches | null> {
  try {
    const supabase = await createClient();
    const user = await getAuthenticatedUser(supabase);
    if (!user) return null;

    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (roomError || !room) {
      return null;
    }

    const memberIds = [room.created_by, room.invited_user_id].filter((id): id is string => Boolean(id));
    if (memberIds.length < 2) {
      return { ...room, matches: [] };
    }

    const { data: interactions, error: interactionsError } = await supabase
      .from('user_interactions')
      .select('*')
      .in('user_id', memberIds);

    if (interactionsError || !interactions) {
      return { ...room, matches: [] };
    }

    const movieInteractionsMap: { [key: number]: typeof interactions } = {};
    interactions.forEach(interaction => {
      if (!movieInteractionsMap[interaction.movie_id]) {
        movieInteractionsMap[interaction.movie_id] = [];
      }
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

      const participantRatings = memberIds.map(id => ratingsByUser.get(id) ?? 0);
      if (participantRatings.every(rating => rating >= 7)) {
        matchedMovieIds.push({ movieId, matchType: 'PRIMARY' });
      }
    });

    if (matchedMovieIds.length === 0) {
      return { ...room, matches: [] };
    }

    const movieIds = matchedMovieIds.map(m => m.movieId);
    const moviesData = await getMoviesByIds(movieIds);

    const matches: MatchedMovie[] = moviesData.map(movie => {
      const matchInfo = matchedMovieIds.find(m => m.movieId === movie.id);
      return {
        ...movie,
        matchType: matchInfo?.matchType || 'SECONDARY'
      };
    });

    return {
      ...room,
      matches
    };
  } catch (err) {
    console.error('Exception in getRoomMatches:', err);
    return null;
  }
}
