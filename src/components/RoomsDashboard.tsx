'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Star, Plus, Mail, Users, ArrowLeft, Copy, Check, Info, Film, Trash, Calendar } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { createRoom, fetchRoomsWithMatches, setGuestEmail, RoomWithMatches, MatchedMovie } from '@/app/actions/roomActions'
import ContentCard from './ContentCard'
import ShareRoomButton from './ShareRoomButton'

interface RoomsDashboardProps {
  initialRooms: RoomWithMatches[];
  currentUserEmail: string;
  currentUserId: string;
}

export default function RoomsDashboard({ initialRooms, currentUserEmail, currentUserId }: RoomsDashboardProps) {
  const [rooms, setRooms] = useState<RoomWithMatches[]>(initialRooms);
  const [roomName, setRoomName] = useState('');
  const [invitedEmail, setInvitedEmail] = useState('');
  const [sessionEmail, setSessionEmail] = useState(currentUserEmail);
  
  const [formStatus, setFormStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sync rooms in real-time using Supabase Realtime subscriptions
  useEffect(() => {
    const supabase = createClient();
    
    // Subscribe to public.user_interactions events
    const channel = supabase
      .channel('realtime-movie-matches')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_interactions' },
        async (payload) => {
          console.log('Realtime update detected in interactions:', payload);
          triggerRefresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const triggerRefresh = async () => {
    setIsRefreshing(true);
    const updatedRooms = await fetchRoomsWithMatches();
    setRooms(updatedRooms);
    setIsRefreshing(false);
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus(null);

    if (!roomName.trim() || !invitedEmail.trim()) {
      setFormStatus({ success: false, message: 'Por favor, rellena todos los campos.' });
      return;
    }

    const response = await createRoom(roomName, invitedEmail);
    
    if (response.success) {
      setFormStatus({ success: true, message: '¡Sala creada exitosamente!' });
      setRoomName('');
      setInvitedEmail('');
      triggerRefresh();
    } else {
      setFormStatus({ success: false, message: response.error || 'Error al crear la sala.' });
    }
  };

  const handleSaveEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailStatus(null);

    if (!sessionEmail.trim()) {
      setEmailStatus('El correo no puede estar vacío.');
      return;
    }

    const response = await setGuestEmail(sessionEmail);
    if (response.success) {
      setEmailStatus('Correo de sesión guardado. Recargando...');
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } else {
      setEmailStatus('Error al guardar el correo.');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentUserEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col p-6 h-full overflow-y-auto no-scrollbar pb-12 text-[#0F0F10]">
      {/* Rooms header */}
      <div className="flex items-center justify-between mb-6">
        <Link 
          href="/" 
          className="flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-[#7C3AED] transition-colors uppercase tracking-wider bg-white border border-[#E5E7EB] px-3 py-1.5 rounded-full"
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

      {/* Guest Session Configuration Guide (Extremely helpful for local dev testing) */}
      <ContentCard className="p-4 mb-6">
        <div className="flex gap-2.5 items-start">
          <Info className="w-5 h-5 text-[#7C3AED] shrink-0 mt-0.5" />
          <div className="text-left space-y-3 flex-1 min-w-0">
            <h3 className="text-xs font-semibold text-[#0F0F10] uppercase tracking-wider">
              Simulador de Parejas Local
            </h3>
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              Copia tu correo e invítalo desde otra ventana (por ejemplo, ventana de incógnito o navegador secundario) para simular matches en tiempo real.
            </p>
            
            <div className="flex gap-2">
              <div className="bg-[#FAFAFA] border border-[#E5E7EB] px-3 py-1.5 rounded-xl flex items-center justify-between flex-1 min-w-0 text-xs text-neutral-600 font-mono select-all truncate">
                {currentUserEmail}
              </div>
              <button 
                onClick={copyToClipboard}
                className="bg-white hover:bg-violet-50 border border-[#E5E7EB] p-2 rounded-xl text-[#1A1A1A] transition-all active:scale-95 cursor-pointer shrink-0"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Change Guest Email form */}
            <form onSubmit={handleSaveEmail} className="flex gap-2 pt-1">
              <input
                type="email"
                value={sessionEmail}
                onChange={(e) => setSessionEmail(e.target.value)}
                placeholder="Cambiar mi correo de sesión"
                className="bg-white border border-[#E5E7EB] text-xs px-3 py-1.5 rounded-xl text-[#1A1A1A] placeholder-neutral-400 flex-1 min-w-0 focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-violet-100"
              />
              <button 
                type="submit"
                className="bg-[#7C3AED] hover:bg-violet-700 border border-[#7C3AED] text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 active:scale-95"
              >
                Guardar
              </button>
            </form>
            {emailStatus && (
              <p className="text-[9px] text-amber-400 font-bold mt-1">{emailStatus}</p>
            )}
          </div>
        </div>
      </ContentCard>

      {/* Create room form */}
      <ContentCard className="p-5 mb-6 text-left">
        <h2 className="text-sm font-semibold text-[#0F0F10] uppercase tracking-wider mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#7C3AED]" />
          Crear Nueva Sala de Match
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
              className="w-full bg-white border border-[#E5E7EB] text-xs px-3.5 py-2 rounded-xl text-[#1A1A1A] placeholder-neutral-400 focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-violet-100"
            />
          </div>

          <div>
            <label className="block text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-1">
              Correo de tu Acompañante
            </label>
            <input
              type="email"
              value={invitedEmail}
              onChange={(e) => setInvitedEmail(e.target.value)}
              placeholder="Ej. mi_pareja@gmail.com"
              className="w-full bg-white border border-[#E5E7EB] text-xs px-3.5 py-2 rounded-xl text-[#1A1A1A] placeholder-neutral-400 focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-violet-100"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-[#7C3AED] hover:bg-violet-700 active:scale-[0.98] text-white text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2"
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

                <div className="flex justify-between items-start border-b border-[#F3F4F6] pb-3 mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-[#0F0F10] leading-snug">
                      {room.name}
                    </h3>
                    <p className="text-[10px] text-neutral-500 flex items-center gap-1.5 mt-0.5">
                      <Mail className="w-3 h-3 text-neutral-400" />
                      Invitado: {room.invited_email}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <ShareRoomButton token={room.invite_token} roomName={room.name} />
                    <Link
                      href={`/?room=${room.id}`}
                      className="text-[9px] font-black text-[#7C3AED] border border-violet-200 bg-violet-50 px-2.5 py-1 rounded-full uppercase tracking-wider hover:bg-violet-100 active:scale-95"
                    >
                      Entrar a votar
                    </Link>
                  </div>
                </div>

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
