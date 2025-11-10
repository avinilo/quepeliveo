const TMDB_BASE = 'https://api.themoviedb.org/3/';

export default async function handler(req, res) {
  try {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: 'TMDB_API_KEY no configurada en entorno' });
      return;
    }

    const urlPath = (req.url || '').split('?')[0] || '';
    const idMatch = urlPath.match(/\/api\/tmdb\/movie\/(\d+)\/credits/);
    const id = idMatch ? idMatch[1] : (req.query?.id || '');
    if (!id) {
      res.status(400).json({ error: 'ID de película no proporcionado' });
      return;
    }

    const targetUrl = new URL(`${TMDB_BASE}movie/${id}/credits`);

    Object.entries(req.query || {}).forEach(([key, value]) => {
      if (key === 'api_key' || key === 'id') return;
      if (Array.isArray(value)) {
        value.forEach(v => targetUrl.searchParams.append(key, String(v)));
      } else if (value !== undefined && value !== null) {
        targetUrl.searchParams.set(key, String(value));
      }
    });

    targetUrl.searchParams.set('api_key', apiKey);

    const response = await fetch(targetUrl.toString(), { headers: { 'Accept': 'application/json' } });

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
    console.error('Error en proxy TMDb (movie credits):', err);
    res.status(500).json({ error: 'Error interno en proxy TMDb (movie credits)', details: String(err && err.message || err) });
  }
}