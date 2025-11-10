import React, { useState } from 'react';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { contentSync } from '../services/contentSync';
import { tmdbService } from '../services/tmdb';

const PLATFORM_KEYS = [
  { key: 'netflix', label: 'Netflix' },
  { key: 'prime', label: 'Prime Video' },
  { key: 'disney', label: 'Disney+' },
  { key: 'hbo', label: 'Max' },
  { key: 'apple', label: 'Apple TV+' },
  { key: 'filmin', label: 'Filmin' },
  { key: 'movistar', label: 'Movistar Plus+' }
] as const;

type PlatformKey = typeof PLATFORM_KEYS[number]['key'];

const SyncStreamingCatalogs: React.FC = () => {
  const [selected, setSelected] = useState<PlatformKey[]>(PLATFORM_KEYS.map(p => p.key));
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<Record<string, string>>({});
  const [resultMsg, setResultMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggle = (key: PlatformKey) => {
    setSelected(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const runSync = async () => {
    setLoading(true);
    setResultMsg(null);
    setErrorMsg(null);
    setProgress({});
    try {
      // Progreso simple por plataforma
      for (const p of selected) {
        setProgress(prev => ({ ...prev, [p]: 'Extrayendo catálogo...' }));
      }

      const res = await contentSync.syncStreamingCatalogs(selected as any);
      const stats = contentSync.getSyncStats();
      setResultMsg(`Nuevos: ${res.newContent}, Actualizados: ${res.updatedContent}, Total disponibles: ${stats.availableContent}`);
      setProgress({});
    } catch (e: any) {
      setErrorMsg(e?.message || 'Error al sincronizar catálogos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-white/5">
      <div className="flex items-center gap-2 mb-2">
        <RefreshCw className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Sincronizar catálogos externos</h3>
      </div>
      <p className="text-sm text-gray-300 mb-4">Recoge el catálogo completo por plataforma (España) usando APIs externas y enriquece con TMDb.</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {PLATFORM_KEYS.map(p => (
          <button
            key={p.key}
            onClick={() => toggle(p.key)}
            className={`px-3 py-1 rounded-full text-sm border ${selected.includes(p.key) ? 'bg-blue-600 border-blue-400 text-white' : 'bg-transparent border-gray-500 text-gray-200'}`}
            disabled={loading}
            aria-pressed={selected.includes(p.key)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <button
        onClick={runSync}
        disabled={loading || selected.length === 0}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-md ${loading ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
      >
        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        {loading ? 'Sincronizando...' : 'Sincronizar catálogos seleccionados'}
      </button>

      {(resultMsg || errorMsg) && (
        <div className="mt-3 text-sm flex items-center gap-2">
          {resultMsg && <><CheckCircle className="w-4 h-4 text-green-500" /> <span>{resultMsg}</span></>}
          {errorMsg && <><AlertCircle className="w-4 h-4 text-red-500" /> <span className="text-red-400">{errorMsg}</span></>}
        </div>
      )}

      {Object.keys(progress).length > 0 && (
        <ul className="mt-3 text-xs text-gray-300 list-disc pl-5">
          {Object.entries(progress).map(([k, v]) => (
            <li key={k}>{PLATFORM_KEYS.find(p => p.key === k)?.label}: {v}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SyncStreamingCatalogs;