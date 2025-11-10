import React, { useState } from 'react';
import ContentGrid from './ContentGrid';
import type { Movie } from './ContentGrid';

// Datos de ejemplo para plataformas
const platformMovies = {
  Netflix: [
    {
      id: 7,
      title: 'Stranger Things',
      year: 2022,
      rating: 8.7,
      genre: 'Ciencia Ficción',
      platform: 'Netflix',
      poster: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Stranger%20Things%20TV%20show%20poster%20with%2080s%20vibe%2C%20kids%20on%20bikes%2C%20mysterious%20lights%2C%20retro%20style&image_size=portrait_4_3',
      description: 'Misterios sobrenaturales en un pequeño pueblo.'
    },
    {
      id: 8,
      title: 'The Crown',
      year: 2023,
      rating: 8.5,
      genre: 'Drama',
      platform: 'Netflix',
      poster: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=The%20Crown%20TV%20series%20poster%20with%20royal%20crown%2C%20elegant%20British%20style%2C%20regal%20atmosphere&image_size=portrait_4_3',
      description: 'La historia de la reina Isabel II.'
    }
  ],
  'Prime Video': [
    {
      id: 9,
      title: 'The Boys',
      year: 2023,
      rating: 8.8,
      genre: 'Acción',
      platform: 'Prime Video',
      poster: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=The%20Boys%20TV%20show%20poster%20with%20superheroes%2C%20dark%20comic%20style%2C%20action%20scene&image_size=portrait_4_3',
      description: 'Superhéroes corruptos y los que los combaten.'
    },
    {
      id: 10,
      title: 'The Marvelous Mrs. Maisel',
      year: 2023,
      rating: 8.6,
      genre: 'Comedia',
      platform: 'Prime Video',
      poster: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Mrs%20Maisel%20TV%20show%20poster%20with%201950s%20woman%20comedian%2C%20vintage%20style%2C%20stand-up%20comedy%20theme&image_size=portrait_4_3',
      description: 'Una mujer se convierte en comediante en los 50.'
    }
  ],
  'Disney+': [
    {
      id: 11,
      title: 'The Mandalorian',
      year: 2023,
      rating: 8.7,
      genre: 'Ciencia Ficción',
      platform: 'Disney+',
      poster: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Mandalorian%20TV%20show%20poster%20with%20bounty%20hunter%2C%20Baby%20Yoda%2C%20space%20western%20style&image_size=portrait_4_3',
      description: 'Un cazarrecompensas en la galaxia de Star Wars.'
    },
    {
      id: 12,
      title: 'WandaVision',
      year: 2021,
      rating: 8.3,
      genre: 'Superhéroes',
      platform: 'Disney+',
      poster: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=WandaVision%20TV%20show%20poster%20with%20scarlet%20witch%2C%20vision%2C%20retro%20sitcom%20style%2C%20mystical%20elements&image_size=portrait_4_3',
      description: 'Una historia de amor con superpoderes.'
    }
  ]
};

const platforms = ['Netflix', 'Prime Video', 'Disney+', 'Max', 'Filmin', 'Movistar+'];

interface NewsByPlatformProps {
  movies?: Movie[];
}

const NewsByPlatform: React.FC<NewsByPlatformProps> = ({ movies }) => {
  const [selectedPlatform, setSelectedPlatform] = useState('Netflix');

  const currentMovies = movies || platformMovies[selectedPlatform as keyof typeof platformMovies] || [];

  return (
    <section className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Novedades de tu semana
          </h2>
          <div className="h-1 w-20 bg-primary rounded"></div>
        </div>
      </div>
      
      {/* Chips de plataformas */}
      <div className="flex flex-wrap gap-2 mb-6">
        {platforms.map((platform) => (
          <button
            key={platform}
            onClick={() => setSelectedPlatform(platform)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedPlatform === platform
                ? 'bg-primary text-white shadow-lg'
                : 'bg-secondary-light text-gray-300 hover:bg-secondary-dark hover:text-white'
            }`}
          >
            {platform}
          </button>
        ))}
      </div>

      {/* Grid de contenido por plataforma */}
      <ContentGrid
        movies={currentMovies}
        title=""
        size="medium"
        columns={{ xs: 2, sm: 3, md: 4, lg: 5, xl: 6 }}
      />
    </section>
  );
};

export default NewsByPlatform;