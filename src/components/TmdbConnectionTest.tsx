import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Loader2, WifiOff } from 'lucide-react';
import { tmdbService } from '../services/tmdb';

interface ConnectionTestProps {
  className?: string;
}

export const TmdbConnectionTest: React.FC<ConnectionTestProps> = ({ className = '' }) => {
  const [status, setStatus] = useState<'testing' | 'success' | 'error' | 'no-api-key'>('testing');
  const [message, setMessage] = useState('Verificando conexión con TMDb...');
  const [details, setDetails] = useState<string>('');

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      // Verificar si hay API key
      const apiKey = localStorage.getItem('tmdb_api_key');
      if (!apiKey) {
        setStatus('no-api-key');
        setMessage('API key no configurada');
        setDetails('Por favor configura tu API key en la configuración');
        return;
      }

      // Intentar una llamada simple a la API
      const response = await fetch(`https://api.themoviedb.org/3/configuration?api_key=${apiKey}`);
      
      if (response.ok) {
        setStatus('success');
        setMessage('Conexión exitosa con TMDb');
        setDetails('La API key es válida y la conexión está funcionando');
      } else {
        setStatus('error');
        setMessage(`Error en la conexión: ${response.status} ${response.statusText}`);
        
        if (response.status === 401) {
          setDetails('API key inválida. Por favor verifica tu clave.');
        } else if (response.status === 403) {
          setDetails('API key sin permisos suficientes.');
        } else {
          setDetails('Error al conectar con TMDb. Intenta más tarde.');
        }
      }
    } catch (error: any) {
      setStatus('error');
      setMessage('Error de conexión');
      
      if (error.message?.includes('Failed to fetch')) {
        setDetails('No se pudo conectar con TMDb. Verifica tu conexión a internet.');
      } else if (error.message?.includes('CORS')) {
        setDetails('Problema de CORS. El proxy debería resolver esto.');
      } else {
        setDetails(error.message || 'Error desconocido');
      }
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'testing':
        return <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'error':
        return <XCircle className="w-6 h-6 text-red-500" />;
      case 'no-api-key':
        return <AlertCircle className="w-6 h-6 text-yellow-500" />;
      default:
        return <WifiOff className="w-6 h-6 text-gray-500" />;
    }
  };

  const getBgColor = () => {
    switch (status) {
      case 'testing':
        return 'bg-blue-900/20 border-blue-700';
      case 'success':
        return 'bg-green-900/20 border-green-700';
      case 'error':
        return 'bg-red-900/20 border-red-700';
      case 'no-api-key':
        return 'bg-yellow-900/20 border-yellow-700';
      default:
        return 'bg-gray-900/20 border-gray-700';
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${getBgColor()} ${className}`}>
      <div className="flex items-center space-x-3">
        {getIcon()}
        <div className="flex-1">
          <h4 className="font-medium text-white">{message}</h4>
          {details && (
            <p className="text-sm text-gray-300 mt-1">{details}</p>
          )}
        </div>
        {status !== 'testing' && (
          <button
            onClick={testConnection}
            className="text-sm text-primary hover:text-primary-dark transition-colors"
            disabled={status === 'testing'}
          >
            Reintentar
          </button>
        )}
      </div>
    </div>
  );
};

export default TmdbConnectionTest;