import React from 'react';
import { AlertCircle, RefreshCw, WifiOff } from 'lucide-react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  type?: 'network' | 'api' | 'general';
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title,
  message,
  onRetry,
  type = 'general',
  className = ''
}) => {
  const getIcon = () => {
    switch (type) {
      case 'network':
        return <WifiOff className="w-12 h-12 text-red-500" />;
      case 'api':
        return <AlertCircle className="w-12 h-12 text-orange-500" />;
      default:
        return <AlertCircle className="w-12 h-12 text-gray-500" />;
    }
  };

  const getTitle = () => {
    if (title) return title;
    switch (type) {
      case 'network':
        return 'Problema de conexión';
      case 'api':
        return 'Error en el servicio';
      default:
        return 'Algo salió mal';
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <div className="mb-4">
        {getIcon()}
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {getTitle()}
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-md">
        {message}
      </p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Intentar nuevamente
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;