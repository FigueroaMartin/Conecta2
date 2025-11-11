import { useState, useEffect, useRef } from 'react';
import { supabase, type Message } from '../lib/supabase';

interface ChatProps {
  channelId: string;
  username: string;
}

export default function Chat({ channelId, username }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!channelId) return;
    
    fetchMessages();
    
    // Suscripción en tiempo real
    const channel = supabase
      .channel(`messages:${channelId}`)
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channelId}`
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error al cargar mensajes:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert([
          {
            channel_id: channelId,
            username,
            message: newMessage.trim()
          }
        ]);

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      alert('Error al enviar el mensaje');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-gray-400">Cargando chat...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.username === username ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                msg.username === username
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-200'
              }`}
            >
              <div className="text-xs font-semibold mb-1 opacity-90">
                {msg.username}
              </div>
              <div className="text-sm">{msg.message}</div>
              <div className="text-xs opacity-75 mt-1">
                {new Date(msg.created_at).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  );
}

