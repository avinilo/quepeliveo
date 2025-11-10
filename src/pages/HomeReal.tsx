import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import SearchIASection from '../components/SearchIASection';
import HeroCarouselReal from '../components/HeroCarouselReal';
import TabBar from '../components/TabBar';
import ContentGridReal from '../components/ContentGridReal';
import NewsByPlatformReal from '../components/NewsByPlatformReal';
import ComingSoon30DaysReal from '../components/ComingSoon30DaysReal';
import TopNewsWeekReal from '../components/TopNewsWeekReal';
import NewsByGenreReal from '../components/NewsByGenreReal';
import TmdbConfig from '../components/TmdbConfig';
import Footer from '../components/Footer';
import CTAFinal from '../components/CTAFinal';
import { contentSync } from '../services/contentSync';

const Home: React.FC = () => {
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Verificar si hay API key configurada
    const checkApiKey = async () => {
      const localKey = localStorage.getItem('tmdb_api_key');
      // También considerar la variable de entorno expuesta por Vite en producción
      let envKey: string | undefined;
      try {
        envKey = (import.meta as any)?.env?.VITE_TMDB_API_KEY;
      } catch (_err) {
        // ignorar si no está disponible
      }

      // Si no hay clave en cliente, intentar detectar proxy serverless
      let proxyWorks = false;
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        const resp = await fetch('/api/hello', { signal: controller.signal });
        clearTimeout(timeout);
        proxyWorks = resp.ok;
      } catch (_err) {
        proxyWorks = false;
      }

      setApiKeyConfigured(!!localKey || !!envKey || proxyWorks);
    };

    checkApiKey();
    
    // Escuchar cambios en el localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'tmdb_api_key') {
        checkApiKey();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleApiKeyChange = (apiKey: string) => {
    setApiKeyConfigured(!!apiKey);
  };

  const handleInitialSync = async () => {
    if (!apiKeyConfigured) return;
    
    setIsSyncing(true);
    try {
      // Evitar arranque si ya hay otra sincronización en curso
      if (contentSync.isCurrentlySyncing()) {
        console.log('Sync ya en progreso, ignorando clic.');
        return;
      }
      // Usar la versión de sincronización completa actual
      await contentSync.forceFullSync({});
      console.log('Sincronización inicial completada');
    } catch (error) {
      console.error('Error en sincronización inicial:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground header-offset" id="main-content">
      <Header />
      
      {/* Configuración de TMDb - Solo mostrar si no hay API key */}
      {!apiKeyConfigured && (
        <div className="container-main py-6">
          <TmdbConfig onConfigChange={handleApiKeyChange} />
        </div>
      )}

      {/* Hero Carousel Real - datos reales TMDb */}
      <HeroCarouselReal />

      {/* Primera sección del body: Buscar o hablar con la IA (debajo del hero) */}
      <SearchIASection />

      {/* Contenido principal - Mobile-first */}
      <main className="container-main py-6 md:py-8">
        {/* (Hero anterior eliminado; ahora se usa HeroCarousel a ancho completo) */}

        {/* Secciones de contenido - Mobile-first grid */}
        <section className="pt-12 md:pt-16 space-y-8 md:space-y-12">
          {/* Sección 1: Buscar o hablar con la IA (ya implementada arriba) */}
          
          {/* Sección 2: Novedades de hoy (con datos reales) */}
          <ContentGridReal 
            title="Novedades de hoy"
            size="medium"
            columns={{ xs: 2, sm: 3, md: 4, lg: 5, xl: 6 }}
            timeFilter="today"
            sortBy="newest"
            limit={12}
            showLoading={true}
          />

          {/* Sección 3: Novedades de tu semana por plataforma (con datos reales) */}
          <NewsByPlatformReal />

          {/* Sección 4: Próximamente (30 días) (con datos reales) */}
          <ComingSoon30DaysReal />

          {/* Sección 5: Top novedades de la semana (con datos reales) */}
          <TopNewsWeekReal />

          {/* Sección 6: Novedades por género (con datos reales) */}
          <NewsByGenreReal />

          {/* Sección 7: Atajos de duración y tono */}
          {/* Sección removida temporalmente */}

          {/* Sección 8: Descubre por modalidad */}
          {/* Sección removida temporalmente */}

          {/* Sección 9: Seguir viendo y Mi lista (opcionales) */}
          {/* Se pueden agregar más adelante cuando se implemente la funcionalidad de usuario */}

          {/* Sección 10: Disponible en tus plataformas (ya implementada) */}
        </section>

        {/* Sección de plataformas - Mobile-first */}
        <section className="mt-12 md:mt-16">
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Disponible en tus plataformas</h2>
            <div className="h-1 w-20 bg-primary rounded"></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {['Netflix', 'Prime Video', 'Disney+', 'Max', 'Filmin', 'Movistar+', 'Apple TV+', 'Rakuten'].map((platform) => (
              <div key={platform} className="bg-secondary-light rounded-lg p-4 text-center hover:bg-secondary-dark transition-colors cursor-pointer">
                <div className="w-12 h-12 bg-primary rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">{platform.charAt(0)}</span>
                </div>
                <p className="text-gray-300 text-sm">{platform}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Botón de sincronización inicial - Solo mostrar si hay API key */}
        {apiKeyConfigured && (
          <section className="mt-12 text-center">
            <button
              onClick={handleInitialSync}
              disabled={isSyncing}
              className="bg-primary hover:bg-primary-dark disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              {isSyncing ? 'Sincronizando...' : 'Sincronizar contenido'}
            </button>
            <p className="text-sm text-gray-400 mt-2">
              Haz clic para sincronizar el contenido de las plataformas españolas
            </p>
          </section>
        )}
      </main>

      {/* TabBar - Solo visible en móvil */}
      <TabBar />
      
      {/* CTA Final Section */}
      <CTAFinal />
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;