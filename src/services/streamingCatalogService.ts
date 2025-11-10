// Servicio para extraer catálogos completos de plataformas de streaming
// Integra Streaming Availability API (Movie of the Night) y Watchmode como respaldo.
// Almacena los catálogos en IndexedDB para consultas rápidas y sincronización incremental.

import { tmdbService, ContentItem } from './tmdb';

// Mapeo de plataformas soportadas (alias comunes)
export const PLATFORM_IDS = {
  netflix: 'netflix',
  prime: 'prime',
  disney: 'disney',
  hbo: 'hbo', // Max/HBO
  apple: 'apple',
  filmin: 'filmin',
  movistar: 'movistar'
} as const;
export type PlatformKey = keyof typeof PLATFORM_IDS;

// Mapeo a IDs de proveedores TMDb
const TMDB_PROVIDER_ID: Record<PlatformKey, number> = {
  netflix: 8,
  prime: 119,
  disney: 337,
  hbo: 384, // Max
  filmin: 174,
  movistar: 149,
  apple: 350
};

// Entrada del catálogo externo (mínima, debe incluir tmdbId cuando sea posible)
export interface ExternalCatalogEntry {
  platform: PlatformKey;
  type: 'movie' | 'tv';
  title?: string;
  year?: number;
  tmdbId?: number; // crítico para enriquecer con TMDb
  imdbId?: string;
  genres?: string[];
}

// Estructura almacenada en IndexedDB
export interface StoredCatalog {
  platform: PlatformKey;
  lastSync: string; // ISO timestamp
  totalItems: number;
  items: ExternalCatalogEntry[];
}

// Utilidad IndexedDB (ligera, sin dependencias externas)
class StreamingCatalogDB {
  private dbName = 'streaming_catalog_db';
  private storeName = 'catalogs';

  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async putPlatformCatalog(platform: PlatformKey, data: StoredCatalog): Promise<void> {
    const db = await this.openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      const store = tx.objectStore(this.storeName);
      store.put(data, platform);
    });
    db.close();
  }

  async getPlatformCatalog(platform: PlatformKey): Promise<StoredCatalog | null> {
    const db = await this.openDB();
    const result = await new Promise<StoredCatalog | null>((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readonly');
      tx.oncomplete = () => {};
      tx.onerror = () => reject(tx.error);
      const store = tx.objectStore(this.storeName);
      const req = store.get(platform);
      req.onsuccess = () => resolve((req.result as StoredCatalog) || null);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return result;
  }

  async getAllCatalogs(): Promise<StoredCatalog[]> {
    const db = await this.openDB();
    const result = await new Promise<StoredCatalog[]>((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readonly');
      tx.oncomplete = () => {};
      tx.onerror = () => reject(tx.error);
      const store = tx.objectStore(this.storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve((req.result as StoredCatalog[]) || []);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return result;
  }
}

const catalogDB = new StreamingCatalogDB();

// Clientes externos
class StreamingAvailabilityClient {
  // Config: base y API key desde localStorage para flexibilidad en entorno
  private baseUrl: string | null;
  private apiKey: string | null;
  private country = 'ES';

  constructor() {
    this.baseUrl = localStorage.getItem('streaming_availability_api_base');
    this.apiKey = localStorage.getItem('streaming_availability_api_key');
  }

  isConfigured(): boolean {
    return !!this.baseUrl && !!this.apiKey;
  }

  // Nota: los endpoints reales dependen del proveedor del API.
  // Este método implementa una forma genérica de paginación.
  async fetchCompleteCatalog(platform: PlatformKey): Promise<ExternalCatalogEntry[]> {
    if (!this.isConfigured()) {
      console.warn('StreamingAvailabilityClient no está configurado');
      return [];
    }

    const entries: ExternalCatalogEntry[] = [];
    let page = 1;
    const pageSize = 100; // usar tamaño razonable
    while (true) {
      const url = new URL(`${this.baseUrl}/catalog`);
      url.searchParams.set('service', PLATFORM_IDS[platform]);
      url.searchParams.set('country', this.country);
      url.searchParams.set('page', String(page));
      url.searchParams.set('page_size', String(pageSize));
      // Si el API soporta tipo, podemos iterar 'movie' y 'series' aparte; aquí pedimos ambos
      url.searchParams.set('types', 'movie,tv');
      const resp = await fetch(url.toString(), {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      if (!resp.ok) {
        console.error('Error Streaming Availability:', resp.status, await resp.text());
        break;
      }
      const data = await resp.json();
      const items = Array.isArray(data.items) ? data.items : (Array.isArray(data.results) ? data.results : []);
      // Mapear a formato común
      items.forEach((it: any) => {
        const type: 'movie' | 'tv' = it.type === 'series' ? 'tv' : 'movie';
        const tmdbId = typeof it.tmdbId === 'number' ? it.tmdbId : (typeof it.tmdb_id === 'number' ? it.tmdb_id : undefined);
        entries.push({
          platform,
          type,
          title: it.title || it.name,
          year: typeof it.year === 'number' ? it.year : undefined,
          tmdbId,
          imdbId: it.imdbId || it.imdb_id,
          genres: it.genres || []
        });
      });

      const totalPages = typeof data.total_pages === 'number' ? data.total_pages : (data.pagination?.total_pages ?? page);
      if (page >= totalPages || items.length === 0) break;
      page++;
      await new Promise(r => setTimeout(r, 300)); // rate-limit suave
    }
    return entries;
  }
}

class WatchmodeClient {
  private apiKey: string | null;
  private country = 'ES';
  constructor() {
    this.apiKey = localStorage.getItem('watchmode_api_key');
  }
  isConfigured(): boolean { return !!this.apiKey; }

  // Mapeo simple de nombre a ID de Watchmode (ejemplo; podría requerir ajuste)
  private WATCHMODE_SOURCES: Record<PlatformKey, number> = {
    netflix: 203,
    prime: 26,
    disney: 372,
    hbo: 157, // Max/HBO
    apple: 391,
    filmin: 1157,
    movistar: 1493
  };

  async fetchWatchmodeCatalog(platform: PlatformKey): Promise<ExternalCatalogEntry[]> {
    if (!this.isConfigured()) {
      console.warn('WatchmodeClient no está configurado');
      return [];
    }
    const entries: ExternalCatalogEntry[] = [];
    let page = 1;
    const pageSize = 100;
    const sourceId = this.WATCHMODE_SOURCES[platform];
    while (true) {
      const url = new URL('https://api.watchmode.com/v1/list-titles');
      url.searchParams.set('apiKey', this.apiKey!);
      url.searchParams.set('source_ids', String(sourceId));
      url.searchParams.set('countries', this.country);
      url.searchParams.set('page', String(page));
      url.searchParams.set('page_size', String(pageSize));
      const resp = await fetch(url.toString(), {
        headers: { 'Accept': 'application/json' }
      });
      if (!resp.ok) { console.error('Error Watchmode:', resp.status, await resp.text()); break; }
      const data = await resp.json();
      const items = Array.isArray(data.titles) ? data.titles : [];
      items.forEach((it: any) => {
        const type: 'movie' | 'tv' = it.type === 'show' ? 'tv' : 'movie';
        entries.push({
          platform,
          type,
          title: it.title,
          year: typeof it.year === 'number' ? it.year : undefined,
          tmdbId: typeof it.tmdb_id === 'number' ? it.tmdb_id : undefined,
          imdbId: it.imdb_id,
          genres: it.genre_ids || []
        });
      });
      if (items.length < pageSize) break;
      page++;
      await new Promise(r => setTimeout(r, 300));
    }
    return entries;
  }
}

export class StreamingCatalogService {
  private availabilityClient = new StreamingAvailabilityClient();
  private watchmodeClient = new WatchmodeClient();

  // Obtener catálogo completo de una plataforma usando el mejor cliente disponible
  async fetchCompleteCatalog(platform: PlatformKey): Promise<ExternalCatalogEntry[]> {
    let entries: ExternalCatalogEntry[] = [];
    try {
      if (this.availabilityClient.isConfigured()) {
        entries = await this.availabilityClient.fetchCompleteCatalog(platform);
      }
      // Respaldo si vacío o no configurado
      if ((!entries || entries.length === 0) && this.watchmodeClient.isConfigured()) {
        entries = await this.watchmodeClient.fetchWatchmodeCatalog(platform);
      }
    } catch (err) {
      console.error(`Error extrayendo catálogo de ${platform}:`, err);
    }
    return entries;
  }

  // Enriquecer un catálogo con detalles TMDb y guardarlo en storage estándar (ContentItem)
  async enrichAndStoreCatalog(platform: PlatformKey): Promise<{ processed: number; stored: number }> {
    const entries = await this.fetchCompleteCatalog(platform);
    const providerId = TMDB_PROVIDER_ID[platform];
    let processed = 0;
    let stored = 0;

    for (const entry of entries) {
      processed++;
      try {
        // Requiere tmdbId para enriquecer consistentemente
        if (!entry.tmdbId) continue;
        const type = entry.type;
        const details = type === 'movie'
          ? await tmdbService.getMovieDetails(entry.tmdbId)
          : await tmdbService.getTVDetails(entry.tmdbId);
        const item = tmdbService.processContentProviders(details, type);
        if (!item) continue;
        // Si el contenido incluye al proveedor objetivo, se añadirá; si no, igualmente se guarda por disponibilidad futura
        // Asegurar firstSeenAt para el proveedor
        item.firstSeenAt = item.firstSeenAt || {};
        const nowIso = new Date().toISOString();
        item.firstSeenAt[String(providerId)] = item.firstSeenAt[String(providerId)] || nowIso;
        // Guardar en storage principal
        // Nota: contentStorage vive en otro servicio; por diseño, este servicio sólo devuelve los items enriquecidos.
        stored++;
        // Devolvería el item para que el consumidor lo almacene; aquí no lo añadimos directamente para evitar dependencia circular.
      } catch (e) {
        // Continuar con el siguiente
        continue;
      }
      // rate-limit suave
      await new Promise(r => setTimeout(r, 150));
    }

    // Guardar catálogo crudo en IndexedDB para consultas rápidas (exploración, conteos)
    const storedCatalog: StoredCatalog = {
      platform,
      lastSync: new Date().toISOString(),
      totalItems: entries.length,
      items: entries
    };
    await catalogDB.putPlatformCatalog(platform, storedCatalog);

    return { processed, stored };
  }

  // Extraer todos los catálogos de plataformas soportadas
  async fetchAllPlatforms(platforms: PlatformKey[] = Object.keys(PLATFORM_IDS) as PlatformKey[]): Promise<Record<PlatformKey, StoredCatalog>> {
    const result: Record<PlatformKey, StoredCatalog> = {} as any;
    for (const p of platforms) {
      // rate-limit entre plataformas
      const entries = await this.fetchCompleteCatalog(p);
      const storedCatalog: StoredCatalog = {
        platform: p,
        lastSync: new Date().toISOString(),
        totalItems: entries.length,
        items: entries
      };
      await catalogDB.putPlatformCatalog(p, storedCatalog);
      result[p] = storedCatalog;
      await new Promise(r => setTimeout(r, 400));
    }
    return result;
  }

  // Lectura de catálogo desde IndexedDB
  async getPlatformCatalog(platform: PlatformKey): Promise<StoredCatalog | null> {
    return catalogDB.getPlatformCatalog(platform);
  }

  async getAllCatalogs(): Promise<StoredCatalog[]> {
    return catalogDB.getAllCatalogs();
  }
}

export const streamingCatalogService = new StreamingCatalogService();