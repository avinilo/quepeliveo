import { tmdbService } from '../services/tmdb';

export async function validateTmdbApiKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  try {
    // Guardar temporalmente la API key actual
    const currentApiKey = localStorage.getItem('tmdb_api_key');
    
    // Establecer la nueva API key temporalmente
    localStorage.setItem('tmdb_api_key', apiKey);
    
    try {
      // Intentar hacer una llamada simple a la API para verificar la key
      const response = await fetch(`https://api.themoviedb.org/3/configuration?api_key=${apiKey}`);
      
      if (!response.ok) {
        if (response.status === 401) {
          return { valid: false, error: 'API key inválida. Por favor verifica que la clave sea correcta.' };
        } else if (response.status === 403) {
          return { valid: false, error: 'API key sin permisos suficientes. Asegúrate de que tenga acceso de lectura.' };
        } else {
          return { valid: false, error: `Error en la API: ${response.status} ${response.statusText}` };
        }
      }
      
      // Si la respuesta es exitosa, la API key es válida
      return { valid: true };
      
    } catch (error: any) {
      if (error.message?.includes('Failed to fetch')) {
        return { valid: false, error: 'No se pudo conectar con TMDb. Verifica tu conexión a internet.' };
      }
      return { valid: false, error: `Error de conexión: ${error.message}` };
      
    } finally {
      // Restaurar la API key original
      if (currentApiKey) {
        localStorage.setItem('tmdb_api_key', currentApiKey);
      } else {
        localStorage.removeItem('tmdb_api_key');
      }
    }
    
  } catch (error) {
    return { valid: false, error: 'Error al validar la API key' };
  }
}

export function isValidApiKeyFormat(apiKey: string): boolean {
  // TMDb API keys típicamente tienen 32 caracteres y contienen solo caracteres hexadecimales
  return /^[a-f0-9]{32}$/i.test(apiKey);
}