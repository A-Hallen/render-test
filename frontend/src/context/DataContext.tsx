import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { OficinasDTO } from 'shared/src/types/oficinas.types';
import { fetchData as fetchDataService, obtenerOficinas as obtenerOficinasService } from '../services/data.service';

interface DataContextType {
  loading: boolean;
  error: string | null;
  oficinas: OficinasDTO[];
  oficinaSeleccionada: OficinasDTO | null;
  setOficinaSeleccionada: (oficina: OficinasDTO) => void;
  fetchData: (endpoint: string, params?: Record<string, string>) => Promise<any>;
  fetchOficinasIfNeeded: () => Promise<OficinasDTO[]>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [oficinas, setOficinas] = useState<OficinasDTO[]>([]);
  const [oficinaSeleccionada, setOficinaSeleccionada] = useState<OficinasDTO | null>(null);
  const [dataCache, setDataCache] = useState<Record<string, { data: any; timestamp: number }>>({});

  // Nota: La configuración de tiempo de caducidad del caché se ha eliminado ya que actualmente no se utiliza

  // Eliminamos mockApiData ya que no se utiliza con el cliente HTTP centralizado

  // Función para generar una clave de caché basada en endpoint y parámetros
  const getCacheKey = (endpoint: string, params?: Record<string, string>): string => {
    if (!params) return endpoint;
    const sortedParams = Object.entries(params).sort((a, b) => a[0].localeCompare(b[0]));
    return `${endpoint}?${sortedParams.map(([key, value]) => `${key}=${value}`).join('&')}`;
  };

  // Nota: La verificación de caché se ha eliminado ya que actualmente no se utiliza
  // Si se necesita implementar caché en el futuro, se puede agregar una función para verificar la validez

  // Función para realizar peticiones a la API
  const fetchData = useCallback(async (endpoint: string, params?: Record<string, string>) => {
    try {
      setLoading(true);
      setError(null);

      // Usar el servicio centralizado para hacer la petición
      const data = await fetchDataService(endpoint, params);

      // Guardar en caché
      const cacheKey = getCacheKey(endpoint, params);
      setDataCache(prev => ({
        ...prev,
        [cacheKey]: { data, timestamp: Date.now() }
      }));

      setLoading(false);
      return data;
    } catch (err: any) {
      setError(err.message || 'Error al obtener datos');
      throw err;
    }
  }, [dataCache]);

  // Función para cargar las oficinas si aún no se han cargado
  const fetchOficinasIfNeeded = useCallback(async (): Promise<OficinasDTO[]> => {
    if (oficinas.length > 0) {
      return oficinas;
    }

    try {
      setLoading(true);
      setError(null);

      // Usar el servicio centralizado para obtener las oficinas
      const nuevasOficinas = await obtenerOficinasService();

      setOficinas(nuevasOficinas);

      // Si no hay oficina seleccionada y hay oficinas disponibles, seleccionar la primera
      if (!oficinaSeleccionada && nuevasOficinas.length > 0) {
        setOficinaSeleccionada(nuevasOficinas[0]);
      }

      return nuevasOficinas;
    } catch (err: any) {
      setError(err.message || 'Error al cargar oficinas');
      console.error('Error al cargar oficinas:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [oficinas, oficinaSeleccionada]);

  // Cargar oficinas al iniciar
  useEffect(() => {
    fetchOficinasIfNeeded();
  }, [fetchOficinasIfNeeded]);

  return (
    <DataContext.Provider value={{
      loading,
      error,
      oficinas,
      oficinaSeleccionada,
      setOficinaSeleccionada,
      fetchData,
      fetchOficinasIfNeeded
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Hook personalizado para acceder directamente a las oficinas
export const useOficinas = () => {
  const { oficinas, oficinaSeleccionada, setOficinaSeleccionada, fetchOficinasIfNeeded } = useData();
  return { oficinas, oficinaSeleccionada, setOficinaSeleccionada, fetchOficinasIfNeeded };
};