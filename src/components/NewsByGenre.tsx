import React, { useState } from 'react';
import ContentGrid from './ContentGrid';
import type { Movie } from './ContentGrid';

// Datos de ejemplo por género
const genreMovies = {
  'Ciencia Ficción': [
    {
      id: 23,
      title: 'Blade Runner 2049',
      year: 2017,
      rating: 8.8,
      genre: 'Ciencia Ficción',
      platform: 'Netflix',
      poster: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Blade%20Runner%202049%20movie%20poster%20with%20cyberpunk%20city%2C%20neon%20lights%2C%20futuristic%20atmosphere%2C%20noir%20style&image_size=portrait_4_3',
      description: 'Un blade runner descubre un secreto que puede alterar la sociedad.'
    },
    {
      id: 24,
      title: 'Arrival',
      year: 2016,
      rating: 8.5,
      genre: 'Ciencia Ficción',
      platform: 'Prime Video',
      poster: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Arrival%20movie%20poster%20with%20alien%20spacecraft%2C%20linguistic%20symbols%2C%20mysterious%20atmosphere%2C%20intellectual%20sci-fi&image_size=portrait_4_3',
      description: 'Una lingüista intenta comunicarse con alienígenas.'
    }
  ],
  Drama: [
    {
      id: 25,
      title: 'Manchester by the Sea',
      year: 2016,
      rating: 8.4,
      genre: 'Drama',
      platform: 'Prime Video',
      poster: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Manchester%20by%20the%20Sea%20movie%20poster%20with%20coastal%20town%2C%20family%20drama%2C%20melancholic%20atmosphere%2C%20emotional%20style&image_size=portrait_4_3',
      description: 'Un hombre debe hacerse cargo de su sobrino tras una tragedia.'
    },
    {
      id: 26,
      title: 'Moonlight',
      year: 2016,
      rating: 8.3,
      genre: 'Drama',
      platform: 'Netflix',
      poster: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Moonlight%20movie%20poster%20with%20coming%20of%20age%20theme%2C%20moonlight%20reflection%2C%20intimate%20portrait%2C%20poetic%20style&image_size=portrait_4_3',
      description: 'La vida de un joven afroamericano en tres actos.'
    }
  ],
  Comedia: [
    {
      id: 27,
      title: 'The Grand Budapest Hotel',
      year: 2014,
      rating: 8.5,
      genre: 'Comedia',
      platform: 'Disney+',
      poster: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Grand%20Budapest%20Hotel%20movie%20poster%20with%20pink%20hotel%2C%20Wes%20Anderson%20style%2C%20symmetrical%20composition%2C%20quirky%20comedy&image_size=portrait_4_3',
      description: 'Las aventuras de un conserje en un lujoso hotel.'
    },
    {
      id: 28,
      title: 'Paddington 2',
      year: 2017,
      rating: 8.4,
      genre: 'Comedia',
      platform: 'Netflix',
      poster: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Paddington%202%20movie%20poster%20with%20cute%20bear%2C%20London%20setting%2C%20family%20comedy%20style%2C%20warm%20colors&image_size=portrait_4_3',
      description: 'Paddington busca el regalo perfecto para su tía.'
    }
  ],
  Terror: [
    {
      id: 29,
      title: 'Hereditary',
      year: 2018,
      rating: 8.3,
      genre: 'Terror',
      platform: 'Prime Video',
      poster: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Hereditary%20movie%20poster%20with%20creepy%20dollhouse%2C%20family%20secrets%2C%20dark%20horror%20atmosphere%2C%20psychological%20terror&image_size=portrait_4_3',
      description: 'Una familia descubre oscuros secretos heredados.'
    },
    {
      id: 30,
      title: 'Get Out',
      year: 2017,
      rating: 8.2,
      genre: 'Terror',
      platform: 'Netflix',
      poster: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Get%20Out%20movie%20poster%20with%20hypnotic%20eye%2C%20social%20horror%20theme%2C%20surreal%20atmosphere%2C%20thriller%20style&image_size=portrait_4_3',
      description: 'Un hombre afroamericano visita a la familia de su novia.'
    }
  ]
};

const genres = ['Ciencia Ficción', 'Drama', 'Comedia', 'Terror', 'Acción', 'Romance', 'Documental', 'Animación'];

interface NewsByGenreProps {
  movies?: Movie[];
}

const NewsByGenre: React.FC<NewsByGenreProps> = ({ movies }) => {
  const [selectedGenre, setSelectedGenre] = useState('Ciencia Ficción');

  const currentMovies = movies || genreMovies[selectedGenre as keyof typeof genreMovies] || [];

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
        {genres.map((genre) => (
          <button
            key={genre}
            onClick={() => setSelectedGenre(genre)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedGenre === genre
                ? 'bg-primary text-white shadow-lg'
                : 'bg-secondary-light text-gray-300 hover:bg-secondary-dark hover:text-white'
            }`}
          >
            {genre}
          </button>
        ))}
      </div>

      {/* Grid de contenido por género */}
      <ContentGrid
        movies={currentMovies}
        title=""
        size="medium"
        columns={{ xs: 2, sm: 3, md: 4, lg: 5, xl: 6 }}
      />
    </section>
  );
};

export default NewsByGenre;