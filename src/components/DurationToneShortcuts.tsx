import React, { useState } from 'react';
import ContentGrid from './ContentGrid';
import type { Movie } from './ContentGrid';

// Datos de ejemplo para duraciones y tonos
const durationToneMovies = {
  'Corto (< 90 min)': [
    {
      id: 31,
      title: 'The Present',
      year: 2020,
      rating: 8.2,
      genre: 'Animación',
      platform: 'YouTube',
      poster: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=The%20Present%20animated%20short%20film%20poster%20with%20puppy%2C%20heartwarming%20story%2C%20colorful%20animation%20style&image_size=portrait_4_3',
      description: 'Un corto animado sobre un niño y su cachorro.',
      duration: 4,
      tone: 'Emotivo'
    },
    {
      id: 32,
      title: 'Bao',
      year: 2018,
      rating: 8.0,
      genre: 'Animación',
      platform: 'Disney+',
      poster: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Bao%20Pixar%20short%20film%20poster%20with%20steamed%20bun%20character%2C%20Chinese%20culture%2C%20warm%20family%20style&image_size=portrait_4_3',
      description: 'Una madre china y su bao con vida.',
      duration: 8,
      tone: 'Tierno'
    }
  ],
  'Ligero/Entretenido': [
    {
      id: 33,
      title: 'The Grand Tour',
      year: 2023,
      rating: 8.5,
      genre: 'Entretenimiento',
      platform: 'Prime Video',
      poster: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Grand%20Tour%20TV%20show%20poster%20with%20cars%2C%20adventure%2C%20humor%2C%20entertainment%20style&image_size=portrait_4_3',
      description: 'Autos, aventuras y humor con los presentadores favoritos.',
      duration: 60,
      tone: 'Divertido'
    },
    {
      id: 34,
      title: 'Queer Eye',
      year: 2023,
      rating: 8.3,
      genre: 'Reality',
      platform: 'Netflix',
      poster: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Queer%20Eye%20TV%20show%20poster%20with%20fab%20five%2C%20makeover%2C%20positive%20vibes%2C%20colorful%20style&image_size=portrait_4_3',
      description: 'Transformaciones de vida con estilo y amor.',
      duration: 50,
      tone: 'Inspirador'
    }
  ],
  'Intenso/Profundo': [
    {
      id: 35,
      title: 'Chernobyl',
      year: 2019,
      rating: 9.4,
      genre: 'Drama Histórico',
      platform: 'Max',
      poster: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Chernobyl%20TV%20series%20poster%20with%20nuclear%20plant%2C%20disaster%20scene%2C%20dramatic%20intensity%2C%20historical%20drama&image_size=portrait_4_3',
      description: 'La historia del desastre nuclear de Chernóbil.',
      duration: 330,
      tone: 'Intenso'
    },
    {
      id: 36,
      title: 'The Wire',
      year: 2008,
      rating: 9.3,
      genre: 'Drama Político',
      platform: 'Max',
      poster: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=The%20Wire%20TV%20show%20poster%20with%20Baltimore%20city%2C%20urban%20drama%2C%20complex%20narrative%2C%20gritty%20style&image_size=portrait_4_3',
      description: 'La cruda realidad del sistema en Baltimore.',
      duration: 3000,
      tone: 'Profundo'
    }
  ]
};

const shortcuts = [
  { id: 'corto', label: 'Corto (< 90 min)', icon: '⏱️' },
  { id: 'ligero', label: 'Ligero/Entretenido', icon: '😄' },
  { id: 'intenso', label: 'Intenso/Profundo', icon: '🎭' },
  { id: 'premiado', label: 'Premiado', icon: '🏆' },
  { id: 'nuevo', label: 'Estrenos', icon: '✨' },
  { id: 'clasico', label: 'Clásicos', icon: '📽️' }
];

interface DurationToneShortcutsProps {
  movies?: Movie[];
}

const DurationToneShortcuts: React.FC<DurationToneShortcutsProps> = ({ movies }) => {
  const [selectedShortcut, setSelectedShortcut] = useState('corto');

  const currentMovies = movies || durationToneMovies[selectedShortcut as keyof typeof durationToneMovies] || [];

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          Atajos de duración y tono
        </h2>
      </div>
      
      {/* Chips de atajos */}
      <div className="flex flex-wrap gap-2 mb-6">
        {shortcuts.map((shortcut) => (
          <button
            key={shortcut.id}
            onClick={() => setSelectedShortcut(shortcut.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              selectedShortcut === shortcut.id
                ? 'bg-primary text-white shadow-lg'
                : 'bg-secondary-light text-gray-300 hover:bg-secondary-dark hover:text-white'
            }`}
          >
            <span>{shortcut.icon}</span>
            <span>{shortcut.label}</span>
          </button>
        ))}
      </div>

      {/* Grid de contenido */}
      <ContentGrid
        movies={currentMovies}
        title=""
        size="medium"
        columns={{ xs: 2, sm: 3, md: 4, lg: 5, xl: 6 }}
      />
    </>
  );
};

export default DurationToneShortcuts;