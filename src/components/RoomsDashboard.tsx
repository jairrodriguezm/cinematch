'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Mail, Users, ArrowLeft, Film } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { createRoom, joinRoom, fetchRoomsWithMatches, RoomWithMatches } from '@/app/actions/roomActions'
import ContentCard from './ContentCard'
import ShareRoomButton from './ShareRoomButton'

interface RoomsDashboardProps {
  initialRooms: RoomWithMatches[];
}

export default function RoomsDashboard({ initialRooms }: RoomsDashboardProps) {
  const [rooms, setRooms] = useState<RoomWithMatches[]>(initialRooms);
  const [roomName, setRoomName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [formStatus, setFormStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [joinStatus, setJoinStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const roomsRef = useRef(rooms);

  useEffect(() => {
    roomsRef.current = rooms;
  }, [rooms]);

  const triggerRefresh = useCallback(async () => {
    setIsRefreshing(true);
    const updatedRooms = await fetchRoomsWithMatches();
    setRooms(updatedRooms);
    setIsRefreshing(false);
  }, []);

  // Sync rooms in real-time using Supabase Realtime subscriptions
  useEffect(() => {
    const supabase = createClient();
    
    // Subscribe to public.user_interactions events
    const channel = supabase
      .channel('realtime-movie-matches')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_interactions' },
        (payload) => {
          // ⚡ Bolt Optimization: Real-time filtering
          // Check if the interaction event is relevant to the user's current rooms
          const currentRooms = roomsRef.current;
          const relevantMembers = new Set<string>();
          currentRooms.forEach(room => {
            if (room.created_by) relevantMembers.add(room.created_by);
            if (room.invited_user_id) relevantMembers.add(room.invited_user_id);
          });

          // Only trigger refresh if the interacting user is part of our rooms
          if (payload.new && 'user_id' in payload.new && typeof payload.new.user_id === 'string' && relevantMembers.has(payload.new.user_id)) {
            console.log('Relevant realtime update detected in interactions:', payload);
            void triggerRefresh();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [triggerRefresh]);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus(null);

    if (!roomName.trim()) {
      setFormStatus({ success: false, message: 'Por favor, rellena todos los campos.' });
      return;
    }

    const response = await createRoom(roomName);
    
    if (response.success) {
      setFormStatus({ success: true, message: '¡Sala creada exitosamente!' });
      setRoomName('');
      triggerRefresh();
    } else {
      setFormStatus({ success: false, message: response.error || 'Error al crear la sala.' });
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinStatus(null);

    if (!roomCode.trim()) {
      setJoinStatus({ success: false, message: 'Por favor, ingresa el código.' });
      return;
    }

    const response = await joinRoom(roomCode.trim());

    if (response.success) {
      setJoinStatus({ success: true, message: '¡Te has unido a la sala exitosamente!' });
      setRoomCode('');
      triggerRefresh();
    } else {
      setJoinStatus({ success: false, message: response.error || 'Error al unirse a la sala.' });
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 h-full overflow-y-auto no-scrollbar pb-12 text-[#0F0F10]">
      {/* Rooms header */}
      <div className="flex items-center justify-between mb-6">
        <Link 
          href="/" 
          className="flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-[#f5c518] transition-colors uppercase tracking-wider bg-white border border-[#E5E7EB] px-3 py-1.5 rounded-full"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver a Deslizar
        </Link>
        <span className="text-[10px] font-black text-neutral-500 tracking-widest uppercase">
          Salas de Coincidencia
        </span>
      </div>

      <h1 className="text-xl font-semibold text-[#0F0F10] tracking-tight mb-8">
        MIS SALAS DE MATCH
      </h1>

      {/* Forms Section */}
      <div className="grid gap-6 mb-6">
        {/* Create room form */}
        <ContentCard className="p-5 text-left">
          <h2 className="text-sm font-semibold text-[#0F0F10] uppercase tracking-wider mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#bc96ff]" />
            Crear Nueva Sala
          </h2>

          <form onSubmit={handleCreateRoom} className="space-y-3.5">
            <div>
              <label className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-1">
                Nombre de la Sala
              </label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Ej. Cine de Fin de Semana"
                className="w-full bg-white border border-[#E5E7EB] text-xs px-3.5 py-2 rounded-full text-[#1A1A1A] placeholder-neutral-400 focus:outline-none focus:border-[#bc96ff] focus:ring-2 focus:ring-[#bc96ff]/20 transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-full bg-gradient-to-r from-[#bc96ff] to-[#ff4365] hover:opacity-90 active:scale-[0.98] text-white text-xs font-extrabold transition-all shadow-[0_0_15px_rgba(188,150,255,0.4)] cursor-pointer flex items-center justify-center gap-2"
            >
              <Users className="w-4 h-4" />
              Crear Sala
            </button>
          </form>

          <AnimatePresence>
            {formStatus && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`text-xs font-bold mt-3 text-center ${
                  formStatus.success ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {formStatus.message}
              </motion.p>
            )}
          </AnimatePresence>
        </ContentCard>

        {/* Join room form */}
        <ContentCard className="p-5 text-left">
          <h2 className="text-sm font-semibold text-[#0F0F10] uppercase tracking-wider mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#ff4365]" />
            Unirse con Código
          </h2>

          <form onSubmit={handleJoinRoom} className="space-y-3.5">
            <div>
              <label className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-1">
                Código de la Sala
              </label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                placeholder="Pega el código aquí"
                className="w-full bg-white border border-[#E5E7EB] text-xs px-3.5 py-2 rounded-full text-[#1A1A1A] placeholder-neutral-400 focus:outline-none focus:border-[#ff4365] focus:ring-2 focus:ring-[#ff4365]/20 transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-full bg-gradient-to-r from-[#ff4365] to-[#bc96ff] hover:opacity-90 active:scale-[0.98] text-white text-xs font-extrabold transition-all shadow-[0_0_15px_rgba(255,67,101,0.4)] cursor-pointer flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Unirse
            </button>
          </form>

          <AnimatePresence>
            {joinStatus && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`text-xs font-bold mt-3 text-center ${
                  joinStatus.success ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {joinStatus.message}
              </motion.p>
            )}
          </AnimatePresence>
        </ContentCard>
      </div>

      {/* Match Rooms List */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-3 text-left">
          <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
            Tus Salas Activas {isRefreshing && '(Actualizando...)'}
          </h2>
        </div>

        <div className="space-y-4">
          {rooms.length > 0 ? (
            rooms.map((room) => (
              <ContentCard key={room.id} className="p-4 text-left relative overflow-hidden">
                {/* Background match indicator blur */}
                {room.matches.length > 0 && (
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-tr from-emerald-500/10 to-blue-500/10 rounded-full blur-2xl pointer-events-none" />
                )}

                <Link href={`/rooms/${room.id}`} className="block">
                  <div className="flex justify-between items-start border-b border-[#F3F4F6] pb-3 mb-3 cursor-pointer hover:bg-gray-50/50 rounded-t-xl transition-colors p-2 -mx-2 -mt-2">
                    <div>
                      <h3 className="text-sm font-semibold text-[#0F0F10] leading-snug">
                        {room.name}
                      </h3>
                      <p className="text-[10px] text-neutral-500 flex items-center gap-1.5 mt-0.5">
                        <Users className="w-3 h-3 text-neutral-400" />
                        Ver Detalles
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[9px] font-black text-white bg-gradient-to-r from-[#bc96ff] to-[#ff4365] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                        Entrar
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Matches Grid inside Room */}
                <div>
                  <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-2">
                    Coincidencias ({room.matches.length})
                  </h4>

                  {room.matches.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {room.matches.map((movie) => (
                        <div 
                          key={movie.id} 
                          className="bg-[#F3F4F6] rounded-2xl border border-neutral-200/70 overflow-hidden flex flex-col p-1.5 relative group"
                        >
                          <div className="relative w-full aspect-[9/13] rounded-xl overflow-hidden">
                            {movie.poster_path ? (
                              <img
                                src={movie.poster_path}
                                alt={movie.title}
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover select-none pointer-events-none"
                              />
                            ) : (
                              <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-600 text-[9px] font-semibold">
                                Sin Póster
                              </div>
                            )}

                            {/* Match Type Overlay Tag */}
                            <div className={`absolute bottom-1.5 inset-x-1.5 px-1.5 py-0.5 rounded-md text-[8px] font-black tracking-wide uppercase text-center shadow-sm ${
                              movie.matchType === 'PRIMARY' 
                                ? 'bg-emerald-500/80 text-white border border-emerald-400/30' 
                                : 'bg-amber-500/80 text-white border border-amber-400/30'
                            }`}>
                              {movie.matchType === 'PRIMARY' ? '❤️ Total' : '⭐ Parcial'}
                            </div>
                          </div>

                          <div className="mt-1.5 text-left px-0.5">
                            <p className="text-[10px] font-semibold text-[#0F0F10] truncate" title={movie.title}>
                              {movie.title}
                            </p>
                            <p className="text-[8px] text-neutral-500 mt-0.5 truncate leading-none">
                              {movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-[#FAFAFA] rounded-xl border border-dashed border-[#E5E7EB] p-4 text-center">
                      <Film className="w-5 h-5 text-slate-600 mx-auto mb-1.5" />
                      <p className="text-[10px] text-neutral-500 leading-normal max-w-[200px] mx-auto">
                        No hay coincidencias todavía. Comiencen a deslizar las películas vinculados a esta sala.
                      </p>
                    </div>
                  )}
                </div>
              </ContentCard>
            ))
          ) : (
            <div className="bg-[#FAFAFA] border border-dashed border-[#E5E7EB] rounded-2xl p-8 text-center mt-4">
              <Users className="w-8 h-8 text-neutral-400 mx-auto mb-3" />
              <p className="text-xs text-neutral-500 leading-relaxed max-w-[220px] mx-auto">
                No tienes salas creadas todavía. Crea una para invitar a tu pareja o amigos a buscar películas juntos.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
