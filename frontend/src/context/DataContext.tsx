import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { OficinasDTO, ObtenerOficinasResponse } from 'shared/src/types/oficinas.types';

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
  
  // Tiempo de caducidad del caché en milisegundos (5 minutos)
  const CACHE_EXPIRY = 5 * 60 * 1000;
  
  // Mock data for demo purposes (mantenemos esto para compatibilidad)
  const mockApiData = {
    'financial-indicators': {
      liquidez: 16.8,
      solvencia: 18.5,
      morosidad: 3.2,
      rentabilidad: 1.7,
      eficiencia: 82.3,
    },
    'loan-portfolio': {
      total: 4850000,
      byType: {
        consumo: 3152500,
        microCredito: 1212500,
        vivienda: 485000,
      },
      byStatus: {
        vigente: 4694950,
        vencido: 155050,
      },
    },
    'deposits': {
      total: 7250000,
      byType: {
        ahorrosVista: 2537500,
        plazoFijo: 4712500,
      },
    },
    'members': {
      total: 12450,
      active: 10583,
      inactive: 1867,
      newThisMonth: 124,
    },
  };
  
  // Función para generar una clave de caché basada en endpoint y parámetros
  const getCacheKey = (endpoint: string, params?: Record<string, string>): string => {
    if (!params) return endpoint;
    const sortedParams = Object.entries(params).sort((a, b) => a[0].localeCompare(b[0]));
    return `${endpoint}?${sortedParams.map(([key, value]) => `${key}=${value}`).join('&')}`;
  };
  
  // Función para verificar si un elemento del caché es válido
  const isCacheValid = (cacheKey: string): boolean => {
    const cachedItem = dataCache[cacheKey];
    if (!cachedItem) return false;
    
    const now = Date.now();
    return now - cachedItem.timestamp < CACHE_EXPIRY;
  };
  
  // Función para obtener datos, usando caché si está disponible
  const fetchData = useCallback(async (endpoint: string, params?: Record<string, string>): Promise<any> => {
    setLoading(true);
    setError(null);
    
    try {
      const cacheKey = getCacheKey(endpoint, params);
      
      // Verificar si hay datos en caché válidos
      if (isCacheValid(cacheKey)) {
        setLoading(false);
        return dataCache[cacheKey].data;
      }
      
      // Para endpoints mock, usar los datos simulados
      if (endpoint in mockApiData) {
        const data = mockApiData[endpoint as keyof typeof mockApiData];
        setDataCache(prev => ({
          ...prev,
          [cacheKey]: { data, timestamp: Date.now() }
        }));
        setLoading(false);
        return data;
      }
      
      // Construir la URL con los parámetros
      let url = `/api/${endpoint}`;
      if (params && Object.keys(params).length > 0) {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          queryParams.append(key, value);
        });
        url += `?${queryParams.toString()}`;
      }
      
      // Realizar la petición al servidor
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error en la respuesta: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Guardar en caché
      setDataCache(prev => ({
        ...prev,
        [cacheKey]: { data, timestamp: Date.now() }
      }));
      
      setLoading(false);
      return data;
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Error al obtener datos');
      throw err;
    }
  }, [dataCache]);
  
  // Función específica para obtener oficinas
  const fetchOficinasIfNeeded = useCallback(async (): Promise<OficinasDTO[]> => {
    // Si ya tenemos oficinas cargadas, las devolvemos
    if (oficinas.length > 0) {
      return oficinas;
    }
    
    try {
      const response = await fetchData('oficinas');
      const nuevasOficinas = response.oficinas || [];
      
      setOficinas(nuevasOficinas);
      
      // Si no hay oficina seleccionada y hay oficinas disponibles, seleccionar la primera
      if (!oficinaSeleccionada && nuevasOficinas.length > 0) {
        setOficinaSeleccionada(nuevasOficinas[0]);
      }
      
      return nuevasOficinas;
    } catch (error) {
      console.error('Error al cargar oficinas:', error);
      return [];
    }
  }, [oficinas, oficinaSeleccionada, fetchData]);
  
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