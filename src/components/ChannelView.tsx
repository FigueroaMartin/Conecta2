import { useState, useEffect } from 'react';
import { supabase, type ChannelUser } from '../lib/supabase';
import Chat from './Chat';
import VideoRoom from './VideoRoom';

interface ChannelViewProps {
  channelId: string;
  username: string;
}

type ViewMode = 'chat' | 'video';

export default function ChannelView({ channelId, username }: ChannelViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('chat');
  const [users, setUsers] = useState<ChannelUser[]>([]);

  useEffect(() => {
    if (!channelId) return;

    // Registrar usuario en el canal
    const registerUser = async () => {
      try {
        const { error } = await supabase
          .from('channel_users')
          .insert([{ channel_id: channelId, username }]);

        if (error) throw error;
      } catch (error) {
        console.error('Error al registrar usuario:', error);
      }
    };

    registerUser();

    // Cargar usuarios del canal
    fetchUsers();

    // Suscripción en tiempo real para usuarios
    const channel = supabase
      .channel(`channel_users:${channelId}`)
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'channel_users',
          filter: `channel_id=eq.${channelId}`
        },
        () => {
          fetchUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('channel_users')
        .select('*')
        .eq('channel_id', channelId)
        .order('joined_at', { ascending: true });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header con tabs */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="flex">
          <button
            onClick={() => setViewMode('chat')}
            className={`flex-1 px-6 py-3 font-semibold transition-colors ${
              viewMode === 'chat'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            💬 Chat
          </button>
          <button
            onClick={() => setViewMode('video')}
            className={`flex-1 px-6 py-3 font-semibold transition-colors ${
              viewMode === 'video'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            📹 Video
          </button>
        </div>
      </div>

      {/* Usuarios en línea */}
      <div className="bg-gray-800 px-4 py-2 border-b border-gray-700">
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <span className="font-semibold">Usuarios en línea:</span>
          <div className="flex gap-2 flex-wrap">
            {users.map((user) => (
              <span
                key={user.id}
                className="bg-gray-700 px-2 py-1 rounded text-xs"
              >
                {user.username}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Contenido según el modo */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'chat' ? (
          <Chat channelId={channelId} username={username} />
        ) : (
          <VideoRoom channelId={channelId} username={username} />
        )}
      </div>
    </div>
  );
}

