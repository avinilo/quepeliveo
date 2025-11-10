// Vercel Serverless Function: Catch-all universal para TMDb (v3/v4)
// Maneja rutas: /configuration, /discover/*, /tv/:id/*, /movie/:id/*, etc.

const TMDB_V3 = 'https://api.themoviedb.org/3';

export default async function handler(req, res) {
  try {
    const apiKey = process.env.TMDB_API_KEY;
    const bearer = process.env.TMDB_ACCESS_TOKEN; // opcional: para v4 o v3 con Authorization

    // Extraer subruta después de /api/tmdb
    const urlPath = (req.url || '').split('?')[0] || '';
    const subpath = urlPath.replace(/^\/api\/tmdb\/?/, '');

    // Normalizar y parsear segmentos
    const clean = subpath.replace(/^\/+|\/+$/g, '');
    const segments = clean ? clean.split('/') : [];

    if (!apiKey && !bearer) {
      res.status(500).json({ error: 'Faltan credenciales TMDb', details: 'Configura TMDB_API_KEY (v3) o TMDB_ACCESS_TOKEN (v4) en el entorno' });
      return;
    }

    // Construir URL destino según tipo de ruta
    let targetUrl;
    const method = req.method || 'GET';

    if (segments.length === 0) {
      // Sin subruta: devolver ayuda
      res.status(400).json({ error: 'Ruta TMDb faltante', examples: [
        '/api/tmdb/configuration',
        '/api/tmdb/discover/movie?with_genres=28',
        '/api/tmdb/tv/4057/credits',
        '/api/tmdb/movie/550/credits',
      ]});
      return;
    }

    const head = segments[0].toLowerCase();

    if (head === 'configuration') {
      targetUrl = new URL(`${TMDB_V3}/configuration`);
    } else if (head === 'discover') {
      // /discover/movie or /discover/tv
      const sub = segments[1] ? segments[1].toLowerCase() : '';
      if (sub !== 'movie' && sub !== 'tv') {
        res.status(400).json({ error: 'Discover requiere /movie o /tv' });
        return;
      }
      targetUrl = new URL(`${TMDB_V3}/discover/${sub}`);
    } else if (head === 'tv' || head === 'movie') {
      // /tv/:id/* or /movie/:id/*
      const id = segments[1];
      if (!id || !/^\d+$/.test(id)) {
        res.status(400).json({ error: 'ID inválido para ruta ' + head });
        return;
      }
      const tail = segments.slice(2).join('/');
      const base = `${TMDB_V3}/${head}/${id}`;
      targetUrl = new URL(tail ? `${base}/${tail}` : base);
    } else {
      // Cualquier otra ruta: pasar tal cual a v3
      targetUrl = new URL(`${TMDB_V3}/${clean}`);
    }

    // Copiar query params excepto api_key
    Object.entries(req.query || {}).forEach(([key, value]) => {
      if (key === 'api_key') return;
      if (Array.isArray(value)) {
        value.forEach(v => targetUrl.searchParams.append(key, String(v)));
      } else if (value !== undefined && value !== null) {
        targetUrl.searchParams.set(key, String(value));
      }
    });

    // Inyectar autenticación
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    // Si hay bearer, úsalo como Authorization; si no, api_key v3 en query
    if (bearer) headers['Authorization'] = `Bearer ${bearer}`;
    if (apiKey) targetUrl.searchParams.set('api_key', apiKey);

    const init = { method, headers };
    if (method !== 'GET' && method !== 'HEAD' && req.body) {
      try {
        init.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      } catch (_) {}
    }

    const response = await fetch(targetUrl.toString(), init);

    res.setHeader('Access-Control-Allow-Origin', '*');
    const contentType = response.headers.get('content-type') || 'application/json';
    res.setHeader('Content-Type', contentType);
    const cacheControl = response.headers.get('cache-control') || 's-maxage=300, stale-while-revalidate=300';
    res.setHeader('Cache-Control', cacheControl);

    const text = await response.text();
    if (!response.ok) {
      res.status(response.status).send(text);
      return;
    }
    res.status(200).send(text);
  } catch (err) {
    console.error('Error en proxy TMDb (catch-all):', err);
    res.status(500).json({ error: 'Error interno en proxy TMDb', details: String(err && err.message || err) });
  }
}
