<div align="center">

# ¿Qué Peli Veo? — App de estrenos por plataformas (ES)

Aplicación web para descubrir estrenos recientes en plataformas de streaming en España (Netflix, Prime Video, Disney+, Max, Filmin, Movistar+, Apple TV+). Muestra novedades por día/mes, por plataforma, y por género, con lógica de ocultación automática de secciones vacías y rangos de tiempo en zona horaria de España.

</div>

## Características

- Novedades del día y del mes con fallback inteligente.
- “Novedades por plataforma” y “Novedades por género” con ocultación de chips vacíos.
- “Top novedades del mes” ordenado por popularidad/rating.
- Zona horaria `Europe/Madrid` y ventanas de 30 días para mensual.
- Sincronización periódica con TMDb y almacenamiento local para rendimiento.
- UI mobile-first con Tailwind CSS.

## Stack tecnológico

- React + TypeScript
- Vite
- Tailwind CSS
- TMDb API (The Movie Database)

## Requisitos previos

- `Node.js` 18+ (recomendado LTS)
- API Key de TMDb: crea una cuenta en TMDb y obtén tu clave.

## Instalación

```bash
npm install
# o
pnpm install
```

## Configuración de TMDb

- Arranca `npm run dev` y abre `http://localhost:5173/` (o el puerto que muestre Vite).
- En la página principal, usa el bloque “Configuración TMDb” para guardar tu `tmdb_api_key` en el navegador.
- Opcional: en “Pruebas de TMDb” (`/test-tmdb`) puedes ejecutar una sincronización completa y verificar los datos.

### Variables de entorno (despliegue en Vercel)
- El `.env` local NO se despliega a Vercel. Debes configurar variables en `Project Settings → Environment Variables`.
- Para que el frontend (Vite) vea una variable en build, debe empezar por `VITE_`. Usa `VITE_TMDB_API_KEY` si quieres que la app no pida clave al cargar.
- La función serverless en `/api/tmdb/[...path].js` usa `TMDB_API_KEY` en el entorno del servidor (no expuesta al cliente). Configúrala también para el proxy en producción.
- Resumen recomendado en Vercel:
  - `VITE_TMDB_API_KEY` → valor de tu API Key (expuesta al cliente en build)
  - `TMDB_API_KEY` → mismo valor para el proxy serverless
- Si NO quieres exponer la clave al cliente, puedes dejar `VITE_TMDB_API_KEY` vacío y la app te pedirá la API key para guardarla en `localStorage`. El proxy seguirá funcionando con `TMDB_API_KEY` en el servidor.

Notas de CORS/proxy:
- El cliente usa un proxy `'/api/tmdb'` en desarrollo para evitar CORS. En producción, necesitas configurar una función/proxy (por ejemplo, en Vercel) o desactivar el proxy y llamar directamente a TMDb si tu entorno lo permite.

## Scripts disponibles

- `npm run dev` — arranca el servidor de desarrollo (Vite).
- `npm run build` — genera build de producción.
- `npm run preview` — sirve el build para comprobación local.

## Estructura del proyecto

```
src/
  components/
    ContentGridReal.tsx        # Grid de novedades con fallback mensual
    NewsByPlatformReal.tsx     # Chips por plataforma con ocultación y mensual
    NewsByGenreReal.tsx        # Chips por género con ocultación y mensual
    TopNewsWeekReal.tsx        # “Top novedades del mes” (título actualizado)
    TmdbConfig.tsx             # Configuración de API Key en UI
    ...
  hooks/
    useContent.ts              # Filtros (today/week/month), sort, fallbacks
  pages/
    HomeReal.tsx               # Home principal con secciones reales
    TestTmdbIntegration.tsx    # Página de pruebas y full sync
  services/
    tmdb.ts                    # Cliente TMDb (proveedores, discover, detalles)
    contentSync.ts             # Orquestación de sincronización con TMDb
    contentStorage.ts          # Almacenamiento local y utilidades
```

## Funcionalidades clave

- Filtros de tiempo (`today`, `month`) con comparación en `Europe/Madrid`.
- Ocultación de secciones y chips sin contenido para mejorar UX.
- Fallback mensual: si el período actual está vacío, muestra el mes anterior.
- Selección automática del primer género/plataforma con contenido disponible.
- Ordenación por `newest` y `popularity` según la sección.

## Sincronización y datos

- El servicio `contentSync` recorre páginas de TMDb y procesa ítems con `tmdb.ts`.
- `tmdb.ts` prioriza fechas de lanzamiento digitales en ES y admite tipos 4/6/3/2.
- Se guarda `firstSeenAt` por proveedor y se usan métodos en `contentStorage` para filtrar por fecha/proveedor/género.

## Desarrollo

```bash
npm run dev
# Abre el puerto indicado (5173/5174) y configura la API Key
```

- En Home, pulsa “Sincronizar contenido” para cargar datos reales.
- En `/test-tmdb`, usa “Forzar full sync” para probar mayor cobertura.

## Despliegue

- Construye con `npm run build` y despliega el contenido de `dist/`.
- Vercel/Netlify: configura un proxy/función para TMDb si necesitas evitar CORS.
  - Ejemplo: API route `/api/tmdb` que reenvía las peticiones a `https://api.themoviedb.org/3` con tu API Key.
  - Alternativa: desactivar el proxy y permitir llamadas directas si tu hosting lo permite.

## Contribución

- Issues y PRs son bienvenidos. Por favor, describe claramente el problema o mejora, pasos de reproducción y contexto.

## Nota

- Este proyecto usa datos de TMDb y respeta sus términos de uso. TMDb no respalda ni certifica este proyecto.
