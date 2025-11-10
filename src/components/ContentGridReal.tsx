import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Play, Plus, Heart, Star, AlertCircle, RefreshCw } from 'lucide-react';
import { ContentItem, tmdbService } from '../services/tmdb';
import { useContent } from '../hooks/useContent';
import { contentStorage } from '../services/contentStorage';
import ErrorMessage from './ErrorMessage';

interface ContentCardProps {
  item: ContentItem;
  size?: 'small' | 'medium' | 'large';
  showDetails?: boolean;
  altText?: string;
}

const ContentCard: React.FC<ContentCardProps> = ({ 
  item, 
  size = 'medium', 
  showDetails = false,
  altText
}) => {
  const sizeClasses = {
    small: 'w-32 md:w-40',
    medium: 'w-40 md:w-48 lg:w-56',
    large: 'w-48 md:w-64 lg:w-72'
  };

  const heightClasses = {
    small: 'h-48 md:h-60',
    medium: 'h-60 md:h-72 lg:h-84',
    large: 'h-72 md:h-96 lg:h-108'
  };

  const [isHovered, setIsHovered] = React.useState(false);

  const getProviderBadge = (providerId: number) => {
    const provider = tmdbService.SPANISH_PROVIDERS.find(p => p.id === providerId);
    if (!provider) return null;

    const providerClasses: Record<string, string> = {
      'Netflix': 'bg-netflix',
      'Prime Video': 'bg-amazon',
      'Disney+': 'bg-disney',
      'Max': 'bg-hbo',
      'Filmin': 'bg-filmin',
      'Movistar Plus+': 'bg-movistar',
      'Apple TV+': 'bg-appletv'
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${providerClasses[provider.name] || 'bg-gray-600'}`}>
        {provider.name}
      </span>
    );
  };

  const getImageUrl = (path: string | null, size: 'w300' | 'w500' | 'w780' = 'w500') => {
    if (!path) return '/placeholder-movie.png';
    return `https://image.tmdb.org/t/p/${size}${path}`;
  };

  return (
    <Link 
      to={`/movie/${item.id}`}
      className={`group relative ${sizeClasses[size]} cursor-pointer transform transition-all duration-300 hover:scale-105 block`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Imagen del contenido */}
      <div className={`${sizeClasses[size]} ${heightClasses[size]} relative overflow-hidden rounded-lg shadow-card hover:shadow-card-hover transition-all duration-300`}>
        <img
          src={getImageUrl(item.posterPath)}
          alt={altText || item.title}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder-movie.png';
          }}
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
                <span className="text-white text-sm">{item.voteAverage.toFixed(1)}</span>
              </div>
              <span className="text-gray-300 text-xs">
                {item.releaseDate ? new Date(item.releaseDate).getFullYear() : 'N/A'}
              </span>
            </div>

            {/* Botones de acción - Mobile-first */}
            <div className="flex items-center space-x-2">
              <button
                className="flex-1 bg-primary hover:bg-primary-dark text-white text-xs font-medium py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center space-x-1"
                aria-label={`Ver ${item.title}`}
              >
                <Play className="w-3 h-3" />
                <span className="hidden sm:inline">Ver</span>
              </button>
              
              <button
                className="p-2 bg-secondary-light hover:bg-secondary-dark text-white rounded-md transition-colors duration-200"
                aria-label={`Añadir ${item.title} a mi lista`}
              >
                <Plus className="w-4 h-4" />
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

        {/* Badge de plataforma - Mobile-first */}
        {(() => {
          const firstFlatrate = item.providers?.flatrate?.[0];
          const firstRent = item.providers?.rent?.[0];
          const firstBuy = item.providers?.buy?.[0];
          const primaryProviderId = (firstFlatrate?.provider_id || firstRent?.provider_id || firstBuy?.provider_id);
          return primaryProviderId ? (
            <div className="absolute top-2 right-2">
              {getProviderBadge(primaryProviderId)}
            </div>
          ) : null;
        })()}
      </div>

      {/* Información básica visible siempre - Mobile-first */}
      <div className="mt-3">
        <h3 className="font-medium text-white text-sm md:text-base mb-1 line-clamp-2">
          {item.title}
        </h3>
        <div className="flex items-center justify-between text-xs md:text-sm text-gray-400">
          <span>
            {item.releaseDate ? new Date(item.releaseDate).getFullYear() : 'N/A'}
          </span>
          <div className="flex items-center space-x-1">
            <Star className="w-3 h-3 md:w-4 md:h-4 text-accent" />
            <span>{item.voteAverage.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

interface ContentGridProps {
  title?: string;
  size?: 'small' | 'medium' | 'large';
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  contentType?: 'movie' | 'tv' | 'all';
  providerId?: number;
  genreId?: number;
  timeFilter?: 'today' | 'week' | 'month' | 'all';
  sortBy?: 'popularity' | 'rating' | 'newest';
  limit?: number;
  showLoading?: boolean;
  // Permite forzar modo estricto desde el exterior (presets)
  strictTimeFilter?: boolean;
}

const ContentGrid: React.FC<ContentGridProps> = ({ 
  title, 
  size = 'medium',
  columns = { xs: 2, sm: 3, md: 4, lg: 5, xl: 6 },
  contentType = 'all',
  providerId,
  genreId,
  timeFilter = 'all',
  sortBy = 'popularity',
  limit,
  showLoading = true,
  strictTimeFilter
}) => {
  const { content, loading, error, syncInProgress, refreshContent } = useContent({
    contentType,
    providerId,
    genreId,
    timeFilter,
    sortBy,
    limit,
    // Modo estricto solo si se indica explícitamente desde el exterior.
    // Por defecto, permitimos fallbacks para evitar grids vacíos en Home.
    strictTimeFilter: typeof strictTimeFilter === 'boolean'
      ? strictTimeFilter
      : false
  });

  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setRetryCount(0);
  }, [contentType, providerId, genreId, timeFilter, sortBy, limit]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    refreshContent();
  };

  // Helpers para zona horaria Europe/Madrid y formato ISO YYYY-MM-DD
  const toIsoES = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  };
  const nowES = useMemo(() => new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Madrid' })), []);

  // Fallback inteligente para hoy: usar estrenos de ayer si hoy está vacío
  const fallbackToday = useMemo(() => {
    if (timeFilter !== 'today' || content.length > 0) return [] as ContentItem[];
    const yesterdayES = new Date(nowES);
    yesterdayES.setDate(yesterdayES.getDate() - 1);
    let items = contentStorage.getReleasesOnDate(yesterdayES);
    // Aplicar filtros de tipo, proveedor y género si están definidos
    if (contentType && contentType !== 'all') {
      items = items.filter(i => i.type === contentType);
    }
    if (providerId) {
      items = items.filter(i => {
        const hasProvider = [
          ...(i.providers?.flatrate || []),
          ...(i.providers?.rent || []),
          ...(i.providers?.buy || [])
        ].some(p => p.provider_id === providerId);
        return hasProvider;
      });
    }
    if (genreId) {
      items = items.filter(i => (i.genres || []).includes(genreId));
    }
    if (limit && limit > 0) {
      items = items.slice(0, limit);
    }
    return items;
  }, [timeFilter, content.length, nowES, contentType, providerId, genreId, limit]);

  // Fallback inteligente para mes: usar el mes previo si el actual está vacío
  const fallbackWeek = useMemo(() => {
    if (timeFilter !== 'week' || content.length > 0) return [] as ContentItem[];
    const todayIsoES = toIsoES(nowES);
    const thirtyOneDaysAgoES = new Date(nowES); thirtyOneDaysAgoES.setDate(thirtyOneDaysAgoES.getDate() - 31);
    const sixtyOneDaysAgoES = new Date(nowES); sixtyOneDaysAgoES.setDate(sixtyOneDaysAgoES.getDate() - 61);
    const fromIso = toIsoES(sixtyOneDaysAgoES);
    const toIso = toIsoES(thirtyOneDaysAgoES);

    let items = contentStorage.getAvailableContent().filter(i => {
      if (!i.releaseDate) return false;
      // Ventana del mes previo [hace 61 días, hace 31 días]
      return i.releaseDate >= fromIso && i.releaseDate <= toIso;
    });
    if (contentType && contentType !== 'all') {
      items = items.filter(i => i.type === contentType);
    }
    if (providerId) {
      items = items.filter(i => {
        const hasProvider = [
          ...(i.providers?.flatrate || []),
          ...(i.providers?.rent || []),
          ...(i.providers?.buy || [])
        ].some(p => p.provider_id === providerId);
        return hasProvider;
      });
    }
    if (genreId) {
      items = items.filter(i => (i.genres || []).includes(genreId));
    }
    if (limit && limit > 0) {
      items = items.slice(0, limit);
    }
    return items;
  }, [timeFilter, content.length, nowES, contentType, providerId, genreId, limit]);

  const getGridCols = () => {
    const cols = [];
    if (columns.xs) cols.push(`grid-cols-${columns.xs}`);
    if (columns.sm) cols.push(`sm:grid-cols-${columns.sm}`);
    if (columns.md) cols.push(`md:grid-cols-${columns.md}`);
    if (columns.lg) cols.push(`lg:grid-cols-${columns.lg}`);
    if (columns.xl) cols.push(`xl:grid-cols-${columns.xl}`);
    return cols.join(' ');
  };

  if (loading && showLoading) {
    return (
      <div className="w-full">
        {title && (
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              {title}
            </h2>
            <div className="h-1 w-20 bg-primary rounded"></div>
          </div>
        )}
        <div className={`grid ${getGridCols()} gap-4 md:gap-6`}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`${size === 'small' ? 'w-32 md:w-40' : size === 'medium' ? 'w-40 md:w-48 lg:w-56' : 'w-48 md:w-64 lg:w-72'} h-60 md:h-72 lg:h-84 bg-gray-800 rounded-lg animate-pulse`} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        {title && (
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              {title}
            </h2>
            <div className="h-1 w-20 bg-primary rounded"></div>
          </div>
        )}
        <ErrorMessage
          type={error.includes('conectar') || error.includes('red') ? 'network' : 'api'}
          message={error}
          onRetry={handleRetry}
          className="py-8"
        />
      </div>
    );
  }

  // Si no hay contenido principal, intentar fallbacks para hoy/mes
  if (content.length === 0) {
    const fallbackItems = timeFilter === 'today' ? fallbackToday : timeFilter === 'week' ? fallbackWeek : [];
    if (fallbackItems.length === 0) {
      // Ocultar sección completamente cuando no hay nada que mostrar
      return null;
    }
    return (
      <div className="w-full">
        {title && (
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              {title}
            </h2>
            <div className="h-1 w-20 bg-primary rounded"></div>
          </div>
        )}
        <div className={`grid ${getGridCols()} gap-4 md:gap-6`}>
          {fallbackItems.map((item) => (
            <ContentCard 
              key={`${item.type}-${item.id}`} 
              item={item} 
              size={size}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {title && (
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {title}
          </h2>
          <div className="h-1 w-20 bg-primary rounded"></div>
        </div>
      )}
      
      <div className={`grid ${getGridCols()} gap-4 md:gap-6`}>
        {content.map((item) => (
          <ContentCard 
            key={`${item.type}-${item.id}`} 
            item={item} 
            size={size}
          />
        ))}
      </div>
    </div>
  );
};

export default ContentGrid;
export { ContentCard };
export type { ContentCardProps, ContentGridProps };