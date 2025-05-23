import React, { useState, useEffect } from 'react';
import { useAutorizacion } from '../context/AutorizacionContext';
import { Card, Button, Alert, Spinner, Badge } from '../components/ui';
import { RefreshCw, Database, Clock, CheckCircle, XCircle } from 'lucide-react';

interface EstadoSincronizacion {
  enProceso: boolean;
  ultimaSincronizacion: string;
  programada: boolean;
  expresionCron: string;
}

export const Sincronizacion: React.FC = () => {
  const [estado, setEstado] = useState<EstadoSincronizacion | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [tipoMensaje, setTipoMensaje] = useState<'success' | 'error'>('success');
  const { usuario } = useAutorizacion();

  // Verificar si el usuario tiene permisos de administrador
  const esAdmin = usuario?.rol === 'administrador' || usuario?.rol === 'gerente_general';

  // Cargar el estado inicial de sincronización
  useEffect(() => {
    cargarEstado();
    // Actualizar el estado cada 30 segundos
    const intervalo = setInterval(cargarEstado, 30000);
    return () => clearInterval(intervalo);
  }, []);

  // Función para cargar el estado de sincronización
  const cargarEstado = async () => {
    try {
      setCargando(true);
      setError(null);
      
      const response = await fetch('/api/sincronizacion/estado');
      
      if (!response.ok) {
        throw new Error(`Error al obtener estado: ${response.statusText}`);
      }
      
      const data = await response.json();
      setEstado(data);
    } catch (err: any) {
      console.error('Error al cargar estado de sincronización:', err);
      setError(err.message || 'Error al cargar estado de sincronización');
    } finally {
      setCargando(false);
    }
  };

  // Función para iniciar sincronización manual
  const iniciarSincronizacion = async (completa: boolean) => {
    try {
      setCargando(true);
      setError(null);
      setMensaje(null);
      
      const response = await fetch('/api/sincronizacion/iniciar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ forzarCompleta: completa })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.mensaje || 'Error al iniciar sincronización');
      }
      
      setMensaje(data.mensaje);
      setTipoMensaje('success');
      
      // Actualizar el estado después de iniciar la sincronización
      await cargarEstado();
    } catch (err: any) {
      console.error('Error al iniciar sincronización:', err);
      setError(err.message || 'Error al iniciar sincronización');
      setMensaje(err.message || 'Error al iniciar sincronización');
      setTipoMensaje('error');
    } finally {
      setCargando(false);
    }
  };

  // Formatear fecha
  const formatearFecha = (fechaStr: string) => {
    if (!fechaStr) return 'Nunca';
    
    try {
      const fecha = new Date(fechaStr);
      return fecha.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (err) {
      return fechaStr;
    }
  };

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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Administración de Sincronización</h1>
        <Button 
          onClick={cargarEstado} 
          variant="outline" 
          disabled={cargando}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualizar
        </Button>
      </div>

      {mensaje && (
        <Alert type={tipoMensaje === 'success' ? 'success' : 'error'} onClose={() => setMensaje(null)}>
          {mensaje}
        </Alert>
      )}

      {error && (
        <Alert type="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Database className="mr-2 h-5 w-5" />
              Estado de Sincronización
            </h2>
            
            {cargando && !estado ? (
              <div className="flex justify-center items-center h-40">
                <Spinner size="lg" />
              </div>
            ) : estado ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Estado actual:</span>
                  {estado.enProceso ? (
                    <Badge color="blue" className="flex items-center">
                      <Spinner size="sm" className="mr-1" />
                      En proceso
                    </Badge>
                  ) : (
                    <Badge color="green" className="flex items-center">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Inactivo
                    </Badge>
                  )}
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Última sincronización:</span>
                  <span className="font-medium">{formatearFecha(estado.ultimaSincronizacion)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Sincronización programada:</span>
                  {estado.programada ? (
                    <Badge color="green" className="flex items-center">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Activada
                    </Badge>
                  ) : (
                    <Badge color="red" className="flex items-center">
                      <XCircle className="mr-1 h-3 w-3" />
                      Desactivada
                    </Badge>
                  )}
                </div>
                
                {estado.programada && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Expresión cron:</span>
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">{estado.expresionCron}</code>
                  </div>
                )}
              </div>
            ) : (
              <Alert type="error">
                No se pudo cargar el estado de sincronización
              </Alert>
            )}
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Sincronización Manual
            </h2>
            
            <div className="space-y-4">
              <p className="text-gray-600">
                Inicia manualmente la sincronización entre el core financiero y Firebase.
              </p>
              
              <div className="flex flex-col space-y-3">
                <Button 
                  onClick={() => iniciarSincronizacion(false)} 
                  disabled={cargando || (estado?.enProceso || false)}
                  className="w-full"
                >
                  {cargando ? <Spinner size="sm" className="mr-2" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                  Sincronización Incremental
                </Button>
                
                <Button 
                  onClick={() => iniciarSincronizacion(true)} 
                  variant="outline" 
                  disabled={cargando || (estado?.enProceso || false)}
                  className="w-full"
                >
                  {cargando ? <Spinner size="sm" className="mr-2" /> : <Database className="mr-2 h-4 w-4" />}
                  Sincronización Completa
                </Button>
              </div>
              
              <Alert type="warning">
                <p className="text-sm">
                  <strong>Nota:</strong> La sincronización completa puede tardar varios minutos dependiendo del volumen de datos.
                </p>
              </Alert>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
