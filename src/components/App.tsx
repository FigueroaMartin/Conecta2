import { useState, useEffect } from 'react';
import ChannelList from './ChannelList';
import ChannelView from './ChannelView';
import type { Channel } from '../lib/supabase';

export default function App() {
  const [username, setUsername] = useState<string>('');
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);

  useEffect(() => {
    // Obtener o solicitar nombre de usuario
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
      setUsername(savedUsername);
    } else {
      const input = prompt('Ingresa tu nombre de usuario:');
      if (input && input.trim()) {
        const trimmedUsername = input.trim();
        localStorage.setItem('username', trimmedUsername);
        setUsername(trimmedUsername);
      }
    }
  }, []);

  const handleSelectChannel = (channel: Channel) => {
    setSelectedChannel(channel);
  };

  const handleBackToChannels = () => {
    setSelectedChannel(null);
  };

  if (!username) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-red-200">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-red-950">
      {/* Header */}
      <header className="bg-red-900 border-b border-red-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">🔥 Conectado ✌️</h1>
          <div className="flex items-center gap-4">
            <span className="text-red-200">Usuario: <span className="font-semibold text-red-300">{username}</span></span>
            {selectedChannel && (
              <button
                onClick={handleBackToChannels}
                className="bg-red-800 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                ← Volver a Canales
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar con lista de canales */}
        {!selectedChannel && (
          <div className="w-80 border-r border-red-700">
            <ChannelList
              onSelectChannel={handleSelectChannel}
              currentChannelId={selectedChannel?.id}
            />
          </div>
        )}

        {/* Vista del canal */}
        <div className="flex-1">
          {selectedChannel ? (
            <ChannelView
              channelId={selectedChannel.id}
              username={username}
            />
          ) : (
            <div className="h-full flex items-center justify-center bg-red-950">
              <div className="text-center text-red-200">
                <svg
                  className="w-24 h-24 mx-auto mb-4 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <img src="https://res.cloudinary.com/diytuytti/image/upload/v1760414538/1cdf732a-a38b-4552-9baa-8f0b0018dfd1.png"></img>
                <p className="text-xl">Selecciona un canal para comenzar</p>
                <p className="text-sm mt-2">O crea uno nuevo desde el panel izquierdo</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

