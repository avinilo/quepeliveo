const getApiKey = (): string | null => {
  // Intentar obtener del localStorage primero
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('tmdb_api_key') : null;
  if (localKey) {
    return localKey;
  }

  // Luego intentar obtener de variables de entorno (Vite)
  try {
    const envKey = (import.meta as any)?.env?.VITE_TMDB_API_KEY;
    if (envKey) {
      return envKey as string;
    }
  } catch (_err) {
    // Ignorar si import.meta no está disponible (entorno no Vite)
  }

  // No disponible
  return null;
};
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';
const USE_PROXY = true; // Usar proxy para evitar problemas de CORS

// Proveedores de streaming en España según las pautas
const SUPPORTED_PROVIDERS = {
  NETFLIX: 8,
  AMAZON_PRIME: 119,
  MAX: 384,
  DISNEY_PLUS: 337,
  FILMIN: 174,
  MOVISTAR_PLUS: 149,
  APPLE_TV_PLUS: 350
};

const MONETIZATION_TYPES = {
  FLATRATE: 'flatrate',
  RENT: 'rent',
  BUY: 'buy'
};

// Configuración de región
const REGION = 'ES';
const LANGUAGE = 'es-ES';

interface TmdbResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

interface TmdbMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  runtime?: number;
}

interface TmdbTV {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  episode_run_time?: number[];
}

interface TmdbProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  display_priority: number;
}

interface TmdbWatchProviders {
  results?: {
    ES?: {
      flatrate?: TmdbProvider[];
      rent?: TmdbProvider[];
      buy?: TmdbProvider[];
    };
  };
}

interface ContentItem {
  id: string;
  tmdbId: number;
  type: 'movie' | 'tv';
  title: string;
  overview: string;
  posterPath: string;
  backdropPath: string;
  releaseDate: string;
  voteAverage: number;
  voteCount: number;
  genres: number[];
  runtime?: number;
  seasons?: number;
  episodes?: number;
  episodeRuntime?: number;
  providers: {
    flatrate: TmdbProvider[];
    rent: TmdbProvider[];
    buy: TmdbProvider[];
  };
  firstSeenAt?: Record<string, string>;
  lastSeenAt?: Record<string, string>;
  isNew?: boolean;
  isNewThisWeek?: boolean;
  isNewThisMonth?: boolean;
}

class TmdbService {
  // Mapeo de proveedores españoles soportados con nombres normalizados
  public SPANISH_PROVIDERS: Array<{ id: number; name: string }> = [
    { id: 8, name: 'Netflix' },
    { id: 119, name: 'Prime Video' },
    { id: 384, name: 'Max' },
    { id: 337, name: 'Disney+' },
    { id: 174, name: 'Filmin' },
    { id: 149, name: 'Movistar Plus+' },
    { id: 350, name: 'Apple TV+' }
  ];

  private async fetchFromTmdb(endpoint: string, params: Record<string, any> = {}): Promise<any> {
    const apiKey = getApiKey();
    const usingProxy = USE_PROXY && typeof window !== 'undefined';
    
    // Si no usamos proxy y no hay API key, no podemos continuar
    if (!apiKey && !usingProxy) {
      throw new Error('TMDB API key no configurada. Por favor configura tu API key en la configuración.');
    }
    
    // Construir URL base
    let baseUrl = TMDB_BASE_URL;
    let targetUrl = endpoint;
    
    // Si usamos proxy, modificar la URL
    if (usingProxy) {
      baseUrl = '/api/tmdb';
      targetUrl = endpoint;
    }
    
    // Construir URL completa
    const fullUrl = `${baseUrl}${targetUrl}`;
    let url: URL;
    
    try {
      // Para URLs relativas (proxy), usar el origen actual
      if (USE_PROXY && typeof window !== 'undefined' && baseUrl.startsWith('/')) {
        url = new URL(fullUrl, window.location.origin);
      } else {
        url = new URL(fullUrl);
      }
    } catch (error) {
      // Si falla la construcción de URL, usar la URL base original
      console.warn('Error construyendo URL, usando URL base original:', error);
      url = new URL(`${TMDB_BASE_URL}${endpoint}`);
    }
    
    // Agregar parámetros base
    // En desarrollo (Vite proxy) y en cliente, seguimos incluyendo api_key si está disponible.
    // En producción (Vercel function) aunque el cliente la envíe, la función la ignorará y usará la del entorno.
    if (apiKey) {
      url.searchParams.set('api_key', apiKey);
    }
    url.searchParams.set('language', LANGUAGE);
    
    // Agregar parámetros adicionales
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, value.toString());
      }
    });

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos de timeout
      
      const response = await fetch(url.toString(), {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('La solicitud a TMDB tardó demasiado tiempo. Por favor intenta nuevamente.');
      }
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        throw new Error('No se pudo conectar con TMDB. Verifica tu conexión a internet o intenta más tarde.');
      }
      console.error('Error fetching from TMDB:', error);
      throw error;
    }
  }

  // Obtener proveedores de streaming en España
  async getWatchProviders(type: 'movie' | 'tv'): Promise<TmdbWatchProviders> {
    return this.fetchFromTmdb(`/watch/providers/${type}`, {
      watch_region: REGION,
      monetization_types: `${MONETIZATION_TYPES.FLATRATE}|${MONETIZATION_TYPES.RENT}|${MONETIZATION_TYPES.BUY}`
    });
  }

  // Descubrir contenido con filtros de proveedores
  async discoverContent(
    type: 'movie' | 'tv',
    providers: number[],
    page: number = 1,
    sortBy: string = 'popularity.desc'
  ): Promise<TmdbResponse<TmdbMovie | TmdbTV>> {
    const providerIds = providers.join('|');
    
    return this.fetchFromTmdb(`/discover/${type}`, {
      watch_region: REGION,
      region: REGION,
      with_watch_providers: providerIds,
      with_watch_monetization_types: `${MONETIZATION_TYPES.FLATRATE}|${MONETIZATION_TYPES.RENT}|${MONETIZATION_TYPES.BUY}`,
      // Aceptar más tipos de lanzamiento para capturar estrenos en plataformas
      // Tipos TMDB: 2 (Theatrical limitado), 3 (Theatrical), 4 (Digital), 6 (TV)
      with_release_type: type === 'movie' ? '2|3|4|6' : undefined,
      page,
      sort_by: sortBy,
      // Filtros de calidad más laxos para no excluir estrenos recientes
      'vote_count.gte': 10,
      'vote_average.gte': 5.0,
      language: LANGUAGE
    });
  }

  // Descubrir próximos estrenos sin filtrar por proveedores (ventana configurable)
  async discoverUpcomingContent(
    type: 'movie' | 'tv',
    page: number = 1,
    windowDays: number = 90
  ): Promise<TmdbResponse<TmdbMovie | TmdbTV>> {
    const now = new Date();
    const until = new Date();
    until.setDate(until.getDate() + windowDays);

    const gte = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const lte = `${until.getFullYear()}-${String(until.getMonth() + 1).padStart(2, '0')}-${String(until.getDate()).padStart(2, '0')}`;

    const dateParams = type === 'movie'
      ? { 'primary_release_date.gte': gte, 'primary_release_date.lte': lte }
      : { 'first_air_date.gte': gte, 'first_air_date.lte': lte };

    return this.fetchFromTmdb(`/discover/${type}`, {
      watch_region: REGION,
      region: REGION,
      page,
      sort_by: 'release_date.asc',
      ...dateParams,
      with_release_type: type === 'movie' ? '2|3|4|6' : undefined,
      'vote_count.gte': 5, // más laxo para próximos estrenos
      'vote_average.gte': 4.0,
      language: LANGUAGE
    });
  }

  // Obtener detalles completos de una película
  async getMovieDetails(movieId: number): Promise<any> {
    const [details, credits, providers, releaseDates] = await Promise.all([
      this.fetchFromTmdb(`/movie/${movieId}`),
      this.fetchFromTmdb(`/movie/${movieId}/credits`),
      this.fetchFromTmdb(`/movie/${movieId}/watch/providers`),
      this.fetchFromTmdb(`/movie/${movieId}/release_dates`)
    ]);

    return {
      ...details,
      credits,
      providers,
      releaseDates
    };
  }

  // Obtener créditos de una película
  async getMovieCredits(movieId: number): Promise<any> {
    return this.fetchFromTmdb(`/movie/${movieId}/credits`);
  }

  // Obtener detalles completos de una serie
  async getTVDetails(tvId: number): Promise<any> {
    const [details, credits, providers, contentRatings] = await Promise.all([
      this.fetchFromTmdb(`/tv/${tvId}`),
      this.fetchFromTmdb(`/tv/${tvId}/credits`),
      this.fetchFromTmdb(`/tv/${tvId}/watch/providers`),
      this.fetchFromTmdb(`/tv/${tvId}/content_ratings`)
    ]);

    return {
      ...details,
      credits,
      providers,
      contentRatings
    };
  }

  // Obtener URLs de imágenes
  getImageUrl(path: string, size: string = 'w500'): string {
    return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
  }

  getBackdropUrl(path: string, size: string = 'w1280'): string {
    return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
  }

  // Mapear proveedores soportados
  getSupportedProviders(): number[] {
    return Object.values(SUPPORTED_PROVIDERS);
  }

  // Obtener listado de proveedores españoles soportados (IDs y nombres)
  getSpanishStreamingProviders(): Array<{ id: number; name: string }> {
    return this.SPANISH_PROVIDERS;
  }

  // Verificar si un proveedor está soportado
  isProviderSupported(providerId: number): boolean {
    return Object.values(SUPPORTED_PROVIDERS).includes(providerId);
  }

  // Extraer fecha de estreno en España (ES) desde release_dates
  // Preferencia: Digital (4) > TV (6) > Theatrical (3/2)
  private getSpainReleaseDate(details: any): string | undefined {
    const results = details?.releaseDates?.results || details?.release_dates?.results;
    if (!Array.isArray(results)) return undefined;

    const esEntry = results.find((r: any) => r.iso_3166_1 === 'ES');
    const dates: Array<{ release_date: string; type: number }> = esEntry?.release_dates || [];
    if (!dates.length) return undefined;
    const acceptedTypes = [4, 6, 3, 2];
    const filtered = dates.filter((d: any) => acceptedTypes.includes(d.type));
    if (!filtered.length) return undefined;

    const preferOrder = [4, 6, 3, 2];
    for (const t of preferOrder) {
      const ofType = filtered.filter((d: any) => d.type === t);
      if (ofType.length) {
        ofType.sort((a: any, b: any) => new Date(a.release_date).getTime() - new Date(b.release_date).getTime());
        const dateIso = ofType[0].release_date; // ISO con tiempo
        return dateIso?.slice(0, 10);
      }
    }
    return undefined;
  }

  // Procesar contenido para obtener proveedores soportados
  // Acepta contenido sin proveedores si su fecha de lanzamiento es futura (<=90 días)
  processContentProviders(content: any, type: 'movie' | 'tv'): ContentItem | null {
    const esProviders = content.providers?.results?.ES;
    
    // Es posible que próximos estrenos aún no tengan proveedores
    const flatrate = (esProviders?.flatrate || []).filter(p => this.isProviderSupported(p.provider_id));
    const rent = (esProviders?.rent || []).filter(p => this.isProviderSupported(p.provider_id));
    const buy = (esProviders?.buy || []).filter(p => this.isProviderSupported(p.provider_id));

    // Resolver releaseDate para España con preferencia por digital; si no está disponible, usar release_date global como fallback
    const resolvedReleaseDate = type === 'movie' ? this.getSpainReleaseDate(content) : undefined;
    const fallbackGlobalRelease = type === 'movie' ? (content.release_date ? content.release_date.slice(0, 10) : undefined) : undefined;
    const finalReleaseDate = type === 'movie' ? (resolvedReleaseDate || fallbackGlobalRelease) : content.first_air_date;

    // Si no tenemos ninguna fecha para película, no podemos incluirla
    if (type === 'movie' && !finalReleaseDate) {
      return null;
    }

    // Si no hay proveedores soportados, permitir guardar si la fecha digital está en próximos 90 días
    let allowWithoutProviders = false;
    if (type === 'movie' && finalReleaseDate) {
      const now = new Date();
      const in90 = new Date(); in90.setDate(in90.getDate() + 90);
      const rd = new Date(finalReleaseDate);
      allowWithoutProviders = rd > now && rd <= in90;
    }
    if (flatrate.length === 0 && rent.length === 0 && buy.length === 0 && !allowWithoutProviders) return null;

    // Asegurar géneros (los detalles no siempre tienen genre_ids, pero sí genres: [{id, name}])
    const genreIds = Array.isArray(content.genre_ids) && content.genre_ids.length > 0
      ? content.genre_ids
      : Array.isArray(content.genres)
        ? (content.genres.map((g: any) => g.id).filter((id: any) => typeof id === 'number'))
        : [];

    // releaseDate: usar SOLO la fecha digital de ES para películas; sin fallback teatral
    // Para series, mantener first_air_date
    // (resolvedReleaseDate ya calculada arriba)

    const baseItem = {
      id: `${type}_${content.id}`,
      tmdbId: content.id,
      type: type as 'movie' | 'tv',
      title: type === 'movie' ? content.title : content.name,
      overview: content.overview,
      posterPath: content.poster_path,
      backdropPath: content.backdrop_path,
      releaseDate: finalReleaseDate || '',
      voteAverage: content.vote_average,
      voteCount: content.vote_count,
      genres: genreIds,
      providers: {
        flatrate,
        rent,
        buy
      }
    };

    if (type === 'movie') {
      return {
        ...baseItem,
        runtime: content.runtime
      };
    } else {
      return {
        ...baseItem,
        seasons: content.number_of_seasons,
        episodes: content.number_of_episodes,
        episodeRuntime: content.episode_run_time?.[0]
      };
    }
  }
}

export const tmdbService = new TmdbService();
export type { ContentItem, TmdbProvider };