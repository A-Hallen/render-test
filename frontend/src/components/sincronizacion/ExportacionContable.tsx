import React, { useState } from 'react';
import { Card, Button, Spinner, Alert } from '../../components/ui';
import { DatePicker, Progress, Checkbox } from '../../components/ui/custom-components';
import { FileUp } from 'lucide-react';
import { exportarDatosContables } from '../../services/sincronizacion.service';

interface ExportacionContableProps {
  enProceso: boolean;
  porcentajeCompletado: number;
  onExportacionIniciada: () => void;
  onMensaje?: (mensaje: string, tipo: 'success' | 'error' | 'warning' | 'info') => void;
}

export const ExportacionContableCard: React.FC<ExportacionContableProps> = ({ 
  enProceso, 
  porcentajeCompletado,
  onExportacionIniciada,
  onMensaje
}) => {
  const [fechaInicio, setFechaInicio] = useState<Date>(new Date(new Date().setDate(new Date().getDate() - 30)));
  const [fechaFin, setFechaFin] = useState<Date>(new Date());
  const [guardarArchivos, setGuardarArchivos] = useState<boolean>(false);
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const iniciarExportacion = async () => {
    try {
      if (!fechaInicio || !fechaFin) {
        setError('Debes seleccionar fechas de inicio y fin');
        return;
      }

      if (fechaInicio > fechaFin) {
        setError('La fecha de inicio no puede ser posterior a la fecha fin');
        return;
      }

      setCargando(true);
      setError(null);
      
      // Formatear fechas para la API en formato YYYY-MM-DD
      const fechaInicioStr = fechaInicio.toISOString().split('T')[0];
      const fechaFinStr = fechaFin.toISOString().split('T')[0];
      
      const data = await exportarDatosContables(fechaInicioStr, fechaFinStr, guardarArchivos);
      
      if (!data.exito) {
        throw new Error(data.mensaje || 'Error al iniciar exportación');
      }
      
      // Mostrar mensaje local en lugar de notificación
      if (onMensaje) {
        onMensaje('La exportación de datos contables ha comenzado', 'success');
      }
      
      onExportacionIniciada();
    } catch (err: any) {
      console.error('Error al iniciar exportación:', err);
      setError(err.message || 'Error al iniciar exportación');
      
      // Mostrar error local en lugar de notificación
      if (onMensaje) {
        onMensaje(err.message || 'Error al iniciar exportación de datos contables', 'error');
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <Card>
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FileUp className="mr-2 h-5 w-5" />
          Exportación de Datos Contables
        </h2>
        
        <div className="space-y-4">
          <p className="text-gray-600">
            Exporta datos contables desde AWS a Firebase para un rango de fechas específico.
          </p>
          
          {error && (
            <Alert type="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          
          {enProceso && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Progreso:</span>
                <span>{porcentajeCompletado}%</span>
              </div>
              <Progress value={porcentajeCompletado} />
              <Alert type="info">
                Exportación en proceso. Recibirás notificaciones sobre el avance.
              </Alert>
            </div>
          )}
          
          {!enProceso && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio</label>
                  <DatePicker
                    selected={fechaInicio}
                    onChange={(date: Date | null) => date && setFechaInicio(date)}
                    className="w-full"
                    dateFormat="dd/MM/yyyy"
                    maxDate={new Date()}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha fin</label>
                  <DatePicker
                    selected={fechaFin}
                    onChange={(date: Date | null) => date && setFechaFin(date)}
                    className="w-full"
                    dateFormat="dd/MM/yyyy"
                    maxDate={new Date()}
                    minDate={fechaInicio}
                  />
                </div>
              </div>
              
              <div className="flex items-center">
                <Checkbox
                  id="guardarArchivos"
                  checked={guardarArchivos}
                  onCheckedChange={(checked: boolean) => setGuardarArchivos(checked === true)}
                />
                <label htmlFor="guardarArchivos" className="ml-2 text-sm text-gray-600">
                  Guardar archivos JSON localmente (opcional)
                </label>
              </div>
              
              <Button 
                onClick={iniciarExportacion} 
                disabled={cargando}
                className="w-full"
              >
                {cargando ? <Spinner size="sm" className="mr-2" /> : <FileUp className="mr-2 h-4 w-4" />}
                Iniciar Exportación
              </Button>
              
              <Alert type="warning">
                <p className="text-sm">
                  <strong>Nota:</strong> La exportación puede tardar varios minutos dependiendo del rango de fechas seleccionado.
                </p>
              </Alert>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};
