import { useState, useEffect } from 'react';
import { supabase, type Channel } from '../lib/supabase';

interface ChannelListProps {
  onSelectChannel: (channel: Channel) => void;
  currentChannelId?: string;
}

export default function ChannelList({ onSelectChannel, currentChannelId }: ChannelListProps) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChannels();
    
    // Suscripción en tiempo real
    const channel = supabase
      .channel('channels')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'channels' },
        () => {
          fetchChannels();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchChannels = async () => {
    try {
      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChannels(data || []);
    } catch (error) {
      console.error('Error al cargar canales:', error);
    } finally {
      setLoading(false);
    }
  };

  const createChannel = async () => {
    const name = prompt('Nombre del canal:');
    if (!name) return;

    try {
      const { data, error } = await supabase
        .from('channels')
        .insert([{ name }])
        .select()
        .single();

      if (error) throw error;
      if (data) onSelectChannel(data);
    } catch (error) {
      console.error('Error al crear canal:', error);
      alert('Error al crear el canal');
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse text-gray-400">Cargando canales...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 text-white h-full flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold mb-4">Canales</h2>
        <button
          onClick={createChannel}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          + Crear Canal
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {channels.length === 0 ? (
          <div className="p-4 text-gray-400 text-center">
            No hay canales. ¡Crea uno!
          </div>
        ) : (
          <ul className="p-2">
            {channels.map((channel) => (
              <li key={channel.id}>
                <button
                  onClick={() => onSelectChannel(channel)}
                  className={`w-full text-left p-3 rounded-lg mb-2 transition-colors ${
                    currentChannelId === channel.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                  }`}
                >
                  <div className="font-semibold">{channel.name}</div>
                  <div className="text-xs opacity-75 mt-1">
                    {new Date(channel.created_at).toLocaleDateString()}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

