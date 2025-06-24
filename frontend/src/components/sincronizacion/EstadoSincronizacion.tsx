import React from 'react';
import { Card, Badge, Spinner, Alert } from '../../components/ui';
import { Database, CheckCircle, XCircle } from 'lucide-react';
import { EstadoSincronizacion as IEstadoSincronizacion } from '../../services/sincronizacion.service';
import { formatearFecha } from '../../utils/formatters';

interface EstadoSincronizacionProps {
  estado: IEstadoSincronizacion | null;
  cargando: boolean;
}

export const EstadoSincronizacionCard: React.FC<EstadoSincronizacionProps> = ({ estado, cargando }) => {
  return (
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
  );
};
