import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, X, Search, Calendar, Star, Clock, Globe, Tv, Film, Play, Heart, Plus } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ContentCard } from '../components/ContentCard';
import { useExploreFilters } from '../hooks/useExploreFilters';

// Mock data
const mockContent = [
  {
    id: 1,
    title: 'Dune: Parte Dos',
    type: 'Película',
    genre: 'Sci-Fi',
    year: 2024,
    rating: 8.6,
    isNew: true,
    platform: 'Max',
    imageUrl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Dune%20Part%20Two%20desert%20epic%20sand%20worms%20sci-fi%20cinematic%20poster&image_size=portrait_4_3'
  },
  {
    id: 2,
    title: 'The Bear',
    type: 'Serie',
    genre: 'Drama',
    year: 2023,
    rating: 8.5,
    isNew: true,
    platform: 'Disney+',
    imageUrl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=The%20Bear%20tv%20series%20kitchen%20drama%20cinematic%20lighting%20wide%20shot&image_size=portrait_4_3'
  },
  {
    id: 3,
    title: 'Oppenheimer',
    type: 'Película',
    genre: 'Biografía',
    year: 2023,
    rating: 8.4,
    isNew: true,
    platform: 'Prime Video',
    imageUrl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Oppenheimer%20movie%20wide%20explosion%20nuclear%20orange%20cinematic%20poster%20dramatic&image_size=portrait_4_3'
  },
  {
    id: 4,
    title: 'Blue Eye Samurai',
    type: 'Serie',
    genre: 'Animación',
    year: 2023,
    rating: 8.7,
    isNew: true,
    platform: 'Netflix',
    imageUrl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Blue%20Eye%20Samurai%20anime%20style%20samurai%20blue%20tones%20cinematic%20wide%20poster&image_size=portrait_4_3'
  },
  {
    id: 5,
    title: 'La sociedad de la nieve',
    type: 'Película',
    genre: 'Drama',
    year: 2023,
    rating: 8.0,
    isNew: true,
    platform: 'Netflix',
    imageUrl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Society%20of%20the%20Snow%20mountain%20survival%20snowy%20cinematic%20wide%20poster&image_size=portrait_4_3'
  },
  {
    id: 6,
    title: 'Ballerina',
    type: 'Película',
    genre: 'Acción',
    year: 2024,
    rating: 7.2,
    isNew: true,
    platform: 'Netflix',
    imageUrl: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Ballerina%20movie%20neon%20noir%20pink%20blue%20wide%20cinematic%20poster&image_size=portrait_4_3'
  }
];

const genres = ['Acción', 'Comedia', 'Drama', 'Terror', 'Sci-Fi', 'Fantasía', 'Romance', 'Documental', 'Animación', 'Biografía'];
const platforms = ['Netflix', 'Prime Video', 'Disney+', 'Max', 'Movistar+', 'Filmin', 'Apple TV+', 'Rakuten'];
const years = ['2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017'];

const Explore: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [miLista, setMiLista] = useState<string[]>([]);
  
  const {
    filters,
    updateFilter,
    toggleFilter,
    resetFilters,
    applyPreset,
    getDynamicTitle,
    getDynamicSubtitle
  } = useExploreFilters();

  useEffect(() => {
    const preset = searchParams.get('preset');
    if (preset) {
      applyPreset(preset);
    }
  }, [searchParams, applyPreset]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleLista = (id: string) => {
    setMiLista(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const filteredContent = mockContent.filter(item => {
    if (filters.type && item.type !== filters.type) return false;
    if (filters.genre && item.genre !== filters.genre) return false;
    if (filters.platform && item.platform !== filters.platform) return false;
    if (filters.year && item.year.toString() !== filters.year) return false;
    if (filters.rating && item.rating < parseFloat(filters.rating)) return false;
    return true;
  });

  const FilterSidebar = () => (
    <div className="bg-secondary p-6 space-y-6">
      <div className="flex items-center justify-between lg:hidden">
        <h3 className="text-white font-semibold text-lg">Filtros</h3>
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Search */}
      <div className="space-y-3">
        <label className="text-gray-300 text-sm font-medium flex items-center gap-2">
          <Search className="w-4 h-4" />
          Búsqueda
        </label>
        <input
          type="text"
          placeholder="Buscar título..."
          value={filters.q || ''}
          onChange={(e) => updateFilter('q', e.target.value)}
          className="w-full px-4 py-2 bg-secondary-light border border-secondary-dark rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* Type */}
      <div className="space-y-3">
        <label className="text-gray-300 text-sm font-medium flex items-center gap-2">
          <Tv className="w-4 h-4" />
          Tipo
        </label>
        <div className="space-y-2">
          {(['Película', 'Serie', 'Documental'] as const).map(label => {
            const typeValue: '' | 'movie' | 'tv' | 'documental' =
              label === 'Película' ? 'movie' : label === 'Serie' ? 'tv' : 'documental';
            return (
              <label key={label} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  checked={filters.type === typeValue}
                  onChange={() => updateFilter('type', typeValue)}
                  className="text-primary bg-secondary-light border-secondary-dark focus:ring-primary"
                />
                <span className="text-gray-300 text-sm">{label}</span>
              </label>
            );
          })}
          <button
            onClick={() => updateFilter('type', '')}
            className="text-primary hover:text-primary/80 text-sm transition-colors"
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* Genre */}
      <div className="space-y-3">
        <label className="text-gray-300 text-sm font-medium flex items-center gap-2">
          <Film className="w-4 h-4" />
          Género
        </label>
        <div className="grid grid-cols-2 gap-2">
          {genres.map(genre => (
            <button
              key={genre}
              onClick={() => updateFilter('genre', genre)}
              className={`px-3 py-2 text-xs rounded-lg transition-colors ${
                filters.genre === genre
                  ? 'bg-primary text-white'
                  : 'bg-secondary-light hover:bg-secondary-dark text-gray-300'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
        <button
          onClick={() => updateFilter('genre', '')}
          className="text-primary hover:text-primary/80 text-sm transition-colors"
        >
          Limpiar
        </button>
      </div>

      {/* Platform */}
      <div className="space-y-3">
        <label className="text-gray-300 text-sm font-medium flex items-center gap-2">
          <Globe className="w-4 h-4" />
          Plataforma
        </label>
        <div className="grid grid-cols-2 gap-2">
          {platforms.map(platform => (
            <button
              key={platform}
              onClick={() => updateFilter('platform', platform)}
              className={`px-3 py-2 text-xs rounded-lg transition-colors ${
                filters.platform === platform
                  ? 'bg-primary text-white'
                  : 'bg-secondary-light hover:bg-secondary-dark text-gray-300'
              }`}
            >
              {platform}
            </button>
          ))}
        </div>
        <button
          onClick={() => updateFilter('platform', '')}
          className="text-primary hover:text-primary/80 text-sm transition-colors"
        >
          Limpiar
        </button>
      </div>

      {/* Year */}
      <div className="space-y-3">
        <label className="text-gray-300 text-sm font-medium flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Año
        </label>
        <select
          value={filters.year || ''}
          onChange={(e) => updateFilter('year', e.target.value)}
          className="w-full px-3 py-2 bg-secondary-light border border-secondary-dark rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Todos los años</option>
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* Rating */}
      <div className="space-y-3">
        <label className="text-gray-300 text-sm font-medium flex items-center gap-2">
          <Star className="w-4 h-4" />
          Valoración mínima
        </label>
        <select
          value={filters.rating || ''}
          onChange={(e) => updateFilter('rating', e.target.value)}
          className="w-full px-3 py-2 bg-secondary-light border border-secondary-dark rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Cualquier valoración</option>
          <option value="7">7+ estrellas</option>
          <option value="8">8+ estrellas</option>
          <option value="9">9+ estrellas</option>
        </select>
        <button
          onClick={() => updateFilter('rating', '')}
          className="text-primary hover:text-primary/80 text-sm transition-colors"
        >
          Limpiar
        </button>
      </div>

      {/* Clear all */}
      <div className="pt-4 border-t border-secondary-light">
        <button
          onClick={resetFilters}
          className="w-full px-4 py-2 bg-secondary-light hover:bg-secondary-dark text-white rounded-lg transition-colors text-sm font-medium"
        >
          Limpiar todo
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-secondary header-offset">
      <Header />
      
      <div className="flex">
        {/* Sidebar for desktop */}
        {!isMobile && (
          <aside className="w-80 bg-secondary min-h-screen sticky top-0">
            <div className="p-6">
              <h2 className="text-white font-bold text-xl mb-6 flex items-center gap-3">
                <Filter className="w-6 h-6 text-primary" />
                Filtros
              </h2>
              <FilterSidebar />
            </div>
          </aside>
        )}

        {/* Main content */}
        <main className="flex-1">
          {/* Mobile filter button */}
          {isMobile && (
            <div className="sticky top-0 z-10 bg-secondary border-b border-secondary-light p-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors font-medium"
              >
                <Filter className="w-5 h-5" />
                Filtros
              </button>
            </div>
          )}

          {/* Header section */}
          <div className="p-6 lg:p-8">
            <div className="mb-8">
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                {getDynamicTitle()}
              </h1>
              <p className="text-gray-400 text-lg">
                {getDynamicSubtitle()}
              </p>
            </div>

            {/* Active filters */}
            {Object.entries(filters).some(([key, value]) => value && key !== 'q') && (
              <div className="mb-6">
                <h3 className="text-white font-medium mb-3">Filtros activos:</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(filters as Record<string, any>).map(([key, value]) => {
                    if (!value || key === 'q') return null;
                    return (
                      <span
                        key={key}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-primary text-white text-sm rounded-full"
                      >
                        {value}
                        <button
                          onClick={() => updateFilter(key as any, '') as any}
                          className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Results */}
            <div className="mb-4">
              <p className="text-gray-400">
                Mostrando {filteredContent.length} resultado{filteredContent.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Content grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {filteredContent.map(item => (
                <ExploreContentCard
                  key={item.id}
                  item={item}
                  isInList={miLista.includes(item.id.toString())}
                  onToggleList={toggleLista}
                />
              ))}
            </div>

            {filteredContent.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500 text-6xl mb-4">🎬</div>
                <h3 className="text-white text-xl font-semibold mb-2">
                  No se encontraron resultados
                </h3>
                <p className="text-gray-400">
                  Intenta ajustar tus filtros o realizar una nueva búsqueda
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {isMobile && isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsSidebarOpen(false)} />
          <div className="fixed right-0 top-0 h-full w-80 bg-secondary shadow-xl">
            <FilterSidebar />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

interface ExploreContentCardProps {
  item: any;
  isInList: boolean;
  onToggleList: (id: string) => void;
}

const ExploreContentCard: React.FC<ExploreContentCardProps> = ({ item, isInList, onToggleList }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'Netflix': return 'bg-netflix';
      case 'Prime Video': return 'bg-amazon';
      case 'Disney+': return 'bg-disney';
      case 'Max': return 'bg-hbo';
      case 'Filmin': return 'bg-filmin';
      case 'Movistar+': return 'bg-movistar';
      case 'Apple TV+': return 'bg-appletv';
      default: return 'bg-rakuten';
    }
  };

  return (
    <div 
      className="group relative w-40 md:w-48 lg:w-56 cursor-pointer transform transition-all duration-300 hover:scale-105"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Imagen del contenido */}
      <div className="w-40 md:w-48 lg:w-56 h-60 md:h-72 lg:h-84 relative overflow-hidden rounded-lg shadow-card hover:shadow-card-hover transition-all duration-300">
        <img
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        
        {/* Overlay con información */}
        <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-semibold text-white text-sm md:text-base mb-2 line-clamp-2">
              {item.title}
            </h3>
            
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-accent" />
                <span className="text-white text-sm">{item.rating}</span>
              </div>
              <span className="text-gray-300 text-xs">{item.year}</span>
            </div>

            {/* Botones de acción */}
            <div className="flex items-center space-x-2">
              <button
                className="flex-1 bg-primary hover:bg-primary-dark text-white text-xs font-medium py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center space-x-1"
                aria-label={`Ver ${item.title}`}
              >
                <Play className="w-3 h-3" />
                <span className="hidden sm:inline">Ver</span>
              </button>
              
              <button
                onClick={() => onToggleList(item.id.toString())}
                className="p-2 bg-secondary-light hover:bg-secondary-dark text-white rounded-md transition-colors duration-200"
                aria-label={`Añadir ${item.title} a mi lista`}
              >
                <Plus className={`w-4 h-4 ${isInList ? 'rotate-45' : ''} transition-transform`} />
              </button>
              
              <button
                className="p-2 bg-secondary-light hover:bg-secondary-dark text-white rounded-md transition-colors duration-200"
                aria-label={`Marcar ${item.title} como favorito`}
              >
                <Heart className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Badge de plataforma */}
        <div className="absolute top-2 right-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${getPlatformColor(item.platform)}`}>
            {item.platform}
          </span>
        </div>
      </div>

      {/* Información básica visible siempre */}
      <div className="mt-3">
        <h3 className="font-medium text-white text-sm md:text-base mb-1 line-clamp-2">
          {item.title}
        </h3>
        <div className="flex items-center justify-between text-xs md:text-sm text-gray-400">
          <span>{item.year}</span>
          <div className="flex items-center space-x-1">
            <Star className="w-3 h-3 md:w-4 md:h-4 text-accent" />
            <span>{item.rating}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export { Explore };