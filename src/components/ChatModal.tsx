import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, Send, Sparkles } from 'lucide-react';

type Role = 'user' | 'assistant';

interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  cards?: IAResultItem[];
}

type WindowPreset = 'Hoy' | 'Esta semana' | '30 días';
type KindPreset = 'Películas' | 'Series' | undefined;

interface IAResultItem {
  id: number;
  title: string;
  type: 'Película' | 'Serie' | 'Documental';
  platform: string;
  poster: string;
  description: string;
  badge?: 'Nuevo hoy' | 'Esta semana';
  duration?: string;
}

const EXAMPLES = [
  'Thriller nuevo en Netflix',
  'Comedias añadidas esta semana',
  'Series cortas recién llegadas',
  'Documentales que acaban de llegar',
  'Novedades para ver en familia',
];

const MOCK_RESULTS: IAResultItem[] = [
  {
    id: 301,
    title: 'Ciudad en Sombras',
    type: 'Película',
    platform: 'Netflix',
    poster:
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=neo%20noir%20thriller%20movie%20poster%20dark%20city%20rain%20lights&image_size=portrait_4_3',
    description: 'Thriller neo‑noir con atmósfera lluviosa y misterio creciente.',
    badge: 'Nuevo hoy',
    duration: '98 min',
  },
  {
    id: 302,
    title: 'Risas al Vuelo',
    type: 'Película',
    platform: 'Prime Video',
    poster:
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=bright%20comedy%20movie%20poster%20friends%20laughing%20stylized&image_size=portrait_4_3',
    description: 'Comedia ligera y optimista para toda la familia.',
    badge: 'Esta semana',
    duration: '93 min',
  },
  {
    id: 303,
    title: 'Latidos Breves',
    type: 'Serie',
    platform: 'Disney+',
    poster:
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=miniseries%20drama%20poster%20close%20up%20faces%20blue%20tones&image_size=portrait_4_3',
    description: 'Miniserie intensa de capítulos cortos y gran ritmo.',
    badge: 'Esta semana',
    duration: '1 temporada',
  },
  {
    id: 304,
    title: 'Ventanas al Mundo',
    type: 'Documental',
    platform: 'Filmin',
    poster:
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=documentary%20poster%20nature%20aerial%20shots%20soothing&image_size=portrait_4_3',
    description: 'Relato visual potente con nuevas perspectivas.',
    badge: 'Nuevo hoy',
    duration: '72 min',
  },
];

const platformClass = (platform: string) => {
  switch (platform) {
    case 'Netflix':
      return 'bg-netflix';
    case 'Prime Video':
      return 'bg-amazon';
    case 'Disney+':
      return 'bg-disney';
    case 'Max':
      return 'bg-hbo';
    case 'Filmin':
      return 'bg-filmin';
    case 'Movistar+':
      return 'bg-movistar';
    case 'Apple TV+':
      return 'bg-appletv';
    default:
      return 'bg-secondary-light';
  }
};

interface ChatModalProps {
  open: boolean;
  onClose: () => void;
}

const ChatModal: React.FC<ChatModalProps> = ({ open, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = sessionStorage.getItem('qpv-chat-history');
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [windowPreset, setWindowPreset] = useState<WindowPreset>(() => {
    return (sessionStorage.getItem('qpv-chat-window') as WindowPreset) || 'Esta semana';
  });
  const [includedOnly, setIncludedOnly] = useState<boolean>(() => {
    return sessionStorage.getItem('qpv-chat-included') === '1';
  });
  const [kindPreset, setKindPreset] = useState<KindPreset>(() => {
    const v = sessionStorage.getItem('qpv-chat-kind');
    return v === 'Películas' || v === 'Series' ? (v as KindPreset) : undefined;
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    sessionStorage.setItem('qpv-chat-history', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    sessionStorage.setItem('qpv-chat-window', windowPreset);
  }, [windowPreset]);

  useEffect(() => {
    sessionStorage.setItem('qpv-chat-included', includedOnly ? '1' : '0');
  }, [includedOnly]);

  useEffect(() => {
    if (kindPreset) sessionStorage.setItem('qpv-chat-kind', kindPreset);
    else sessionStorage.removeItem('qpv-chat-kind');
  }, [kindPreset]);

  useEffect(() => {
    if (!open) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [open, messages, loading]);

  const filteredResults = useMemo(() => {
    return MOCK_RESULTS.filter((r) => {
      if (kindPreset === 'Películas' && r.type !== 'Película') return false;
      if (kindPreset === 'Series' && r.type !== 'Serie') return false;
      if (includedOnly && r.platform !== 'Netflix' && r.platform !== 'Disney+' && r.platform !== 'Prime Video') {
        return false;
      }
      return true;
    });
  }, [kindPreset, includedOnly]);

  const send = (preset?: string) => {
    const q = (preset ?? input).trim();
    if (!q) return;
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'user', content: q }]);
    setInput('');
    setLoading(true);
    setTimeout(() => {
      const assistantText = `Te muestro novedades (${windowPreset}${includedOnly ? ', solo incluidas' : ''}${kindPreset ? `, ${kindPreset.toLowerCase()}` : ''}).`;
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: assistantText,
          cards: filteredResults.slice(0, 4),
        },
      ]);
      setLoading(false);
    }, 900);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-secondary" role="dialog" aria-label="Chat con IA">
      {/* Header */}
      <div
        className="h-14 px-4 flex items-center justify-between border-b border-secondary-dark"
        onTouchStart={(e) => (touchStartY.current = e.changedTouches[0].clientY)}
        onTouchEnd={(e) => {
          const endY = e.changedTouches[0].clientY;
          if (touchStartY.current !== null && endY - touchStartY.current > 70) onClose();
          touchStartY.current = null;
        }}
      >
        <span className="font-semibold text-white">Chat con IA</span>
        <button className="p-2 text-gray-300 hover:text-white" aria-label="Cerrar chat" onClick={onClose}>
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Mensajes */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3">
        {messages.length === 0 && (
          <div className="mb-4">
            <p className="text-gray-400 text-sm mb-3">Empieza con un ejemplo:</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => send(ex)}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-secondary-light hover:bg-secondary-dark text-white border border-secondary-dark"
                >
                  <Sparkles className="w-4 h-4 text-accent" /> {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`${
                m.role === 'user'
                  ? 'bg-primary text-white'
                  : 'bg-secondary-light text-white border border-secondary-dark'
              } max-w-[80%] rounded-xl px-3 py-2 shadow-sm`}
            >
              <p className="text-sm whitespace-pre-wrap">{m.content}</p>
            </div>
          </div>
        ))}

        {/* Loading bubble */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-secondary-light text-white border border-secondary-dark rounded-xl px-3 py-2">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150" />
              </div>
            </div>
          </div>
        )}

        {/* Cards respuesta (último mensaje del asistente con cards) */}
        {messages
          .filter((m) => m.role === 'assistant' && m.cards && m.cards.length > 0)
          .slice(-1)
          .map((m) => (
            <div key={`cards-${m.id}`} className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              {m.cards!.map((item) => (
                <div key={item.id} className="bg-secondary-light rounded-xl overflow-hidden border border-secondary-dark">
                  <div className="relative">
                    <img src={item.poster} alt={item.title} className="w-full h-32 object-cover" />
                    {/* Badge */}
                    {item.badge && (
                      <span className="absolute top-2 left-2 px-2 py-1 rounded-full text-[10px] font-semibold bg-primary text-white">
                        {item.badge}
                      </span>
                    )}
                    {/* Plataforma */}
                    <span
                      className={`absolute top-2 right-2 px-2 py-1 rounded-full text-[10px] font-medium text-white ${platformClass(
                        item.platform
                      )}`}
                    >
                      {item.platform}
                    </span>
                  </div>
                  <div className="p-2">
                    <h3 className="text-white text-xs font-medium mb-1 line-clamp-2">{item.title}</h3>
                    <p className="text-gray-400 text-[11px] mb-2 line-clamp-2">{item.description}</p>
                    <div className="flex items-center justify-between text-[11px] text-gray-400 mb-2">
                      <span>{item.type}</span>
                      {item.duration && <span>{item.duration}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="flex-1 px-2 py-1 bg-primary hover:bg-primary-dark text-white text-[11px] rounded-md">
                        Ver en {item.platform}
                      </button>
                      <button className="px-2 py-1 bg-secondary-dark text-white text-[11px] rounded-md border border-secondary">
                        Detalles
                      </button>
                      <button className="px-2 py-1 bg-secondary-dark text-white text-[11px] rounded-md border border-secondary">
                        Guardar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
      </div>

      {/* Ajustes rápidos */}
      <div className="px-4 pb-2">
        <div className="flex flex-wrap items-center gap-2">
          {(['Hoy', 'Esta semana', '30 días'] as WindowPreset[]).map((w) => (
            <button
              key={w}
              onClick={() => setWindowPreset(w)}
              className={`px-3 py-1 rounded-full text-sm border ${
                windowPreset === w
                  ? 'bg-primary text-white border-primary'
                  : 'bg-secondary-light text-white border-secondary-dark hover:bg-secondary-dark'
              }`}
            >
              {w}
            </button>
          ))}
          <button
            onClick={() => setIncludedOnly((v) => !v)}
            className={`px-3 py-1 rounded-full text-sm border ${
              includedOnly
                ? 'bg-primary text-white border-primary'
                : 'bg-secondary-light text-white border-secondary-dark hover:bg-secondary-dark'
            }`}
          >
            Solo incluidas
          </button>
          {(['Películas', 'Series'] as KindPreset[]).map((k) => (
            <button
              key={k}
              onClick={() => setKindPreset((prev) => (prev === k ? undefined : k))}
              className={`px-3 py-1 rounded-full text-sm border ${
                kindPreset === k
                  ? 'bg-primary text-white border-primary'
                  : 'bg-secondary-light text-white border-secondary-dark hover:bg-secondary-dark'
              }`}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      {/* Entrada fija abajo */}
      <div className="border-t border-secondary-dark p-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Pídeme algo: ‘terror en Netflix de 90 min’, ‘comedia familiar’…"
            className="flex-1 bg-secondary-light border border-secondary-dark text-white placeholder-gray-400 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            aria-label="Escribe tu mensaje"
          />
          <button
            onClick={() => send()}
            className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold inline-flex items-center gap-2"
            aria-label="Enviar"
          >
            <Send className="w-4 h-4" />
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;