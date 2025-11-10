import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ContentGridReal from '../components/ContentGridReal';
import { Play, Plus, Share, Star, Calendar, Clock, Globe, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { tmdbService, ContentItem, TmdbProvider } from '../services/tmdb';
import { useContent } from '../hooks/useContent';

interface CastMember {
  id: number;
  name: string;
  character: string;
  image: string;
}

const MovieDetailReal: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'included' | 'rental' | 'purchase'>('included');
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [isInList, setIsInList] = useState(false);
  const [movie, setMovie] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [cast, setCast] = useState<CastMember[]>([]);

  // No cargamos contenido relacionado aquí; lo pedimos más abajo con ContentGridReal

  useEffect(() => {
    const loadMovieDetails = async () => {
      if (!id) return;

      setLoading(true);
      setError('');

      try {
        // ID puede venir como "movie_123" o "tv_456"
        let type: 'movie' | 'tv' = 'movie';
        let tmdbId: number | null = null;

        if (id.includes('_')) {
          const [prefix, num] = id.split('_');
          if (prefix === 'tv' || prefix === 'movie') {
            type = prefix as 'movie' | 'tv';
          }
          tmdbId = parseInt(num, 10);
        } else {
          // Fallback: si el id es solo número, asumir película
          tmdbId = parseInt(id, 10);
        }

        if (!tmdbId || Number.isNaN(tmdbId)) {
          throw new Error('ID de contenido inválido');
        }

        // Cargar detalles según el tipo
        const details = type === 'movie'
          ? await tmdbService.getMovieDetails(tmdbId)
          : await tmdbService.getTVDetails(tmdbId);

        const processed = tmdbService.processContentProviders(details, type);
        if (processed) {
          setMovie(processed);
          // Cargar elenco desde detalles
          try {
            const credits = details.credits;
            const castData = (credits?.cast || []).slice(0, 6).map((member: any) => ({
              id: member.id,
              name: member.name,
              character: member.character,
              image: member.profile_path
                ? tmdbService.getImageUrl(member.profile_path, 'w185')
                : 'https://via.placeholder.com/185x278?text=No+Image'
            }));
            setCast(castData);
          } catch (castError) {
            console.error('Error loading cast:', castError);
            setCast([]);
          }
        }
      } catch (err) {
        console.error('Error loading movie details:', err);
        setError('No se pudieron cargar los detalles de la película/serie');
      } finally {
        setLoading(false);
      }
    };

    loadMovieDetails();
  }, [id]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: movie?.title || '',
        text: `Mira ${movie?.title} en QuePeliVeo`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Enlace copiado al portapapeles');
    }
  };

  const getReleaseYear = () => {
    if (!movie) return '';
    const date = movie.releaseDate;
    return date ? new Date(date).getFullYear() : '';
  };

  const getDuration = () => {
    if (!movie?.runtime) return '';
    const hours = Math.floor(movie.runtime / 60);
    const minutes = movie.runtime % 60;
    return `${hours}h ${minutes}min`;
  };

  const getGenres = () => {
    // ContentItem.genres es number[]; no tenemos nombres aquí
    return '';
  };

  const getProvidersByModality = () => {
    if (!movie?.providers) return { included: [] as TmdbProvider[], rental: [] as TmdbProvider[], purchase: [] as TmdbProvider[] };
    const included = movie.providers.flatrate || [];
    const rental = movie.providers.rent || [];
    const purchase = movie.providers.buy || [];
    return { included, rental, purchase };
  };

  const hasAnyProviders = () => {
    if (!movie?.providers) return false;
    const all = [
      ...(movie.providers.flatrate || []),
      ...(movie.providers.rent || []),
      ...(movie.providers.buy || [])
    ];
    return all.length > 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground header-offset">
        <Header />
        <div className="container-main py-8">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-700 rounded-lg mb-8"></div>
            <div className="h-8 bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-1/3"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-background text-foreground header-offset">
        <Header />
        <div className="container-main py-8 text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Error</h1>
          <p className="text-gray-300 mb-4">{error || 'No se encontró la película/serie'}</p>
          <Link to="/" className="text-primary hover:text-primary-dark">
            Volver al inicio
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const providers = getProvidersByModality();
  const currentProviders = providers[activeTab];

  return (
    <div className="min-h-screen bg-background text-foreground header-offset" id="main-content">
      <Header />
      
      {/* Hero Section con backdrop */}
      <div className="relative h-[60vh] md:h-[70vh] overflow-hidden">
        {movie.backdropPath ? (
          <img 
            src={tmdbService.getImageUrl(movie.backdropPath, 'original')}
            alt={movie.title || ''}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent"></div>
        
        <div className="relative z-10 container-main h-full flex items-end pb-8">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 w-full">
            {/* Póster */}
            <div className="flex-shrink-0">
              <img 
                src={movie.posterPath 
                  ? tmdbService.getImageUrl(movie.posterPath, 'w500')
                  : 'https://via.placeholder.com/500x750?text=No+Image'
                }
                alt={movie.title || ''}
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
                <span className="text-primary">{getGenres().split(', ')[0] || 'Sin categoría'}</span>
                <ChevronRight className="w-4 h-4" />
                <span>{movie.title}</span>
              </div>
              
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {hasAnyProviders() && (
                  <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Disponible en streaming
                  </span>
                )}
                <span className="bg-accent text-white px-3 py-1 rounded-full text-sm font-medium">
                  {movie.voteAverage >= 8 ? 'Excelente' : movie.voteAverage >= 7 ? 'Muy buena' : 'Buena'}
                </span>
                {movie.runtime && (
                  <span className="bg-secondary-light text-white px-3 py-1 rounded-full text-sm font-medium">
                    {getDuration()}
                  </span>
                )}
              </div>
              
              {/* Título y metadatos */}
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-2">
                {movie.title} <span className="text-gray-400">({getReleaseYear()})</span>
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 mb-6">
                <span>{movie.type === 'movie' ? 'Película' : 'Serie'}</span>
                {movie.runtime && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {getDuration()}
                    </span>
                  </>
                )}
                <span>·</span>
                <span>{getGenres()}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-accent" />
                  {movie.voteAverage.toFixed(1)} ({movie.voteCount.toLocaleString()} votos)
                </span>
              </div>
              
              {/* Plataformas disponibles */}
              {hasAnyProviders() && (
                <div className="mb-6">
                  <p className="text-sm text-gray-300 mb-3">Disponible en España:</p>
                  <div className="flex flex-wrap gap-3">
                    {[
                      ...(movie.providers.flatrate || []),
                      ...(movie.providers.rent || []),
                      ...(movie.providers.buy || [])
                    ].slice(0, 3).map((platform) => (
                      <div key={platform.provider_id} className="flex items-center space-x-2 bg-secondary-light rounded-lg px-3 py-2">
                        <div className="w-6 h-6 bg-primary rounded flex items-center justify-center text-white font-bold text-xs">
                          {platform.provider_name.charAt(0)}
                        </div>
                        <span className="text-white text-sm">{platform.provider_name}</span>
                      </div>
                    ))}
                    {([
                      ...(movie.providers.flatrate || []),
                      ...(movie.providers.rent || []),
                      ...(movie.providers.buy || [])
                    ].length > 3) && (
                      <div className="bg-secondary-light rounded-lg px-3 py-2">
                        <span className="text-white text-sm">+{([
                          ...(movie.providers.flatrate || []),
                          ...(movie.providers.rent || []),
                          ...(movie.providers.buy || [])
                        ].length - 3)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Sinopsis */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Sinopsis</h3>
                <p className="text-gray-300 leading-relaxed">
                  {movie.overview || 'Sin descripción disponible.'}
                </p>
              </div>
              
              {/* Botones de acción */}
              <div className="flex flex-wrap gap-4">
                <button className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Ver tráiler
                </button>
                <button 
                  onClick={() => setIsInList(!isInList)}
                  className={`${isInList ? 'bg-accent hover:bg-accent-dark' : 'bg-secondary-light hover:bg-secondary-dark'} text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2`}
                >
                  <Plus className="w-5 h-5" />
                  {isInList ? 'En mi lista' : 'Agregar a lista'}
                </button>
                <button 
                  onClick={handleShare}
                  className="bg-secondary-light hover:bg-secondary-dark text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                >
                  <Share className="w-5 h-5" />
                  Compartir
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="container-main py-8">
        {/* Tabs de plataformas */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-secondary p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('included')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                activeTab === 'included' ? 'bg-primary text-white' : 'text-gray-300 hover:text-white'
              }`}
            >
              Incluida
            </button>
            <button
              onClick={() => setActiveTab('rental')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                activeTab === 'rental' ? 'bg-primary text-white' : 'text-gray-300 hover:text-white'
              }`}
            >
              Alquiler
            </button>
            <button
              onClick={() => setActiveTab('purchase')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                activeTab === 'purchase' ? 'bg-primary text-white' : 'text-gray-300 hover:text-white'
              }`}
            >
              Compra
            </button>
          </div>
          
          {/* Lista de plataformas según tab activo */}
          <div className="mt-4">
            {currentProviders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentProviders.map((platform) => (
                  <div key={platform.provider_id} className="bg-secondary-light rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
                        {platform.provider_name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{platform.provider_name}</h4>
                        <p className="text-sm text-gray-400">
                          {activeTab === 'included' ? 'Incluida en suscripción' : 
                           activeTab === 'rental' ? 'Disponible para alquilar' : 'Disponible para comprar'}
                        </p>
                      </div>
                    </div>
                    <button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      Ver ahora
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                No disponible en {activeTab === 'included' ? 'plataformas de suscripción' : 
                                activeTab === 'rental' ? 'alquiler' : 'compra'} en España
              </div>
            )}
          </div>
        </div>

        {/* Información técnica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-secondary-light rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Detalles técnicos</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Director:</span>
                <span className="text-white">No especificado</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">País:</span>
                <span className="text-white">No disponible</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Idiomas:</span>
                <span className="text-white">No disponible</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Presupuesto:</span>
                <span className="text-white">No disponible</span>
              </div>
            </div>
          </div>
          
          <div className="bg-secondary-light rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Recepción</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Rating:</span>
                <span className="text-white flex items-center gap-1">
                  <Star className="w-4 h-4 text-accent" />
                  {movie.voteAverage.toFixed(1)}/10
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Votos:</span>
                <span className="text-white">{movie.voteCount.toLocaleString()}</span>
              </div>
              {/* Popularidad y recaudación no están en ContentItem */}
            </div>
          </div>
        </div>

        {/* Elenco */}
        {cast.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Elenco principal</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {cast.map((member) => (
                <div key={member.id} className="text-center">
                  <img 
                    src={member.image}
                    alt={member.name}
                    className="w-full aspect-[3/4] object-cover rounded-lg mb-2"
                  />
                  <h4 className="font-medium text-white text-sm">{member.name}</h4>
                  <p className="text-gray-400 text-xs">{member.character}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contenido relacionado: por género principal */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Contenido relacionado</h3>
          <ContentGridReal 
            size="small"
            columns={{ xs: 2, sm: 3, md: 4, lg: 6 }}
            showLoading={false}
            genreId={movie.genres?.[0]}
            sortBy="popularity"
            limit={6}
          />
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default MovieDetailReal;