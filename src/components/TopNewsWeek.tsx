import React from 'react';
import ContentGrid from './ContentGrid';
import type { Movie } from './ContentGrid';

// Datos de ejemplo para top novedades de la semana
const topWeekMovies: Movie[] = [
  {
    id: 18,
    title: 'The Last of Us',
    year: 2023,
    rating: 9.5,
    genre: 'Drama Post-apocalíptico',
    platform: 'Max',
    poster: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=The%20Last%20of%20Us%20TV%20series%20poster%20with%20father%20and%20daughter%20figures%2C%20post-apocalyptic%20landscape%2C%20emotional%20drama%20style&image_size=portrait_4_3',
    description: 'Una historia emotiva de supervivencia en un mundo post-apocalíptico.',
    position: 1
  },
  {
    id: 19,
    title: 'House of the Dragon',
    year: 2023,
    rating: 9.2,
    genre: 'Fantasía',
    platform: 'Max',
    poster: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=House%20of%20the%20Dragon%20TV%20show%20poster%20with%20dragons%2C%20medieval%20fantasy%2C%20epic%20battle%20scene%2C%20Game%20of%20Thrones%20style&image_size=portrait_4_3',
    description: 'La historia de la Casa Targaryen y sus dragones.',
    position: 2
  },
  {
    id: 20,
    title: 'The Bear',
    year: 2023,
    rating: 9.1,
    genre: 'Drama',
    platform: 'Disney+',
    poster: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=The%20Bear%20TV%20series%20poster%20with%20chef%20in%20kitchen%2C%20intense%20culinary%20drama%2C%20restaurant%20atmosphere&image_size=portrait_4_3',
    description: 'Un chef regresa a su restaurante familiar en Chicago.',
    position: 3
  },
  {
    id: 21,
    title: 'Succession',
    year: 2023,
    rating: 9.0,
    genre: 'Drama Corporativo',
    platform: 'Max',
    poster: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Succession%20TV%20show%20poster%20with%20business%20family%2C%20corporate%20power%20struggle%2C%20luxury%20setting%2C%20drama%20style&image_size=portrait_4_3',
    description: 'La lucha por el poder en un imperio mediático.',
    position: 4
  },
  {
    id: 22,
    title: 'Andor',
    year: 2023,
    rating: 8.9,
    genre: 'Ciencia Ficción',
    platform: 'Disney+',
    poster: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Andor%20TV%20series%20poster%20with%20Star%20Wars%20rebel%20spy%2C%20espionage%20thriller%20style%2C%20space%20undercover%20mission&image_size=portrait_4_3',
    description: 'Una historia de espionaje en el universo de Star Wars.',
    position: 5
  }
];

interface TopNewsWeekProps {
  movies?: Movie[];
}

const TopNewsWeek: React.FC<TopNewsWeekProps> = ({ movies }) => {
  const displayMovies = movies || topWeekMovies;

  // Agregar badges de posición
  const moviesWithBadges = displayMovies.map(movie => ({
    ...movie,
    badge: `#${movie.position}`
  }));

  return (
    <section className="w-full">
      <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Top novedades de la semana
          </h2>
          <div className="h-1 w-20 bg-primary rounded"></div>
        </div>
        <div className="flex items-center justify-between mb-6">
        <span className="text-sm text-gray-400 bg-secondary-light px-3 py-1 rounded-full">
          Ranking actualizado
        </span>
      </div>

      <ContentGrid
        movies={moviesWithBadges}
        title=""
        size="medium"
        columns={{ xs: 1, sm: 2, md: 3, lg: 5 }}
      />
    </section>
  );
};

export default TopNewsWeek;