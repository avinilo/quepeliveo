# Sistema de Diseño y Estilos - Quepeliveo

Documento técnico completo para crear una web visualmente idéntica a Quepeliveo. Este documento contiene todos los estilos, componentes y estructuras visuales sin referencias al contenido específico.

## 1. Sistema de Diseño Base

### 1.1 Paleta de Colores

#### Colores Principales
```css
/* Primario - Rojo Netflix */
--primary: #E50914
--primary-dark: #B20710
--primary-light: #F40612
--primary-foreground: #FFFFFF

/* Secundario - Negro carbón */
--secondary: #141414
--secondary-light: #1F1F1F
--secondary-dark: #0A0A0A

/* Acento - Naranja */
--accent: #FFA500
--accent-light: #FFB84D
--accent-dark: #CC8400

/* Fondos y texto (modo claro por defecto) */
--background: #FFFFFF
--foreground: #0A0A0A
--card: #FFFFFF
--card-foreground: #0A0A0A
--muted: #F5F5F5
--muted-foreground: #6B7280
--border: #E5E7EB

/* Fondos y texto (modo oscuro) */
.dark {
  --background: #0A0A0A
  --foreground: #FFFFFF
  --card: #1F1F1F
  --card-foreground: #FFFFFF
  --muted: #2D2D2D
  --muted-foreground: #B3B3B3
  --border: #383838
}
```

#### Colores de Plataformas
```css
--netflix: #E50914
--amazon: #00A8E1
--disney: #113CCF
--hbo: #674EA7
--movistar: #00ED82
--filmin: #FF6B35
--rakuten: #BF1313
--appletv: #1D1D1F
```

### 1.2 Tipografía

#### Fuentes
```css
/* Familias de fuentes */
font-sans: 'Inter', system-ui, sans-serif
font-display: 'Poppins', system-ui, sans-serif
font-mono: 'JetBrains Mono', monospace

/* Import desde Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Poppins:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
```

#### Tamaños de Fuente
```css
/* Escalado tipográfico */
.text-xs: 0.75rem (12px)
.text-sm: 0.875rem (14px)
.text-base: 1rem (16px)
.text-lg: 1.125rem (18px)
.text-xl: 1.25rem (20px)
.text-2xl: 1.5rem (24px)
.text-3xl: 1.875rem (30px)
.text-4xl: 2.25rem (36px)
.text-5xl: 3rem (48px)
.text-6xl: 3.75rem (60px)
.text-7xl: 4.5rem (72px)
```

### 1.3 Sistema de Espaciado

```css
/* Basado en múltiplos de 8px */
.spacing-1: 0.25rem (4px)
.spacing-2: 0.5rem (8px)
.spacing-3: 0.75rem (12px)
.spacing-4: 1rem (16px)
.spacing-5: 1.25rem (20px)
.spacing-6: 1.5rem (24px)
.spacing-8: 2rem (32px)
.spacing-10: 2.5rem (40px)
.spacing-12: 3rem (48px)
.spacing-16: 4rem (64px)
.spacing-20: 5rem (80px)
.spacing-24: 6rem (96px)
.spacing-32: 8rem (128px)
.spacing-40: 10rem (160px)
.spacing-48: 12rem (192px)
.spacing-56: 14rem (224px)
.spacing-64: 16rem (256px)
```

### 1.4 Sombras y Efectos

```css
/* Sombras de tarjetas */
.shadow-card: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)
.shadow-card-hover: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)

/* Sombras de botones */
.shadow-button: 0 2px 4px 0 rgba(0, 0, 0, 0.1)
.shadow-button-hover: 0 4px 8px 0 rgba(0, 0, 0, 0.15)

/* Sombras de modales */
.shadow-modal: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)
```

### 1.5 Bordes y Radio

```css
/* Radio de bordes */
.rounded-none: 0
.rounded-sm: 0.125rem (2px)
.rounded: 0.25rem (4px)
.rounded-md: 0.375rem (6px)
.rounded-lg: 0.5rem (8px)
.rounded-xl: 0.75rem (12px)
.rounded-2xl: 1rem (16px)
.rounded-3xl: 1.5rem (24px)
.rounded-full: 9999px
```

## 2. Sistema de Layout

### 2.1 Contenedores Base

```css
/* Contenedor principal */
.container-main {
  @apply max-w-container mx-auto px-4 sm:px-6 lg:px-8;
}

/* Anchos máximos */
.max-w-container: 1200px
.max-w-content: 800px
.max-w-modal: 600px
```

### 2.2 Sistema de Grid

```css
/* Grid de contenido */
.content-grid {
  @apply grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4;
}

/* Breakpoints responsive */
.xs: 475px
.sm: 640px
.md: 768px
.lg: 1024px
.xl: 1366px
.2xl: 1920px
```

### 2.3 Layouts Principales

#### MainLayout
```tsx
<div className="min-h-screen bg-secondary flex flex-col">
  <Header />
  <main className="flex-1 pt-16"> {/* Compensa header fijo */}
    <Outlet />
  </main>
  <Footer />
</div>
```

#### AuthLayout
```tsx
<div className="min-h-screen bg-secondary flex items-center justify-center">
  <div className="w-full max-w-md mx-4">
    <Outlet />
  </div>
</div>
```

## 3. Componentes UI Base

### 3.1 Header (Navegación)

#### Estructura Desktop
```tsx
<header className="fixed top-0 left-0 right-0 z-50 h-16">
  <div className="container-main">
    <div className="flex items-center justify-between h-16">
      {/* Logo + Navegación */}
      <div className="flex items-center space-x-8">
        <Link className="flex items-center space-x-2">
          <Film className="w-8 h-8 text-primary" />
          <span className="font-display font-bold text-lg md:text-xl">
            {APP_NAME}
          </span>
        </Link>
        
        {/* Links de navegación */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link className="text-sm font-medium text-gray-300 hover:text-primary">
            Link
          </Link>
        </nav>
      </div>
      
      {/* Acciones usuario */}
      <div className="flex items-center space-x-4">
        {/* Búsqueda */}
        <Link className="hidden md:flex items-center space-x-2 px-3 py-2 bg-secondary-light rounded-lg">
          <Search className="w-4 h-4" />
          <span className="text-sm">Buscar...</span>
        </Link>
        
        {/* Watchlist */}
        <Link className="hidden md:block p-2">
          <Heart className="w-5 h-5" />
        </Link>
        
        {/* Menú usuario */}
        <div className="hidden md:block relative group">
          <button className="flex items-center space-x-2 p-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">U</span>
            </div>
          </button>
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-48 bg-secondary-light rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible">
            {/* Items del dropdown */}
          </div>
        </div>
        
        {/* Menú móvil */}
        <button className="md:hidden p-2">
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </div>
  </div>
</header>
```

#### Estados del Header
```css
/* Header transparente al inicio */
.bg-transparent

/* Header con fondo al hacer scroll */
.bg-secondary/95 backdrop-blur-md shadow-lg

/* Links de navegación activos */
.text-primary

/* Links de navegación inactivos */
.text-gray-300 hover:text-primary
```

### 3.2 Footer

#### Estructura Base
```tsx
<footer className="bg-secondary-dark border-t border-secondary-light mt-auto">
  <div className="container-main py-12">
    {/* Logo y descripción */}
    <div className="mb-8">
      <Link className="flex items-center space-x-2 mb-4">
        <Film className="w-8 h-8 text-primary" />
        <span className="font-display font-bold text-xl text-white">
          {APP_NAME}
        </span>
      </Link>
      <p className="text-gray-400 text-sm max-w-md">
        Descripción del sitio
      </p>
    </div>
    
    {/* Secciones de enlaces */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
      {/* Cada sección */}
      <div>
        <h3 className="font-semibold text-white mb-4">Título</h3>
        <ul className="space-y-2">
          <li>
            <Link className="text-gray-400 hover:text-white text-sm transition-colors">
              Enlace
            </Link>
          </li>
        </ul>
      </div>
    </div>
    
    {/* Redes sociales y copyright */}
    <div className="flex flex-col md:flex-row justify-between items-center">
      {/* Redes sociales */}
      <div className="flex items-center space-x-4">
        <a className="text-gray-400 hover:text-white transition-colors">
          <Icon className="w-5 h-5" />
        </a>
      </div>
      
      {/* Copyright */}
      <div className="text-center md:text-right">
        <p className="text-gray-400 text-sm">
          © {currentYear} {APP_NAME}. Todos los derechos reservados.
        </p>
      </div>
    </div>
  </div>
</footer>
```

### 3.3 Tarjetas de Contenido (ContentCard)

#### Variantes de Tamaño
```css
/* Tamaños de tarjetas */
.w-32 md:w-40 /* small */
.w-40 md:w-48 lg:w-56 /* medium */
.w-48 md:w-64 lg:w-72 /* large */

/* Alturas de imagen */
.h-48 md:h-60 /* small */
.h-60 md:h-72 lg:h-84 /* medium */
.h-72 md:h-96 lg:h-108 /* large */
```

#### Estados y Efectos
```css
/* Tarjeta base */
.content-card {
  @apply bg-secondary-light rounded-lg overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 ease-out;
}

/* Hover effect */
.group:hover .group-hover:scale-105
.group:hover .group-hover:opacity-100

/* Overlay de información */
.image-overlay {
  @apply absolute inset-0 bg-gradient-to-t from-secondary via-secondary/50 to-transparent;
}
```

### 3.4 Botones

#### Variantes de Botones
```css
/* Botón primario */
.btn-primary {
  @apply bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded-lg shadow-button hover:shadow-button-hover transition-all duration-200 ease-out;
}

/* Botón secundario */
.btn-secondary {
  @apply bg-secondary-light hover:bg-secondary-dark text-white font-semibold py-2 px-4 rounded-lg border border-secondary-dark hover:border-primary transition-all duration-200 ease-out;
}

/* Botón outline */
.btn-outline {
  @apply bg-transparent hover:bg-primary text-white font-semibold py-2 px-4 rounded-lg border border-primary hover:border-primary-dark transition-all duration-200 ease-out;
}
```

### 3.5 Formularios e Inputs

#### Input Base
```css
.input-field {
  @apply w-full bg-secondary-light border border-secondary-dark text-white placeholder-gray-400 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200;
}
```

#### Estados de Formulario
```css
/* Focus state */
focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent

/* Placeholder */
placeholder-gray-400

/* Error state */
border-red-500 focus:ring-red-500

/* Success state */
border-green-500 focus:ring-green-500
```

### 3.6 Badges y Etiquetas

#### Badges de Plataforma
```css
.platform-badge {
  @apply inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white;
}

/* Colores específicos */
.platform-badge-netflix { @apply bg-netflix; }
.platform-badge-amazon { @apply bg-amazon; }
.platform-badge-disney { @apply bg-disney; }
.platform-badge-hbo { @apply bg-hbo; }
```

#### Badges de Género
```css
.genre-badge {
  @apply inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent text-black;
}
```

## 4. Componentes Especiales

### 4.1 Hero Carousel

#### Estructura Base
```css
.hero-slide {
  @apply relative h-[60vh] min-h-[400px] max-h-[600px] w-full;
}
```

#### Controles del Carousel
```css
/* Botones de navegación */
.carousel-control {
  @apply absolute top-1/2 -translate-y-1/2 z-10 p-2 bg-secondary/50 hover:bg-secondary/75 rounded-full transition-colors;
}

/* Indicadores */
.carousel-indicator {
  @apply w-2 h-2 rounded-full bg-white/50 hover:bg-white transition-colors;
}
```

### 4.2 Modal

#### Estructura del Modal
```css
/* Backdrop */
.modal-backdrop {
  @apply fixed inset-0 bg-black/75 backdrop-blur-sm z-40;
}

/* Contenedor */
.modal-container {
  @apply fixed inset-0 z-50 flex items-center justify-center p-4;
}

/* Contenido */
.modal-content {
  @apply bg-secondary rounded-xl shadow-modal max-w-modal w-full max-h-[90vh] overflow-y-auto;
}
```

### 4.3 Tooltips

```css
.tooltip {
  @apply absolute z-50 px-2 py-1 text-sm text-white bg-secondary-dark rounded shadow-lg pointer-events-none opacity-0 transition-opacity duration-200;
}

.tooltip.show {
  @apply opacity-100;
}
```

## 5. Estados y Animaciones

### 5.1 Estados de Interacción

#### Hover States
```css
/* Links */
hover:text-primary
hover:text-white

/* Botones */
hover:bg-primary-dark
hover:bg-secondary-dark

/* Tarjetas */
hover:shadow-card-hover
hover:scale-105
```

#### Focus States
```css
/* Focus visible para accesibilidad */
:focus-visible {
  @apply outline-none ring-2 ring-primary ring-offset-2 ring-offset-secondary;
}
```

#### Active States
```css
/* Botones activos */
active:scale-95
active:bg-primary-dark
```

### 5.2 Animaciones

#### Animaciones Base
```css
/* Duraciones */
transition-all duration-200
transition-all duration-300

/* Curvas de aceleración */
ease-out
ease-in-out
```

#### Animaciones Personalizadas
```css
/* Keyframes definidos en tailwind.config.js */
@keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
@keyframes slideUp { 0% { transform: translateY(10px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
@keyframes slideDown { 0% { transform: translateY(-10px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
@keyframes scaleIn { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
@keyframes bounceIn { 0% { transform: scale(0.3); opacity: 0; } 50% { transform: scale(1.05); } 70% { transform: scale(0.9); } 100% { transform: scale(1); opacity: 1; } }
```

#### Clases de Animación
```css
.animate-fade-in
.animate-slide-up
.animate-slide-down
.animate-scale-in
.animate-bounce-in
```

### 5.3 Estados de Carga

#### Skeleton Loading
```css
.skeleton {
  @apply bg-secondary-light animate-pulse;
}
```

#### Spinners
```css
/* Spinner base */
.spinner {
  @apply animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full;
}
```

## 6. Utilidades CSS Personalizadas

### 6.1 Scrollbar Personalizada

```css
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  @apply bg-secondary-light;
}

::-webkit-scrollbar-thumb {
  @apply bg-primary rounded-full;
}

::-webkit-scrollbar-thumb:hover {
  @apply bg-primary-dark;
}
```

### 6.2 Utilidades de Overflow

```css
/* Ocultar scrollbar */
.no-scrollbar {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
.no-scrollbar::-webkit-scrollbar {
  display: none; /* Chrome, Safari */
}
```

### 6.3 Selección de Texto

```css
::selection {
  @apply bg-primary text-white;
}
```

## 7. Configuración de Tailwind CSS

### 7.1 Configuración Extendida (tailwind.config.js)

```javascript
export default {
  theme: {
    extend: {
      colors: {
        // Colores definidos arriba
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Poppins', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace']
      },
      spacing: {
        // Sistema de espaciado definido arriba
      },
      borderRadius: {
        // Radios definidos arriba
      },
      boxShadow: {
        // Sombras definidas arriba
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        DEFAULT: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px'
      },
      screens: {
        xs: '475px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1366px',
        '2xl': '1920px'
      },
      maxWidth: {
        'container': '1200px',
        'content': '800px',
        'modal': '600px'
      },
      zIndex: {
        'dropdown': '1000',
        'sticky': '1020',
        'fixed': '1030',
        'modal-backdrop': '1040',
        'modal': '1050',
        'popover': '1060',
        'tooltip': '1070'
      }
    }
  }
}
```

## 8. Iconos y Assets

### 8.1 Sistema de Iconos

```tsx
/* Usando Lucide React */
import { IconName } from 'lucide-react'

/* Tamaños estándar */
.w-4 h-4 /* small */
.w-5 h-5 /* default */
.w-6 h-6 /* large */
.w-8 h-8 /* extra large */
```

### 8.2 Logos de Plataformas

```css
/* Implementación como clases de color */
.text-netflix
.text-amazon
.text-disney
.text-hbo
.text-movistar
.text-filmin
.text-rakuten
.text-appletv
```

## 9. Responsive Design

### 9.1 Breakpoints y Adaptación

```css
/* Mobile-first approach */
/* Base: móviles pequeños */
/* xs: 475px+ */
/* sm: 640px+ */
/* md: 768px+ */
/* lg: 1024px+ */
/* xl: 1366px+ */
/* 2xl: 1920px+ */
```

### 9.2 Patrones Responsive Comunes

```css
/* Mostrar/ocultar elementos */
.hidden md:block /* Ocultar móvil, mostrar desktop */
.md:hidden /* Ocultar desktop, mostrar móvil */

/* Cambios de layout */
.grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6

/* Cambios de espaciado */
.px-4 sm:px-6 lg:px-8
```

## 10. Consideraciones de Accesibilidad

### 10.1 Focus Management

```tsx
/* Focus visible para teclado */
:focus-visible {
  @apply outline-none ring-2 ring-primary ring-offset-2 ring-offset-secondary;
}
```

### 10.2 ARIA Labels

```tsx
/* Ejemplos de uso */
aria-label="Buscar"
aria-label="Menú"
aria-label="Mi lista"
```

### 10.3 Contraste de Colores

- Todos los colores cumplen con WCAG 2.1 AA
- Ratio de contraste mínimo 4.5:1 para texto normal
- Ratio de contraste mínimo 3:1 para texto grande

---

Este documento proporciona un sistema de diseño completo para crear una web visualmente idéntica a Quepeliveo. Incluye todos los estilos, componentes y patrones visuales necesarios sin referencias al contenido específico.