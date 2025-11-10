// Script de prueba para depurar llamadas a RapidAPI (Streaming Availability) y Watchmode
// Uso: node scripts/test-streaming-apis.mjs netflix
// Puedes pasar varias plataformas: node scripts/test-streaming-apis.mjs netflix prime disney

import 'dotenv/config'

const RAPID_BASE = process.env.STREAMING_AVAILABILITY_BASE || 'https://streaming-availability.p.rapidapi.com'
const RAPID_KEY = process.env.STREAMING_AVAILABILITY_KEY
const RAPID_HOST = (() => { try { return new URL(RAPID_BASE).host } catch { return 'streaming-availability.p.rapidapi.com' } })()
const WATCHMODE_KEY = process.env.WATCHMODE_API_KEY

const PLATFORM_IDS = {
  netflix: 'netflix',
  prime: 'prime',
  disney: 'disney',
  hbo: 'hbo',
  apple: 'apple',
  filmin: 'filmin',
  movistar: 'movistar'
}

const WATCHMODE_SOURCES = {
  netflix: 203,
  prime: 26,
  disney: 372,
  hbo: 157,
  apple: 391,
  filmin: 1157,
  movistar: 1493
}

async function testRapidAPI(platform, { country = 'ES', maxPages = 10, pageSize = 100 } = {}) {
  if (!RAPID_KEY) {
    console.log('[RapidAPI] Falta STREAMING_AVAILABILITY_KEY en .env')
    return { total: 0 }
  }
  const service = PLATFORM_IDS[platform]
  if (!service) {
    console.log(`[RapidAPI] Plataforma desconocida: ${platform}`)
    return { total: 0 }
  }
  let total = 0
  let cursor = undefined
  console.log(`\n=== RapidAPI ${platform} (${country}) ===`)
  for (let page = 1; page <= maxPages; page++) {
    const url = new URL(`${RAPID_BASE}/shows/search/filters`)
    url.searchParams.set('catalogs', service)
    url.searchParams.set('country', country)
    url.searchParams.set('page_size', String(pageSize))
    if (cursor) url.searchParams.set('cursor', cursor)
    const resp = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': RAPID_KEY,
        'X-RapidAPI-Host': RAPID_HOST
      }
    })
    const text = await resp.text()
    if (!resp.ok) {
      console.log(`[RapidAPI] Error ${resp.status} page=${page}:`, text.slice(0, 300))
      break
    }
    let data
    try { data = JSON.parse(text) } catch { console.log('[RapidAPI] JSON parse error'); break }
    const items = Array.isArray(data.shows) ? data.shows : (Array.isArray(data.items) ? data.items : (Array.isArray(data.results) ? data.results : []))
    total += items.length
    console.log(`[RapidAPI] page=${page} count=${items.length} keys=${Object.keys(data).join(', ')}`)
    items.slice(0, 5).forEach((it, i) => {
      const type = (it.showType === 'series' || it.type === 'series' || it.type === 'show') ? 'tv' : 'movie'
      const tmdbId = typeof it.tmdbId === 'number' ? it.tmdbId : (typeof it.tmdb_id === 'number' ? it.tmdb_id : undefined)
      console.log(`  #${i+1}: ${it.title || it.name} (${type}) tmdb=${tmdbId ?? 'n/a'}`)
    })
    // Cursor-based pagination: continue while hasMore and nextCursor provided
    if (data.hasMore === false || !data.nextCursor) {
      console.log('[RapidAPI] fin por hasMore=false o falta nextCursor')
      break
    }
    cursor = data.nextCursor
    await new Promise(r => setTimeout(r, 400))
  }
  console.log(`[RapidAPI] total acumulado en ${platform}: ${total}`)
  return { total }
}

async function testWatchmode(platform, { country = 'ES', maxPages = 3, pageSize = 100 } = {}) {
  if (!WATCHMODE_KEY) {
    console.log('[Watchmode] Falta WATCHMODE_API_KEY en .env')
    return { total: 0 }
  }
  const sourceId = WATCHMODE_SOURCES[platform]
  if (!sourceId) {
    console.log(`[Watchmode] Plataforma desconocida: ${platform}`)
    return { total: 0 }
  }
  let total = 0
  console.log(`\n=== Watchmode ${platform} (${country}) ===`)
  for (let page = 1; page <= maxPages; page++) {
    const url = new URL('https://api.watchmode.com/v1/list-titles')
    url.searchParams.set('apiKey', WATCHMODE_KEY)
    url.searchParams.set('source_ids', String(sourceId))
    url.searchParams.set('countries', country)
    url.searchParams.set('page', String(page))
    url.searchParams.set('page_size', String(pageSize))
    const resp = await fetch(url.toString(), { headers: { 'Accept': 'application/json' } })
    const text = await resp.text()
    if (!resp.ok) {
      console.log(`[Watchmode] Error ${resp.status} page=${page}:`, text.slice(0, 300))
      break
    }
    let data
    try { data = JSON.parse(text) } catch { console.log('[Watchmode] JSON parse error'); break }
    const items = Array.isArray(data.titles) ? data.titles : []
    total += items.length
    console.log(`[Watchmode] page=${page} count=${items.length} keys=${Object.keys(data).join(', ')}`)
    items.slice(0, 5).forEach((it, i) => {
      const type = it.type === 'show' ? 'tv' : 'movie'
      console.log(`  #${i+1}: ${it.title} (${type}) tmdb=${it.tmdb_id ?? 'n/a'}`)
    })
    if (items.length < pageSize) {
      console.log('[Watchmode] fin por items < pageSize')
      break
    }
    await new Promise(r => setTimeout(r, 400))
  }
  console.log(`[Watchmode] total acumulado en ${platform}: ${total}`)
  return { total }
}

async function main() {
  const args = process.argv.slice(2)
  const platforms = args.length ? args : ['netflix']
  console.log('Plataformas a probar:', platforms.join(', '))
  for (const p of platforms) {
    try {
      const rapid = await testRapidAPI(p, { maxPages: 5, pageSize: 100 })
      const wm = await testWatchmode(p, { maxPages: 5, pageSize: 100 })
      console.log(`\nResumen ${p}: RapidAPI=${rapid.total} Watchmode=${wm.total}`)
    } catch (e) {
      console.log(`Error general en ${p}:`, e?.message || e)
    }
    await new Promise(r => setTimeout(r, 500))
  }
}

main()
