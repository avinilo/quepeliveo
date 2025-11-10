import React, { useState, useEffect, useMemo } from 'react';
import { tmdbService } from '../services/tmdb';
import { contentStorage } from '../services/contentStorage';
import { contentSync } from '../services/contentSync';
import { useContent, useNews, useTopContent } from '../hooks/useContent';
import { Play, RefreshCw, CheckCircle, XCircle, AlertCircle, Film, Tv, Star } from 'lucide-react';

const TestTmdbIntegration: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [contentVerificationLogged, setContentVerificationLogged] = useState(false);
  
  // Hooks para probar datos
  const { content: todayNews, loading: todayLoading } = useNews('today');
  const { content: weekNews, loading: weekLoading } = useNews('week');
  const { content: topContent, loading: topLoading } = useTopContent(5);

  // Verificaciones específicas solicitadas
  const { content: strictToday, loading: strictTodayLoading } = useContent({ timeFilter: 'today', sortBy: 'newest', strictTimeFilter: true, limit: 100 });
  const { content: strictWeek, loading: strictWeekLoading } = useContent({ timeFilter: 'week', sortBy: 'newest', strictTimeFilter: true, limit: 100 });
  const { content: allContent, loading: allLoading } = useContent({ timeFilter: 'all', sortBy: 'newest', limit: 200 });

  // Estrenos recientes (30 días) basados en releaseDate pasada
  const recent30 = useMemo(() => {
    const now = new Date();
    const past30 = new Date();
    past30.setDate(past30.getDate() - 30);
    return allContent.filter(item => {
      if (!item.releaseDate) return false;
      const rd = new Date(item.releaseDate);
      return rd <= now && rd >= past30;
    }).sort((a,b) => new Date(b.releaseDate || 0).getTime() - new Date(a.releaseDate || 0).getTime()).slice(0, 100);
  }, [allContent]);

  // Fallback: últimos 90 días si los últimos 30 están vacíos
  const recent90 = useMemo(() => {
    if (recent30.length > 0) return [];
    const now = new Date();
    const past90 = new Date();
    past90.setDate(past90.getDate() - 90);
    return allContent.filter(item => {
      if (!item.releaseDate) return false;
      const rd = new Date(item.releaseDate);
      return rd <= now && rd >= past90;
    }).sort((a,b) => new Date(b.releaseDate || 0).getTime() - new Date(a.releaseDate || 0).getTime()).slice(0, 100);
  }, [allContent, recent30]);

  // Novedades por género (selector sencillo)
  const GENRES = [
    { id: 28, name: 'Acción' },
    { id: 12, name: 'Aventura' },
    { id: 35, name: 'Comedia' },
    { id: 18, name: 'Drama' },
    { id: 80, name: 'Crimen' }
  ];
  const [selectedGenre, setSelectedGenre] = useState<number>(18);
  const { content: genreNews, loading: genreLoading } = useContent({ genreId: selectedGenre, timeFilter: 'week', strictTimeFilter: true, sortBy: 'newest', limit: 100 });

  // Utilidades de validación visual
  const supportedProviders = useMemo(() => tmdbService.getSupportedProviders(), []);
  const toIso = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  };
  const isNewToday = (item: any) => {
    const nowES = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Madrid' }));
    const todayIsoES = toIso(nowES);
    return !!item.releaseDate && item.releaseDate === todayIsoES;
  };
  const isNewThisWeek = (item: any) => {
    const nowES = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Madrid' }));
    const weekAgoES = new Date(nowES);
    weekAgoES.setDate(weekAgoES.getDate() - 7);
    const todayIsoES = toIso(nowES);
    const weekAgoIsoES = toIso(weekAgoES);
    return !!item.releaseDate && item.releaseDate >= weekAgoIsoES && item.releaseDate <= todayIsoES;
  };
  const isWithinNext30Days = (item: any) => {
    if (!item.releaseDate) return false;
    const now = new Date();
    const in30 = new Date();
    in30.setDate(in30.getDate() + 30);
    const rd = new Date(item.releaseDate);
    return rd >= now && rd <= in30;
  };
  const hasSupportedMonetization = (item: any) => {
    const allProviders = [
      ...(item.providers?.flatrate || []).map((p: any) => p.provider_id),
      ...(item.providers?.rent || []).map((p: any) => p.provider_id),
      ...(item.providers?.buy || []).map((p: any) => p.provider_id)
    ];
    return allProviders.some((id: number) => supportedProviders.includes(id));
  };
  const listPlatforms = (item: any): string[] => [
    ...(item.providers.flatrate || []).map((p: any) => `${p.provider_name} (Incluida)`),
    ...(item.providers.rent || []).map((p: any) => `${p.provider_name} (Alquiler)`),
    ...(item.providers.buy || []).map((p: any) => `${p.provider_name} (Compra)`)
  ];

  useEffect(() => {
    const key = localStorage.getItem('tmdb_api_key');
    setApiKey(key || '');
    setIsConfigured(!!key);
  },[]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const runTests = async () => {
    setIsTesting(true);
    setTestResults([]);
    let providerIds: number[] = [];
    
    try {
      addResult('=== INICIANDO PRUEBAS DE TMDB ===');
      
      // Verificar API key
      const key = localStorage.getItem('tmdb_api_key');
      if (!key) {
        addResult('❌ ERROR: No hay API key configurada');
        addResult('Por favor configura tu API key en la página principal');
        return;
      }
      
      addResult('✅ API key encontrada');
      
      // Probar obtener proveedores
      try {
        addResult('Obteniendo proveedores de streaming en España...');
        const providers = await tmdbService.getSpanishStreamingProviders();
        addResult(`✅ Proveedores obtenidos: ${providers.length} proveedores`);
        providers.slice(0, 3).forEach(p => addResult(`  - ${p.name} (ID: ${p.id})`));
        providerIds = providers.map(p => p.id);
      } catch (error) {
        addResult(`❌ Error obteniendo proveedores: ${error}`);
      }
      
      // Probar descubrimiento de películas
      try {
        addResult('Descubriendo películas populares en España...');
        const resp = await tmdbService.discoverContent(
          'movie',
          providerIds.length ? providerIds : tmdbService.getSupportedProviders(),
          1,
          'popularity.desc'
        );
        addResult(`✅ Películas encontradas: ${resp.results.length} películas`);
        if (resp.results.length > 0) {
          const first: any = resp.results[0];
          const title = (first as any).title || (first as any).name || 'Sin título';
          const vote = (first as any).vote_average ?? 'N/A';
          addResult(`  - Ejemplo: ${title} (${vote}/10)`);
        }
      } catch (error) {
        addResult(`❌ Error descubriendo películas: ${error}`);
      }
      
      // Probar sincronización (esperar si hay otra sincronización en curso)
      try {
        addResult('Ejecutando sincronización de contenido...');
        // Espera más larga y luego sincronización incremental + fallback full sync
        let waitedMs = 0;
        while (contentSync.isCurrentlySyncing() && waitedMs < 15000) {
          addResult('ℹ️ Ya hay una sincronización en curso. Esperando...');
          await new Promise(res => setTimeout(res, 500));
          waitedMs += 500;
        }

        let result = await contentSync.incrementalSync();
        if (result.newContent === 0 && result.updatedContent === 0) {
          addResult('ℹ️ Incremental sin novedades. Intentando sincronización completa limitada...');
          result = await contentSync.forceFullSync({ maxPages: 5 });
        }

        addResult(`✅ Sincronización completada`);
        addResult(`  - Nuevos items: ${result.newContent}`);
        addResult(`  - Items actualizados: ${result.updatedContent}`);
        addResult(`  - Errores: ${result.errors.length}`);
      } catch (error) {
        addResult(`❌ Error en sincronización: ${error}`);
      }
      
      addResult('=== PRUEBAS FINALIZADAS ===');
      
    } catch (error) {
      addResult(`❌ Error general: ${error}`);
    } finally {
      setIsTesting(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  // Ejecutar pruebas automáticamente al cargar si hay API key
  useEffect(() => {
    if (isConfigured && !isTesting && testResults.length === 0) {
      runTests();
    }
  }, [isConfigured]);

  // Registrar verificaciones de contenido en el bloque de logs (formato igual al test inicial)
  useEffect(() => {
    if (contentVerificationLogged) return;

    // Esperar a que los hooks de contenido hayan cargado
    const loaded = !strictTodayLoading && !strictWeekLoading && !allLoading && !genreLoading;
    if (!loaded) return;

    const lines: string[] = [];
    lines.push('=== VERIFICACIÓN DE CONTENIDO ===');
    // Construir verificación directamente desde contentStorage para evitar estados desactualizados
    const available = contentStorage.getAvailableContent();
    const toIsoLocal = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const nowESLocal = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Madrid' }));
    const todayIsoES = toIsoLocal(nowESLocal);
    const weekAgoES = new Date(nowESLocal);
    weekAgoES.setDate(weekAgoES.getDate() - 7);
    const weekAgoIsoES = toIsoLocal(weekAgoES);
    const now = new Date();
    const in30 = new Date();
    in30.setDate(in30.getDate() + 30);

    const storageToday = available.filter(item => !!item.releaseDate && item.releaseDate === todayIsoES);
    const storageWeek = available.filter(item => !!item.releaseDate && item.releaseDate >= weekAgoIsoES && item.releaseDate <= todayIsoES);
    const storageComingSoon = available.filter(item => {
      if (!item.releaseDate) return false;
      const rd = new Date(item.releaseDate);
      return rd >= now && rd <= in30;
    });
    const storageByGenre = available
      .filter(item => (item.genres || []).includes(selectedGenre))
      .filter(item => !!item.releaseDate && item.releaseDate >= weekAgoIsoES && item.releaseDate <= todayIsoES);

    // Hoy (estricto)
    lines.push(storageToday.length > 0
      ? `✅ Novedades de hoy: ${storageToday.length} resultados`
      : '❌ Novedades de hoy: 0 resultados');

    // Semana (estricto)
    lines.push(storageWeek.length > 0
      ? `✅ Novedades de la semana: ${storageWeek.length} resultados`
      : '❌ Novedades de la semana: 0 resultados');

    // Estrenos recientes (30 días) con fallback 90 días
    const past30 = new Date(); past30.setDate(past30.getDate() - 30);
    // Solo considerar películas con fecha digital (releaseDate presente) y series por first_air_date
    const storageRecent30 = available.filter(item => {
      if (item.type === 'movie' && !item.releaseDate) return false;
      if (!item.releaseDate) return false;
      const rd = new Date(item.releaseDate);
      return rd <= now && rd >= past30;
    });
    if (storageRecent30.length > 0) {
      lines.push(`✅ Estrenos recientes (30 días): ${storageRecent30.length} resultados`);
    } else {
      const past90 = new Date(); past90.setDate(past90.getDate() - 90);
      const storageRecent90 = available.filter(item => {
        if (item.type === 'movie' && !item.releaseDate) return false;
        if (!item.releaseDate) return false;
        const rd = new Date(item.releaseDate);
        return rd <= now && rd >= past90;
      });
      if (storageRecent90.length > 0) {
        lines.push(`✅ Estrenos recientes (90 días): ${storageRecent90.length} resultados`);
      } else {
        lines.push('❌ Estrenos recientes (30/90 días): 0 resultados');
      }
    }

    // Por género (semana, estricto)
    const currentGenreName = GENRES.find(g => g.id === selectedGenre)?.name || 'Género';
    lines.push(storageByGenre.length > 0
      ? `✅ Novedades por género (${currentGenreName}): ${storageByGenre.length} resultados`
      : `❌ Novedades por género (${currentGenreName}): 0 resultados`);

    // Detalle de primeros elementos para comparar con interfaz
    const detail = (label: string, items: any[]) => {
      const subset = items.slice(0, 5);
      if (subset.length === 0) return;
      lines.push(`=== ${label} (primeros 5) ===`);
      subset.forEach(item => {
        const firstSeenDates = Object.values(item.firstSeenAt || {});
        const firstSeenStr = firstSeenDates.length > 0 && typeof firstSeenDates[0] === 'string'
          ? new Date(firstSeenDates[0] as string).toLocaleDateString('es-ES')
          : 'N/A';
        const platforms = listPlatforms(item).join(', ');
        const genres = (item.genres || []).join(', ');
        const releaseStr = item.releaseDate ? new Date(item.releaseDate as string).toLocaleDateString('es-ES') : 'N/A';
        lines.push(`  - ${item.title} | visto: ${firstSeenStr} | estreno: ${releaseStr} | plataformas: ${platforms} | géneros: ${genres}`);
      });
    };

    detail('Hoy (estricto)', storageToday);
    detail('Semana (estricto)', storageWeek);
    detail('Estrenos recientes (30 días)', storageRecent30);
    detail(`Género ${currentGenreName}`, storageByGenre);

    setTestResults(prev => [...prev, ...lines]);
    setContentVerificationLogged(true);
  }, [strictTodayLoading, strictWeekLoading, allLoading, genreLoading, strictToday, strictWeek, genreNews, selectedGenre]);

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Pruebas de Integración TMDb</h1>
        
        {/* Configuración */}
        <div className="bg-secondary rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Configuración
          </h2>
          <div className="space-y-2">
            <p className="text-gray-300 flex items-center gap-2">
              {isConfigured ? <CheckCircle className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
              API Key: {isConfigured ? '✅ Configurada' : '❌ No configurada'}
            </p>
            <p className="text-gray-300">
              Última sincronización: {localStorage.getItem('last_full_sync') || 'Nunca'}
            </p>
          </div>
        </div>
        
        {/* Controles de prueba */}
        <div className="bg-secondary rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Play className="w-5 h-5" />
            Controles de Prueba
          </h2>
          <div className="flex space-x-4 mb-4">
            <button
              onClick={runTests}
              disabled={isTesting || !isConfigured}
              className="bg-primary hover:bg-primary-dark disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {isTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {isTesting ? 'Ejecutando pruebas...' : 'Ejecutar pruebas'}
            </button>
            <button
              onClick={async () => {
                setIsTesting(true);
                addResult('Forzando sincronización completa...');
                try {
                  const result = await contentSync.forceFullSync({ maxPages: 10 });
                  addResult(`✅ Full sync completada`);
                  addResult(`  - Nuevos items: ${result.newContent}`);
                  addResult(`  - Items actualizados: ${result.updatedContent}`);
                  addResult(`  - Errores: ${result.errors.length}`);
                  // Re-verificar contenido en logs
                  setContentVerificationLogged(false);
                } catch (e) {
                  addResult(`❌ Error en full sync: ${e}`);
                } finally {
                  setIsTesting(false);
                }
              }}
              disabled={isTesting || !isConfigured}
              className="bg-secondary-light hover:bg-secondary-dark disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Forzar full sync
            </button>
            <button
              onClick={clearResults}
              className="bg-secondary-light hover:bg-secondary-dark text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Limpiar resultados
            </button>
          </div>
        </div>
        
        {/* Resultados de pruebas */}
        <div className="bg-secondary rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Resultados de Pruebas</h2>
          <div className="bg-black rounded p-4 h-64 overflow-y-auto font-mono text-sm">
            {testResults.length === 0 ? (
              <p className="text-gray-400">No hay resultados aún. Ejecuta las pruebas para ver los resultados.</p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="mb-1">
                  {result.startsWith('❌') && <span className="text-red-400">{result}</span>}
                  {result.startsWith('✅') && <span className="text-green-400">{result}</span>}
                  {result.startsWith('===') && <span className="text-blue-400 font-bold">{result}</span>}
                  {!result.startsWith('❌') && !result.startsWith('✅') && !result.startsWith('===') && (
                    <span className="text-gray-300">{result}</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Datos actuales del hook */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-secondary rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Novedades de Hoy</h3>
            {todayLoading ? (
              <p className="text-gray-400">Cargando...</p>
            ) : (
              <div>
                <p className="text-gray-300 mb-2">{todayNews.length} items</p>
                {todayNews.slice(0, 3).map((item, index) => (
                  <div key={index} className="text-sm text-gray-400 mb-1">
                    • {item.title}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="bg-secondary rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Novedades de la Semana</h3>
            {weekLoading ? (
              <p className="text-gray-400">Cargando...</p>
            ) : (
              <div>
                <p className="text-gray-300 mb-2">{weekNews.length} items</p>
                {weekNews.slice(0, 3).map((item, index) => (
                  <div key={index} className="text-sm text-gray-400 mb-1">
                    • {item.title}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="bg-secondary rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Top Contenido</h3>
            {topLoading ? (
              <p className="text-gray-400">Cargando...</p>
            ) : (
              <div>
                <p className="text-gray-300 mb-2">{topContent.length} items</p>
                {topContent.slice(0, 3).map((item, index) => (
                  <div key={index} className="text-sm text-gray-400 mb-1">
                    • {item.title} ({item.voteAverage}/10)
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Verificaciones detalladas solicitadas (visual, sin logs) */}
        <div className="mt-8 grid grid-cols-1 gap-6">
          {/* Test: Novedades de hoy (estricto) */}
          <div className="bg-secondary rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> Test: Novedades de hoy (estricto)
            </h3>
            {strictTodayLoading ? (
              <p className="text-gray-400">Cargando...</p>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {strictToday.length > 0 ? (
                    <span className="text-green-400 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> {strictToday.length} resultados</span>
                  ) : (
                    <span className="text-red-400 flex items-center gap-1"><XCircle className="w-4 h-4" /> 0 resultados</span>
                  )}
                </div>
                <ul className="text-sm text-gray-300 space-y-1">
                  {strictToday.slice(0, 20).map((item, idx) => {
                    const firstSeenDates = Object.values(item.firstSeenAt || {});
                    const dateStr = firstSeenDates[0] ? new Date(firstSeenDates[0]).toLocaleDateString('es-ES') : 'N/A';
                    const platforms = listPlatforms(item);
                    const okNewToday = isNewToday(item);
                    const okMonetization = hasSupportedMonetization(item);
                    return (
                      <li key={idx} className="flex items-start gap-2">
                        {okNewToday && okMonetization ? (
                          <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400 mt-0.5" />
                        )}
                        <span>
                          • {item.title} — visto: {dateStr}
                          <br />
                          <span className="text-gray-400">Plataformas: {platforms.join(', ')}</span>
                          <br />
                          <span className="text-gray-400">Géneros: {(item.genres || []).join(', ')}</span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          {/* Test: Novedades de la semana (estricto) */}
          <div className="bg-secondary rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> Test: Novedades de la semana (estricto)
            </h3>
            {strictWeekLoading ? (
              <p className="text-gray-400">Cargando...</p>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {strictWeek.length > 0 ? (
                    <span className="text-green-400 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> {strictWeek.length} resultados</span>
                  ) : (
                    <span className="text-red-400 flex items-center gap-1"><XCircle className="w-4 h-4" /> 0 resultados</span>
                  )}
                </div>
                <ul className="text-sm text-gray-300 space-y-1">
                  {strictWeek.slice(0, 20).map((item, idx) => {
                    const firstSeenDates = Object.values(item.firstSeenAt || {});
                    const dateStr = firstSeenDates[0] ? new Date(firstSeenDates[0]).toLocaleDateString('es-ES') : 'N/A';
                    const platforms = listPlatforms(item);
                    const okNewWeek = isNewThisWeek(item);
                    const okMonetization = hasSupportedMonetization(item);
                    return (
                      <li key={idx} className="flex items-start gap-2">
                        {okNewWeek && okMonetization ? (
                          <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400 mt-0.5" />
                        )}
                        <span>
                          • {item.title} — visto: {dateStr}
                          <br />
                          <span className="text-gray-400">Plataformas: {platforms.join(', ')}</span>
                          <br />
                          <span className="text-gray-400">Géneros: {(item.genres || []).join(', ')}</span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          {/* Test: Estrenos recientes (30/90 días) */}
          <div className="bg-secondary rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Test: Estrenos recientes (30/90 días)</h3>
            {allLoading ? (
              <p className="text-gray-400">Cargando...</p>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {recent30.length > 0 ? (
                    <span className="text-green-400 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> {recent30.length} resultados</span>
                  ) : (
                    <span className="text-red-400 flex items-center gap-1"><XCircle className="w-4 h-4" /> 0 resultados</span>
                  )}
                </div>
                <ul className="text-sm text-gray-300 space-y-1">
                  {(recent30.length > 0 ? recent30 : recent90).slice(0, 20).map((item, idx) => {
                    const relStr = item.releaseDate ? new Date(item.releaseDate).toLocaleDateString('es-ES') : 'N/A';
                    const platforms = listPlatforms(item);
                    const okMonetization = hasSupportedMonetization(item);
                    return (
                      <li key={idx} className="flex items-start gap-2">
                        {okMonetization ? (
                          <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400 mt-0.5" />
                        )}
                        <span>
                          • {item.title} — estreno: {relStr}
                          <br />
                          <span className="text-gray-400">Plataformas: {platforms.join(', ')}</span>
                          <br />
                          <span className="text-gray-400">Géneros: {(item.genres || []).join(', ')}
                          </span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          {/* Test: Novedades por género (semana, estricto) */}
          <div className="bg-secondary rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Test: Novedades por género (semana)</h3>
              <select
                value={selectedGenre}
                onChange={e => setSelectedGenre(parseInt(e.target.value, 10))}
                className="bg-secondary-light text-white rounded px-3 py-2 text-sm"
              >
                {GENRES.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
            {genreLoading ? (
              <p className="text-gray-400">Cargando...</p>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {genreNews.length > 0 ? (
                    <span className="text-green-400 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> {genreNews.length} resultados</span>
                  ) : (
                    <span className="text-red-400 flex items-center gap-1"><XCircle className="w-4 h-4" /> 0 resultados</span>
                  )}
                </div>
                <ul className="text-sm text-gray-300 space-y-1">
                  {genreNews.slice(0, 20).map((item, idx) => {
                    const firstSeenDates = Object.values(item.firstSeenAt || {});
                    const dateStr = firstSeenDates[0] ? new Date(firstSeenDates[0]).toLocaleDateString('es-ES') : 'N/A';
                    const platforms = listPlatforms(item);
                    const okNewWeek = isNewThisWeek(item);
                    const okMonetization = hasSupportedMonetization(item);
                    return (
                      <li key={idx} className="flex items-start gap-2">
                        {okNewWeek && okMonetization ? (
                          <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400 mt-0.5" />
                        )}
                        <span>
                          • {item.title} — visto: {dateStr}
                          <br />
                          <span className="text-gray-400">Plataformas: {platforms.join(', ')}</span>
                          <br />
                          <span className="text-gray-400">Géneros: {(item.genres || []).join(', ')}
                          </span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-primary hover:text-primary-dark font-medium"
          >
            Volver a la página principal
          </a>
        </div>
      </div>
    </div>
  );
};

export default TestTmdbIntegration;