import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '';

// Crear el cliente con valores por defecto vacíos si no están disponibles
// Esto permite que el build funcione, pero el cliente fallará en runtime si faltan
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key');

// Función para validar las variables de entorno (solo en el cliente)
export function validateSupabaseEnv() {
  if (typeof window === 'undefined') return true; // No validar durante SSR/build
  
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    console.error('Faltan las variables de entorno de Supabase');
    return false;
  }
  return true;
}

export interface Channel {
  id: string;
  name: string;
  created_at: string;
}

export interface Message {
  id: string;
  channel_id: string;
  username: string;
  message: string;
  created_at: string;
}

export interface ChannelUser {
  id: string;
  channel_id: string;
  username: string;
  joined_at: string;
}

