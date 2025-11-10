import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, Search, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Role = 'user' | 'assistant';

interface IAResultItem {
  id: number;
  title: string;
  type: 'Película' | 'Serie' | 'Documental';
  platform: string;
  poster: string;
  description: string;
}

interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  cards?: IAResultItem[];
}

const EXAMPLES = [
  'Recomiéndame una película de acción emocionante',
  'Quiero ver una comedia romántica reciente',
  'Busco una serie de misterio para maratonear',
];

const MOCK_RESULTS: IAResultItem[] = [
  {
    id: 1,
    title: 'Sombra de Ciudad',
    type: 'Película',
    platform: 'Netflix',
    poster:
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=dark%20city%20thriller%20poster%20rain%20neon&image_size=portrait_4_3',
    description: 'Thriller urbano con misterio y atmósfera de lluvia.',
  },
  {
    id: 2,
    title: 'Risas Instantáneas',
    type: 'Película',
    platform: 'Prime Video',
    poster:
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=bright%20comedy%20friends%20laughing%20poster&image_size=portrait_4_3',
    description: 'Comedia fresca y ligera para ver en familia.',
  },
  {
    id: 3,
    title: 'Capítulos Breves',
    type: 'Serie',
    platform: 'Disney+',
    poster:
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=miniseries%20drama%20poster%20blue%20tones&image_size=portrait_4_3',
    description: 'Miniserie intensa de ritmo alto y capítulos cortos.',
  },
  {
    id: 4,
    title: 'Miradas al Mundo',
    type: 'Documental',
    platform: 'Filmin',
    poster:
      'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=documentary%20nature%20aerial%20shots%20poster&image_size=portrait_4_3',
    description: 'Relato visual potente con nuevas perspectivas.',
  },
];

const SearchIASection: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'chat' | 'search'>('chat');

  // Chat
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, loading]);

  const send = (preset?: string) => {
    const text = preset ?? input.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'user', content: text }]);
    setInput('');
    setLoading(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'Te propongo algunas opciones basadas en tu mensaje.',
          cards: MOCK_RESULTS.slice(0, 4),
        },
      ]);
      setLoading(false);
    }, 700);
  };

  // Search
  const [textQuery, setTextQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const goExplore = () => {
    const params = new URLSearchParams({ q: textQuery }).toString();
    navigate(`/other?${params}`);
  };

  return (
    <section className="container-main py-6">
      <h2 className="text-2xl font-bold text-white">Buscar o hablar con la IA</h2>
      <div className="h-1 w-20 bg-primary rounded mb-4"></div>

      <div role="tablist" aria-label="Selecciona modo" className="flex gap-2 mb-5">
        {[
          { key: 'chat', label: 'Chat con IA' },
          { key: 'search', label: 'Búsqueda por texto' },
        ].map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={activeTab === (t.key as 'chat' | 'search')}
            onClick={() => setActiveTab(t.key as 'chat' | 'search')}
            className={`px-3 py-1 rounded-full text-sm border ${
              activeTab === t.key
                ? 'bg-primary text-white border-primary'
                : 'bg-secondary-light text-white border-secondary-dark hover:bg-secondary-dark'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'chat' ? (
        <div className="bg-secondary rounded-xl border border-secondary-dark shadow-sm">
          <div className="h-11 px-3 flex items-center border-b border-secondary-dark">
            <span className="flex items-center gap-2 text-white font-semibold text-sm">
              <MessageCircle className="w-5 h-5 text-primary" /> Chat con IA
            </span>
          </div>
          <div ref={scrollRef} className="max-h-[60vh] overflow-y-auto no-scrollbar p-3 space-y-3">
            {messages.length === 0 && (
              <div className="mb-2">
                <div className="flex flex-wrap gap-2">
                  {EXAMPLES.map((ex) => (
                    <button
                      key={ex}
                      onClick={() => send(ex)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs bg-secondary-light hover:bg-secondary-dark text-white border border-secondary-dark"
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
                  } max-w-[85%] rounded-2xl px-3 py-2`}
                >
                  <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            ))}

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

            {messages.length > 0 && messages[messages.length - 1].role === 'assistant' &&
              messages[messages.length - 1].cards && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-1">
                  {messages[messages.length - 1].cards!.map((item) => (
                    <div key={item.id} className="bg-secondary-light rounded-xl overflow-hidden border border-secondary-dark">
                      <img src={item.poster} alt={item.title} className="w-full h-36 object-cover" />
                      <div className="p-3">
                        <h3 className="text-white text-sm font-medium mb-1 line-clamp-2">{item.title}</h3>
                        <p className="text-gray-400 text-xs mb-2 line-clamp-2">{item.description}</p>
                        <div className="flex items-center gap-2">
                          <button className="flex-1 px-3 py-2 bg-primary hover:bg-primary-dark text-white text-xs rounded-md">
                            Ver en {item.platform}
                          </button>
                          <button className="px-2 py-2 bg-secondary-dark text-white text-xs rounded-md border border-secondary">
                            Ver detalles
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>

          <div className="px-3 py-3 border-t border-secondary-dark">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="flex items-center gap-2"
              aria-label="Enviar mensaje al chat"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pídeme algo nuevo…"
                className="flex-1 bg-secondary-light border border-secondary-dark rounded-lg px-3 py-3 text-white placeholder-gray-400 focus:outline-none"
                aria-label="Caja de chat"
              />
              <button
                type="submit"
                className="px-4 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold"
                aria-label="Enviar"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <div className="relative flex-1 min-w-0">
              <div className="flex items-center gap-2 bg-secondary-light border border-secondary-dark rounded-lg px-3 py-2 md:py-3">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={textQuery}
                  onChange={(e) => setTextQuery(e.target.value)}
                  placeholder="Busca títulos, actores o plataformas…"
                  className="min-w-0 flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none"
                  aria-label="Buscar por texto"
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                />
              </div>
              {showSuggestions && textQuery.length >= 1 && (
                <div className="absolute z-10 mt-2 left-0 right-0 bg-secondary-light border border-secondary-dark rounded-lg">
                  {['Netflix', 'Prime Video', 'Disney+', 'Filmin', 'Movistar+']
                    .filter((s) => s.toLowerCase().includes(textQuery.toLowerCase()))
                    .slice(0, 5)
                    .map((s) => (
                      <button
                        key={s}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setTextQuery(s);
                          setShowSuggestions(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-white hover:bg-secondary-dark"
                      >
                        {s}
                      </button>
                    ))}
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setShowSuggestions(false)}
                    className="w-full text-left px-3 py-2 text-xs text-gray-400"
                  >
                    Ocultar sugerencias
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={goExplore}
              className="shrink-0 px-3 py-2 md:px-4 md:py-2 bg-primary hover:bg-primary-dark text-white rounded-md text-sm whitespace-nowrap"
            >
              Ver todo
            </button>
          </div>

          {textQuery.length > 2 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
              {MOCK_RESULTS.filter(
                (r) =>
                  r.title.toLowerCase().includes(textQuery.toLowerCase()) ||
                  r.platform.toLowerCase().includes(textQuery.toLowerCase())
              )
                .slice(0, 8)
                .map((item) => (
                  <div key={item.id} className="bg-secondary-light rounded-xl overflow-hidden border border-secondary-dark">
                    <img src={item.poster} alt={item.title} className="w-full h-36 object-cover" />
                    <div className="p-3">
                      <h3 className="text-white text-sm font-medium mb-1 line-clamp-2">{item.title}</h3>
                      <p className="text-gray-400 text-xs mb-2 line-clamp-2">{item.description}</p>
                      <div className="flex items-center gap-2">
                        <button className="flex-1 px-3 py-2 bg-primary hover:bg-primary-dark text-white text-xs rounded-md">
                          Ver en {item.platform}
                        </button>
                        <button className="px-2 py-2 bg-secondary-dark text-white text-xs rounded-md border border-secondary">
                          Ver detalles
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default SearchIASection;

