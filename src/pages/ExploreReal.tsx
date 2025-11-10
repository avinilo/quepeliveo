import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, X, Search, Calendar, Star, Clock, Globe, Tv, Film, Play, Heart, Plus } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ContentGridReal from '../components/ContentGridReal';
import { useExploreFilters } from '../hooks/useExploreFilters';
import { tmdbService } from '../services/tmdb';

const genres = [
  { id: 28, name: 'Acción' },
  { id: 12, name: 'Aventura' },
  { id: 16, name: 'Animación' },
  { id: 35, name: 'Comedia' },
  { id: 80, name: 'Crimen' },
  { id: 99, name: 'Documental' },
  { id: 18, name: 'Drama' },
  { id: 27, name: 'Terror' },
  { id: 9648, name: 'Misterio' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Ciencia ficción' },
  { id: 53, name: 'Suspense' },
  { id: 37, name: 'Western' }
];

const platforms = [
  { id: 8, name: 'Netflix' },
  { id: 119, name: 'Prime Video' },
  { id: 337, name: 'Disney+' },
  { id: 384, name: 'Max' },
  { id: 149, name: 'Movistar Plus+' },
  { id: 174, name: 'Filmin' },
  { id: 350, name: 'Apple TV+' }
];

const years = ['2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017'];

const ExploreReal: React.FC = () => {
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
          {(['movie', 'tv', 'documental'] as const).map(type => (
            <label key={type} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="type"
                checked={filters.type === type}
                onChange={() => updateFilter('type', type)}
                className="text-primary bg-secondary-light border-secondary-dark focus:ring-primary"
              />
              <span className="text-gray-300 text-sm capitalize">
                {type === 'movie' ? 'Película' : type === 'tv' ? 'Serie' : 'Documental'}
              </span>
            </label>
          ))}
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
              key={genre.id}
              onClick={() => updateFilter('genre', genre.id.toString())}
              className={`px-3 py-2 text-xs rounded-lg transition-colors ${
                filters.genre === genre.id.toString()
                  ? 'bg-primary text-white'
                  : 'bg-secondary-light text-gray-300 hover:bg-secondary-dark'
              }`}
            >
              {genre.name}
            </button>
          ))}
          <button
            onClick={() => updateFilter('genre', '')}
            className="col-span-2 text-primary hover:text-primary/80 text-sm transition-colors"
          >
            Limpiar filtro
          </button>
        </div>
      </div>

      {/* Platform */}
      <div className="space-y-3">
        <label className="text-gray-300 text-sm font-medium flex items-center gap-2">
          <Globe className="w-4 h-4" />
          Plataforma
        </label>
        <div className="space-y-2">
          {platforms.map(platform => (
            <label key={platform.id} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="platform"
                checked={filters.platform === platform.id.toString()}
                onChange={() => updateFilter('platform', platform.id.toString())}
                className="text-primary bg-secondary-light border-secondary-dark focus:ring-primary"
              />
              <span className="text-gray-300 text-sm">{platform.name}</span>
            </label>
          ))}
          <button
            onClick={() => updateFilter('platform', '')}
            className="text-primary hover:text-primary/80 text-sm transition-colors"
          >
            Limpiar
          </button>
        </div>
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
          className="w-full px-4 py-2 bg-secondary-light border border-secondary-dark rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
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
          Rating mínimo
        </label>
        <div className="space-y-2">
          {['7.0', '8.0', '9.0'].map(rating => (
            <label key={rating} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="rating"
                checked={filters.rating === rating}
                onChange={() => updateFilter('rating', rating)}
                className="text-primary bg-secondary-light border-secondary-dark focus:ring-primary"
              />
              <span className="text-gray-300 text-sm">{rating} o más</span>
            </label>
          ))}
          <button
            onClick={() => updateFilter('rating', '')}
            className="text-primary hover:text-primary/80 text-sm transition-colors"
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* Time Filter */}
      <div className="space-y-3">
        <label className="text-gray-300 text-sm font-medium flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Período
        </label>
        <div className="space-y-2">
          {([
            { value: 'today' as const, label: 'Hoy' },
            { value: 'week' as const, label: 'Esta semana' },
            { value: 'month' as const, label: 'Este mes' },
            { value: 'all' as const, label: 'Todo el tiempo' }
          ]).map(period => (
            <label key={period.value} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="timeFilter"
                checked={filters.timeFilter === period.value}
                onChange={() => updateFilter('timeFilter', period.value)}
                className="text-primary bg-secondary-light border-secondary-dark focus:ring-primary"
              />
              <span className="text-gray-300 text-sm">{period.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Sort By */}
      <div className="space-y-3">
        <label className="text-gray-300 text-sm font-medium flex items-center gap-2">
          <Play className="w-4 h-4" />
          Ordenar por
        </label>
        <select
          value={filters.sortBy || 'popularity'}
          onChange={(e) => updateFilter('sortBy', (e.target.value as 'popularity' | 'rating' | 'newest'))}
          className="w-full px-4 py-2 bg-secondary-light border border-secondary-dark rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="popularity">Popularidad</option>
          <option value="rating">Rating</option>
          <option value="newest">Más reciente</option>
        </select>
      </div>

      {/* Reset */}
      <button
        onClick={resetFilters}
        className="w-full bg-secondary-dark hover:bg-primary/20 text-primary py-2 px-4 rounded-lg font-medium transition-colors"
      >
        Limpiar todos los filtros
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground header-offset">
      <Header />
      
      <div className="container-main py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {getDynamicTitle()}
            </h1>
            <p className="text-gray-400">
              {getDynamicSubtitle()}
            </p>
          </div>
          
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filtros
          </button>
        </div>

        {/* Layout */}
        <div className="flex gap-8">
          {/* Sidebar - Desktop */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <FilterSidebar />
          </div>

          {/* Mobile Sidebar */}
          {isMobile && (
            <div className={`fixed inset-0 z-50 lg:hidden ${
              isSidebarOpen ? 'block' : 'hidden'
            }`}>
              <div className="absolute inset-0 bg-black/50" onClick={() => setIsSidebarOpen(false)} />
              <div className="absolute right-0 top-0 h-full w-80 bg-secondary overflow-y-auto">
                <FilterSidebar />
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex-1">
            <ContentGridReal
              contentType={filters.type === 'documental' ? 'all' : (filters.type as 'movie' | 'tv' | 'all')}
              providerId={filters.platform ? parseInt(filters.platform) : undefined}
              genreId={filters.genre ? parseInt(filters.genre) : undefined}
              timeFilter={filters.timeFilter as 'today' | 'week' | 'month' | 'all'}
              sortBy={filters.sortBy as 'popularity' | 'rating' | 'newest'}
              limit={50}
              // Aplicar modo estricto si el preset lo requiere
              strictTimeFilter={filters.strictMode || ['today','week','month'].includes(filters.timeFilter || '')}
            />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ExploreReal;