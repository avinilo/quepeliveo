import React, { useState } from 'react';
import ContentGrid from './ContentGrid';
import type { Movie } from './ContentGrid';

// Datos de ejemplo por modalidad
const modalityContent = {
  'Cine en casa': [
    {
      id: 37,
      title: 'Cinema Paradiso',
      year: 1988,
      rating: 9.2,
      genre: 'Drama',
      platform: 'Filmin',
      poster: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Cinema%20Paradiso%20movie%20poster%20with%20movie%20theater%2C%20projectionist%2C%20nostalgic%20Italian%20cinema%20style%2C%20romantic%20drama&image_size=portrait_4_3',
      description: 'Un homenaje al cine y al amor por las películas.'
    },
    {
      id: 38,
      title: '8½',
      year: 1963,
      rating: 8.9,
      genre: 'Drama',
      platform: 'Movistar+',
      poster: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=8%20and%20a%20Half%20Fellini%20movie%20poster%20with%20surreal%20elements%2C%20Italian%20cinema%2C%20artistic%20style%2C%20black%20and%20white&image_size=portrait_4_3',
      description: 'Un director de cine enfrenta un bloqueo creativo.'
    }
  ],
  'Binge watching': [
    {
      id: 39,
      title: 'Breaking Bad',
      year: 2013,
      rating: 9.8,
      genre: 'Drama',
      platform: 'Netflix',
      poster: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Breaking%20Bad%20TV%20show%20poster%20with%20chemistry%20elements%2C%20desert%20landscape%2C%20intense%20drama%20style%2C%20Heisenberg%20hat&image_size=portrait_4_3',
      description: 'Un profesor de química se convierte en narcotraficante.'
    },
    {
      id: 40,
      title: 'The Sopranos',
      year: 2007,
      rating: 9.5,
      genre: 'Drama',
      platform: 'Max',
      poster: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=The%20Sopranos%20TV%20series%20poster%20with%20mafia%20family%2C%20New%20Jersey%20setting%2C%20psychological%20drama%2C%20Italian%20American%20style&image_size=portrait_4_3',
      description: 'La vida doble de un capo de la mafia y su familia.'
    }
  ],
  'Acompañado': [
    {
      id: 41,
      title: 'Friends',
      year: 2004,
      rating: 9.0,
      genre: 'Comedia',
      platform: 'Max',
      poster: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Friends%20TV%20show%20poster%20with%20six%20friends%2C%20coffee%20shop%2C%20NYC%20apartment%2C%20sitcom%20style%2C%20warm%20colors&image_size=portrait_4_3',
      description: 'Las aventuras de seis amigos en Nueva York.'
    },
    {
      id: 42,
      title: 'The Office',
      year: 2013,
      rating: 8.9,
      genre: 'Comedia',
      platform: 'Netflix',
      poster: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=The%20Office%20TV%20show%20poster%20with%20office%20workers%2C%20workplace%20comedy%2C%20mockumentary%20style%2C%20funny%20expressions&image_size=portrait_4_3',
      description: 'La vida cotidiana en una oficina de ventas.'
    }
  ],
  'En pareja': [
    {
      id: 43,
      title: 'Pride and Prejudice',
      year: 2005,
      rating: 8.6,
      genre: 'Romance',
      platform: 'Netflix',
      poster: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Pride%20and%20Prejudice%20movie%20poster%20with%20period%20drama%2C%20English%20countryside%2C%20romantic%20couple%2C%20Jane%20Austen%20style&image_size=portrait_4_3',
      description: 'Una historia de amor en la Inglaterra victoriana.'
    },
    {
      id: 44,
      title: 'La La Land',
      year: 2016,
      rating: 8.0,
      genre: 'Musical Romance',
      platform: 'Max',
      poster: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=La%20La%20Land%20romantic%20musical%20poster%20with%20dancing%20couple%2C%20Los%20Angeles%20sunset%2C%20vibrant%20colors%2C%20classic%20Hollywood%20style&image_size=portrait_4_3',
      description: 'Un musical romántico sobre sueños y amor.'
    }
  ]
};

const modalities = [
  { id: 'cine', label: 'Cine en casa', icon: '🏠' },
  { id: 'binge', label: 'Binge watching', icon: '📺' },
  { id: 'acompanado', label: 'Acompañado', icon: '👥' },
  { id: 'pareja', label: 'En pareja', icon: '💕' },
  { id: 'familia', label: 'En familia', icon: '👨‍👩‍👧‍👦' },
  { id: 'solo', label: 'Solo/a', icon: '🧘' }
];

interface DiscoverByModalityProps {
  movies?: Movie[];
}

const DiscoverByModality: React.FC<DiscoverByModalityProps> = ({ movies }) => {
  const [selectedModality, setSelectedModality] = useState('cine');

  const currentMovies = movies || modalityContent[selectedModality as keyof typeof modalityContent] || [];

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          Descubre por modalidad
        </h2>
      </div>
      
      {/* Chips de modalidades */}
      <div className="flex flex-wrap gap-2 mb-6">
        {modalities.map((modality) => (
          <button
            key={modality.id}
            onClick={() => setSelectedModality(modality.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              selectedModality === modality.id
                ? 'bg-primary text-white shadow-lg'
                : 'bg-secondary-light text-gray-300 hover:bg-secondary-dark hover:text-white'
            }`}
          >
            <span>{modality.icon}</span>
            <span>{modality.label}</span>
          </button>
        ))}
      </div>

      {/* Grid de contenido por modalidad */}
      <ContentGrid
        movies={currentMovies}
        title=""
        size="medium"
        columns={{ xs: 2, sm: 3, md: 4, lg: 5, xl: 6 }}
      />
    </>
  );
};

export default DiscoverByModality;