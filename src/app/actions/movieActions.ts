'use server'

import { createClient } from '@/lib/supabase/server'
import { MovieInteractionAction } from '@/types/database'
import { cookies } from 'next/headers'

interface InteractionResponse {
  success: boolean;
  error?: string;
}

/**
 * Upserts a movie into the `movies` table if not present,
 * and inserts a swipe record ('LIKE', 'MAYBE', 'DISCARD') into `user_interactions`.
 */
export async function saveMovieInteraction(
  movieId: number,
  title: string,
  action: MovieInteractionAction,
  roomId?: string
): Promise<InteractionResponse> {
  try {
    const supabase = await createClient();

    // 1. Upsert the movie information into the movies database table
    const { error: movieError } = await supabase
      .from('movies')
      .upsert({ id: movieId, title }, { onConflict: 'id' });

    if (movieError) {
      console.error('Error al realizar upsert de la película:', movieError);
      return { 
        success: false, 
        error: `No se pudo registrar la película en la base de datos: ${movieError.message}` 
      };
    }

    // 2. Fetch authenticated user, fallback to guest cookie id
    const { data: { user } } = await supabase.auth.getUser();
    
    const cookieStore = await cookies();
    let guestId = cookieStore.get('cinematch_user_id')?.value;
    if (!guestId) {
      guestId = crypto.randomUUID();
      cookieStore.set('cinematch_user_id', guestId, { maxAge: 60 * 60 * 24 * 365, path: '/' });
    }
    const finalUserId = user?.id || guestId;

    // 3. Save the swipe choice
    const { error: interactionError } = await supabase
      .from('user_interactions')
      .insert({
        movie_id: movieId,
        action: action,
        user_id: finalUserId,
        room_id: roomId || null
      });

    if (interactionError) {
      console.error('Error al insertar interacción de usuario:', interactionError);
      return { 
        success: false, 
        error: `No se pudo registrar su interacción: ${interactionError.message}` 
      };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Excepción atrapada en saveMovieInteraction Server Action:', error);
    return { 
      success: false, 
      error: error.message || 'Ocurrió un error inesperado al procesar la interacción en el servidor.' 
    };
  }
}
