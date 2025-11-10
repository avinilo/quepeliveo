// Proxy para Streaming Availability API (o equivalente) por plataforma
// Configurable via env: STREAMING_AVAILABILITY_BASE, STREAMING_AVAILABILITY_KEY
// Uso: /api/streaming/availability/netflix?page=1&page_size=100&types=movie,tv

export default async function handler(req, res) {
  try {
    const base = process.env.STREAMING_AVAILABILITY_BASE;
    const key = process.env.STREAMING_AVAILABILITY_KEY;
    if (!base || !key) {
      res.status(500).json({ error: 'Configura STREAMING_AVAILABILITY_BASE y STREAMING_AVAILABILITY_KEY' });
      return;
    }
    const platform = req.query.platform;
    if (!platform) {
      res.status(400).json({ error: 'Falta plataforma en la ruta' });
      return;
    }

    const url = new URL(`${base}/catalog`);
    // Mapear service según plataforma
    url.searchParams.set('service', String(platform));
    url.searchParams.set('country', 'ES');
    Object.entries(req.query || {}).forEach(([k, v]) => {
      if (k === 'platform') return;
      if (Array.isArray(v)) v.forEach(x => url.searchParams.append(k, String(x)));
      else if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });

    const resp = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        // Por defecto usar Bearer; si tu proveedor requiere X-RapidAPI-Key, ajusta aquí
        'Authorization': `Bearer ${key}`
      }
    });
    res.setHeader('Access-Control-Allow-Origin', '*');
    const text = await resp.text();
    res.status(resp.status).send(text);
  } catch (err) {
    console.error('Error en proxy availability:', err);
    res.status(500).json({ error: 'Error interno en proxy availability', details: String(err && err.message || err) });
  }
}