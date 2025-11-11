# Conectados - Plataforma de Chat y Video para Jugadores

Plataforma web para que los jugadores se conecten online mediante chat y video en tiempo real.

## Características

- 🎮 Sistema de canales para crear y unirse a salas
- 💬 Chat en tiempo real
- 📹 Video en tiempo real
- 👤 Almacenamiento de usuarios por nombre (sin login formal)
- 🎨 Diseño moderno con Tailwind CSS

## Tecnologíass

- **Astro** - Framework principal
- **React** - Componentes interactivos
- **Supabase** - Base de datos y tiempo real
- **Tailwind CSS** - Estilos
- **WebRTC** - Video en tiempo real

## Setup

1. Instala las dependencias:
```bash
npm install
```

2. Configura Supabase:
   - Crea un proyecto en Supabase
   - Copia las variables de entorno en `.env`:
     ```
     PUBLIC_SUPABASE_URL=tu_url_de_supabase
     PUBLIC_SUPABASE_ANON_KEY=tu_clave_anon
     ```

3. Ejecuta el servidor de desarrollo:
```bash
npm run dev
```

4. Abre [http://localhost:4321](http://localhost:4321)

## Configuración de Supabase

1. Crea un proyecto en [Supabase](https://supabase.com)

2. Ve al SQL Editor en tu proyecto Supabase

3. Copia y ejecuta el contenido del archivo `supabase-setup.sql` que incluye:
   - Creación de tablas (channels, channel_users, messages)
   - Índices para optimización
   - Habilitación de Realtime
   - Políticas de seguridad (RLS)

4. Obtén tus credenciales:
   - Ve a Settings → API
   - Copia la "Project URL" y la "anon public" key

5. Crea un archivo `.env` en la raíz del proyecto:
   ```
   PUBLIC_SUPABASE_URL=tu_project_url
   PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
   ```

## Estructura del Proyecto

```
.
├── src/
│   ├── components/      # Componentes React
│   │   ├── App.tsx      # Componente principal
│   │   ├── ChannelList.tsx
│   │   ├── ChannelView.tsx
│   │   ├── Chat.tsx
│   │   └── VideoRoom.tsx
│   ├── lib/
│   │   └── supabase.ts  # Cliente de Supabase
│   └── pages/
│       └── index.astro  # Página principal
├── supabase-setup.sql   # Script de configuración
└── package.json
```

## Uso

1. Ingresa tu nombre de usuario cuando se solicite (se guarda en localStorage)
2. Crea un canal o selecciona uno existente
3. Cambia entre Chat y Video usando las pestañas
4. Comparte el enlace del canal con otros jugadores

## Deploy en GitHub Pages

### Prerequisitos

- Una cuenta de GitHub
- Git instalado en tu computadora
- Un repositorio de GitHub creado para este proyecto

### Paso 1: Preparar el proyecto para GitHub Pages

1. **Cambiar el modo de salida a estático** (necesario para GitHub Pages):
   
   Edita el archivo `astro.config.mjs` y cambia la configuración:

```javascript
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [react(), tailwind()],
  output: 'static', // Cambiar de 'server' a 'static'
  site: 'https://bemtorres.github.io', // Reemplaza TU_USUARIO con tu usuario de GitHub
  base: '/conecta2', // Reemplaza con el nombre de tu repositorio (solo si no es la raíz)
});
```

   **Nota:** Si tu repositorio se llama exactamente igual que tu usuario de GitHub y está en la raíz, puedes omitir el campo `base` o dejarlo como `/`.

2. **Inicializar Git (si aún no lo has hecho)**:
```bash
git init
git add .
git commit -m "Initial commit"
```

3. **Conectar con tu repositorio de GitHub**:
```bash
git remote add origin https://github.com/TU_USUARIO/NOMBRE_DEL_REPO.git
git branch -M main
git push -u origin main
```

### Paso 2: Configurar Variables de Entorno en GitHub

⚠️ **IMPORTANTE:** Este paso es crítico. Si no configuras las variables de entorno, el build puede completarse pero la aplicación no funcionará en producción.

1. Ve a tu repositorio en GitHub
2. Haz clic en **Settings** (Configuración)
3. En el menú lateral, ve a **Secrets and variables** → **Actions**
4. Haz clic en **New repository secret** (Nuevo secreto del repositorio)
5. Agrega los siguientes secretos:
   - **Nombre:** `PUBLIC_SUPABASE_URL`
   - **Valor:** Tu URL de Supabase (ej: `https://tntacrwceejsgdmjajuq.supabase.co`)
   - Haz clic en **Add secret**
   
6. Repite el paso para agregar:
   - **Nombre:** `PUBLIC_SUPABASE_ANON_KEY`
   - **Valor:** Tu clave anónima de Supabase
   - Haz clic en **Add secret**

**Verificación:** Después de agregar los secretos, verifica que aparezcan en la lista. Los nombres deben ser exactamente `PUBLIC_SUPABASE_URL` y `PUBLIC_SUPABASE_ANON_KEY` (con mayúsculas y guiones bajos).

### Paso 3: Crear el Workflow de GitHub Actions

1. Crea la carpeta `.github/workflows` en la raíz de tu proyecto:
```bash
mkdir -p .github/workflows
```

2. Crea el archivo `.github/workflows/deploy.yml` (ver sección siguiente)

### Paso 4: Habilitar GitHub Pages

1. Ve a tu repositorio en GitHub
2. Haz clic en **Settings** (Configuración)
3. En el menú lateral, ve a **Pages**
4. En **Source** (Origen), selecciona **GitHub Actions**
5. Guarda los cambios

### Paso 5: Hacer Push y Desplegar

1. Agrega los archivos del workflow:
```bash
git add .github/
git add astro.config.mjs
git commit -m "Configurar deploy en GitHub Pages"
git push
```

2. Ve a la pestaña **Actions** en tu repositorio de GitHub
3. Verás que se ejecuta automáticamente el workflow "Deploy to GitHub Pages"
4. Espera a que termine (puede tomar 2-5 minutos)
5. Una vez completado, tu sitio estará disponible en:
   `https://TU_USUARIO.github.io/NOMBRE_DEL_REPO`

### Workflow de GitHub Actions

Crea el archivo `.github/workflows/deploy.yml` con el siguiente contenido:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        env:
          PUBLIC_SUPABASE_URL: ${{ secrets.PUBLIC_SUPABASE_URL }}
          PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.PUBLIC_SUPABASE_ANON_KEY }}
        run: npm run build
      
      - name: Setup Pages
        uses: actions/configure-pages@v4
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Actualizar el Deploy

Cada vez que hagas cambios y hagas `git push`, el sitio se actualizará automáticamente. El proceso tarda aproximadamente 2-5 minutos.

### Troubleshooting (Solución de Problemas)

- **Error 404:** Verifica que el campo `base` en `astro.config.mjs` coincida con el nombre de tu repositorio
- **Las variables de entorno no funcionan:** Verifica que los secretos estén configurados correctamente en GitHub Settings → Secrets and variables → Actions
- **El build falla:** Revisa los logs en la pestaña Actions para ver el error específico
- **El sitio no carga:** Espera unos minutos y verifica que el workflow se haya completado exitosamente

## Deploy en Vercel

Vercel es una plataforma de deployment muy sencilla que detecta automáticamente Astro y configura todo por ti.

### Prerequisitos

- Una cuenta de [Vercel](https://vercel.com) (gratuita)
- Tu proyecto subido a un repositorio de GitHub, GitLab o Bitbucket

### Paso 1: Preparar la configuración de Astro (opcional)

Para Vercel, puedes usar el modo estático sin necesidad de configurar `base` o `site`. Si quieres mantener el modo estático para Vercel, tu configuración actual está bien. Si prefieres, puedes simplificar el `astro.config.mjs`:

```javascript
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [react(), tailwind()],
  output: 'static',
});
```

**Nota:** Si también usas GitHub Pages, mantén la configuración con `site` y `base`. Si solo usas Vercel, puedes omitirlos.

### Paso 2: Conectar tu repositorio a Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión (puedes usar tu cuenta de GitHub)
2. Haz clic en **Add New...** → **Project**
3. Importa tu repositorio de GitHub:
   - Si es la primera vez, autoriza a Vercel para acceder a tus repositorios
   - Selecciona el repositorio que contiene tu proyecto Astro
   - Haz clic en **Import**

### Paso 3: Configurar el proyecto en Vercel

1. **Configuración del Framework Preset:**
   - Vercel debería detectar automáticamente que es un proyecto Astro
   - Verifica que aparezca "Astro" en el Framework Preset
   - Si no, selecciona "Astro" manualmente

2. **Configuración del Build:**
   - **Framework Preset:** Astro
   - **Build Command:** `npm run build` (o `astro build`)
   - **Output Directory:** `dist` (debería detectarse automáticamente)
   - **Install Command:** `npm install` (o `npm ci`)

3. **Variables de Entorno:**
   - En la sección "Environment Variables", agrega:
     - **Key:** `PUBLIC_SUPABASE_URL`
     - **Value:** Tu URL de Supabase (ej: `https://tntacrwceejsgdmjajuq.supabase.co`)
     - Haz clic en **Add**
   - Agrega la segunda variable:
     - **Key:** `PUBLIC_SUPABASE_ANON_KEY`
     - **Value:** Tu clave anónima de Supabase
     - Haz clic en **Add**

4. **Configuración Avanzada (opcional):**
   - **Root Directory:** Déjalo vacío (o especifica si tu proyecto está en una subcarpeta)
   - **Override:** Generalmente no es necesario para proyectos Astro estándar

### Paso 4: Desplegar

1. Haz clic en **Deploy**
2. Vercel comenzará a construir y desplegar tu proyecto automáticamente
3. El proceso tarda aproximadamente 1-2 minutos
4. Una vez completado, recibirás una URL única para tu sitio, por ejemplo:
   - `https://tu-proyecto.vercel.app`
   - También puedes configurar un dominio personalizado más tarde

### Paso 5: Actualizaciones automáticas

Cada vez que hagas `git push` a tu repositorio conectado, Vercel detectará los cambios y desplegará automáticamente una nueva versión:

1. Haz tus cambios localmente
2. Haz commit y push:
```bash
git add .
git commit -m "Mis cambios"
git push
```
3. Vercel detectará el push y comenzará un nuevo deploy automáticamente
4. Puedes ver el progreso en el dashboard de Vercel

### Configuración de Dominio Personalizado (opcional)

1. Ve al dashboard de tu proyecto en Vercel
2. Haz clic en **Settings** → **Domains**
3. Agrega tu dominio personalizado
4. Sigue las instrucciones para configurar los registros DNS

### Ventajas de Vercel

- ✅ **Deploy automático:** Cada push a tu repositorio despliega automáticamente
- ✅ **Previews:** Cada pull request genera una URL de preview única
- ✅ **HTTPS:** Certificados SSL automáticos
- ✅ **CDN global:** Tu sitio se sirve desde múltiples ubicaciones
- ✅ **Sin configuración de base path:** Funciona directamente sin configuración adicional
- ✅ **Dashboard intuitivo:** Fácil de monitorear y gestionar

### Troubleshooting (Solución de Problemas)

- **Error de build:** Revisa los logs en el dashboard de Vercel para ver el error específico
- **Las variables de entorno no funcionan:** Verifica que las variables estén configuradas correctamente en Settings → Environment Variables
- **El sitio muestra un error 404:** Verifica que el output directory sea `dist` en la configuración del proyecto
- **Deploy falla:** Asegúrate de que tu proyecto compile localmente con `npm run build` antes de hacer push

### Comparación: Vercel vs GitHub Pages

| Característica | Vercel | GitHub Pages |
|---------------|--------|--------------|
| Setup | Más fácil (detección automática) | Requiere configuración manual |
| Deploy automático | ✅ Sí | ✅ Sí (con GitHub Actions) |
| Previews de PR | ✅ Sí, automático | ❌ No |
| Base path | No necesario | Requiere configuración |
| Velocidad de deploy | ~1-2 min | ~2-5 min |
| Costo | Gratis (con límites) | Gratis |

### Alternativas de Deploy

Si prefieres usar otros servicios:

- **Netlify:** Similar a Vercel, con conexión directa a GitHub
- **Cloudflare Pages:** También detecta Astro automáticamente
- **GitHub Pages:** Para hosting estático básico (requiere configuración adicional)

