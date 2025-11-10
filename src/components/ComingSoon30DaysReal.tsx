import React from 'react';
import ContentGridReal from './ContentGridReal';
import { useContent } from '../hooks/useContent';
import { tmdbService } from '../services/tmdb';

interface ComingSoon30DaysProps {
  limit?: number;
}

const ComingSoon30Days: React.FC<ComingSoon30DaysProps> = ({ limit = 12 }) => {
  // Obtener contenido que se lanzará en los próximos 30 días
  const { content, loading, error } = useContent({
    timeFilter: 'all',
    sortBy: 'newest'
  });

  // Filtrar contenido que se lanzará en los próximos 30 días
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  
  const comingSoonContent = content.filter(item => {
    if (!item.releaseDate) return false;
    const releaseDate = new Date(item.releaseDate);
    const today = new Date();
    return releaseDate > today && releaseDate <= thirtyDaysFromNow;
  });

  // Agregar badge de días hasta el estreno
  const moviesWithBadges = comingSoonContent.map(item => {
    const releaseDate = new Date(item.releaseDate || '');
    const today = new Date();
    const daysUntilRelease = Math.ceil((releaseDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      ...item,
      badge: daysUntilRelease > 0 ? `${daysUntilRelease} días` : undefined
    };
  });

  // Ocultar sección si no hay próximos estrenos en 30 días
  if (moviesWithBadges.length === 0) {
    return null;
  }

  return (
    <section className="w-full">
      <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Próximamente (30 días)
          </h2>
          <div className="h-1 w-20 bg-primary rounded"></div>
        </div>
        <div className="flex items-center justify-between mb-6">
        <span className="text-sm text-gray-400 bg-secondary-light px-3 py-1 rounded-full">
          {moviesWithBadges.length} estrenos
        </span>
      </div>

      <ContentGridReal
        limit={limit}
        title=""
        size="large"
        columns={{ xs: 1, sm: 2, md: 3, lg: 4 }}
        sortBy="newest"
        showLoading={true}
      />
    </section>
  );
};

export default ComingSoon30Days;