import { tmdbService, ContentItem } from './tmdb';
import { contentStorage } from './contentStorage';

interface SyncOptions {
  providers?: number[];
  contentTypes?: ('movie' | 'tv')[];
  maxPages?: number;
  forceSync?: boolean;
}

interface SyncResult {
  newContent: number;
  updatedContent: number;
  removedContent: number;
  totalContent: number;
  errors: string[];
}

class ContentSyncService {
  private isSyncing = false;
  private currentSyncPromise: Promise<SyncResult> | null = null;
  private maxSyncDurationMs = 60000; // 60s de duración máxima por ejecución
  private supportedProviders = [
    8,   // Netflix
    119, // Amazon Prime Video
    384, // Max
    337, // Disney+
    174, // Filmin
    149, // Movistar Plus+
    350  // Apple TV+
  ];

  // Sincronizar todo el contenido
  async syncAllContent(options: SyncOptions = {}): Promise<SyncResult> {
    // Si ya hay una sincronización en curso, devolver la misma promesa para evitar errores
    if (this.isSyncing) {
      if (this.currentSyncPromise) {
        return this.currentSyncPromise;
      }
      throw new Error('Sync already in progress');
    }

    // Crear y registrar la promesa de sincronización actual
    this.isSyncing = true;
    this.currentSyncPromise = (async (): Promise<SyncResult> => {
      const result: SyncResult = {
        newContent: 0,
        updatedContent: 0,
        removedContent: 0,
        totalContent: 0,
        errors: []
      };
      const startedAt = Date.now();

      try {
        const providers = options.providers || this.supportedProviders;
        const contentTypes = options.contentTypes || ['movie', 'tv'];
        const maxPages = options.maxPages || 10; // Ampliar páginas para cubrir más catálogo

        // Obtener contenido actual para comparar
        // Usar IDs reales del storage (incluye no disponibles para marcar removidos correctamente)
        const currentContentIds = new Set(contentStorage.getAllIds());
        const foundContentIds = new Set<string>();

        // Sincronizar por tipo de contenido con pausas entre ellos
        for (const contentType of contentTypes) {
          // Cortar por tiempo máximo
          if (Date.now() - startedAt > this.maxSyncDurationMs) {
            result.errors.push('Sync timed out by max duration.');
            break;
          }
          try {
            // Pausa entre tipos de contenido para no sobrecargar la API
            if (contentType !== contentTypes[0]) {
              await this.delay(1000);
            }
            
            const syncResult = await this.syncContentType(
              contentType as 'movie' | 'tv',
              providers,
              maxPages
            );
            
            syncResult.foundIds.forEach(id => foundContentIds.add(id));
            result.newContent += syncResult.newContent;
            result.updatedContent += syncResult.updatedContent;
          } catch (error) {
            result.errors.push(`Error syncing ${contentType}: ${error}`);
          }
        }

        // Marcar contenido no encontrado como no disponible
        const removedIds = Array.from(currentContentIds).filter(id => !foundContentIds.has(id));
        removedIds.forEach(id => {
          contentStorage.markAsUnavailable(id);
          result.removedContent++;
        });

        // Actualizar estadísticas
        result.totalContent = contentStorage.getAvailableContent().length;
        
        // Limpiar contenido antiguo no disponible
        contentStorage.cleanupOldContent();
        
        // Actualizar timestamp de sincronización
        contentStorage.updateLastSync();

      } catch (error) {
        result.errors.push(`General sync error: ${error}`);
      } finally {
        this.isSyncing = false;
        this.currentSyncPromise = null;
      }

      return result;
    })();

    return this.currentSyncPromise;
  }

  // Función auxiliar para pausas
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Sincronizar un tipo específico de contenido
  private async syncContentType(
    type: 'movie' | 'tv',
    providers: number[],
    maxPages: number
  ): Promise<{ foundIds: string[]; newContent: number; updatedContent: number }> {
    const foundIds: string[] = [];
    let newContent = 0;
    let updatedContent = 0;
    const startedAt = Date.now();

    for (let page = 1; page <= maxPages; page++) {
      // Timeout por duración total del tipo
      if (Date.now() - startedAt > this.maxSyncDurationMs) {
        break;
      }
      try {
        // Pausa entre páginas para no sobrecargar la API
        if (page > 1) {
          await this.delay(500);
        }
        
        // Estrategia: primero recientes sin filtro de proveedores (captura amplio)
        let response = await tmdbService.discoverRecentContent(type, page, 90);
        // Si hay pocos, completar con OR de proveedores
        if (!response.results || response.results.length < 20) {
          const extra = await tmdbService.discoverContent(type, providers, page, 'release_date.desc');
          response.results = [...(response.results || []), ...(extra.results || [])];
        }
        
        // Procesar items con pausas entre ellos
        for (let i = 0; i < response.results.length; i++) {
          const item = response.results[i];
          
          try {
            // Pausa entre procesamiento de items para ser más amigable con la API
            if (i > 0 && i % 5 === 0) {
              await this.delay(200);
            }
            
            // Obtener detalles completos del contenido
            const details = type === 'movie' 
              ? await tmdbService.getMovieDetails(item.id)
              : await tmdbService.getTVDetails(item.id);

            // Procesar el contenido
            const processedItem = tmdbService.processContentProviders(details, type);
            
            if (processedItem) {
              // Verificar si es contenido nuevo o actualizado usando storage helpers
              const existingContent = contentStorage.getContentById(processedItem.id);
              
              if (!existingContent) {
                newContent++;
                // Asegurar firstSeenAt en todos los proveedores disponibles
                processedItem.firstSeenAt = processedItem.firstSeenAt || {};
                const providers = [
                  ...processedItem.providers.flatrate.map(p => p.provider_id.toString()),
                  ...processedItem.providers.rent.map(p => p.provider_id.toString()),
                  ...processedItem.providers.buy.map(p => p.provider_id.toString())
                ];
                const nowIso = new Date().toISOString();
                providers.forEach(pid => {
                  if (!processedItem.firstSeenAt![pid]) {
                    processedItem.firstSeenAt![pid] = nowIso;
                  }
                });
              } else {
                // Verificar si hay cambios significativos
                if (this.hasSignificantChanges(existingContent, processedItem)) {
                  updatedContent++;
                }
              }

              // Agregar o actualizar contenido
              // Delegar en storage que preserve firstSeenAt de existentes y solo marque nuevos
              contentStorage.addContent(processedItem);
              foundIds.push(processedItem.id);
            }
          } catch (error) {
            console.error(`Error processing ${type} ${item.id}:`, error);
            // Continuar con el siguiente item en lugar de detenerse
          }
        }

        // Si hay menos resultados que el tamaño de página, es la última página
        if (response.results.length < 20) {
          break;
        }

      } catch (error) {
        console.error(`Error fetching ${type} page ${page}:`, error);
        // Intentar continuar con la siguiente página en lugar de detenerse
        if (page === 1) {
          // Si falla la primera página, es un error grave
          break;
        }
      }
    }

    return { foundIds, newContent, updatedContent };
  }

  // Verificar si hay cambios significativos en el contenido
  private hasSignificantChanges(existing: ContentItem, updated: ContentItem): boolean {
    // Verificar cambios en proveedores
    const existingProviders = [
      ...existing.providers.flatrate.map(p => p.provider_id),
      ...existing.providers.rent.map(p => p.provider_id),
      ...existing.providers.buy.map(p => p.provider_id)
    ].sort();
    
    const updatedProviders = [
      ...updated.providers.flatrate.map(p => p.provider_id),
      ...updated.providers.rent.map(p => p.provider_id),
      ...updated.providers.buy.map(p => p.provider_id)
    ].sort();

    if (existingProviders.length !== updatedProviders.length) return true;
    if (existingProviders.some((id, index) => id !== updatedProviders[index])) return true;

    // Verificar cambios en rating
    if (Math.abs(existing.voteAverage - updated.voteAverage) > 0.1) return true;
    if (existing.voteCount !== updated.voteCount) return true;

    return false;
  }

  // Sincronizar contenido de un proveedor específico
  async syncProviderContent(providerId: number, options: SyncOptions = {}): Promise<SyncResult> {
    return this.syncAllContent({
      ...options,
      providers: [providerId]
    });
  }

  // Obtener estadísticas de sincronización
  getSyncStats() {
    return contentStorage.getStats();
  }

  // Verificar si está sincronizando
  isCurrentlySyncing(): boolean {
    return this.isSyncing;
  }

  // Sincronización incremental (solo nuevas páginas)
  async incrementalSync(options: SyncOptions = {}): Promise<SyncResult> {
    // Solo sincronizar las primeras páginas para detectar contenido nuevo
    return this.syncAllContent({
      ...options,
      maxPages: 2 // Solo revisar las 2 primeras páginas
    });
  }

  // Forzar sincronización completa
  async forceFullSync(options: SyncOptions = {}): Promise<SyncResult> {
    return this.syncAllContent({
      ...options,
      forceSync: true,
      maxPages: 10 // Revisar más páginas para sincronización completa
    });
  }
}

export const contentSync = new ContentSyncService();
export type { SyncOptions, SyncResult };