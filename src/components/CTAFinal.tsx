import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, List, TrendingUp, Sparkles, ArrowRight, Mail } from 'lucide-react';

interface ValueBlockProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

const ValueBlock: React.FC<ValueBlockProps> = ({ icon: Icon, title, description }) => {
  return (
    <div className="bg-secondary-light rounded-xl p-6 hover:bg-secondary-dark transition-all duration-300 group">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-6 h-6 text-primary-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

const CTAFinal: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubscribed(true);
      setEmail('');
      // Aquí iría la lógica real de suscripción
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  const valueBlocks = [
    {
      icon: Search,
      title: 'Búsqueda inteligente',
      description: 'Encuentra exactamente lo que quieres con filtros por plataforma, género, duración y más.'
    },
    {
      icon: List,
      title: 'Listas personalizadas',
      description: 'Guarda películas y series para ver más tarde y organízalas a tu manera.'
    },
    {
      icon: TrendingUp,
      title: 'Descubre tendencias',
      description: 'Lo que está pegando ahora mismo en España, ajustado a tus preferencias.'
    },
    {
      icon: Sparkles,
      title: 'Únete a Quepeliveo',
      description: 'Accede a funciones exclusivas como recomendaciones personalizadas y tu lista privada.'
    }
  ];

  return (
    <section className="bg-secondary-light py-16 md:py-20">
      <div className="w-full">
        {/* Header Section */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Da el siguiente paso
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Todo lo nuevo, mejor organizado para ti. Empieza gratis en segundos.
          </p>
        </div>

        {/* Value Blocks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-12 md:mb-16">
          {valueBlocks.map((block, index) => (
            <ValueBlock
              key={index}
              icon={block.icon}
              title={block.title}
              description={block.description}
            />
          ))}
        </div>

        {/* Main CTA Buttons */}
        <div className="text-center mb-8 md:mb-12 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/registro"
              className="inline-flex items-center justify-center px-8 py-4 bg-primary hover:bg-primary-dark text-primary-foreground font-semibold rounded-xl text-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-primary/50 shadow-lg hover:shadow-xl"
            >
              Crear cuenta gratuita
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              to="/explore"
              className="inline-flex items-center justify-center px-8 py-4 bg-secondary hover:bg-secondary-dark text-foreground font-semibold rounded-xl text-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-secondary/50 shadow-lg hover:shadow-xl border border-border"
            >
              Explorar sin cuenta
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Secondary Links */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 md:gap-6 mb-12 md:mb-16">
          <Link
            to="/busqueda-avanzada"
            className="text-primary hover:text-primary/80 font-medium transition-colors flex items-center group"
          >
            Probar búsqueda avanzada
            <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/explore?preset=novedades-hoy"
            className="text-primary hover:text-primary/80 font-medium transition-colors flex items-center group"
          >
            Ver novedades de hoy
            <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Newsletter Section */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-secondary rounded-2xl p-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-primary mr-2" />
              <h3 className="text-xl font-semibold text-foreground">
                Recibe lo nuevo en tu correo
              </h3>
            </div>
            <p className="text-muted-foreground mb-6">
              Mantente al día con las incorporaciones más recientes a tus plataformas.
            </p>
            
            <form onSubmit={handleNewsletterSubmit} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nombre@correo.com"
                  className="flex-1 px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubscribed}
                  className="px-6 py-3 bg-primary hover:bg-primary-dark disabled:bg-green-600 text-primary-foreground font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                >
                  {isSubscribed ? '¡Suscrito!' : 'Quiero estar al día'}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Puedes darte de baja cuando quieras.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTAFinal;