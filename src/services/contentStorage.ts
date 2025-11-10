import { ContentItem } from './tmdb';

interface StoredContent extends ContentItem {
  lastUpdated: string;
  isAvailable: boolean;
}

interface ContentStorage {
  content: Record<string, StoredContent>;
  lastFullSync: string;
  providerLastSync: Record<string, string>;
}

class ContentStorageService {
  private storageKey = 'tmdb_content_storage';
  private content: Record<string, StoredContent> = {};
  private lastFullSync: string = '';
  private providerLastSync: Record<string, string> = {};

  constructor() {
    this.loadFromStorage();
  }

  // Helpers: obtener por ID y verificar existencia
  getContentById(id: string): StoredContent | undefined {
    return this.content[id];
  }

  hasContent(id: string): boolean {
    return !!this.content[id];
  }

  getAllIds(): string[] {
    return Object.keys(this.content);
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data: ContentStorage = JSON.parse(stored);
        this.content = data.content || {};
        this.lastFullSync = data.lastFullSync || '';
        this.providerLastSync = data.providerLastSync || {};
      }
    } catch (error) {
      console.error('Error loading content storage:', error);
      this.initializeStorage();
    }
  }

  private saveToStorage(): void {
    try {
      const data: ContentStorage = {
        content: this.content,
        lastFullSync: this.lastFullSync,
        providerLastSync: this.providerLastSync
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving content storage:', error);
    }
  }

  private initializeStorage(): void {
    this.content = {};
    this.lastFullSync = new Date().toISOString();
    this.providerLastSync = {};
    this.saveToStorage();
  }

  // Agregar o actualizar contenido
  addContent(item: ContentItem): void {
    const now = new Date().toISOString();
    const existing = this.content[item.id];
    
    // Si es contenido nuevo (no existe), marcar firstSeenAt
    if (!existing) {
      item.firstSeenAt = item.firstSeenAt || {};
      
      // Marcar firstSeenAt para cada proveedor
      const providers = [
        ...item.providers.flatrate.map(p => p.provider_id.toString()),
        ...item.providers.rent.map(p => p.provider_id.toString()),
        ...item.providers.buy.map(p => p.provider_id.toString())
      ];
      
      providers.forEach(providerId => {
        if (!item.firstSeenAt![providerId]) {
          item.firstSeenAt![providerId] = now;
        }
      });
    } else {
      // Actualización: preservar firstSeenAt existente y añadir para nuevos proveedores
      const mergedFirstSeenAt: Record<string, string> = {
        ...(existing.firstSeenAt || {})
      };

      const providers = [
        ...item.providers.flatrate.map(p => p.provider_id.toString()),
        ...item.providers.rent.map(p => p.provider_id.toString()),
        ...item.providers.buy.map(p => p.provider_id.toString())
      ];

      providers.forEach(providerId => {
        if (!mergedFirstSeenAt[providerId]) {
          mergedFirstSeenAt[providerId] = now;
        }
      });

      item.firstSeenAt = mergedFirstSeenAt;
    }

    this.content[item.id] = {
      ...(existing || {}),
      ...item,
      firstSeenAt: item.firstSeenAt,
      lastUpdated: now,
      // Si estaba marcado no disponible y vuelve a aparecer, lo marcamos disponible
      isAvailable: true
    };

    this.saveToStorage();
  }

  // Marcar contenido como no disponible
  markAsUnavailable(contentId: string): void {
    if (this.content[contentId]) {
      this.content[contentId].isAvailable = false;
      this.content[contentId].lastUpdated = new Date().toISOString();
      this.saveToStorage();
    }
  }

  // Obtener contenido disponible
  getAvailableContent(): ContentItem[] {
    return Object.values(this.content)
      .filter(item => item.isAvailable)
      // Excluir películas sin fecha digital (releaseDate vacío)
      .filter(item => item.type !== 'movie' || !!item.releaseDate)
      .map(({ lastUpdated, isAvailable, ...item }) => item);
  }

  // Obtener novedades de hoy
  getTodaysNews(): ContentItem[] {
    // Calcular la fecha actual en la zona horaria de España y comparar por ISO YYYY-MM-DD
    const todayIsoES = (() => {
      const nowES = new Date(
        new Date().toLocaleString('en-US', { timeZone: 'Europe/Madrid' })
      );
      const y = nowES.getFullYear();
      const m = String(nowES.getMonth() + 1).padStart(2, '0');
      const d = String(nowES.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    })();
    
    return Object.values(this.content)
      .filter(item => item.isAvailable)
      // Usar releaseDate (digital ES para películas, first_air_date para series)
      .filter(item => !!item.releaseDate && item.releaseDate === todayIsoES)
      .map(({ lastUpdated, isAvailable, ...item }) => item);
  }

  // Obtener novedades del mes (últimos 30 días)
  getThisWeekNews(): ContentItem[] {
    // Rango inclusivo [hace 30 días, hoy] en zona Europa/Madrid usando ISO YYYY-MM-DD
    const nowES = new Date(
      new Date().toLocaleString('en-US', { timeZone: 'Europe/Madrid' })
    );
    const monthAgoES = new Date(nowES);
    monthAgoES.setDate(monthAgoES.getDate() - 30);
    const toIso = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${dd}`;
    };
    const todayIsoES = toIso(nowES);
    const monthAgoIsoES = toIso(monthAgoES);

    return Object.values(this.content)
      .filter(item => item.isAvailable)
      .filter(item => {
        if (!item.releaseDate) return false;
        return item.releaseDate >= monthAgoIsoES && item.releaseDate <= todayIsoES;
      })
      .map(({ lastUpdated, isAvailable, ...item }) => item);
  }

  // Obtener novedades de los últimos 30 días
  getThisMonthNews(): ContentItem[] {
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    
    return Object.values(this.content)
      .filter(item => item.isAvailable)
      .filter(item => {
        const firstSeenDates = Object.values(item.firstSeenAt || {});
        const seenRecently = firstSeenDates.some(date => new Date(date) >= monthAgo);

        // Fallback adicional: si no hay firstSeenAt, usar fecha de lanzamiento
        if (!seenRecently) {
          if (item.releaseDate) {
            const release = new Date(item.releaseDate);
            return release >= monthAgo;
          }
          return false;
        }
        return true;
      })
      .map(({ lastUpdated, isAvailable, ...item }) => item);
  }

  // Obtener estrenos exactamente en una fecha concreta (por releaseDate)
  getReleasesOnDate(targetDate: Date): ContentItem[] {
    // Convertir fecha objetivo a ISO YYYY-MM-DD en zona Europa/Madrid
    const targetIsoES = (() => {
      const dES = new Date(
        targetDate.toLocaleString('en-US', { timeZone: 'Europe/Madrid' })
      );
      const y = dES.getFullYear();
      const m = String(dES.getMonth() + 1).padStart(2, '0');
      const d = String(dES.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    })();
    return Object.values(this.content)
      .filter(item => item.isAvailable)
      .filter(item => {
        if (!item.releaseDate) return false;
        return item.releaseDate === targetIsoES;
      })
      .sort((a, b) => {
        const dateA = new Date(a.releaseDate || 0).getTime();
        const dateB = new Date(b.releaseDate || 0).getTime();
        return dateB - dateA;
      })
      .map(({ lastUpdated, isAvailable, ...item }) => item);
  }

  // Obtener estrenos recientes por fecha de lanzamiento (descendente)
  getRecentReleases(limit: number = 20): ContentItem[] {
    const today = new Date();
    return Object.values(this.content)
      .filter(item => item.isAvailable)
      .filter(item => {
        if (!item.releaseDate) return false;
        const release = new Date(item.releaseDate);
        // Solo mostrar estrenos ya disponibles (no futuros)
        return release <= today;
      })
      .sort((a, b) => {
        const dateA = new Date(a.releaseDate || 0).getTime();
        const dateB = new Date(b.releaseDate || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, limit)
      .map(({ lastUpdated, isAvailable, ...item }) => item);
  }

  // Obtener contenido por proveedor
  getContentByProvider(providerId: number): ContentItem[] {
    return Object.values(this.content)
      .filter(item => item.isAvailable)
      .filter(item => {
        const hasProvider = [
          ...item.providers.flatrate,
          ...item.providers.rent,
          ...item.providers.buy
        ].some(p => p.provider_id === providerId);
        
        return hasProvider;
      })
      .map(({ lastUpdated, isAvailable, ...item }) => item);
  }

  // Obtener top contenido por rating
  getTopContent(limit: number = 20): ContentItem[] {
    return Object.values(this.content)
      .filter(item => item.isAvailable)
      .sort((a, b) => b.voteAverage - a.voteAverage)
      .slice(0, limit)
      .map(({ lastUpdated, isAvailable, ...item }) => item);
  }

  // Obtener contenido por género
  getContentByGenre(genreId: number): ContentItem[] {
    return Object.values(this.content)
      .filter(item => item.isAvailable)
      .filter(item => item.genres.includes(genreId))
      .map(({ lastUpdated, isAvailable, ...item }) => item);
  }

  // Limpiar contenido antiguo no disponible
  cleanupOldContent(daysToKeep: number = 30): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    Object.keys(this.content).forEach(contentId => {
      const item = this.content[contentId];
      if (!item.isAvailable && new Date(item.lastUpdated) < cutoffDate) {
        delete this.content[contentId];
      }
    });
    
    this.saveToStorage();
  }

  // Actualizar timestamp de sincronización
  updateLastSync(providerId?: string): void {
    const now = new Date().toISOString();
    
    if (providerId) {
      this.providerLastSync[providerId] = now;
    } else {
      this.lastFullSync = now;
    }
    
    this.saveToStorage();
  }

  // Obtener estadísticas
  getStats(): {
    totalContent: number;
    availableContent: number;
    lastFullSync: string;
    providerLastSync: Record<string, string>;
  } {
    const availableCount = Object.values(this.content).filter(item => item.isAvailable).length;
    
    return {
      totalContent: Object.keys(this.content).length,
      availableContent: availableCount,
      lastFullSync: this.lastFullSync,
      providerLastSync: this.providerLastSync
    };
  }
}

export const contentStorage = new ContentStorageService();
export type { StoredContent };