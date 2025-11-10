import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export type TimeWindow = 'hoy' | 'semana' | 'ultimos-30-dias' | 'proximos-30-dias' | 'cualquiera';
export type ContentType = 'peliculas' | 'series' | 'cualquiera';
export type Modalidad = 'incluida' | 'alquiler' | 'compra' | 'cualquiera';
export type Orden = 'mas-recientes' | 'mejor-valoradas' | 'mas-populares' | 'mas-nuevas' | 'mas-antiguas' | 'duracion';

export interface FilterState {
  timeWindow: TimeWindow;
  platforms: string[];
  contentType: ContentType;
  modalidad: Modalidad;
  orden: Orden;
  generos: string[];
  duracion: string[];
  anio: string;
  clasificacion: string[];
  pais: string;
  idioma: string;
  q: string; // parámetro de búsqueda
  // Modo estricto para novedades (usar firstSeenAt sin fallbacks)
  strictMode?: boolean;
}

const PLATFORMS = [
  'Netflix', 'Prime Video', 'Disney+', 'Max', 'Filmin', 'Movistar Plus+', 'Apple TV+'
];

const GENEROS = [
  'Acción', 'Aventura', 'Animación', 'Comedia', 'Crimen', 'Documental', 'Drama',
  'Familia', 'Fantasía', 'Historia', 'Terror', 'Música', 'Misterio', 'Romance',
  'Ciencia ficción', 'Suspense', 'Guerra', 'Western'
];

const initialFilters: FilterState = {
  timeWindow: 'semana',
  platforms: [],
  contentType: 'cualquiera',
  modalidad: 'cualquiera',
  orden: 'mas-recientes',
  generos: [],
  duracion: [],
  anio: '',
  clasificacion: [],
  pais: '',
  idioma: '',
  q: '',
  strictMode: false
};

export const useExploreFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [showExtendedFilters, setShowExtendedFilters] = useState(false);

  // Cargar filtros desde URL al montar
  useEffect(() => {
    const urlFilters: Partial<FilterState> = {};
    
    // Preset desde URL
    const preset = searchParams.get('preset');
    if (preset) {
      applyPreset(preset);
      return;
    }

    // Cargar filtros individuales
    if (searchParams.get('timeWindow')) {
      urlFilters.timeWindow = searchParams.get('timeWindow') as TimeWindow;
    }
    if (searchParams.get('platforms')) {
      urlFilters.platforms = searchParams.get('platforms')?.split(',') || [];
    }
    if (searchParams.get('contentType')) {
      urlFilters.contentType = searchParams.get('contentType') as ContentType;
    }
    if (searchParams.get('modalidad')) {
      urlFilters.modalidad = searchParams.get('modalidad') as Modalidad;
    }
    if (searchParams.get('orden')) {
      urlFilters.orden = searchParams.get('orden') as Orden;
    }
    if (searchParams.get('generos')) {
      urlFilters.generos = searchParams.get('generos')?.split(',') || [];
    }
    if (searchParams.get('q')) {
      urlFilters.q = searchParams.get('q') || '';
    }

    if (Object.keys(urlFilters).length > 0) {
      setFilters(prev => ({ ...prev, ...urlFilters }));
    }
  }, [searchParams]);

  // Actualizar URL cuando cambian los filtros
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.timeWindow !== initialFilters.timeWindow) {
      params.set('timeWindow', filters.timeWindow);
    }
    if (filters.platforms.length > 0) {
      params.set('platforms', filters.platforms.join(','));
    }
    if (filters.contentType !== initialFilters.contentType) {
      params.set('contentType', filters.contentType);
    }
    if (filters.modalidad !== initialFilters.modalidad) {
      params.set('modalidad', filters.modalidad);
    }
    if (filters.orden !== initialFilters.orden) {
      params.set('orden', filters.orden);
    }
    if (filters.generos.length > 0) {
      params.set('generos', filters.generos.join(','));
    }
    if (filters.q) {
      params.set('q', filters.q);
    }

    setSearchParams(params);
  }, [filters, setSearchParams]);

  const applyPreset = (preset: string) => {
    const presetFilters = { ...initialFilters };
    
    switch (preset) {
      case 'novedades-hoy':
        presetFilters.timeWindow = 'hoy';
        presetFilters.orden = 'mas-recientes';
        presetFilters.strictMode = true;
        break;
      case 'novedades-semana':
        presetFilters.timeWindow = 'semana';
        presetFilters.orden = 'mas-recientes';
        presetFilters.strictMode = true;
        break;
      case 'novedades-30-dias':
        presetFilters.timeWindow = 'ultimos-30-dias';
        presetFilters.orden = 'mas-recientes';
        break;
      case 'proximamente':
        presetFilters.timeWindow = 'proximos-30-dias';
        presetFilters.orden = 'mas-recientes';
        break;
      case 'top-semana':
        presetFilters.timeWindow = 'semana';
        presetFilters.orden = 'mejor-valoradas';
        break;
      case 'catalogo-completo':
        presetFilters.timeWindow = 'cualquiera';
        break;
      default:
        // Preset con plataforma específica
        if (preset.startsWith('plataforma-')) {
          const plataforma = preset.replace('plataforma-', '');
          presetFilters.timeWindow = 'semana';
          presetFilters.platforms = [plataforma];
          presetFilters.orden = 'mas-recientes';
        }
        // Preset con género específico
        else if (preset.startsWith('genero-')) {
          const genero = preset.replace('genero-', '');
          presetFilters.timeWindow = 'semana';
          presetFilters.generos = [genero];
          presetFilters.orden = 'mas-recientes';
        }
        break;
    }
    
    setFilters(presetFilters);
  };

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayFilter = (key: 'platforms' | 'generos' | 'duracion' | 'clasificacion', value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(item => item !== value)
        : [...prev[key], value]
    }));
  };

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  const removeFilter = (type: string, value?: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      switch (type) {
        case 'platform':
          newFilters.platforms = prev.platforms.filter(p => p !== value);
          break;
        case 'genero':
          newFilters.generos = prev.generos.filter(g => g !== value);
          break;
        case 'duracion':
          newFilters.duracion = prev.duracion.filter(d => d !== value);
          break;
        case 'clasificacion':
          newFilters.clasificacion = prev.clasificacion.filter(c => c !== value);
          break;
        case 'contentType':
          newFilters.contentType = 'cualquiera';
          break;
        case 'modalidad':
          newFilters.modalidad = 'cualquiera';
          break;
        case 'anio':
          newFilters.anio = '';
          break;
        case 'pais':
          newFilters.pais = '';
          break;
        case 'idioma':
          newFilters.idioma = '';
          break;
      }
      
      return newFilters;
    });
  };

  // Generar título dinámico
  const getDynamicTitle = () => {
    // Si hay búsqueda, mostrarla primero
    if (filters.q) {
      return `Resultados para "${filters.q}"`;
    }
    
    const parts = [];
    
    if (filters.timeWindow === 'hoy') parts.push('Novedades de hoy');
    else if (filters.timeWindow === 'semana') parts.push('Novedades de la semana');
    else if (filters.timeWindow === 'ultimos-30-dias') parts.push('Novedades últimos 30 días');
    else if (filters.timeWindow === 'proximos-30-dias') parts.push('Próximamente (30 días)');
    else if (filters.orden === 'mejor-valoradas') parts.push('Top novedades de la semana');
    
    if (filters.platforms.length === 1) {
      parts[parts.length - 1] += ` en ${filters.platforms[0]}`;
    }
    
    if (filters.generos.length === 1) {
      parts.push(`Género: ${filters.generos[0]}`);
    }
    
    return parts.length > 0 ? parts.join(' · ') : 'Explorar contenido';
  };

  // Generar subtítulo dinámico
  const getDynamicSubtitle = () => {
    const parts = [];
    
    // Contar resultados (mock)
    parts.push('Mostrando 128 títulos');
    
    // Ventana temporal
    if (filters.timeWindow !== 'cualquiera') {
      const windowLabels = {
        'hoy': 'Hoy',
        'semana': 'Esta semana',
        'ultimos-30-dias': 'Últimos 30 días',
        'proximos-30-dias': 'Próximos 30 días'
      };
      parts.push(windowLabels[filters.timeWindow]);
    }
    
    // Plataformas
    if (filters.platforms.length > 0) {
      parts.push(filters.platforms.join(', '));
    }
    
    // Tipo de contenido
    if (filters.contentType !== 'cualquiera') {
      parts.push(filters.contentType === 'peliculas' ? 'Películas' : 'Series');
    }
    
    return parts.join(' · ');
  };

  return {
    filters,
    showExtendedFilters,
    platforms: PLATFORMS,
    generos: GENEROS,
    updateFilter,
    toggleArrayFilter,
    resetFilters,
    removeFilter,
    setShowExtendedFilters,
    applyPreset,
    getDynamicTitle,
    getDynamicSubtitle
  };
};