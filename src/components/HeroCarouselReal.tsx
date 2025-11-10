import React, { useEffect, useMemo, useState } from 'react';
import HeroCarousel from './HeroCarousel';
import { useContent } from '../hooks/useContent';
import { tmdbService, TmdbProvider } from '../services/tmdb';

type PlatformMode = 'Incluida' | 'Alquiler' | 'Compra';

interface PlatformInfo {
  name: string;
  mode: PlatformMode;
}

interface HeroItem {
  id: number;
  title: string;
  type: 'Película' | 'Serie' | 'Documental';
  genre: string;
  isNewToday?: boolean;
  isNewThisWeek?: boolean;
  rating: number; // 0-10
  votes: string; // ej. "2,3k"
  overview: string;
  dateAddedCopy: string; // ej. "Se añadió el 9 nov"
  platforms: PlatformInfo[];
  backgroundImage: string; // url
  trailerUrl?: string; // opcional
}

// Mapear proveedores TMDb a modo
function mapProvidersToPlatforms(flatrate: TmdbProvider[], rent: TmdbProvider[], buy: TmdbProvider[]): PlatformInfo[] {
  const toPlatform = (p: TmdbProvider, mode: PlatformMode): PlatformInfo => ({
    name: p.provider_name,
    mode
  });
  return [
    ...flatrate.map(p => toPlatform(p, 'Incluida')),
    ...rent.map(p => toPlatform(p, 'Alquiler')),
    ...buy.map(p => toPlatform(p, 'Compra'))
  ];
}

function formatVotes(voteCount: number): string {
  if (voteCount >= 1000) {
    const k = (voteCount / 1000).toFixed(1);
    return `${k}k`;
  }
  return `${voteCount}`;
}

function formatDateAdded(dateIso?: string): string {
  if (!dateIso) return '';
  const d = new Date(dateIso);
  const today = new Date();
  const diffDays = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Se añadió hoy';
  const day = d.getDate();
  const monthNames = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  const month = monthNames[d.getMonth()];
  return `Se añadió el ${day} ${month}`;
}

const HeroCarouselReal: React.FC = () => {
  // Usamos contenido disponible ordenado por rating para que el hero sea atractivo
  const { content, loading, error } = useContent({ contentType: 'all', sortBy: 'rating', limit: 30 });

  const heroItems: HeroItem[] = useMemo(() => {
    if (!content || content.length === 0) return [];

    // Tomar los mejores 6 elementos con backdrop disponible
    const top = content
      .filter(item => !!item.backdropPath)
      .slice(0, 6)
      .map(item => {
        const backgroundImage = item.backdropPath ? tmdbService.getBackdropUrl(item.backdropPath, 'w1280') : '';
        const platforms = mapProvidersToPlatforms(item.providers.flatrate || [], item.providers.rent || [], item.providers.buy || []);
        const isNewToday = (() => {
          const today = new Date().toDateString();
          const dates = Object.values(item.firstSeenAt || {});
          return dates.some(d => new Date(d).toDateString() === today);
        })();
        const isNewThisWeek = (() => {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          const dates = Object.values(item.firstSeenAt || {});
          return dates.some(d => new Date(d) >= weekAgo);
        })();

        const type = item.type === 'movie' ? 'Película' : 'Serie';
        const dateAddedCopy = formatDateAdded(Object.values(item.firstSeenAt || {})[0]);

        return {
          id: item.tmdbId,
          title: item.title,
          type,
          genre: '',
          isNewToday,
          isNewThisWeek,
          rating: parseFloat(item.voteAverage.toFixed(1)),
          votes: formatVotes(item.voteCount),
          overview: item.overview,
          dateAddedCopy,
          platforms,
          backgroundImage
        } as HeroItem;
      });

    return top;
  }, [content]);

  if (loading) {
    return (
      <section className="w-full h-[50vh] md:h-[60vh] bg-secondary animate-pulse rounded-xl" aria-label="Cargando hero" />
    );
  }

  if (error) {
    return (
      <section className="w-full h-[50vh] md:h-[60vh] bg-secondary rounded-xl flex items-center justify-center">
        <p className="text-gray-300">No se pudo cargar el hero: {error}</p>
      </section>
    );
  }

  if (heroItems.length === 0) {
    return (
      <section className="w-full h-[50vh] md:h-[60vh] bg-secondary rounded-xl flex items-center justify-center">
        <p className="text-gray-300">Aún no hay contenido para el hero</p>
      </section>
    );
  }

  // Reutilizamos el HeroCarousel original para mantener diseño y acciones
  return <HeroCarousel items={heroItems as any} />;
};

export default HeroCarouselReal;