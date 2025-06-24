import React, { useState } from 'react';
import { Card, Button, Spinner, Alert } from '../../components/ui';
import { Input, Switch } from '../../components/ui/custom-components';
import { Calendar, CheckCircle, XCircle } from 'lucide-react';
import { configurarSincronizacionProgramada } from '../../services/sincronizacion.service';

interface SincronizacionProgramadaProps {
  programada: boolean;
  expresionCron: string;
  onConfiguracionActualizada: () => void;
  onMensaje?: (mensaje: string, tipo: 'success' | 'error' | 'warning' | 'info') => void;
}

export const SincronizacionProgramadaCard: React.FC<SincronizacionProgramadaProps> = ({ 
  programada, 
  expresionCron,
  onConfiguracionActualizada,
  onMensaje
}) => {
  const [expresion, setExpresion] = useState<string>(expresionCron || '0 0 * * *');
  const [activa, setActiva] = useState<boolean>(programada);
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const guardarConfiguracion = async () => {
    try {
      if (!expresion.trim()) {
        setError('La expresión cron no puede estar vacía');
        return;
      }

      setCargando(true);
      setError(null);
      
      const data = await configurarSincronizacionProgramada(expresion, activa);
      
      if (!data.exito) {
        throw new Error(data.mensaje || 'Error al configurar sincronización programada');
      }
      
      // Mostrar mensaje local en lugar de notificación
      if (onMensaje) {
        onMensaje(
          activa 
            ? 'La sincronización programada ha sido activada' 
            : 'La sincronización programada ha sido desactivada',
          'success'
        );
      }
      
      onConfiguracionActualizada();
    } catch (err: any) {
      console.error('Error al configurar sincronización programada:', err);
      setError(err.message || 'Error al configurar sincronización programada');
      
      // Mostrar error local en lugar de notificación
      if (onMensaje) {
        onMensaje(err.message || 'Error al configurar sincronización programada', 'error');
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <Card>
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Calendar className="mr-2 h-5 w-5" />
          Sincronización Programada
        </h2>
        
        <div className="space-y-4">
          <p className="text-gray-600">
            Configura una sincronización automática periódica utilizando una expresión cron.
          </p>
          
          {error && (
            <Alert type="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          
          <div className="flex items-center justify-between">
            <span className="font-medium">Estado:</span>
            <div className="flex items-center">
              {activa ? (
                <Badge color="green" className="flex items-center mr-2">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Activada
                </Badge>
              ) : (
                <Badge color="red" className="flex items-center mr-2">
                  <XCircle className="mr-1 h-3 w-3" />
                  Desactivada
                </Badge>
              )}
              <Switch 
                checked={activa} 
                onCheckedChange={setActiva}
                aria-label="Activar sincronización programada"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expresión Cron
            </label>
            <Input
              value={expresion}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setExpresion(e.target.value)}
              placeholder="0 0 * * *"
              disabled={cargando}
            />
            <p className="text-xs text-gray-500 mt-1">
              Ejemplo: "0 0 * * *" (todos los días a medianoche)
            </p>
          </div>
          
          <Button 
            onClick={guardarConfiguracion} 
            disabled={cargando}
            className="w-full"
          >
            {cargando ? <Spinner size="sm" className="mr-2" /> : null}
            Guardar Configuración
          </Button>
          
          <Alert type="info">
            <p className="text-sm">
              <strong>Ayuda:</strong> La expresión cron define cuándo se ejecutará la sincronización automáticamente.
              <br />
              Formato: minuto hora día-mes mes día-semana
              <br />
              Ejemplos:
              <br />
              - "0 0 * * *": Todos los días a medianoche
              <br />
              - "0 */6 * * *": Cada 6 horas
              <br />
              - "0 8 * * 1-5": De lunes a viernes a las 8:00 AM
            </p>
          </Alert>
        </div>
      </div>
    </Card>
  );
};

// Componente Badge para uso interno
const Badge = ({ color, className, children }: { color: string, className?: string, children: React.ReactNode }) => {
  const colorClasses = {
    green: "bg-green-100 text-green-800",
    red: "bg-red-100 text-red-800",
    blue: "bg-blue-100 text-blue-800",
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses[color as keyof typeof colorClasses]} ${className || ''}`}>
      {children}
    </span>
  );
};
