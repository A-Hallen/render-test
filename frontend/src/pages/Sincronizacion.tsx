import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Alert, Button, Card, Spinner } from '../components/ui';
import { ExportacionContableCard } from '../components/sincronizacion/ExportacionContable';
import { SincronizacionProgramadaCard } from '../components/sincronizacion/SincronizacionProgramada';
import { 
  obtenerEstadoSincronizacion, 
  obtenerEstadoExportacionContable, 
  iniciarSincronizacion,
  EstadoSincronizacion as IEstadoSincronizacion, 
  EstadoExportacionContable 
} from '../services/sincronizacion.service';
import { RefreshCw, Database, Clock } from 'lucide-react';
import { UserRole } from '../types/auth';
import { ProgresoExportacionCard } from '../components/sincronizacion/ProgresoExportacion';

export const Sincronizacion: React.FC = () => {
  const { user } = useAuth();
  const [estadoSincronizacion, setEstadoSincronizacion] = useState<IEstadoSincronizacion | null>(null);
  const [estadoExportacion, setEstadoExportacion] = useState<EstadoExportacionContable | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [exportacionActiva, setExportacionActiva] = useState<boolean>(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [tipoMensaje, setTipoMensaje] = useState<'success' | 'error' | 'warning' | 'info'>('info');

  // Verificar si el usuario tiene permisos de administrador
  const esAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.GERENTE_GENERAL;

  // Función para actualizar el estado de sincronización
  const actualizarEstadoSincronizacion = async () => {
    try {
      const data = await obtenerEstadoSincronizacion();
      setEstadoSincronizacion(data);
    } catch (err: any) {
      console.error('Error al obtener estado de sincronización:', err);
      setError('Error al obtener estado de sincronización');
    }
  };

  // Función para actualizar el estado de exportación
  const actualizarEstadoExportacion = async () => {
    try {
      const data = await obtenerEstadoExportacionContable();
      if (data && data.estado) {
        setEstadoExportacion(data.estado);
        setExportacionActiva(data.estado.enProceso || false);
      }
    } catch (err: any) {
      console.error('Error al obtener estado de exportación:', err);
      // No mostramos error para no sobrecargar la interfaz
    }
  };

  // Función para iniciar sincronización manual
  const iniciarSincronizacionManual = async (completa: boolean) => {
    setMensaje(null);
    setCargando(true);
    try {
      const respuesta = await iniciarSincronizacion(completa);
      if (respuesta.exito) {
        setMensaje(respuesta.mensaje);
        setTipoMensaje('success');
        // Actualizar el estado después de iniciar la sincronización
        await actualizarEstadoSincronizacion();
      } else {
        setMensaje('Error al iniciar la sincronización');
        setTipoMensaje('error');
      }
    } catch (error: any) {
      console.error('Error al iniciar sincronización:', error);
      setMensaje('Error al iniciar la sincronización: ' + (error.message || 'Error desconocido'));
      setTipoMensaje('error');
    } finally {
      setCargando(false);
    }
  };

  // Efecto para cargar el estado inicial
  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true);
      try {
        await Promise.all([
          actualizarEstadoSincronizacion(),
          actualizarEstadoExportacion()
        ]);
      } catch (err) {
        console.error('Error al cargar datos iniciales:', err);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  // Efecto para actualizar periódicamente el estado
  useEffect(() => {
    // Intervalo para actualizar el estado de sincronización (cada 30 segundos)
    const intervaloSincronizacion = setInterval(() => {
      actualizarEstadoSincronizacion();
    }, 30000);

    // Intervalo para actualizar el estado de exportación (cada 5 segundos si hay una exportación activa, sino cada 15 segundos)
    const intervaloExportacion = setInterval(() => {
      actualizarEstadoExportacion();
    }, exportacionActiva ? 5000 : 15000);

    return () => {
      clearInterval(intervaloSincronizacion);
      clearInterval(intervaloExportacion);
    };
  }, [exportacionActiva]);

  // Manejador para cuando se inicia una exportación
  const handleExportacionIniciada = () => {
    setExportacionActiva(true);
    // Actualizamos inmediatamente para mostrar el progreso
    actualizarEstadoExportacion();
  };

  // Manejador para actualizar después de configurar la sincronización programada
  const handleConfiguracionActualizada = () => {
    actualizarEstadoSincronizacion();
  };

  // Redirigir si el usuario no tiene permisos
  if (!esAdmin) {
    return (
      <div className="p-6">
        <Alert type="error">
          <h3 className="text-lg font-semibold">Acceso denegado</h3>
          <p>No tienes permisos para acceder a esta página.</p>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Panel de Sincronización</h1>
      
      {error && (
        <Alert type="error" className="mb-4">
          {error}
        </Alert>
      )}

      {mensaje && (
        <Alert type={tipoMensaje} className="mb-4" onClose={() => setMensaje(null)}>
          {mensaje}
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Database className="mr-2 h-5 w-5" />
            Estado de Sincronización
          </h2>
          {cargando && !estadoSincronizacion ? (
            <div className="flex justify-center items-center h-40">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Estado:</span>
                {estadoSincronizacion?.enProceso ? (
                  <div className="flex items-center">
                    <Spinner size="sm" className="mr-2" />
                    <span className="text-blue-600 font-medium">Sincronización en progreso</span>
                  </div>
                ) : (
                  <span className="text-green-600 font-medium">Listo para sincronizar</span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Última sincronización:</span>
                <span>{estadoSincronizacion?.ultimaSincronizacion || 'Nunca'}</span>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <RefreshCw className="mr-2 h-5 w-5" />
            Sincronización Manual
          </h2>
          <div className="space-y-4">
            <p className="text-gray-600">Inicie una sincronización manual de datos desde AWS a Firebase.</p>
            <div className="flex flex-col space-y-3">
              <Button 
                onClick={() => iniciarSincronizacionManual(false)} 
                disabled={cargando || (estadoSincronizacion?.enProceso || false)}
                className="w-full"
              >
                {cargando ? <Spinner size="sm" className="mr-2" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Sincronización Incremental
              </Button>
              
              <Button 
                onClick={() => iniciarSincronizacionManual(true)} 
                variant="outline" 
                disabled={cargando || (estadoSincronizacion?.enProceso || false)}
                className="w-full"
              >
                Sincronización Completa
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <ExportacionContableCard 
          enProceso={estadoExportacion?.enProceso || false}
          porcentajeCompletado={estadoExportacion?.progreso?.porcentajeCompletado || 0}
          onExportacionIniciada={handleExportacionIniciada}
          onMensaje={(mensaje, tipo) => {
            setMensaje(mensaje);
            setTipoMensaje(tipo);
          }}
        />
        <ProgresoExportacionCard 
          estado={estadoExportacion} 
          cargando={cargando && !estadoExportacion} 
        />
      </div>

      <div className="mt-6">
        <SincronizacionProgramadaCard 
          expresionCron={estadoSincronizacion?.expresionCron || ''}
          programada={estadoSincronizacion?.programada || false}
          onConfiguracionActualizada={handleConfiguracionActualizada}
          onMensaje={(mensaje, tipo) => {
            setMensaje(mensaje);
            setTipoMensaje(tipo);
          }}
        />
      </div>
    </div>
  );
};

export default Sincronizacion;
