import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import SearchIASection from '../components/SearchIASection';
import HeroCarousel from '../components/HeroCarousel';
import TabBar from '../components/TabBar';
import ContentGridReal from '../components/ContentGridReal';
import NewsByPlatformReal from '../components/NewsByPlatformReal';
import ComingSoon30DaysReal from '../components/ComingSoon30DaysReal';
import TopNewsWeekReal from '../components/TopNewsWeekReal';
import NewsByGenreReal from '../components/NewsByGenreReal';
import TmdbConfig from '../components/TmdbConfig';
import TmdbConnectionTest from '../components/TmdbConnectionTest';
import Footer from '../components/Footer';
import CTAFinal from '../components/CTAFinal';
import { contentSync } from '../services/contentSync';

// Datos de ejemplo - Mobile-first con pocas películas
const mockMovies: Movie[] = [
  {
    id: 1,
    title: 'El Origen',
    year: 2010,
    rating: 8.8,
    genre: 'Ciencia Ficción',
    platform: 'Netflix',
    poster: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Inception%20movie%20poster%20with%20spinning%20top%20and%20city%20folding%20dream%20sequence%2C%20dark%20mysterious%20atmosphere%2C%20high%20quality%20cinema%20poster&image_size=portrait_4_3',
    description: 'Un ladrón que roba secretos a través de los sueños.'
  },
  {
    id: 2,
    title: 'Parásitos',
    year: 2019,
    rating: 8.5,
    genre: 'Drama',
    platform: 'Prime Video',
    poster: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Parasite%20Korean%20movie%20poster%20with%20family%20members%20and%20house%20stairs%2C%20minimalist%20design%2C%20dark%20comedy%20style&image_size=portrait_4_3',
    description: 'Una familia pobre se infiltra en una familia rica.'
  },
  {
    id: 3,
    title: 'Interestelar',
    year: 2014,
    rating: 8.6,
    genre: 'Ciencia Ficción',
    platform: 'Disney+',
    poster: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Interstellar%20movie%20poster%20with%20spacecraft%20and%20black%20hole%2C%20epic%20space%20scene%2C%20scientific%20accuracy%2C%20dramatic%20lighting&image_size=portrait_4_3',
    description: 'Un viaje espacial para salvar a la humanidad.'
  },
  {
    id: 4,
    title: 'La La Land',
    year: 2016,
    rating: 8.0,
    genre: 'Musical',
    platform: 'Max',
    poster: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=La%20La%20Land%20musical%20movie%20poster%20with%20couple%20dancing%20and%20Los%20Angeles%20sunset%2C%20vibrant%20colors%2C%20romantic%20atmosphere%2C%20retro%20style&image_size=portrait_4_3',
    description: 'Una historia de amor entre un músico y una actriz.'
  },
  {
    id: 5,
    title: 'Joker',
    year: 2019,
    rating: 8.4,
    genre: 'Drama',
    platform: 'Filmin',
    poster: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Joker%20movie%20poster%20with%20Joaquin%20Phoenix%20character%20in%20clown%20makeup%2C%20dark%20psychological%20thriller%20style%2C%20intense%20portrait&image_size=portrait_4_3',
    description: 'El origen del villano más icónico de Gotham.'
  },
  {
    id: 6,
    title: 'Soul',
    year: 2020,
    rating: 8.1,
    genre: 'Animación',
    platform: 'Disney+',
    poster: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Soul%20Pixar%20movie%20poster%20with%20jazz%20musician%20and%20colorful%20soul%20world%2C%20animated%20style%2C%20vibrant%20colors%2C%20musical%20theme&image_size=portrait_4_3',
    description: 'Un viaje filosófico sobre el propósito de la vida.'
  }
];

const Home: React.FC = () => {
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Verificar si hay API key configurada
    const checkApiKey = () => {
      const apiKey = localStorage.getItem('tmdb_api_key');
      setApiKeyConfigured(!!apiKey);
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
      await contentSync.fullSync();
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
          <TmdbConnectionTest className="mt-4" />
        </div>
      )}

      {/* Prueba de conexión - Mostrar si hay API key */}
      {apiKeyConfigured && (
        <div className="container-main py-6">
          <TmdbConnectionTest className="mb-4" />
        </div>
      )}

      {/* Hero Carousel - según documentación herohome.md */}
      <HeroCarousel />

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