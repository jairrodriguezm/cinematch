import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getRoomMatches } from '@/app/actions/roomActions'
import Link from 'next/link'
import { ArrowLeft, Users, Film } from 'lucide-react'
import CopyTokenButton from '@/components/CopyTokenButton'

export const dynamic = 'force-dynamic';

interface RoomDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function RoomDetailPage({ params }: RoomDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/rooms/${id}`);

  const room = await getRoomMatches(id);

  if (!room) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-[#0F0F10]">
        <h1 className="text-xl font-bold mb-4">Sala no encontrada</h1>
        <Link href="/rooms" className="text-sm font-semibold text-[#bc96ff] hover:underline">
          Volver a Mis Salas
        </Link>
      </div>
    );
  }

  // Check if current user is part of the room
  const isMember = room.created_by === user.id || room.invited_user_id === user.id;
  if (!isMember) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-[#0F0F10]">
        <h1 className="text-xl font-bold mb-4">Acceso Denegado</h1>
        <p className="text-sm text-neutral-500 mb-4 text-center">No tienes permiso para ver esta sala.</p>
        <Link href="/rooms" className="text-sm font-semibold text-[#bc96ff] hover:underline">
          Volver a Mis Salas
        </Link>
      </div>
    );
  }

  const primaryMatches = room.matches.filter(m => m.matchType === 'PRIMARY');

  return (
    <div className="flex-1 flex flex-col p-6 h-full overflow-y-auto no-scrollbar pb-12 text-[#0F0F10]">
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/rooms"
          className="flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-[#bc96ff] transition-colors uppercase tracking-wider bg-white border border-[#E5E7EB] px-3 py-1.5 rounded-full"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Mis Salas
        </Link>
        <span className="text-[10px] font-black text-neutral-500 tracking-widest uppercase">
          Detalles de Sala
        </span>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-[#0F0F10] tracking-tight mb-2">
          {room.name}
        </h1>

        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-500">
              U1
            </div>
            {room.invited_user_id && (
              <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-500">
                U2
              </div>
            )}
          </div>
          <span className="text-xs font-bold text-neutral-500">
            {room.invited_user_id ? '2 miembros activos' : 'Esperando a tu acompañante...'}
          </span>
        </div>

        <div className="flex justify-center">
          <CopyTokenButton token={room.invite_token} />
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4 text-left border-b border-[#E5E7EB] pb-2">
          <h2 className="text-sm font-bold text-[#0F0F10] uppercase tracking-widest flex items-center gap-2">
            ¡Hicieron Match! 🎉
          </h2>
          <span className="text-xs font-bold text-[#bc96ff]">{primaryMatches.length} en Total</span>
        </div>

        <div className="space-y-4">
          {primaryMatches.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {primaryMatches.map((movie) => (
                <div
                  key={movie.id}
                  className="bg-[#F3F4F6] rounded-2xl border border-neutral-200/70 overflow-hidden flex flex-col p-1.5 relative group"
                >
                  <div className="relative w-full aspect-[9/13] rounded-xl overflow-hidden">
                    {movie.poster_path ? (
                      <img
                        src={movie.poster_path}
                        alt={movie.title}
                        className="w-full h-full object-cover select-none pointer-events-none"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-600 text-[9px] font-semibold">
                        Sin Póster
                      </div>
                    )}

                    <div className="absolute top-1.5 right-1.5 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-xs font-bold text-white">
                      ❤️
                    </div>
                  </div>

                  <div className="mt-2 text-left px-1 pb-1">
                    <p className="text-xs font-semibold text-[#0F0F10] truncate" title={movie.title}>
                      {movie.title}
                    </p>
                    <p className="text-[10px] text-neutral-500 mt-0.5 truncate leading-none">
                      {movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#FAFAFA] border border-dashed border-[#E5E7EB] rounded-2xl p-8 text-center mt-4">
              <Film className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
              <p className="text-xs text-neutral-500 leading-relaxed max-w-[220px] mx-auto">
                No hay matches de puntuación alta todavía. Continúen calificando películas para encontrar coincidencias.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
