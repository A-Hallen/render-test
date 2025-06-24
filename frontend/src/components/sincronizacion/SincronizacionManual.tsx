import React, { useState } from 'react';
import { Card, Button, Spinner, Alert } from '../../components/ui';
import { RefreshCw, Database, Clock } from 'lucide-react';
import { iniciarSincronizacion } from '../../services/sincronizacion.service';

interface SincronizacionManualProps {
  enProceso: boolean;
  onSincronizacionIniciada: () => void;
  onMensaje?: (mensaje: string, tipo: 'success' | 'error' | 'warning' | 'info') => void;
}

export const SincronizacionManualCard: React.FC<SincronizacionManualProps> = ({ 
  enProceso, 
  onSincronizacionIniciada,
  onMensaje
}) => {
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const iniciarSincronizacionHandler = async (completa: boolean) => {
    try {
      setCargando(true);
      setError(null);
      
      const data = await iniciarSincronizacion(completa);
      
      if (!data.exito) {
        throw new Error(data.mensaje || 'Error al iniciar sincronización');
      }
      
      // Mostrar mensaje local en lugar de notificación
      if (onMensaje) {
        onMensaje(data.mensaje || 'Sincronización iniciada correctamente', 'success');
      }
      
      onSincronizacionIniciada();
    } catch (err: any) {
      console.error('Error al iniciar sincronización:', err);
      setError(err.message || 'Error al iniciar sincronización');
      
      // Mostrar error local en lugar de notificación
      if (onMensaje) {
        onMensaje(err.message || 'Error al iniciar sincronización', 'error');
      }
    } finally {
      setCargando(false);
    }
  };

  return (
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
          
          {error && (
            <Alert type="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          
          <div className="flex flex-col space-y-3">
            <Button 
              onClick={() => iniciarSincronizacionHandler(false)} 
              disabled={cargando || enProceso}
              className="w-full"
            >
              {cargando ? <Spinner size="sm" className="mr-2" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Sincronización Incremental
            </Button>
            
            <Button 
              onClick={() => iniciarSincronizacionHandler(true)} 
              variant="outline" 
              disabled={cargando || enProceso}
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
  );
};
