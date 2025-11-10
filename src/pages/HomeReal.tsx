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
import Footer from '../components/Footer';
import CTAFinal from '../components/CTAFinal';
import { contentSync } from '../services/contentSync';

const Home: React.FC = () => {
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // UI de configuración eliminada; asumimos proxy funcional
  }, []);

  // Eliminada función de cambio de API key

  const handleInitialSync = async () => {
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
      
      {/* Pantalla de configuración TMDb eliminada */}

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

        {/* Botón de sincronización inicial */}
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