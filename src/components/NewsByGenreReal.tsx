import React, { useState, useEffect, useMemo } from 'react';
import ContentGridReal from './ContentGridReal';
import { useContent } from '../hooks/useContent';
import { tmdbService } from '../services/tmdb';
import { contentStorage } from '../services/contentStorage';

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
  { id: 878, name: 'Ciencia Ficción' },
  { id: 10770, name: 'Película de TV' },
  { id: 53, name: 'Suspense' },
  { id: 10752, name: 'Bélica' },
  { id: 37, name: 'Western' }
];

interface NewsByGenreProps {
  genreId?: number;
}

const NewsByGenre: React.FC<NewsByGenreProps> = ({ genreId }) => {
  const [selectedGenre, setSelectedGenre] = useState(18); // Drama por defecto
  const { content, loading, error } = useContent({
    genreId: genreId || selectedGenre,
    timeFilter: 'week',
    sortBy: 'popularity',
    limit: 12,
    strictTimeFilter: true
  });

  useEffect(() => {
    if (genreId && genreId !== selectedGenre) {
      setSelectedGenre(genreId);
    }
  }, [genreId, selectedGenre]);

  const handleGenreChange = (genreId: number) => {
    setSelectedGenre(genreId);
  };

  // Helpers de fecha (Europe/Madrid)
  const getNowES = () => new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Madrid' }));
  const toIso = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  };

  const genreHasWeekOrFallbackContent = (genreIdToCheck: number) => {
    const items = contentStorage.getContentByGenre(genreIdToCheck).filter(i => !!i.releaseDate);
    const nowES = getNowES();
    const todayIsoES = toIso(nowES);
    const weekAgoES = new Date(nowES);
    weekAgoES.setDate(weekAgoES.getDate() - 7);
    const weekAgoIsoES = toIso(weekAgoES);

    // Semana actual [hace 7 días, hoy]
    const hasCurrentWeek = items.some(i => i.releaseDate! >= weekAgoIsoES && i.releaseDate! <= todayIsoES);
    if (hasCurrentWeek) return true;

    // Fallback: semana anterior [hace 14 días, hace 8 días]
    const prevWeekStart = new Date(nowES);
    prevWeekStart.setDate(prevWeekStart.getDate() - 14);
    const prevWeekEnd = new Date(nowES);
    prevWeekEnd.setDate(prevWeekEnd.getDate() - 8);
    const prevWeekStartIso = toIso(prevWeekStart);
    const prevWeekEndIso = toIso(prevWeekEnd);
    const hasPrevWeek = items.some(i => i.releaseDate! >= prevWeekStartIso && i.releaseDate! <= prevWeekEndIso);
    return hasPrevWeek;
  };

  // Calcular géneros disponibles dinámicamente
  const availableGenres = useMemo(() => {
    return genres.filter(g => genreHasWeekOrFallbackContent(g.id));
  }, [content]);

  // Ajustar selección si el género actual deja de estar disponible
  useEffect(() => {
    if (!availableGenres.find(g => g.id === selectedGenre)) {
      const fallback = availableGenres[0]?.id;
      if (fallback && fallback !== selectedGenre) {
        setSelectedGenre(fallback);
      }
    }
  }, [availableGenres, selectedGenre]);

  // Ocultar sección si no hay contenido para el género seleccionado
  if (content.length === 0) {
    return null;
  }

  return (
    <section className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Novedades por género
          </h2>
          <div className="h-1 w-20 bg-primary rounded"></div>
        </div>
      </div>
      
      {/* Chips de géneros */}
      <div className="flex flex-wrap gap-2 mb-6">
        {availableGenres.map((genre) => (
          <button
            key={genre.id}
            onClick={() => handleGenreChange(genre.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedGenre === genre.id
                ? 'bg-primary text-white shadow-lg'
                : 'bg-secondary-light text-gray-300 hover:bg-secondary-dark hover:text-white'
            }`}
          >
            {genre.name}
          </button>
        ))}
      </div>

      {/* Grid de contenido por género */}
      <ContentGridReal
        genreId={selectedGenre}
        title=""
        size="medium"
        columns={{ xs: 2, sm: 3, md: 4, lg: 5, xl: 6 }}
        timeFilter="week"
        sortBy="popularity"
        limit={12}
        showLoading={true}
      />
    </section>
  );
};

export default NewsByGenre;