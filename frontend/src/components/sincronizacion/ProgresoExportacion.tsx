import React from 'react';
import { Card, Badge, Spinner, Alert } from '../../components/ui';
import { Progress } from '../../components/ui/custom-components';
import { BarChart, CheckCircle } from 'lucide-react';
import { EstadoExportacionContable } from '../../services/sincronizacion.service';
import { formatearFecha, formatearDuracion } from '../../utils/formatters';

interface ProgresoExportacionProps {
  estado: EstadoExportacionContable | null;
  cargando: boolean;
}

export const ProgresoExportacionCard: React.FC<ProgresoExportacionProps> = ({ estado, cargando }) => {
  return (
    <Card>
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <BarChart className="mr-2 h-5 w-5" />
          Estado de Exportación Contable
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
            
            {estado.ultimaExportacion && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Última exportación:</span>
                <span className="font-medium">{formatearFecha(estado.ultimaExportacion)}</span>
              </div>
            )}
            
            {estado.enProceso && estado.progreso && (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Progreso:</span>
                    <span className="font-medium">{estado.progreso.porcentajeCompletado}%</span>
                  </div>
                  <Progress value={estado.progreso.porcentajeCompletado} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600 block text-sm">Procesados:</span>
                    <span className="font-medium">{estado.progreso.processed} / {estado.progreso.total}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 block text-sm">Exitosos:</span>
                    <span className="font-medium">{estado.progreso.success}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 block text-sm">Fallidos:</span>
                    <span className="font-medium">{estado.progreso.failed}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 block text-sm">Tiempo:</span>
                    <span className="font-medium">{formatearDuracion(estado.progreso.tiempoTranscurrido)}</span>
                  </div>
                </div>
              </>
            )}
            
            {!estado.enProceso && !estado.ultimaExportacion && (
              <Alert type="info">
                No se ha realizado ninguna exportación contable todavía.
              </Alert>
            )}
          </div>
        ) : (
          <Alert type="error">
            No se pudo cargar el estado de exportación
          </Alert>
        )}
      </div>
    </Card>
  );
};
