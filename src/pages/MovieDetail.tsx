import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ContentGrid from '../components/ContentGrid';
import { Play, Plus, Share, Star, Calendar, Clock, Globe, ChevronLeft, ChevronRight, Heart } from 'lucide-react';

interface Movie {
  id: number;
  title: string;
  year: number;
  rating: number;
  genre: string;
  platform: string;
  poster: string;
  description: string;
}

interface Platform {
  name: string;
  logo: string;
  availableFrom: string;
  modality: 'included' | 'rental' | 'purchase';
  price?: string;
}

interface CastMember {
  id: number;
  name: string;
  character: string;
  image: string;
}

const MovieDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'included' | 'rental' | 'purchase'>('included');
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [isInList, setIsInList] = useState(false);

  // Datos de ejemplo - se conectarán a la API real después
  const movieData = {
    title: 'El Origen',
    year: 2010,
    rating: 8.8,
    votes: 2500000,
    duration: '148 min',
    genres: ['Ciencia Ficción', 'Acción', 'Thriller'],
    director: 'Christopher Nolan',
    synopsis: 'Dom Cobb es un ladrón especializado en el arte de la extracción: robar secretos del subconsciente durante el estado de sueño. Su habilidad lo ha convertido en un jugador clave en el traicionoso mundo del espionaje corporativo, pero también lo ha convertido en un fugitivo internacional y ha costado todo lo que alguna vez amó. Ahora Cobb tiene la oportunidad de redimirse con un trabajo final: en lugar de robar una idea, debe implantar una en la mente de un objetivo.',
    languages: ['Español', 'Inglés', 'Francés'],
    subtitles: ['Español', 'Inglés', 'Francés', 'Alemán'],
    ageRating: '+13',
    country: 'Estados Unidos',
    backdrop: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Inception%20movie%20backdrop%20with%20city%20folding%20dream%20sequence%2C%20epic%20scale%2C%20dramatic%20lighting%2C%20cinematic%20quality&image_size=landscape_16_9'
  };

  const platforms: Platform[] = [
    { name: 'Netflix', logo: 'N', availableFrom: '2024-01-15', modality: 'included' },
    { name: 'Prime Video', logo: 'P', availableFrom: '2024-02-01', modality: 'rental', price: '3,99€' },
    { name: 'Apple TV+', logo: 'A', availableFrom: '2024-01-20', modality: 'purchase', price: '9,99€' }
  ];

  const cast: CastMember[] = [
    { id: 1, name: 'Leonardo DiCaprio', character: 'Dom Cobb', image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Leonardo%20DiCaprio%20portrait%2C%20professional%20headshot%2C%20cinematic%20lighting' },
    { id: 2, name: 'Marion Cotillard', character: 'Mal Cobb', image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Marion%20Cotillard%20portrait%2C%20professional%20headshot%2C%20cinematic%20lighting' },
    { id: 3, name: 'Tom Hardy', character: 'Eames', image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Tom%20Hardy%20portrait%2C%20professional%20headshot%2C%20cinematic%20lighting' },
    { id: 4, name: 'Ellen Page', character: 'Ariadne', image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Elliot%20Page%20portrait%2C%20professional%20headshot%2C%20cinematic%20lighting' },
    { id: 5, name: 'Joseph Gordon-Levitt', character: 'Arthur', image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Joseph%20Gordon-Levitt%20portrait%2C%20professional%20headshot%2C%20cinematic%20lighting' },
    { id: 6, name: 'Michael Caine', character: 'Professor Miles', image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Michael%20Caine%20portrait%2C%20professional%20headshot%2C%20cinematic%20lighting' }
  ];

  const mockMovies: Movie[] = [
    {
      id: 2,
      title: 'Interestelar',
      year: 2014,
      rating: 8.6,
      genre: 'Ciencia Ficción',
      platform: 'Netflix',
      poster: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Interstellar%20movie%20poster%20with%20spacecraft%20and%20black%20hole%2C%20epic%20space%20scene%2C%20scientific%20accuracy%2C%20dramatic%20lighting&image_size=portrait_4_3',
      description: 'Un viaje espacial para salvar a la humanidad.'
    },
    {
      id: 3,
      title: 'Matrix',
      year: 1999,
      rating: 8.7,
      genre: 'Ciencia Ficción',
      platform: 'Prime Video',
      poster: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Matrix%20movie%20poster%20with%20Neo%20and%20digital%20rain%2C%20cyberpunk%20style%2C%20green%20tint%2C%20iconic%20imagery&image_size=portrait_4_3',
      description: 'Un hacker descubre la verdadera naturaleza de la realidad.'
    },
    {
      id: 4,
      title: 'Blade Runner 2049',
      year: 2017,
      rating: 8.0,
      genre: 'Ciencia Ficción',
      platform: 'Apple TV+',
      poster: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Blade%20Runner%202049%20movie%20poster%20with%20futuristic%20city%20and%20android%2C%20neon%20lights%2C%20cyberpunk%20aesthetic&image_size=portrait_4_3',
      description: 'Un blade runner descubre un secreto que puede cambiar todo.'
    }
  ];

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: movieData.title,
        text: `Mira ${movieData.title} en QuePeliVeo`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Enlace copiado al portapapeles');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground header-offset" id="main-content">
      <Header />
      
      {/* Hero Section con backdrop */}
      <div className="relative h-[60vh] md:h-[70vh] overflow-hidden">
        <img 
          src={movieData.backdrop} 
          alt={movieData.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent"></div>
        
        <div className="relative z-10 container-main h-full flex items-end pb-8">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 w-full">
            {/* Póster */}
            <div className="flex-shrink-0">
              <img 
                src="https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Inception%20movie%20poster%20with%20spinning%20top%20and%20city%20folding%20dream%20sequence%2C%20dark%20mysterious%20atmosphere%2C%20high%20quality%20cinema%20poster&image_size=portrait_4_3"
                alt={movieData.title}
                className="w-32 md:w-48 lg:w-64 rounded-lg shadow-2xl"
              />
            </div>
            
            {/* Información */}
            <div className="flex-1 text-white pb-4">
              {/* Breadcrumb */}
              <div className="flex items-center space-x-2 text-sm text-gray-300 mb-4">
                <Link to="/" className="hover:text-primary transition-colors">Inicio</Link>
                <ChevronRight className="w-4 h-4" />
                <Link to="/explore" className="hover:text-primary transition-colors">Explorar</Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-primary">Ciencia Ficción</span>
                <ChevronRight className="w-4 h-4" />
                <span>{movieData.title}</span>
              </div>
              
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">Nuevo hoy</span>
                <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">Incluida</span>
                <span className="bg-accent text-white px-3 py-1 rounded-full text-sm font-medium">4K</span>
                <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">{movieData.ageRating}</span>
              </div>
              
              {/* Título y metadatos */}
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-2">
                {movieData.title} <span className="text-gray-400">({movieData.year})</span>
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 mb-6">
                <span>Película</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {movieData.duration}
                </span>
                <span>·</span>
                <span>{movieData.genres.join(', ')}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-accent" />
                  {movieData.rating} ({movieData.votes.toLocaleString()} votos)
                </span>
              </div>
              
              {/* Plataformas disponibles */}
              <div className="mb-6">
                <p className="text-sm text-gray-300 mb-3">Disponible en España:</p>
                <div className="flex flex-wrap gap-3">
                  {platforms.slice(0, 3).map((platform) => (
                    <div key={platform.name} className="flex items-center space-x-2 bg-secondary-light rounded-lg px-3 py-2">
                      <div className="w-6 h-6 bg-primary rounded flex items-center justify-center text-white font-bold text-xs">
                        {platform.logo}
                      </div>
                      <span className="text-white text-sm">{platform.name}</span>
                    </div>
                  ))}
                  {platforms.length > 3 && (
                    <div className="bg-secondary-light rounded-lg px-3 py-2">
                      <span className="text-white text-sm">+{platforms.length - 3}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* CTAs */}
              <div className="flex flex-wrap gap-3">
                <button className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors">
                  <Play className="w-5 h-5" />
                  <span>Ver en Netflix</span>
                </button>
                <button 
                  onClick={() => setIsTrailerOpen(true)}
                  className="bg-secondary-light hover:bg-secondary-dark text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors"
                >
                  <Play className="w-5 h-5" />
                  <span>Tráiler</span>
                </button>
                <button 
                  onClick={() => setIsInList(!isInList)}
                  className="bg-secondary-light hover:bg-secondary-dark text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span>{isInList ? 'En mi lista' : 'Añadir a lista'}</span>
                </button>
                <button 
                  onClick={handleShare}
                  className="bg-secondary-light hover:bg-secondary-dark text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors"
                >
                  <Share className="w-5 h-5" />
                  <span>Compartir</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Contenido principal */}
      <main className="container-main py-8 md:py-12 space-y-12 md:space-y-16">
        
        {/* Dónde ver */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Dónde ver en España</h2>
          <div className="bg-secondary-light rounded-lg p-6">
            {/* Tabs */}
            <div className="flex space-x-1 mb-6 bg-secondary-dark rounded-lg p-1">
              <button
                onClick={() => setActiveTab('included')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'included' 
                    ? 'bg-primary text-white' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Incluida
              </button>
              <button
                onClick={() => setActiveTab('rental')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'rental' 
                    ? 'bg-primary text-white' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Alquiler
              </button>
              <button
                onClick={() => setActiveTab('purchase')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'purchase' 
                    ? 'bg-primary text-white' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Compra
              </button>
            </div>
            
            {/* Plataformas por modalidad */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {platforms
                .filter(platform => platform.modality === activeTab)
                .map((platform) => (
                  <div key={platform.name} className="bg-secondary-dark rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
                        {platform.logo}
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{platform.name}</h3>
                        <p className="text-gray-400 text-sm">Desde {platform.availableFrom}</p>
                      </div>
                    </div>
                    {platform.price && (
                      <span className="text-primary font-bold">{platform.price}</span>
                    )}
                  </div>
                ))
              }
              {platforms.filter(platform => platform.modality === activeTab).length === 0 && (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-400">No hay disponibilidad actual en esta modalidad.</p>
                </div>
              )}
            </div>
          </div>
        </section>
        
        {/* Sinopsis */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Sinopsis y por qué te puede interesar</h2>
          <div className="bg-secondary-light rounded-lg p-6">
            <p className="text-gray-300 leading-relaxed mb-6">{movieData.synopsis}</p>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Te puede gustar si...</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start space-x-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Te gustan las películas de ciencia ficción con conceptos mentales complejos</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Disfrutas de thrillers con giros argumentales inesperados</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Te interesa explorar la naturaleza de la realidad y los sueños</span>
                </li>
              </ul>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <span className="bg-secondary-dark text-gray-300 px-3 py-1 rounded-full text-sm">Mente</span>
              <span className="bg-secondary-dark text-gray-300 px-3 py-1 rounded-full text-sm">Sueños</span>
              <span className="bg-secondary-dark text-gray-300 px-3 py-1 rounded-full text-sm">Realidad</span>
              <span className="bg-secondary-dark text-gray-300 px-3 py-1 rounded-full text-sm">Thriller</span>
            </div>
          </div>
        </section>
        
        {/* Idiomas y subtítulos */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Idiomas y subtítulos</h2>
          <div className="bg-secondary-light rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                  <Globe className="w-5 h-5" />
                  <span>Audios disponibles</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {movieData.languages.map((lang) => (
                    <span key={lang} className="bg-secondary-dark text-gray-300 px-3 py-1 rounded-full text-sm">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Subtítulos disponibles</h3>
                <div className="flex flex-wrap gap-2">
                  {movieData.subtitles.map((sub) => (
                    <span key={sub} className="bg-secondary-dark text-gray-300 px-3 py-1 rounded-full text-sm">
                      {sub}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-gray-500 text-sm mt-4">Los idiomas y subtítulos pueden variar según la plataforma.</p>
          </div>
        </section>
        
        {/* Reparto */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Reparto y equipo</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Reparto principal</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {cast.map((member) => (
                  <div key={member.id} className="text-center">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-full aspect-square object-cover rounded-lg mb-3"
                    />
                    <h4 className="text-white font-medium text-sm">{member.name}</h4>
                    <p className="text-gray-400 text-xs">{member.character}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Dirección</h3>
              <div className="bg-secondary-light rounded-lg p-4">
                <p className="text-white font-medium">{movieData.director}</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Tráiler */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Tráiler y vídeos</h2>
          <div className="bg-secondary-light rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div 
                className="bg-secondary-dark rounded-lg aspect-video flex items-center justify-center cursor-pointer hover:bg-secondary-dark/80 transition-colors"
                onClick={() => setIsTrailerOpen(true)}
              >
                <div className="text-center">
                  <Play className="w-12 h-12 text-primary mx-auto mb-2" />
                  <p className="text-white font-medium">Tráiler oficial</p>
                </div>
              </div>
              <div className="bg-secondary-dark rounded-lg aspect-video flex items-center justify-center cursor-pointer hover:bg-secondary-dark/80 transition-colors">
                <div className="text-center">
                  <Play className="w-12 h-12 text-primary mx-auto mb-2" />
                  <p className="text-white font-medium">Teaser</p>
                </div>
              </div>
              <div className="bg-secondary-dark rounded-lg aspect-video flex items-center justify-center cursor-pointer hover:bg-secondary-dark/80 transition-colors">
                <div className="text-center">
                  <Play className="w-12 h-12 text-primary mx-auto mb-2" />
                  <p className="text-white font-medium">Clip exclusivo</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Recomendadas */}
        <section>
          <ContentGrid 
            movies={mockMovies} 
            title="Recomendadas (disponibles ahora en España)"
            size="medium"
            columns={{ xs: 2, sm: 3, md: 4, lg: 5, xl: 6 }}
          />
        </section>
        
        {/* Ficha técnica */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Ficha técnica</h2>
          <div className="bg-secondary-light rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-gray-400 text-sm mb-1">Géneros</h4>
                  <p className="text-white">{movieData.genres.join(', ')}</p>
                </div>
                <div>
                  <h4 className="text-gray-400 text-sm mb-1">Año de estreno</h4>
                  <p className="text-white">{movieData.year}</p>
                </div>
                <div>
                  <h4 className="text-gray-400 text-sm mb-1">País de producción</h4>
                  <p className="text-white">{movieData.country}</p>
                </div>
                <div>
                  <h4 className="text-gray-400 text-sm mb-1">Duración</h4>
                  <p className="text-white">{movieData.duration}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-gray-400 text-sm mb-1">Director</h4>
                  <p className="text-white">{movieData.director}</p>
                </div>
                <div>
                  <h4 className="text-gray-400 text-sm mb-1">Valoración media</h4>
                  <p className="text-white flex items-center space-x-2">
                    <Star className="w-4 h-4 text-accent" />
                    <span>{movieData.rating} ({movieData.votes.toLocaleString()} votos)</span>
                  </p>
                </div>
                <div>
                  <h4 className="text-gray-400 text-sm mb-1">Clasificación por edades</h4>
                  <p className="text-white">{movieData.ageRating}</p>
                </div>
                <div>
                  <h4 className="text-gray-400 text-sm mb-1">Disponible desde</h4>
                  <p className="text-white">15 de enero de 2024</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <Footer />
      
      {/* Modal de tráiler */}
      {isTrailerOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-secondary-light rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Tráiler de {movieData.title}</h3>
                <button 
                  onClick={() => setIsTrailerOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="aspect-video bg-secondary-dark rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Play className="w-16 h-16 text-primary mx-auto mb-4" />
                  <p className="text-white">Reproductor de tráiler</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetail;