import React, { useState, useEffect, useMemo } from 'react';
import ContentGridReal from './ContentGridReal';
import { tmdbService } from '../services/tmdb';
import { useContentByProvider } from '../hooks/useContent';
import { contentStorage } from '../services/contentStorage';

const platforms = [
  { id: 8, name: 'Netflix' },
  { id: 119, name: 'Prime Video' },
  { id: 337, name: 'Disney+' },
  { id: 384, name: 'Max' },
  { id: 174, name: 'Filmin' },
  { id: 149, name: 'Movistar Plus+' },
  { id: 350, name: 'Apple TV+' }
];

interface NewsByPlatformProps {
  providerId?: number;
}

const NewsByPlatform: React.FC<NewsByPlatformProps> = ({ providerId }) => {
  const [selectedPlatform, setSelectedPlatform] = useState(8); // Netflix por defecto
  const { content, loading, error, syncInProgress } = useContentByProvider(
    providerId || selectedPlatform,
    { 
      timeFilter: 'week', 
      sortBy: 'newest',
      limit: 12 
    }
  );

  // Helpers de fecha en zona Europe/Madrid
  const getNowES = () => new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Madrid' }));
  const toIso = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  };

  const providerHasWeekOrFallbackContent = (providerIdToCheck: number) => {
    const items = contentStorage.getContentByProvider(providerIdToCheck).filter(i => !!i.releaseDate);
    const nowES = getNowES();
    const todayIsoES = toIso(nowES);
    const monthAgoES = new Date(nowES);
    monthAgoES.setDate(monthAgoES.getDate() - 30);
    const monthAgoIsoES = toIso(monthAgoES);

    // Rango mes actual [hace 30 días, hoy]
    const hasCurrentMonth = items.some(i => i.releaseDate! >= monthAgoIsoES && i.releaseDate! <= todayIsoES);
    if (hasCurrentMonth) return true;

    // Fallback: mes anterior [hace 61 días, hace 31 días]
    const prevMonthStart = new Date(nowES);
    prevMonthStart.setDate(prevMonthStart.getDate() - 61);
    const prevMonthEnd = new Date(nowES);
    prevMonthEnd.setDate(prevMonthEnd.getDate() - 31);
    const prevMonthStartIso = toIso(prevMonthStart);
    const prevMonthEndIso = toIso(prevMonthEnd);
    const hasPrevMonth = items.some(i => i.releaseDate! >= prevMonthStartIso && i.releaseDate! <= prevMonthEndIso);
    return hasPrevMonth;
  };

  // Calcular plataformas disponibles dinámicamente
  const availablePlatforms = useMemo(() => {
    return platforms.filter(p => providerHasWeekOrFallbackContent(p.id));
  }, [syncInProgress, content]);

  useEffect(() => {
    if (providerId && providerId !== selectedPlatform) {
      setSelectedPlatform(providerId);
    }
  }, [providerId, selectedPlatform]);

  // Asegurar que la plataforma seleccionada sea válida; si no, seleccionar la primera disponible
  useEffect(() => {
    if (!availablePlatforms.find(p => p.id === selectedPlatform)) {
      const fallback = availablePlatforms[0]?.id;
      if (fallback && fallback !== selectedPlatform) {
        setSelectedPlatform(fallback);
      }
    }
  }, [availablePlatforms, selectedPlatform]);

  const handlePlatformChange = (platformId: number) => {
    setSelectedPlatform(platformId);
  };

  // Ocultar sección si no hay contenido para la plataforma seleccionada
  if (content.length === 0) {
    return null;
  }

  return (
    <section className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Novedades del mes
          </h2>
          <div className="h-1 w-20 bg-primary rounded"></div>
        </div>
      </div>
      
      {/* Chips de plataformas - ocultar botones sin contenido */}
      <div className="flex flex-wrap gap-2 mb-6">
        {availablePlatforms.map((platform) => (
          <button
            key={platform.id}
            onClick={() => handlePlatformChange(platform.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedPlatform === platform.id
                ? 'bg-primary text-white shadow-lg'
                : 'bg-secondary-light text-gray-300 hover:bg-secondary-dark hover:text-white'
            }`}
            disabled={syncInProgress}
          >
            {platform.name}
          </button>
        ))}
      </div>

      {/* Grid de contenido por plataforma */}
      <ContentGridReal
        providerId={selectedPlatform}
        title=""
        size="medium"
        columns={{ xs: 2, sm: 3, md: 4, lg: 5, xl: 6 }}
        timeFilter="week"
        sortBy="newest"
        limit={12}
      />
    </section>
  );
};

export default NewsByPlatform;