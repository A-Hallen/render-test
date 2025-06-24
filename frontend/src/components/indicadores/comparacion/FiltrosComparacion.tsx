import React, { useRef } from 'react';
import { Button, Spinner } from '../../../components/ui';
import { Calendar, RefreshCw, ChevronDown } from 'lucide-react';
import { Oficina } from '../../../services/OficinasService';
import { FiltrosComparacion as FiltrosComparacionType } from './types';
import '../../../components/ui/DateInput.css';

interface FiltrosComparacionProps {
  filtros: FiltrosComparacionType;
  fechaMostrada: string;
  oficinas: Oficina[];
  cargandoOficinas: boolean;
  cargando: boolean;
  onOficina1Change: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onOficina2Change: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onFechaChange: (fecha: string) => void;
  onConsultar: () => void;
}

/**
 * Componente para los filtros de comparación de indicadores financieros
 * Permite seleccionar dos oficinas y una fecha para comparar
 */
export const FiltrosComparacion: React.FC<FiltrosComparacionProps> = ({
  filtros,
  fechaMostrada,
  oficinas,
  cargandoOficinas,
  cargando,
  onOficina1Change,
  onOficina2Change,
  onFechaChange,
  onConsultar
}) => {
  // Referencia al input de fecha
  const dateInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      {/* Filtros de selección en una sola fila */}
      <div className="flex flex-wrap items-end gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm">
        {/* Selector de Oficina 1 */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-semibold text-indigo-700 mb-2">
            Oficina 1
          </label>
          <div className="relative">
            <select
              className="w-full h-[46px] p-3 pl-4 pr-10 text-gray-700 bg-white border-2 border-indigo-100 rounded-lg shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={filtros.oficina1}
              onChange={onOficina1Change}
              disabled={cargandoOficinas}
            >
              {cargandoOficinas ? (
                <option value="">Cargando oficinas...</option>
              ) : (
                <>
                  <option value="">Seleccione una oficina</option>
                  {oficinas.map((oficina) => (
                    <option key={oficina.codigo} value={oficina.codigo}>
                      {oficina.nombre}
                    </option>
                  ))}
                </>
              )}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
              <ChevronDown className="h-5 w-5 text-indigo-500" />
            </div>
          </div>
        </div>

        {/* Selector de Oficina 2 */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-semibold text-indigo-700 mb-2">
            Oficina 2
          </label>
          <div className="relative">
            <select
              className="w-full h-[46px] p-3 pl-4 pr-10 text-gray-700 bg-white border-2 border-indigo-100 rounded-lg shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={filtros.oficina2}
              onChange={onOficina2Change}
              disabled={cargandoOficinas}
            >
              {cargandoOficinas ? (
                <option value="">Cargando oficinas...</option>
              ) : (
                <>
                  <option value="">Seleccione una oficina</option>
                  {oficinas.map((oficina) => (
                    <option key={oficina.codigo} value={oficina.codigo}>
                      {oficina.nombre}
                    </option>
                  ))}
                </>
              )}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
              <ChevronDown className="h-5 w-5 text-indigo-500" />
            </div>
          </div>
        </div>

        {/* Selector de Fecha */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-semibold text-indigo-700 mb-2">Fecha</label>
          <div className="relative">
            <div 
              className="flex items-center justify-between h-[46px] px-4 bg-white border-2 border-indigo-100 rounded-lg cursor-pointer"
              onClick={() => dateInputRef.current?.showPicker()}
            >
              <span className="font-medium text-gray-700">{fechaMostrada}</span>
              <Calendar className="h-5 w-5 text-indigo-500" />
            </div>
            <input
              ref={dateInputRef}
              type="date"
              className="sr-only"
              value={filtros.fecha}
              onChange={(e) => onFechaChange(e.target.value)}
            />
          </div>
        </div>

        {/* Botón de consulta */}
        <div className="ml-auto">
          <Button
            onClick={onConsultar}
            disabled={
              cargando ||
              !filtros.oficina1 ||
              !filtros.oficina2 ||
              filtros.oficina1 === filtros.oficina2
            }
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 font-medium whitespace-nowrap"
          >
            {cargando ? (
              <>
                <Spinner size="sm" className="text-white" />
                <span>Consultando...</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-5 w-5" />
                <span>Consultar</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  );
};

export default FiltrosComparacion;
