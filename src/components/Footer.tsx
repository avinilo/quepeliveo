import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Instagram, Youtube, Music, Film } from 'lucide-react';
import { FooterAccordion, useAccordionManager } from './FooterAccordion';

interface FooterSection {
  title: string;
  links: Array<{
    label: string;
    href: string;
    highlighted?: boolean;
  }>;
}



interface DesktopSectionProps {
  title: string;
  links: Array<{
    label: string;
    href: string;
    highlighted?: boolean;
  }>;
}

const DesktopSection: React.FC<DesktopSectionProps> = ({ title, links }) => {
  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
      <ul className="space-y-2">
        {links.map((link, index) => (
          <li key={index}>
            <Link
              to={link.href}
              className={`block py-1 text-sm transition-colors focus:outline-none focus:ring-1 focus:ring-primary focus:ring-offset-1 focus:ring-offset-background rounded ${
                link.highlighted 
                  ? 'text-primary hover:text-primary/80 font-medium' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

const Footer: React.FC = () => {
  const { openSections, toggleSection } = useAccordionManager(['descubrir']);

  // Secciones simplificadas: solo Descubrir, Ayuda y Legal
  const footerSections: FooterSection[] = [
    {
      title: 'Descubrir',
      links: [
        { label: 'Novedades de hoy', href: '/explore?preset=novedades-hoy', highlighted: true },
        { label: 'Novedades de esta semana', href: '/explore?preset=novedades-semana' },
        { label: 'Novedades últimos 30 días', href: '/explore?preset=novedades-30-dias' },
        { label: 'Próximamente', href: '/explore?preset=proximamente', highlighted: true },
        { label: 'Top novedades', href: '/explore?preset=top-semana', highlighted: true }
      ]
    },
    {
      title: 'Ayuda',
      links: [
        { label: 'Cómo funciona', href: '/como-funciona', highlighted: true },
        { label: 'Preguntas frecuentes', href: '/faq' },
        { label: 'Contacto', href: '/contacto', highlighted: true },
        { label: 'Accesibilidad', href: '/accesibilidad' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { label: 'Términos y condiciones', href: '/terminos' },
        { label: 'Privacidad', href: '/privacidad' },
        { label: 'Cookies', href: '/cookies' },
        { label: 'Configurar cookies', href: '/configurar-cookies', highlighted: true }
      ]
    }
  ];

  const socialLinks = [
    { icon: Twitter, href: 'https://twitter.com/Quepeliveo', label: 'Twitter' },
    { icon: Instagram, href: 'https://instagram.com/Quepeliveo', label: 'Instagram' },
    { icon: Youtube, href: 'https://youtube.com/Quepeliveo', label: 'YouTube' },
    { icon: Music, href: 'https://tiktok.com/Quepeliveo', label: 'TikTok' }
  ];

  return (
    <footer className="bg-secondary text-foreground mt-auto animate-fade-in full-bleed" role="contentinfo">
      {/* Contenido principal del Footer (ancho completo) */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-10">
        {/* Mobile Accordion View */}
        <div className="md:hidden">
          {/* Logo + tagline en móvil */}
          <div className="flex items-center gap-2 mb-4">
            <Film className="w-8 h-8 text-primary" />
            <span className="font-display font-bold text-lg text-white">Quepeliveo</span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Descubre qué ver hoy en tus plataformas favoritas.</p>
          {footerSections.map((section) => (
            <FooterAccordion
              key={section.title}
              title={section.title}
              isOpen={openSections.includes(section.title.toLowerCase())}
              onToggle={() => toggleSection(section.title.toLowerCase())}
            >
              <ul className="space-y-2">
                {section.links.map((link, index) => (
                  <li key={index}>
                    <Link
                      to={link.href}
                      className={`block py-1 text-sm transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-primary focus:ring-offset-1 focus:ring-offset-background rounded ${
                        link.highlighted 
                          ? 'text-primary hover:text-primary/80 font-medium hover:translate-x-1' 
                          : 'text-muted-foreground hover:text-foreground hover:translate-x-1'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </FooterAccordion>
          ))}
        </div>

        {/* Desktop: 4 columnas en una sola fila */}
        <div className="hidden md:grid grid-cols-4 gap-8 items-start w-full">
          {/* Columna 1: Logo + tagline */}
          <div className="flex flex-col gap-3">
            <Link to="/" className="inline-flex items-center gap-2" aria-label="Inicio Quepeliveo">
              <Film className="w-8 h-8 text-primary" />
              <span className="font-display font-bold text-xl text-white">Quepeliveo</span>
            </Link>
            <p className="text-sm text-muted-foreground">Descubre qué ver hoy en tus plataformas favoritas.</p>
          </div>

          {/* Columnas 2-4: Descubrir, Ayuda, Legal */}
          {footerSections.map((section) => (
            <DesktopSection
              key={section.title}
              title={section.title}
              links={section.links}
            />
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border bg-secondary-light">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
          {/* Top row: Scope note and data credits */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div className="text-sm text-muted-foreground">
              <p className="mb-1">Mostramos disponibilidad en plataformas <strong>de España</strong>.</p>
              <p>Información de catálogo y metadatos proporcionados por fuentes públicas y partners.</p>
            </div>
            
            {/* Language/Country Selector (placeholder) */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Idioma · Región:</span>
              <select className="bg-secondary-light text-foreground px-2 py-1 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="es">España</option>
              </select>
            </div>
          </div>

          {/* Middle row: Social links and help text */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
            <div className="flex items-center gap-4">
              {/* Social Media Icons */}
              <div className="flex items-center gap-3">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Help Microcopy */}
            <div className="text-sm text-muted-foreground text-center md:text-right">
              <p className="mb-1">
                ¿Dudas? Revisa <Link to="/como-funciona" className="text-primary hover:text-primary/80">Cómo funciona</Link> o 
                escríbenos en <Link to="/contacto" className="text-primary hover:text-primary/80">Contacto</Link>.
              </p>
              <p>
                Tu privacidad importa. Gestiona tus preferencias en 
                <Link to="/configurar-cookies" className="text-primary hover:text-primary/80 ml-1">Configurar cookies</Link>.
              </p>
            </div>
          </div>

          {/* Bottom row: Copyright */}
          <div className="text-center text-sm text-muted-foreground">
            <p>© Quepeliveo, {new Date().getFullYear()}</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;