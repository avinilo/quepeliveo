import { useEffect, useState, useCallback } from 'react';
import { streamingCatalogService, StoredCatalog, PlatformKey, PLATFORM_IDS } from '../services/streamingCatalogService';
import { tmdbService, ContentItem } from '../services/tmdb';
import { contentStorage } from '../services/contentStorage';

interface UseStreamingCatalogsOptions {
  platform?: PlatformKey | 'all';
  type?: 'movie' | 'tv' | 'all';
  genreId?: number;
  year?: number;
  search?: string;
  sortBy?: 'popularity' | 'rating' | 'newest';
}

interface UseStreamingCatalogsReturn {
  catalogs: StoredCatalog[];
  items: ContentItem[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useStreamingCatalogs(options: UseStreamingCatalogsOptions = {}): UseStreamingCatalogsReturn {
  const [catalogs, setCatalogs] = useState<StoredCatalog[]>([]);
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    platform = 'all',
    type = 'all',
    genreId,
    year,
    search,
    sortBy = 'popularity'
  } = options;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cats = await streamingCatalogService.getAllCatalogs();
      setCatalogs(cats);

      // Usar el storage principal para obtener items enriquecidos (si existen)
      let enriched = contentStorage.getAvailableContent();

      // Filtrar por plataforma si se indica
      if (platform !== 'all') {
        const providerIdMap = new Map<string, number>(tmdbService.getSpanishStreamingProviders().map(p => [p.name, p.id]));
        const platformNameMap: Record<PlatformKey, string> = {
          netflix: 'Netflix', prime: 'Prime Video', disney: 'Disney+', hbo: 'Max', apple: 'Apple TV+', filmin: 'Filmin', movistar: 'Movistar Plus+'
        };
        const providerId = providerIdMap.get(platformNameMap[platform]);
        if (providerId) {
          enriched = enriched.filter(it => {
            const provs = [...it.providers.flatrate, ...it.providers.rent, ...it.providers.buy];
            return provs.some(p => p.provider_id === providerId);
          });
        }
      }

      // Filtrar por tipo
      if (type !== 'all') {
        enriched = enriched.filter(it => it.type === type);
      }

      // Filtrar por género
      if (genreId) {
        enriched = enriched.filter(it => (it.genres || []).includes(genreId));
      }

      // Filtrar por año
      if (year) {
        enriched = enriched.filter(it => {
          const dateStr = it.type === 'movie' ? it.releaseDate : it.releaseDate; // usar releaseDate para ambos por simplicidad
          if (!dateStr) return false;
          const y = Number(dateStr.slice(0, 4));
          return y === year;
        });
      }

      // Búsqueda simple
      if (search && search.trim().length > 0) {
        const q = search.trim().toLowerCase();
        enriched = enriched.filter(it => (it.title || '').toLowerCase().includes(q));
      }

      // Ordenar
      if (sortBy === 'rating') {
        enriched = enriched.sort((a, b) => b.voteAverage - a.voteAverage);
      } else if (sortBy === 'newest') {
        enriched = enriched.sort((a, b) => {
          const da = new Date(a.releaseDate || 0).getTime();
          const db = new Date(b.releaseDate || 0).getTime();
          return db - da;
        });
      } else {
        // popularity fallback: usar vote_count como proxy
        enriched = enriched.sort((a, b) => b.voteCount - a.voteCount);
      }

      setItems(enriched);
    } catch (e: any) {
      setError(e?.message || 'Error cargando catálogos');
    } finally {
      setLoading(false);
    }
  }, [platform, type, genreId, year, search, sortBy]);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = useCallback(async () => {
    await load();
  }, [load]);

  return { catalogs, items, loading, error, refresh };
}