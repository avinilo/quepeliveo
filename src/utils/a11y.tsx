import React from 'react';

interface SkipToContentProps {
  targetId?: string;
  label?: string;
}

/**
 * Componente SkipToContent para accesibilidad
 * Permite a usuarios de teclado saltar al contenido principal
 */
export const SkipToContent: React.FC<SkipToContentProps> = ({ 
  targetId = 'main-content', 
  label = 'Saltar al contenido principal' 
}) => {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-white px-4 py-2 rounded-lg shadow-lg z-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-secondary"
    >
      {label}
    </a>
  );
};

interface ScreenReaderOnlyProps {
  children: React.ReactNode;
}

/**
 * Componente para texto solo para lectores de pantalla
 */
export const ScreenReaderOnly: React.FC<ScreenReaderOnlyProps> = ({ children }) => {
  return (
    <span className="sr-only">
      {children}
    </span>
  );
};

interface FocusTrapProps {
  children: React.ReactNode;
  isActive?: boolean;
}

/**
 * Hook para manejar el focus en modales y menús
 */
export const useFocusTrap = (isActive: boolean = true) => {
  React.useEffect(() => {
    if (!isActive) return;

    const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const element = document.activeElement as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        const focusable = Array.from(document.querySelectorAll(focusableElements)) as HTMLElement[];
        const firstFocusable = focusable[0];
        const lastFocusable = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            lastFocusable.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            firstFocusable.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive]);
};

interface A11yAnnouncerProps {
  message: string;
  priority?: 'polite' | 'assertive';
}

/**
 * Componente para anunciar cambios a lectores de pantalla
 */
export const A11yAnnouncer: React.FC<A11yAnnouncerProps> = ({ 
  message, 
  priority = 'polite' 
}) => {
  return (
    <div 
      className="sr-only" 
      role="status" 
      aria-live={priority}
      aria-atomic="true"
    >
      {message}
    </div>
  );
};

/**
 * Utilidades de contraste y accesibilidad
 */
export const a11yUtils = {
  // Verificar contraste WCAG AA (4.5:1 para texto normal, 3:1 para texto grande)
  checkContrast: (foreground: string, background: string): boolean => {
    // Implementación simplificada - en producción usar una librería como 'color-contrast'
    return true; // Placeholder
  },

  // Generar texto alternativo para imágenes
  generateAltText: (title: string, type: 'movie' | 'poster' | 'actor'): string => {
    switch (type) {
      case 'movie':
        return `Póster de la película ${title}`;
      case 'poster':
        return `Imagen promocional de ${title}`;
      case 'actor':
        return `Foto de ${title}`;
      default:
        return `Imagen de ${title}`;
    }
  },

  // Verificar si el color es lo suficientemente oscuro para texto blanco
  needsDarkText: (backgroundColor: string): boolean => {
    // Implementación simplificada
    return false; // Placeholder
  }
};

export default {
  SkipToContent,
  ScreenReaderOnly,
  useFocusTrap,
  A11yAnnouncer,
  a11yUtils
};