import React, { useState, useRef, useEffect } from 'react';

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

/**
 * Componente de acordeón mejorado para el footer móvil
 * Con animaciones suaves y accesibilidad mejorada
 */
export const FooterAccordion: React.FC<AccordionProps> = ({ 
  title, 
  children, 
  isOpen, 
  onToggle 
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState('0px');

  useEffect(() => {
    if (contentRef.current) {
      setMaxHeight(isOpen ? `${contentRef.current.scrollHeight}px` : '0px');
    }
  }, [isOpen]);

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 px-4 text-left hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset"
        aria-expanded={isOpen}
        aria-controls={`accordion-content-${title.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <div className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      
      <div 
        ref={contentRef}
        id={`accordion-content-${title.toLowerCase().replace(/\s+/g, '-')}`}
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight }}
      >
        <div className="px-4 pb-4">
          {children}
        </div>
      </div>
    </div>
  );
};

/**
 * Hook para manejar múltiples acordeones
 */
export const useAccordionManager = (initialOpen?: string | string[]) => {
  const [openSections, setOpenSections] = useState<string[]>(
    Array.isArray(initialOpen) ? initialOpen : initialOpen ? [initialOpen] : []
  );

  const toggleSection = (sectionTitle: string) => {
    setOpenSections(prev => 
      prev.includes(sectionTitle) 
        ? prev.filter(title => title !== sectionTitle)
        : [...prev, sectionTitle]
    );
  };

  const openSection = (sectionTitle: string) => {
    setOpenSections(prev => 
      prev.includes(sectionTitle) ? prev : [...prev, sectionTitle]
    );
  };

  const closeSection = (sectionTitle: string) => {
    setOpenSections(prev => prev.filter(title => title !== sectionTitle));
  };

  const isOpen = (sectionTitle: string) => openSections.includes(sectionTitle);

  return {
    openSections,
    toggleSection,
    openSection,
    closeSection,
    isOpen
  };
};

export default {
  FooterAccordion,
  useAccordionManager
};