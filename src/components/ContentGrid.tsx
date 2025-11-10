import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Plus, Heart, Star } from 'lucide-react';

interface Movie {
  id: number;
  title: string;
  year: number;
  rating: number;
  genre: string;
  platform: string;
  poster: string;
  description: string;
  // Campos adicionales opcionales usados en componentes de demo
  daysUntilRelease?: number;
  position?: number;
  badge?: string;
  duration?: number;
  tone?: string;
}

interface ContentCardProps {
  movie: Movie;
  size?: 'small' | 'medium' | 'large';
  showDetails?: boolean;
  altText?: string;
}

const ContentCard: React.FC<ContentCardProps> = ({ 
  movie, 
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

  return (
    <div 
      className={`group relative ${sizeClasses[size]} cursor-pointer transform transition-all duration-300 hover:scale-105`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Imagen de la película */}
      <div className={`${sizeClasses[size]} ${heightClasses[size]} relative overflow-hidden rounded-lg shadow-card hover:shadow-card-hover transition-all duration-300`}>
        <img
          src={movie.poster}
          alt={altText || movie.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        
        {/* Overlay con información */}
        <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-semibold text-white text-sm md:text-base mb-2 line-clamp-2">
              {movie.title}
            </h3>
            
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-accent" />
                <span className="text-white text-sm">{movie.rating}</span>
              </div>
              <span className="text-gray-300 text-xs">{movie.year}</span>
            </div>

            {/* Botones de acción - Mobile-first */}
            <div className="flex items-center space-x-2">
              <button
                className="flex-1 bg-primary hover:bg-primary-dark text-white text-xs font-medium py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center space-x-1"
                aria-label={`Ver ${movie.title}`}
              >
                <Play className="w-3 h-3" />
                <span className="hidden sm:inline">Ver</span>
              </button>
              
              <button
                className="p-2 bg-secondary-light hover:bg-secondary-dark text-white rounded-md transition-colors duration-200"
                aria-label={`Añadir ${movie.title} a mi lista`}
              >
                <Plus className="w-4 h-4" />
              </button>
              
              <button
                className="p-2 bg-secondary-light hover:bg-secondary-dark text-white rounded-md transition-colors duration-200"
                aria-label={`Marcar ${movie.title} como favorito`}
              >
                <Heart className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Badge de plataforma - Mobile-first */}
        <div className="absolute top-2 right-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${
            movie.platform === 'Netflix' ? 'bg-netflix' :
            movie.platform === 'Prime Video' ? 'bg-amazon' :
            movie.platform === 'Disney+' ? 'bg-disney' :
            movie.platform === 'Max' ? 'bg-hbo' :
            movie.platform === 'Filmin' ? 'bg-filmin' :
            movie.platform === 'Movistar+' ? 'bg-movistar' :
            movie.platform === 'Apple TV+' ? 'bg-appletv' :
            'bg-rakuten'
          }`}>
            {movie.platform}
          </span>
        </div>
      </div>

      {/* Información básica visible siempre - Mobile-first */}
      <div className="mt-3">
        <h3 className="font-medium text-white text-sm md:text-base mb-1 line-clamp-2">
          {movie.title}
        </h3>
        <div className="flex items-center justify-between text-xs md:text-sm text-gray-400">
          <span>{movie.year}</span>
          <div className="flex items-center space-x-1">
            <Star className="w-3 h-3 md:w-4 md:h-4 text-accent" />
            <span>{movie.rating}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ContentGridProps {
  movies: Movie[];
  title?: string;
  size?: 'small' | 'medium' | 'large';
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

const ContentGrid: React.FC<ContentGridProps> = ({ 
  movies, 
  title, 
  size = 'medium',
  columns = { xs: 2, sm: 3, md: 4, lg: 5, xl: 6 }
}) => {
  const getGridCols = () => {
    const cols = [];
    if (columns.xs) cols.push(`grid-cols-${columns.xs}`);
    if (columns.sm) cols.push(`sm:grid-cols-${columns.sm}`);
    if (columns.md) cols.push(`md:grid-cols-${columns.md}`);
    if (columns.lg) cols.push(`lg:grid-cols-${columns.lg}`);
    if (columns.xl) cols.push(`xl:grid-cols-${columns.xl}`);
    return cols.join(' ');
  };

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
        {movies.map((movie) => (
          <ContentCard 
            key={movie.id} 
            movie={movie} 
            size={size}
          />
        ))}
      </div>
    </div>
  );
};

export default ContentGrid;
export { ContentCard };
export type { Movie, ContentCardProps, ContentGridProps };