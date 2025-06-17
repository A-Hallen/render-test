import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { OficinasDTO } from 'shared/src/types/oficinas.types';
import { CooperativaDTO } from 'shared/src/types/cooperativa.types';
import { fetchData as fetchDataService, obtenerOficinas as obtenerOficinasService } from '../services/data.service';
import { obtenerCooperativa, actualizarCooperativa } from '../services/cooperativa.service';
import { useAuth } from './AuthContext';
import { UserRole } from '../types/auth';

interface DataContextType {
  loading: boolean;
  error: string | null;
  oficinas: OficinasDTO[];
  oficinaSeleccionada: OficinasDTO | null;
  setOficinaSeleccionada: (oficina: OficinasDTO) => void;
  fetchData: (endpoint: string, params?: Record<string, string>) => Promise<any>;
  fetchOficinasIfNeeded: () => Promise<OficinasDTO[]>;
  // Cooperativa
  cooperativa: CooperativaDTO | null;
  cooperativaLoading: boolean;
  cooperativaError: string | null;
  canEditCooperativa: boolean;
  actualizarDatosCooperativa: (datos: Partial<CooperativaDTO>) => Promise<void>;
  cargarDatosCooperativa: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [oficinas, setOficinas] = useState<OficinasDTO[]>([]);
  const [oficinaSeleccionada, setOficinaSeleccionada] = useState<OficinasDTO | null>(null);
  const [dataCache, setDataCache] = useState<Record<string, { data: any; timestamp: number }>>({});
  
  // Estados para la cooperativa
  const [cooperativa, setCooperativa] = useState<CooperativaDTO | null>(null);
  const [cooperativaLoading, setCooperativaLoading] = useState(false);
  const [cooperativaError, setCooperativaError] = useState<string | null>(null);
  
  // Verificar si el usuario tiene permisos para editar la cooperativa
  const canEditCooperativa = user?.role === UserRole.ADMIN;

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

  // Función para cargar los datos de la cooperativa
  const cargarDatosCooperativa = useCallback(async () => {
    try {
      setCooperativaLoading(true);
      setCooperativaError(null);
      
      const data = await obtenerCooperativa();
      console.log("datos de la cooperativa", data);
      setCooperativa(data);
    } catch (err: any) {
      setCooperativaError(err.message || 'Error al cargar datos de la cooperativa');
      console.error('Error al cargar datos de la cooperativa:', err);
    } finally {
      setCooperativaLoading(false);
    }
  }, []);

  // Función para actualizar los datos de la cooperativa
  const actualizarDatosCooperativa = useCallback(async (datos: Partial<CooperativaDTO>) => {
    if (!canEditCooperativa) {
      throw new Error('No tienes permisos para editar la información de la cooperativa');
    }
    
    try {
      setCooperativaLoading(true);
      setCooperativaError(null);
      
      const cooperativaActualizada = await actualizarCooperativa(datos);
      setCooperativa(cooperativaActualizada);
    } catch (err: any) {
      setCooperativaError(err.message || 'Error al actualizar datos de la cooperativa');
      throw err;
    } finally {
      setCooperativaLoading(false);
    }
  }, [canEditCooperativa]);

  // Cargar oficinas al iniciar
  useEffect(() => {
    fetchOficinasIfNeeded();
  }, [fetchOficinasIfNeeded]);
  
  // Cargar datos de la cooperativa cuando el usuario está autenticado
  useEffect(() => {
    if (user) {
      cargarDatosCooperativa();
    }
  }, [user, cargarDatosCooperativa]);

  return (
    <DataContext.Provider value={{
      loading,
      error,
      oficinas,
      oficinaSeleccionada,
      setOficinaSeleccionada,
      fetchData,
      fetchOficinasIfNeeded,
      // Cooperativa
      cooperativa,
      cooperativaLoading,
      cooperativaError,
      canEditCooperativa,
      actualizarDatosCooperativa,
      cargarDatosCooperativa
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