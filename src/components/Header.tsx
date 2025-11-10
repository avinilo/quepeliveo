import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Film, Search, Heart, Menu, X, MessageCircle, Settings, User } from 'lucide-react';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Refs para rendimiento y cálculo de dirección
  const lastScrollYRef = useRef(0);
  const tickingRef = useRef(false);
  const HIDE_DELTA = 50; // mínima distancia para ocultar al bajar
  const SHOW_DELTA = 30;  // mínima distancia para mostrar al subir

  // Detectar scroll para cambiar estilo del header
  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;

      if (!tickingRef.current) {
        tickingRef.current = true;
        window.requestAnimationFrame(() => {
          const prevY = lastScrollYRef.current;
          const delta = currentY - prevY;
          const absDelta = Math.abs(delta);

          // Fondo: gradiente del Hero arriba, #141414 opaco al scrollear
          setIsScrolled(currentY >= 10);

          // Auto-ocultar: desaparece al bajar, aparece al subir
          if (currentY <= 10) {
            setIsVisible(true); // siempre visible en el top
          } else if (delta > 0 && absDelta > HIDE_DELTA) {
            setIsVisible(false); // ocultar al bajar
          } else if (delta < 0 && absDelta > SHOW_DELTA) {
            setIsVisible(true); // mostrar al subir
          }

          lastScrollYRef.current = currentY;
          tickingRef.current = false;
        });
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    // Estado inicial
    lastScrollYRef.current = window.scrollY;
    setIsScrolled(window.scrollY >= 10);
    setIsVisible(true);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Atajo de teclado para búsqueda
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navigationItems = [
    { name: 'Novedades', path: '/explore?preset=novedades-30-dias' },
    { name: 'Próximamente', path: '/explore?preset=proximamente' },
    { name: 'Top', path: '/explore?preset=top-semana' },
    { name: 'Explorar', path: '/explore' },
    { name: 'Test TMDb', path: '/test-tmdb' }, // Enlace temporal para pruebas
  ];

  const platformItems = [
    { name: 'Netflix', color: 'bg-netflix' },
    { name: 'Prime Video', color: 'bg-amazon' },
    { name: 'Disney+', color: 'bg-disney' },
    { name: 'Max', color: 'bg-hbo' },
    { name: 'Filmin', color: 'bg-filmin' },
    { name: 'Movistar+', color: 'bg-movistar' },
    { name: 'Apple TV+', color: 'bg-appletv' },
    { name: 'Rakuten', color: 'bg-rakuten' },
  ];

  return (
    <>
      {/* Header Principal - Mobile-First */}
      <header 
        className={
          `
          fixed top-0 left-0 right-0 z-50 h-16 transition-transform duration-300 ease-out
          ${isVisible ? 'translate-y-0' : '-translate-y-full'}
          ${isScrolled 
            ? 'bg-[#141414] shadow-lg' // 100% opaco al scrollear
            : 'bg-gradient-to-r from-black/70 via-black/40 to-transparent' // Gradiente del Hero en top
          }
        `
        }
        role="banner"
        style={{ willChange: 'transform' }}
      >
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Siempre visible */}
            <Link 
              to="/" 
              className="flex items-center space-x-2 flex-shrink-0"
              aria-label="Quepeliveo - Inicio"
              tabIndex={0}
            >
              <Film className="w-8 h-8 text-primary" />
              <span className="font-display font-bold text-lg md:text-xl text-white">
                Quepeliveo
              </span>
            </Link>

            {/* Navegación Desktop - Oculta en móvil */}
            <nav className="hidden md:flex items-center space-x-6" role="navigation" aria-label="Navegación principal">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="text-sm font-medium text-gray-300 hover:text-primary transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Acciones Desktop - Ocultas en móvil pequeño */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* Buscador Desktop */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="hidden xl:flex items-center space-x-2 px-3 py-2 bg-secondary-light rounded-lg hover:bg-secondary-dark transition-colors"
                aria-label="Buscar películas y series"
              >
                <Search className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">Buscar...</span>
              </button>

              {/* Iconos de acción */}
              <button 
                className="p-2 text-gray-300 hover:text-primary transition-colors"
                aria-label="Chat IA - Pide recomendaciones"
              >
                <MessageCircle className="w-5 h-5" />
              </button>
              
              <Link 
                to="/lista" 
                className="p-2 text-gray-300 hover:text-primary transition-colors"
                aria-label="Mi lista de películas"
              >
                <Heart className="w-5 h-5" />
              </Link>

              <Link 
                to="/ajustes" 
                className="p-2 text-gray-300 hover:text-primary transition-colors"
                aria-label="Configuración y preferencias"
              >
                <Settings className="w-5 h-5" />
              </Link>

              {/* Perfil */}
              <div className="relative group">
                <button className="flex items-center space-x-2 p-2">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                </button>
                
                {/* Dropdown de perfil */}
                <div className="absolute right-0 top-full mt-2 w-48 bg-secondary-light rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="p-2">
                    <Link to="/perfil" className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-secondary-dark rounded transition-colors">
                      Mi Perfil
                    </Link>
                    <Link to="/ajustes" className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-secondary-dark rounded transition-colors">
                      Ajustes
                    </Link>
                    <hr className="border-secondary-dark my-1" />
                    <button className="block w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-secondary-dark rounded transition-colors">
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones Móvil - Visibles solo en móvil */}
            <div className="flex items-center space-x-2 md:space-x-3">
              {/* Búsqueda móvil */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="md:hidden p-2 text-gray-300 hover:text-primary transition-colors"
                aria-label="Buscar"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Chat IA - Visible en móvil */}
              <button 
                className="md:hidden p-2 text-gray-300 hover:text-primary transition-colors"
                aria-label="Chat IA"
              >
                <MessageCircle className="w-5 h-5" />
              </button>

              {/* Mi lista - Visible en móvil */}
              <Link 
                to="/lista" 
                className="md:hidden p-2 text-gray-300 hover:text-primary transition-colors"
                aria-label="Mi lista"
              >
                <Heart className="w-5 h-5" />
              </Link>

              {/* Menú hamburguesa - Solo en móvil */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-gray-300 hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Menú lateral móvil - Overlay */}
      {isMenuOpen && (
        <div className="md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/75 z-40 transition-opacity duration-300"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Menú lateral */}
          <div className="fixed top-0 right-0 h-full w-80 max-w-[80vw] bg-secondary z-50 transform transition-transform duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <span className="font-display font-bold text-xl text-white">Menú</span>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 text-gray-300 hover:text-white transition-colors"
                  aria-label="Cerrar menú"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Navegación móvil */}
              <nav className="space-y-4 mb-8">
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className="block text-lg font-medium text-gray-300 hover:text-primary transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

              {/* Plataformas */}
              <div className="mb-8">
                <h3 className="font-semibold text-white mb-4">Plataformas</h3>
                <div className="grid grid-cols-2 gap-3">
                  {platformItems.map((platform) => (
                    <button
                      key={platform.name}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-white text-sm ${platform.color} hover:opacity-90 transition-opacity`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span>{platform.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Enlaces adicionales */}
              <div className="space-y-4">
                <Link to="/ayuda" className="block text-gray-300 hover:text-white transition-colors" onClick={() => setIsMenuOpen(false)}>
                  Ayuda / FAQ
                </Link>
                <Link to="/legal" className="block text-gray-300 hover:text-white transition-colors" onClick={() => setIsMenuOpen(false)}>
                  Legal
                </Link>
                <Link to="/cookies" className="block text-gray-300 hover:text-white transition-colors" onClick={() => setIsMenuOpen(false)}>
                  Configurar cookies
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de búsqueda - Mobile-first */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-2xl mx-4">
            <div className="bg-secondary rounded-xl shadow-modal p-6">
              <div className="flex items-center space-x-4 mb-4">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar título, actor, directora..."
                  className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none text-lg"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setIsSearchOpen(false);
                  }}
                />
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  aria-label="Cerrar búsqueda"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-400">
                Presiona <kbd className="px-2 py-1 bg-secondary-light rounded text-xs">Esc</kbd> para cerrar
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;