import React, { useState, useEffect } from 'react';
import { Settings, Save, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { validateTmdbApiKey, isValidApiKeyFormat } from '../utils/validateApiKey';

interface TmdbConfigProps {
  onConfigChange?: (apiKey: string) => void;
}

const TmdbConfig: React.FC<TmdbConfigProps> = ({ onConfigChange }) => {
  const [apiKey, setApiKey] = useState('');
  const [savedKey, setSavedKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  useEffect(() => {
    // Cargar API key guardada del localStorage
    const saved = localStorage.getItem('tmdb_api_key');
    if (saved) {
      setSavedKey(saved);
      setApiKey(saved);
    }
  }, []);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setMessage('Por favor ingresa una API key válida');
      setMessageType('error');
      return;
    }

    // Validar formato básico
    if (!isValidApiKeyFormat(apiKey.trim())) {
      setMessage('El formato de la API key no es válido. Debe tener 32 caracteres alfanuméricos.');
      setMessageType('error');
      return;
    }

    setIsSaving(true);
    setMessage('Validando API key con TMDb...');
    setMessageType('');
    
    try {
      // Validar la API key con TMDb
      const validation = await validateTmdbApiKey(apiKey.trim());
      
      if (!validation.valid) {
        setMessage(validation.error || 'API key inválida');
        setMessageType('error');
        return;
      }
      
      // Si la validación es exitosa, guardar en localStorage
      localStorage.setItem('tmdb_api_key', apiKey.trim());
      setSavedKey(apiKey.trim());
      
      // Notificar al componente padre
      if (onConfigChange) {
        onConfigChange(apiKey.trim());
      }
      
      setMessage('API key guardada y validada exitosamente');
      setMessageType('success');
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 3000);
      
    } catch (error) {
      setMessage('Error al validar o guardar la API key');
      setMessageType('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setApiKey('');
    localStorage.removeItem('tmdb_api_key');
    setSavedKey('');
    
    if (onConfigChange) {
      onConfigChange('');
    }
    
    setMessage('API key eliminada');
    setMessageType('success');
    
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
  };

  return (
    <div className="bg-secondary rounded-lg p-6 mb-8">
      <div className="flex items-center mb-4">
        <Settings className="w-6 h-6 text-primary mr-3" />
        <h3 className="text-xl font-semibold text-white">Configuración de TMDb API</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="tmdb-api-key" className="block text-sm font-medium text-gray-300 mb-2">
            API Key de TMDb
          </label>
          <input
            id="tmdb-api-key"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Ingresa tu API key de TMDb"
            className="w-full px-4 py-2 bg-secondary-light border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            {savedKey ? (
              <span className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                API key configurada
              </span>
            ) : (
              <span className="flex items-center">
                <AlertCircle className="w-4 h-4 text-yellow-500 mr-2" />
                No hay API key configurada
              </span>
            )}
          </div>
          
          <div className="flex space-x-3">
            {savedKey && (
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-secondary-light hover:bg-secondary-dark rounded-lg transition-colors duration-200"
                disabled={isSaving}
              >
                Eliminar
              </button>
            )}
            
            <button
              onClick={handleSave}
              disabled={isSaving || apiKey === savedKey}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors duration-200"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Validando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar
                </>
              )}
            </button>
          </div>
        </div>
        
        {message && (
          <div className={`p-3 rounded-lg text-sm flex items-center ${
            messageType === 'success' 
              ? 'bg-green-900/20 text-green-400 border border-green-700' 
              : 'bg-red-900/20 text-red-400 border border-red-700'
          }`}>
            {messageType === 'success' ? (
              <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            )}
            {message}
          </div>
        )}
        
        <div className="text-xs text-gray-500 border-t border-gray-700 pt-4">
          <p className="mb-2">
            <strong>¿Cómo obtener tu API key?</strong>
          </p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Regístrate en <a href="https://www.themoviedb.org/signup" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">TMDb</a></li>
            <li>Ve a Configuración → API</li>
            <li>Solicita una API key para desarrollador</li>
            <li>Copia y pega la clave aquí</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default TmdbConfig;