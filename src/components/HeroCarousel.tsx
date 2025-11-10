import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Play, Plus, Check, Star, Info } from 'lucide-react';

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

const sampleItems: HeroItem[] = [
  {
    id: 1,
    title: 'Dune: Parte Dos',
    type: 'Película',
    genre: 'Sci‑Fi',
    isNewThisWeek: true,
    rating: 8.6,
    votes: '12,4k',
    overview: 'Paul Atreides se une a los Fremen mientras busca venganza contra los conspiradores que destruyeron su familia.',
    dateAddedCopy: 'Se añadió el 7 nov',
    platforms: [
      { name: 'Max', mode: 'Incluida' },
      { name: 'Apple TV+', mode: 'Alquiler' },
      { name: 'Rakuten', mode: 'Compra' },
    ],
    backgroundImage:
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Dune%20Part%20Two%20desert%20epic%20sand%20worms%20sci-fi%20cinematic%20poster%20wide%20shot&image_size=landscape_16_9',
    trailerUrl: 'https://www.youtube.com/embed/_YUzQa_3S0o',
  },
  {
    id: 2,
    title: 'The Bear',
    type: 'Serie',
    genre: 'Drama',
    isNewToday: true,
    rating: 8.5,
    votes: '9,1k',
    overview: 'Un chef de alta cocina regresa para liderar la tienda de sándwiches de su familia y lidiar con el caos diario.',
    dateAddedCopy: 'Se añadió hoy',
    platforms: [
      { name: 'Disney+', mode: 'Incluida' },
      { name: 'Apple TV+', mode: 'Compra' },
    ],
    backgroundImage:
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=The%20Bear%20tv%20series%20kitchen%20drama%20cinematic%20lighting%20wide%20shot&image_size=landscape_16_9',
    trailerUrl: 'https://www.youtube.com/embed/Adg1IriE3Ck',
  },
  {
    id: 3,
    title: 'Oppenheimer',
    type: 'Película',
    genre: 'Biografía',
    isNewThisWeek: true,
    rating: 8.4,
    votes: '21,7k',
    overview: 'La historia de J. Robert Oppenheimer y su papel en el desarrollo de la bomba atómica.',
    dateAddedCopy: 'Se añadió el 5 nov',
    platforms: [
      { name: 'Prime Video', mode: 'Incluida' },
      { name: 'Apple TV+', mode: 'Alquiler' },
      { name: 'Rakuten', mode: 'Compra' },
    ],
    backgroundImage:
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Oppenheimer%20movie%20wide%20explosion%20nuclear%20orange%20cinematic%20poster%20dramatic&image_size=landscape_16_9',
    trailerUrl: 'https://www.youtube.com/embed/bK6ldnjE1Lw',
  },
  {
    id: 4,
    title: 'Blue Eye Samurai',
    type: 'Serie',
    genre: 'Animación',
    isNewToday: false,
    isNewThisWeek: true,
    rating: 8.7,
    votes: '4,2k',
    overview: 'Una espadachina mestiza busca venganza en el Japón de la era Edo.',
    dateAddedCopy: 'Se añadió el 8 nov',
    platforms: [
      { name: 'Netflix', mode: 'Incluida' },
      { name: 'Apple TV+', mode: 'Compra' },
    ],
    backgroundImage:
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Blue%20Eye%20Samurai%20anime%20style%20samurai%20blue%20tones%20cinematic%20wide%20poster&image_size=landscape_16_9',
    trailerUrl: 'https://www.youtube.com/embed/lmkSm55yV9o',
  },
  {
    id: 5,
    title: 'La sociedad de la nieve',
    type: 'Película',
    genre: 'Drama',
    isNewThisWeek: true,
    rating: 8.0,
    votes: '6,8k',
    overview: 'Relato del accidente aéreo en los Andes y la supervivencia del equipo uruguayo.',
    dateAddedCopy: 'Se añadió el 6 nov',
    platforms: [
      { name: 'Netflix', mode: 'Incluida' },
      { name: 'Rakuten', mode: 'Compra' },
    ],
    backgroundImage:
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Society%20of%20the%20Snow%20mountain%20survival%20snowy%20cinematic%20wide%20poster&image_size=landscape_16_9',
    trailerUrl: 'https://www.youtube.com/embed/DMbKhGZ1a9k',
  },
  {
    id: 6,
    title: 'Ballerina',
    type: 'Película',
    genre: 'Acción',
    isNewThisWeek: true,
    rating: 7.2,
    votes: '3,1k',
    overview: 'Un intenso thriller de venganza con coreografías de acción y estética neo-noir.',
    dateAddedCopy: 'Se añadió el 9 nov',
    platforms: [
      { name: 'Netflix', mode: 'Incluida' },
      { name: 'Apple TV+', mode: 'Alquiler' },
      { name: 'Rakuten', mode: 'Compra' },
    ],
    backgroundImage:
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Ballerina%20movie%20neon%20noir%20pink%20blue%20wide%20cinematic%20poster&image_size=landscape_16_9',
    trailerUrl: 'https://www.youtube.com/embed/8G1R6tNshQw',
  },
];

const platformColorClass = (name: string) => {
  switch (name) {
    case 'Netflix':
      return 'bg-netflix';
    case 'Prime Video':
      return 'bg-amazon';
    case 'Disney+':
      return 'bg-disney';
    case 'Max':
      return 'bg-hbo';
    case 'Movistar+':
      return 'bg-movistar';
    case 'Filmin':
      return 'bg-filmin';
    case 'Apple TV+':
      return 'bg-appletv';
    case 'Rakuten':
      return 'bg-rakuten';
    default:
      return 'bg-secondary-light';
  }
};

const HeroCarousel: React.FC<{ items?: HeroItem[] }> = ({ items = sampleItems }) => {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [addedIds, setAddedIds] = useState<number[]>([]);
  const [showTrailer, setShowTrailer] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Auto‑avance
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % items.length);
    }, 6000);
    return () => clearInterval(id);
  }, [items.length, paused]);

  // Pausa al abrir trailer
  useEffect(() => {
    if (showTrailer) setPaused(true);
  }, [showTrailer]);

  const goPrev = () => setCurrent((prev) => (prev - 1 + items.length) % items.length);
  const goNext = () => setCurrent((prev) => (prev + 1) % items.length);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].clientX;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
  };
  const onTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchEndX.current - touchStartX.current;
    const threshold = 50; // px
    if (diff > threshold) {
      goPrev();
    } else if (diff < -threshold) {
      goNext();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const currentItem = items[current];

  const toggleAdd = (id: number) => {
    setAddedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <section
      className="relative full-bleed"
      role="region"
      aria-label="Últimas novedades mejor valoradas"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Slide actual como fondo */}
      <div className="relative h-[75vh] min-h-[420px] w-full overflow-hidden">
        <img
          src={currentItem.backgroundImage}
          alt={currentItem.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Degradado para legibilidad (no cubre bajo el header) */}
        <div className="absolute left-0 right-0 bottom-0 top-16 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

        {/* Panel de contenido (izquierda en desktop) */}
        <div className="relative z-10 h-full">
          <div className="container-main h-full flex items-center">
            <div className="max-w-2xl md:max-w-xl lg:max-w-2xl">
              {/* Chips superiores */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-accent text-black">
                  {currentItem.genre}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-secondary-light text-white border border-secondary-dark">
                  {currentItem.type}
                </span>
                {currentItem.isNewToday && (
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-primary text-white">
                    Nuevo hoy
                  </span>
                )}
                {currentItem.isNewThisWeek && !currentItem.isNewToday && (
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-primary-dark text-white">
                    Nuevo esta semana
                  </span>
                )}
              </div>

              {/* Información principal */}
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3">
                {currentItem.title}
              </h2>
              <div className="flex items-center text-sm md:text-base text-gray-200 mb-3 gap-3">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-accent" />
                  <span className="font-medium">{currentItem.rating.toFixed(1)}</span>
                  <span className="text-gray-300">· {currentItem.votes} votos</span>
                </div>
                <span className="text-gray-300">{currentItem.dateAddedCopy}</span>
              </div>
              <p className="text-gray-200 text-base md:text-lg mb-6 line-clamp-3">
                {currentItem.overview}
              </p>

              {/* Plataformas */}
              <div className="mb-6">
                <div className="flex flex-wrap items-center gap-2">
                  {currentItem.platforms.slice(0, 3).map((p) => (
                    <span
                      key={`${currentItem.id}-${p.name}`}
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs md:text-sm font-medium text-white ${platformColorClass(
                        p.name
                      )}`}
                      title={`${p.name} · ${p.mode}`}
                    >
                      <span>{p.name}</span>
                      <span className="opacity-90">{p.mode}</span>
                    </span>
                  ))}
                  {currentItem.platforms.length > 3 && (
                    <span className="px-3 py-1 rounded-full text-xs md:text-sm font-medium bg-secondary-light text-white border border-secondary-dark">
                      +{currentItem.platforms.length - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* Acciones */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-5 shadow-button hover:shadow-button-hover transition-all duration-200"
                  aria-label="Ver detalles"
                >
                  <Info className="w-5 h-5" />
                  Ver detalles
                </button>
                <button
                  onClick={() => toggleAdd(currentItem.id)}
                  className="inline-flex items-center justify-center gap-2 bg-secondary-light hover:bg-secondary-dark text-white font-semibold py-3 px-5 border border-secondary-dark transition-all duration-200"
                  aria-label={addedIds.includes(currentItem.id) ? 'Quitar de lista' : 'Agregar a lista'}
                >
                  {addedIds.includes(currentItem.id) ? (
                    <>
                      <Check className="w-5 h-5 text-accent" /> Añadida
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" /> Agregar a lista
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowTrailer(true)}
                  disabled={!currentItem.trailerUrl}
                  className={`inline-flex items-center justify-center gap-2 py-3 px-5 font-semibold transition-all duration-200 ${
                    currentItem.trailerUrl
                      ? 'bg-secondary-light hover:bg-secondary-dark text-white border border-secondary-dark'
                      : 'bg-secondary-light text-gray-500 border border-secondary-dark cursor-not-allowed'
                  }`}
                  aria-label="Ver tráiler"
                >
                  <Play className="w-5 h-5" /> {currentItem.trailerUrl ? 'Tráiler' : 'Ver teaser'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Controles del carrusel */}
        <div className="absolute inset-y-0 left-0 right-0 z-10 pointer-events-none">
          <div className="h-full flex items-center justify-between">
            {/* Prev */}
            <button
              onClick={goPrev}
              className="pointer-events-auto m-2 md:m-4 p-2 md:p-3 rounded-full bg-black/40 hover:bg-black/60 text-white"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            {/* Next */}
            <button
              onClick={goNext}
              className="pointer-events-auto m-2 md:m-4 p-2 md:p-3 rounded-full bg-black/40 hover:bg-black/60 text-white"
              aria-label="Siguiente"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Indicadores */}
        <div className="absolute bottom-4 left-0 right-0 z-10">
          <div className="container-main">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {items.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrent(idx)}
                    aria-label={`Ir a la slide ${idx + 1}`}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      idx === current ? 'bg-white' : 'bg-white/40'
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-300 text-xs md:text-sm">{current + 1}/{items.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de tráiler */}
      {showTrailer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-3xl mx-4">
            <div className="bg-secondary rounded-xl shadow-modal overflow-hidden">
              <div className="aspect-video bg-black">
                {currentItem.trailerUrl ? (
                  <iframe
                    title={`Tráiler: ${currentItem.title}`}
                    src={currentItem.trailerUrl}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-300">
                    Tráiler no disponible
                  </div>
                )}
              </div>
              <div className="p-4 flex justify-end">
                <button
                  onClick={() => {
                    setShowTrailer(false);
                    setPaused(false);
                  }}
                  className="px-4 py-2 bg-secondary-light hover:bg-secondary-dark rounded-lg text-white"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default HeroCarousel;
