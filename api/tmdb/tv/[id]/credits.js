const TMDB_BASE = 'https://api.themoviedb.org/3/';

export default async function handler(req, res) {
  try {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: 'TMDB_API_KEY no configurada en entorno' });
      return;
    }

    // Obtener ID de la URL o de query
    const urlPath = (req.url || '').split('?')[0] || '';
    const idMatch = urlPath.match(/\/api\/tmdb\/tv\/(\d+)\/credits/);
    const id = idMatch ? idMatch[1] : (req.query?.id || '');
    if (!id) {
      res.status(400).json({ error: 'ID de TV no proporcionado' });
      return;
    }

    const targetUrl = new URL(`${TMDB_BASE}tv/${id}/credits`);

    // Copiar parámetros de consulta, excepto api_key
    Object.entries(req.query || {}).forEach(([key, value]) => {
      if (key === 'api_key' || key === 'id') return;
      if (Array.isArray(value)) {
        value.forEach(v => targetUrl.searchParams.append(key, String(v)));
      } else if (value !== undefined && value !== null) {
        targetUrl.searchParams.set(key, String(value));
      }
    });

    // Inyectar API key
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
    console.error('Error en proxy TMDb (tv credits):', err);
    res.status(500).json({ error: 'Error interno en proxy TMDb (tv credits)', details: String(err && err.message || err) });
  }
}