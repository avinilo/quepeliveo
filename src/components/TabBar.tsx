import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Sparkles, Clock, TrendingUp, Compass } from 'lucide-react';

const TabBar: React.FC = () => {
  const location = useLocation();

  const tabs = [
    {
      name: 'Inicio',
      path: '/',
      icon: Home,
      label: 'Ir al inicio'
    },
    {
      name: 'Novedades',
      path: '/explore?preset=novedades-30-dias',
      icon: Sparkles,
      label: 'Ver novedades'
    },
    {
      name: 'Próximamente',
      path: '/explore?preset=proximamente',
      icon: Clock,
      label: 'Ver próximos estrenos'
    },
    {
      name: 'Top',
      path: '/explore?preset=top-semana',
      icon: TrendingUp,
      label: 'Ver películas más populares'
    },
    {
      name: 'Explorar',
      path: '/explore',
      icon: Compass,
      label: 'Explorar catálogo completo'
    }
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    // Para rutas con parámetros, verificar si el pathname base coincide
    const basePath = path.split('?')[0];
    return location.pathname === basePath;
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-secondary-dark border-t border-secondary-light z-40">
      <div className="flex items-center justify-around h-12 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);
          
          return (
            <Link
              key={tab.name}
              to={tab.path}
              className={`
                flex flex-col items-center justify-center flex-1 min-w-0 py-1 px-1 rounded transition-all duration-200
                ${active 
                  ? 'text-primary' 
                  : 'text-gray-400 hover:text-gray-200'
                }
              `}
              aria-label={tab.label}
              title={tab.name}
            >
              <Icon className={`w-4 h-4 mb-0.5 ${active ? 'scale-110' : ''}`} />
              <span className="text-[10px] font-medium leading-tight truncate">
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
      
    </nav>
  );
};

export default TabBar;