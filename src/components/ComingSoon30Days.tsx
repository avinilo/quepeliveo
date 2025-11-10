import React from 'react';
import ContentGrid from './ContentGrid';
import type { Movie } from './ContentGrid';

// Datos de ejemplo para próximos 30 días
const comingSoonMovies: Movie[] = [
  {
    id: 13,
    title: 'Dune: Part Two',
    year: 2024,
    rating: 9.0,
    genre: 'Ciencia Ficción',
    platform: 'Cines',
    poster: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Dune%20Part%20Two%20movie%20poster%20with%20desert%20planet%2C%20sand%20worms%2C%20epic%20sci-fi%20style%2C%20dramatic%20landscape&image_size=portrait_4_3',
    description: 'La continuación del épico viaje de Paul Atreides.',
    daysUntilRelease: 5
  },
  {
    id: 14,
    title: 'Oppenheimer',
    year: 2024,
    rating: 8.9,
    genre: 'Drama Histórico',
    platform: 'Cines',
    poster: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Oppenheimer%20movie%20poster%20with%20atomic%20explosion%2C%20historical%20drama%20style%2C%20intense%20portrait%2C%20black%20and%20white%20elements&image_size=portrait_4_3',
    description: 'La historia del padre de la bomba atómica.',
    daysUntilRelease: 12
  },
  {
    id: 15,
    title: 'The Batman 2',
    year: 2024,
    rating: 8.8,
    genre: 'Acción',
    platform: 'Cines',
    poster: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Batman%202%20movie%20poster%20with%20dark%20knight%2C%20Gotham%20City%2C%20noir%20style%2C%20detective%20mystery&image_size=portrait_4_3',
    description: 'Batman enfrenta nuevos villanos en Gotham.',
    daysUntilRelease: 18
  },
  {
    id: 16,
    title: 'Avatar 3',
    year: 2024,
    rating: 9.2,
    genre: 'Aventura',
    platform: 'Cines',
    poster: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Avatar%203%20movie%20poster%20with%20Pandora%20planet%2C%20alien%20creatures%2C%20bioluminescent%20forest%2C%20epic%20adventure%20style&image_size=portrait_4_3',
    description: 'Nuevas aventuras en el mundo de Pandora.',
    daysUntilRelease: 25
  },
  {
    id: 17,
    title: 'Fast X Part 2',
    year: 2024,
    rating: 7.5,
    genre: 'Acción',
    platform: 'Cines',
    poster: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Fast%20and%20Furious%20movie%20poster%20with%20fast%20cars%2C%20action%20scene%2C%20explosions%2C%20adrenaline%20style&image_size=portrait_4_3',
    description: 'Más velocidad y acción con la familia Toretto.',
    daysUntilRelease: 30
  }
];

interface ComingSoon30DaysProps {
  movies?: Movie[];
}

const ComingSoon30Days: React.FC<ComingSoon30DaysProps> = ({ movies }) => {
  const displayMovies = movies || comingSoonMovies;

  // Agregar badge de días hasta el estreno
  const moviesWithBadges = displayMovies.map(movie => ({
    ...movie,
    badge: movie.daysUntilRelease ? `${movie.daysUntilRelease} días` : undefined
  }));

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
          {displayMovies.length} estrenos
        </span>
      </div>

      <ContentGrid
        movies={moviesWithBadges}
        title=""
        size="large"
        columns={{ xs: 1, sm: 2, md: 3, lg: 4 }}
      />
    </section>
  );
};

export default ComingSoon30Days;