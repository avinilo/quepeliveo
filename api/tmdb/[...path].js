// Vercel Serverless Function: Proxy TMDb API (general routes)
// Forwards requests from /api/tmdb/* to https://api.themoviedb.org/3/*
// Injects TMDB_API_KEY from environment and preserves query params

const TMDB_BASE = 'https://api.themoviedb.org/3/';

export default async function handler(req, res) {
  try {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: 'TMDB_API_KEY no configurada en entorno' });
      return;
    }

    // Derivar subruta desde la URL para máxima compatibilidad
    const urlPath = (req.url || '').split('?')[0] || '';
    const subpath = urlPath.replace(/^\/api\/tmdb\/?/, '');

    const targetUrl = new URL(TMDB_BASE + subpath);

    // Copiar parámetros de consulta, excepto api_key
    Object.entries(req.query || {}).forEach(([key, value]) => {
      if (key === 'api_key') return;
      if (Array.isArray(value)) {
        value.forEach(v => targetUrl.searchParams.append(key, String(v)));
      } else if (value !== undefined && value !== null) {
        targetUrl.searchParams.set(key, String(value));
      }
    });

    // Inyectar API key
    targetUrl.searchParams.set('api_key', apiKey);

    const method = req.method || 'GET';
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    const init = { method, headers };
    if (method !== 'GET' && method !== 'HEAD' && req.body) {
      try {
        init.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      } catch (_) {}
    }

    const response = await fetch(targetUrl.toString(), init);

    const contentType = response.headers.get('content-type') || 'application/json';
    const cacheControl = response.headers.get('cache-control') || 's-maxage=300, stale-while-revalidate=300';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', cacheControl);
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (!response.ok) {
      const text = await response.text();
      res.status(response.status).send(text);
      return;
    }

    const bodyText = await response.text();
    res.status(200).send(bodyText);
  } catch (err) {
    console.error('Error en proxy TMDb (general):', err);
    res.status(500).json({ error: 'Error interno en proxy TMDb (general)', details: String(err && err.message || err) });
  }
}