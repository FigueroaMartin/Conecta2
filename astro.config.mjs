import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [
    react({
      strictMode: false // ← FIX PARA WEBRTC
    }),
    tailwind()
  ],
  output: 'static',
  site: 'https://FigueroaMartin.github.io',
  base: '/Conecta2',
});

