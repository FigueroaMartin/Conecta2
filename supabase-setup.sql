-- Script de configuración para Supabase
-- Ejecuta este script en el SQL Editor de tu proyecto Supabase

-- Tabla de canales
CREATE TABLE IF NOT EXISTS channels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabla de usuarios en canales
CREATE TABLE IF NOT EXISTS channel_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  username VARCHAR(255) NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabla de mensajes
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  username VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_channel_users_channel_id ON channel_users(channel_id);
CREATE INDEX IF NOT EXISTS idx_messages_channel_id ON messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Habilitar Realtime para las tablas
ALTER PUBLICATION supabase_realtime ADD TABLE channels;
ALTER PUBLICATION supabase_realtime ADD TABLE channel_users;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Políticas de seguridad (RLS)
-- Habilitar RLS en las tablas
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Política para canales: todos pueden leer y crear
CREATE POLICY "Canales: lectura pública" ON channels
  FOR SELECT USING (true);

CREATE POLICY "Canales: creación pública" ON channels
  FOR INSERT WITH CHECK (true);

-- Política para usuarios de canal: todos pueden leer y crear
CREATE POLICY "Usuarios de canal: lectura pública" ON channel_users
  FOR SELECT USING (true);

CREATE POLICY "Usuarios de canal: creación pública" ON channel_users
  FOR INSERT WITH CHECK (true);

-- Política para mensajes: todos pueden leer y crear
CREATE POLICY "Mensajes: lectura pública" ON messages
  FOR SELECT USING (true);

CREATE POLICY "Mensajes: creación pública" ON messages
  FOR INSERT WITH CHECK (true);

