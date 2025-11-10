// Proxy para Watchmode por plataforma
// Configurable via env: WATCHMODE_API_KEY
// Uso: /api/streaming/watchmode/netflix?page=1&page_size=100

export default async function handler(req, res) {
  try {
    const apiKey = process.env.WATCHMODE_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: 'Configura WATCHMODE_API_KEY' });
      return;
    }
    const platform = req.query.platform;
    if (!platform) {
      res.status(400).json({ error: 'Falta plataforma en la ruta' });
      return;
    }
    // Mapeo simple: el cliente ajusta los IDs; aquí aceptamos platform como nombre
    const url = new URL('https://api.watchmode.com/v1/list-titles');
    Object.entries(req.query || {}).forEach(([k, v]) => {
      if (Array.isArray(v)) v.forEach(x => url.searchParams.append(k, String(x)));
      else if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
    url.searchParams.set('apiKey', apiKey);

    const resp = await fetch(url.toString(), { headers: { 'Accept': 'application/json' } });
    res.setHeader('Access-Control-Allow-Origin', '*');
    const text = await resp.text();
    res.status(resp.status).send(text);
  } catch (err) {
    console.error('Error en proxy watchmode:', err);
    res.status(500).json({ error: 'Error interno en proxy watchmode', details: String(err && err.message || err) });
  }
}
