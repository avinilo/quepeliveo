import React from 'react';
import { Play, Plus, Info, ExternalLink } from 'lucide-react';

interface ContentCardProps {
  id: string;
  title: string;
  poster: string;
  type: 'pelicula' | 'serie';
  platform: string;
  genero: string;
  duracion?: string;
  temporadas?: number;
  badge?: 'nuevo-hoy' | 'nuevo-semana' | 'proximamente';
  modalidad?: 'incluida' | 'alquiler' | 'compra';
  fechaLlegada?: string;
  enLista?: boolean;
  onToggleLista: (id: string) => void;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  id,
  title,
  poster,
  type,
  platform,
  genero,
  duracion,
  temporadas,
  badge,
  modalidad,
  fechaLlegada,
  enLista,
  onToggleLista
}) => {
  const getBadgeInfo = () => {
    switch (badge) {
      case 'nuevo-hoy':
        return { text: 'Nuevo hoy', className: 'bg-green-500 text-white' };
      case 'nuevo-semana':
        return { text: 'Nuevo esta semana', className: 'bg-blue-500 text-white' };
      case 'proximamente':
        return { text: `Próx. ${fechaLlegada}`, className: 'bg-purple-500 text-white' };
      default:
        return null;
    }
  };

  const getModalidadInfo = () => {
    switch (modalidad) {
      case 'incluida':
        return { text: 'Incluida', className: 'bg-gray-100 text-gray-800' };
      case 'alquiler':
        return { text: 'Alquiler', className: 'bg-yellow-100 text-yellow-800' };
      case 'compra':
        return { text: 'Compra', className: 'bg-red-100 text-red-800' };
      default:
        return null;
    }
  };

  const getPlatformLogo = (platform: string) => {
    const logos: Record<string, string> = {
      'Netflix': 'https://via.placeholder.com/24x24/e50914/ffffff?text=N',
      'Prime Video': 'https://via.placeholder.com/24x24/00a8e1/ffffff?text=P',
      'Disney+': 'https://via.placeholder.com/24x24/113ccf/ffffff?text=D',
      'Max': 'https://via.placeholder.com/24x24/8b5cf6/ffffff?text=M',
      'Filmin': 'https://via.placeholder.com/24x24/ff6b35/ffffff?text=F',
      'Movistar Plus+': 'https://via.placeholder.com/24x24/0066cc/ffffff?text=M',
      'Apple TV+': 'https://via.placeholder.com/24x24/1d1d1f/ffffff?text=A'
    };
    return logos[platform] || 'https://via.placeholder.com/24x24/666666/ffffff?text=?';
  };

  const badgeInfo = getBadgeInfo();
  const modalidadInfo = getModalidadInfo();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105">
      {/* Imagen del poster */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <img 
          src={poster} 
          alt={title}
          className="w-full h-full object-cover"
        />
        
        {/* Overlay con acciones */}
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
          <div className="flex gap-2">
            <button 
              className="bg-white bg-opacity-90 p-2 rounded-full hover:bg-opacity-100 transition-all"
              aria-label="Ver detalles"
            >
              <Info className="w-5 h-5 text-gray-800" />
            </button>
            <button 
              className="bg-white bg-opacity-90 p-2 rounded-full hover:bg-opacity-100 transition-all"
              aria-label="Ver en plataforma"
            >
              <ExternalLink className="w-5 h-5 text-gray-800" />
            </button>
          </div>
        </div>

        {/* Badges superiores */}
        <div className="absolute top-2 left-2 right-2 flex flex-col gap-1">
          {badgeInfo && (
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${badgeInfo.className}`}>
              {badgeInfo.text}
            </span>
          )}
          {modalidadInfo && (
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${modalidadInfo.className}`}>
              {modalidadInfo.text}
            </span>
          )}
        </div>

        {/* Botón agregar a lista */}
        <button
          onClick={() => onToggleLista(id)}
          className={`absolute bottom-2 right-2 p-2 rounded-full transition-all ${
            enLista 
              ? 'bg-primary text-white' 
              : 'bg-white bg-opacity-90 text-gray-800 hover:bg-opacity-100'
          }`}
          aria-label={enLista ? 'Quitar de mi lista' : 'Agregar a mi lista'}
        >
          <Plus className={`w-4 h-4 ${enLista ? 'rotate-45' : ''} transition-transform`} />
        </button>
      </div>

      {/* Información del contenido */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 flex-1">{title}</h3>
          <span className={`text-xs px-2 py-1 rounded-full ml-2 ${
            type === 'pelicula' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
          }`}>
            {type === 'pelicula' ? 'Película' : 'Serie'}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <img 
            src={getPlatformLogo(platform)} 
            alt={platform}
            className="w-6 h-6 rounded"
          />
          <span className="text-xs text-gray-600">{platform}</span>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>{genero}</span>
          <span>
            {type === 'pelicula' && duracion && `${duracion} min`}
            {type === 'serie' && temporadas && `${temporadas} temp`}
          </span>
        </div>

        {/* CTAs */}
        <div className="mt-3 flex gap-2">
          <button className="flex-1 bg-primary text-white text-xs py-2 px-3 rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-1">
            <Play className="w-3 h-3" />
            Ver en {platform}
          </button>
          <button className="bg-gray-100 text-gray-700 text-xs py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors">
            Detalles
          </button>
        </div>
      </div>
    </div>
  );
};