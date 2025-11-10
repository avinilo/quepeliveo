const TMDB_BASE = 'https://api.themoviedb.org/3/';

export default async function handler(req, res) {
  try {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: 'TMDB_API_KEY no configurada en entorno' });
      return;
    }

    // Parsear tipo, id y resto de la subruta desde la URL
    const urlPath = (req.url || '').split('?')[0] || '';
    const match = urlPath.match(/^\/api\/tmdb\/(movie|tv)\/(\d+)(?:\/(.*))?$/);
    if (!match) {
      res.status(404).json({ error: 'Ruta no válida para TMDb' });
      return;
    }
    const type = match[1];
    const id = match[2];
    const rest = match[3] || '';

    const base = `${type}/${id}`;
    const targetUrl = new URL(`${TMDB_BASE}${base}${rest ? '/' + rest : ''}`);

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
    console.error('Error en proxy TMDb ([type]/[id]/[...path]):', err);
    res.status(500).json({ error: 'Error interno en proxy TMDb', details: String(err && err.message || err) });
  }
}