import React, { useMemo } from 'react';
import ContentGridReal from './ContentGridReal';
import { useContent, useTopContent } from '../hooks/useContent';
import { contentStorage } from '../services/contentStorage';

interface TopNewsWeekProps {
  limit?: number;
}

const TopNewsWeek: React.FC<TopNewsWeekProps> = ({ limit = 10 }) => {
  const { content, loading, error } = useTopContent(limit, 'all');
  // Comprobar si hay contenido del mes actual (para decidir ocultar sección si vacío)
  const { content: monthContent } = useContent({ timeFilter: 'week', sortBy: 'rating', strictTimeFilter: true, limit });

  // Fallback semana previa si la actual está vacía
  const toIsoES = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const nowES = useMemo(() => new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Madrid' })), []);
  const prevMonthFallback = useMemo(() => {
    if (monthContent.length > 0) return [];
    const thirtyOneDaysAgoES = new Date(nowES); thirtyOneDaysAgoES.setDate(thirtyOneDaysAgoES.getDate() - 31);
    const sixtyOneDaysAgoES = new Date(nowES); sixtyOneDaysAgoES.setDate(sixtyOneDaysAgoES.getDate() - 61);
    const fromIso = toIsoES(sixtyOneDaysAgoES);
    const toIso = toIsoES(thirtyOneDaysAgoES);
    let items = contentStorage.getAvailableContent().filter(i => i.releaseDate && i.releaseDate >= fromIso && i.releaseDate <= toIso);
    return items.slice(0, limit);
  }, [monthContent.length, nowES, limit]);

  // Agregar badges de posición
  const moviesWithBadges = content.map((item, index) => ({
    ...item,
    badge: `#${index + 1}`
  }));

  // Ocultar sección si no hay contenido ni en semana actual ni en fallback
  if (monthContent.length === 0 && prevMonthFallback.length === 0) {
    return null;
  }

  return (
    <section className="w-full">
      <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Top novedades del mes
          </h2>
          <div className="h-1 w-20 bg-primary rounded"></div>
        </div>
        <div className="flex items-center justify-between mb-6">
        <span className="text-sm text-gray-400 bg-secondary-light px-3 py-1 rounded-full">
          Ranking actualizado
        </span>
      </div>

      <ContentGridReal
        limit={limit}
        title=""
        size="medium"
        columns={{ xs: 1, sm: 2, md: 3, lg: 5 }}
        timeFilter="week"
        sortBy="rating"
        showLoading={true}
      />
    </section>
  );
};

export default TopNewsWeek;