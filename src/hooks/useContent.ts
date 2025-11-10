import { useState, useEffect, useCallback } from 'react';
import { contentStorage } from '../services/contentStorage';
import { contentSync } from '../services/contentSync';
import { ContentItem } from '../services/tmdb';

interface UseContentOptions {
  contentType?: 'movie' | 'tv' | 'all';
  providerId?: number;
  genreId?: number;
  timeFilter?: 'today' | 'week' | 'month' | 'all';
  sortBy?: 'popularity' | 'rating' | 'newest';
  limit?: number;
  // Cuando está activo, no aplica fallbacks de tiempo (hoy/semana/mes estrictos)
  strictTimeFilter?: boolean;
}

interface UseContentReturn {
  content: ContentItem[];
  loading: boolean;
  error: string | null;
  syncInProgress: boolean;
  stats: {
    totalContent: number;
    availableContent: number;
    lastFullSync: string;
  };
  refreshContent: () => Promise<void>;
  syncContent: (options?: any) => Promise<void>;
}

export function useContent(options: UseContentOptions = {}): UseContentReturn {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [stats, setStats] = useState({
    totalContent: 0,
    availableContent: 0,
    lastFullSync: ''
  });

  const {
    contentType = 'all',
    providerId,
    genreId,
    timeFilter = 'all',
    sortBy = 'popularity',
    limit,
    strictTimeFilter = false
  } = options;
  // Guardar el filtro temporal original para evitar problemas de estrechamiento de tipos
  const originalTimeFilter = (options.timeFilter ?? 'all') as 'today' | 'week' | 'month' | 'all';

  const loadContent = useCallback(() => {
    try {
      // Partimos de todo el contenido disponible y combinamos filtros
      let items: ContentItem[] = contentStorage.getAvailableContent();

      // Helpers de zona horaria ES y formateo ISO YYYY-MM-DD
      const toIso = (d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${dd}`;
      };
      const nowES = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Madrid' }));
      const todayIsoES = toIso(nowES);
      const weekAgoES = new Date(nowES);
      weekAgoES.setDate(weekAgoES.getDate() - 7);
      const weekAgoIsoES = toIso(weekAgoES);

      // Filtro por tiempo basado en releaseDate (digital ES para películas, first_air_date para series)
      if (timeFilter === 'today') {
        items = items.filter(item => !!item.releaseDate && item.releaseDate === todayIsoES);
      } else if (timeFilter === 'week') {
        items = items.filter(item => !!item.releaseDate && item.releaseDate >= weekAgoIsoES && item.releaseDate <= todayIsoES);
      } else if (timeFilter === 'month') {
        const monthAgo = new Date();
        monthAgo.setDate(monthAgo.getDate() - 30);
        items = items.filter(item => {
          const firstSeenDates = Object.values(item.firstSeenAt || {});
          const seenRecently = firstSeenDates.some(date => new Date(date) >= monthAgo);
          if (!seenRecently) {
            if (item.releaseDate) {
              const release = new Date(item.releaseDate);
              return release >= monthAgo;
            }
            return false;
          }
          return true;
        });
      }

      // Filtro por proveedor
      if (providerId) {
        items = items.filter(item => {
          const hasProvider = [
            ...(item.providers?.flatrate || []),
            ...(item.providers?.rent || []),
            ...(item.providers?.buy || [])
          ].some(p => p.provider_id === providerId);
          return hasProvider;
        });
      }

      // Filtro por género
      if (genreId) {
        items = items.filter(item => (item.genres || []).includes(genreId));
      }

      // Fallback si no hay resultados para filtros de tiempo
      const strictToday = strictTimeFilter || timeFilter === 'today';
      if (items.length === 0 && !strictToday) {
        // Priorizar fallback por provider/genre si existen
        if (providerId) {
          items = contentStorage.getContentByProvider(providerId);
        } else if (genreId) {
          items = contentStorage.getContentByGenre(genreId);
        } else {
          // Cadena de fallback por tiempo (evitar comparar con 'today' en este bloque)
          if (timeFilter === 'week') {
            items = contentStorage.getThisMonthNews();
          }

          // Último recurso: todo el contenido disponible
          if (items.length === 0) {
            items = contentStorage.getAvailableContent();
          }
        }
      }

      // Filtrar por tipo de contenido
      if (contentType !== 'all') {
        items = items.filter(item => item.type === contentType);
      }

      // Excluir películas sin fecha digital en España (releaseDate vacío)
      items = items.filter(item => {
        if (item.type === 'movie') {
          return !!item.releaseDate;
        }
        return true; // mantener series con first_air_date
      });

      // Ordenar según el criterio especificado
      if (sortBy === 'rating') {
        items.sort((a, b) => b.voteAverage - a.voteAverage);
      } else if (sortBy === 'newest') {
        items.sort((a, b) => {
          const dateA = new Date(a.releaseDate || 0).getTime();
          const dateB = new Date(b.releaseDate || 0).getTime();
          return dateB - dateA;
        });
      }

      // Aplicar límite si se especifica
      if (limit && limit > 0) {
        items = items.slice(0, limit);
      }

      setContent(items);
      setStats(contentStorage.getStats());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading content');
    } finally {
      setLoading(false);
    }
  }, [contentType, providerId, genreId, timeFilter, sortBy, limit, strictTimeFilter]);

  const refreshContent = useCallback(async () => {
    setLoading(true);
    setError(null);
    loadContent();
  }, [loadContent]);

  const syncContent = useCallback(async (syncOptions = {}) => {
    // Verificar si ya hay una sincronización en progreso
    if (syncInProgress || contentSync.isCurrentlySyncing()) {
      console.log('Sync already in progress, skipping...');
      return;
    }
    
    setSyncInProgress(true);
    setError(null);
    
    try {
      // Primero intentar sincronización incremental
      let result = await contentSync.incrementalSync(syncOptions);
      
      // Si hay muchos errores o no se encontró contenido, intentar sincronización completa
      if (result.errors.length > 3 || result.newContent === 0) {
        console.log('Incremental sync had issues, trying full sync...');
        result = await contentSync.syncAllContent({
          ...syncOptions,
          maxPages: 2 // Limitar páginas para sincronización inicial
        });
      }
      
      if (result.errors.length > 0) {
        console.warn('Sync completed with errors:', result.errors);
        // No mostrar error si al menos se encontró algo de contenido
        if (result.newContent === 0 && result.updatedContent === 0) {
          setError('No se pudo sincronizar contenido. Verifica tu conexión a internet.');
        }
      }
      
      // Recargar contenido después de sincronizar
      loadContent();
    } catch (err: any) {
      console.error('Error syncing content:', err);
      
      let errorMessage = 'Error al sincronizar contenido';
      if (err.message?.includes('TMDB')) {
        errorMessage = 'Error al conectar con TMDb. Verifica tu conexión a internet.';
      } else if (err.message?.includes('API key')) {
        errorMessage = 'API key no configurada. Por favor configura tu API key en la configuración.';
      } else if (err.message?.includes('timeout')) {
        errorMessage = 'La sincronización tardó demasiado tiempo. Intenta nuevamente.';
      } else if (err.message?.includes('already in progress')) {
        // No mostrar error si ya está en progreso
        return;
      }
      
      setError(errorMessage);
    } finally {
      setSyncInProgress(false);
    }
  }, [syncInProgress, loadContent]);

  // Cargar contenido inicial
  useEffect(() => {
    loadContent();
  }, [loadContent]);

  // Refresco automático diario en medianoche de Europa/Madrid
  useEffect(() => {
    const scheduleNextRefresh = () => {
      const nowES = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Madrid' }));
      const nextMidnightES = new Date(nowES);
      nextMidnightES.setHours(24, 0, 0, 0);
      const delay = nextMidnightES.getTime() - nowES.getTime();

      const timeoutId = setTimeout(() => {
        setLoading(true);
        loadContent();
        // Reprogramar para el siguiente día
        scheduleNextRefresh();
      }, Math.max(1000, delay));
      return timeoutId;
    };

    const id = scheduleNextRefresh();
    return () => clearTimeout(id);
  }, [loadContent]);

  // Sincronizar automáticamente si el contenido está vacío o muy antiguo
  useEffect(() => {
    const shouldSync = content.length === 0 || isDataStale();
    
    if (shouldSync && !syncInProgress) {
      syncContent();
    }
  }, [content.length, syncInProgress, syncContent]);

  return {
    content,
    loading,
    error,
    syncInProgress,
    stats,
    refreshContent,
    syncContent
  };
}

// Hook específico para novedades
export function useNews(timeFilter: 'today' | 'week' | 'month' = 'today') {
  const strict = timeFilter === 'today' || timeFilter === 'week';
  return useContent({ timeFilter, sortBy: 'newest', strictTimeFilter: strict });
}

// Hook específico para contenido por proveedor
export function useContentByProvider(providerId: number, options: Omit<UseContentOptions, 'providerId'> = {}) {
  return useContent({ ...options, providerId });
}

// Hook específico para top contenido
export function useTopContent(limit: number = 20, contentType: 'movie' | 'tv' | 'all' = 'all') {
  const { content: allContent, ...rest } = useContent({ contentType, sortBy: 'rating' });
  const content = allContent.slice(0, limit);
  
  return { content, ...rest };
}

// Hook específico para contenido por género
export function useContentByGenre(genreId: number, options: Omit<UseContentOptions, 'genreId'> = {}) {
  return useContent({ ...options, genreId });
}

// Función auxiliar para verificar si los datos están desactualizados
function isDataStale(): boolean {
  const stats = contentStorage.getStats();
  
  if (!stats.lastFullSync) return true;
  
  const lastSync = new Date(stats.lastFullSync);
  const now = new Date();
  const hoursSinceLastSync = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60);
  
  // Considerar datos como desactualizados si tienen más de 24 horas
  return hoursSinceLastSync > 24;
}