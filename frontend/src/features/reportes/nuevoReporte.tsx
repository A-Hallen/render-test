import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { ConfiguracionReporteDTO, ReporteTendenciaResponse } from "shared/src/types/reportes.types";
import { Calendar, Clock, CalendarRange, X, UserRound } from 'lucide-react';
import { OficinasDTO } from "shared/src/types/oficinas.types";
import { ReporteTendenciaRequest } from "shared/src/types/reportes.types";
import toast from 'react-hot-toast';

export type NuevoReporteHandle = {
  openModal: () => void;
  closeModal: () => void;
};

interface NuevoReporteProps {
  onClose?: () => void;
  tiposReporte: ConfiguracionReporteDTO[];
  oficinas: OficinasDTO[];
}

export const NuevoReporteView = forwardRef<NuevoReporteHandle, NuevoReporteProps>(
  ({ onClose, tiposReporte, oficinas }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [selectedTipo, setSelectedTipo] = useState<ConfiguracionReporteDTO | null>(null);
    const [selectedOficina, setSelectedOficina] = useState<string>('');
    const [periodo, setPeriodo] = useState('mensual');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [creandoReporte, setCreandoReporte] = useState(false);

    const openModal = () => {
      setIsOpen(true);
      setTimeout(() => setIsVisible(true), 100);
    };

    const closeModal = () => {
      setIsVisible(false);
      setTimeout(() => {
        setIsOpen(false);
        onClose?.();
      }, 300);
    };

    useImperativeHandle(ref, () => ({
      openModal,
      closeModal,
    }));

    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape" && isOpen) {
          closeModal();
        }
      };

      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedTipo || !selectedOficina || !fechaInicio || !fechaFin) {
        toast.error('Por favor complete todos los campos requeridos');
        return;
      }

      const toastId = toast.loading("Creando reporte...");

      try {
        setCreandoReporte(true);
        const req: ReporteTendenciaRequest = {
          tipo: selectedTipo,
          oficina: selectedOficina,
          periodo: periodo,
          fechaInicio: fechaInicio,
          fechaFin: fechaFin
        };
        
        const response = await fetch("api/reportes/tendencia", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(req)
        })


        const responseData: ReporteTendenciaResponse | { success: boolean; message: string; } = await response.json();
        
        if (!responseData.success) {
          toast.error(responseData.message || 'Error al crear el reporte');
          return;
        }
        
        toast.success("Reporte creado exitosamente");
      } catch (error) {
        console.error('Error creating report:', error);
        toast.error("Error al crear el reporte");
      } finally {
        closeModal();
        toast.dismiss(toastId);
        setCreandoReporte(false);
      }
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full transform transition-all duration-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Nuevo Reporte</h2>
            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                <Calendar className="inline w-4 h-4 mr-1" /> Tipo de Reporte
              </label>
              <select
                value={selectedTipo?.nombre || ''}
                onChange={(e) => setSelectedTipo(tiposReporte.find(t => t.nombre === e.target.value) || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Selecciona un tipo de reporte</option>
                {tiposReporte.map((tipo) => (
                  <option key={tipo.nombre} value={tipo.nombre}>
                    {tipo.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <UserRound className="inline w-4 h-4 mr-1" /> Oficina
              </label>
              <select
                value={selectedOficina}
                onChange={(e) => setSelectedOficina(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Selecciona una oficina</option>
                {oficinas?.map((oficina) => (
                  <option key={oficina.nombre} value={oficina.nombre}>
                    {oficina.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <Clock className="inline w-4 h-4 mr-1" /> Periodo
              </label>
              <select
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="mensual">Mensual</option>
                <option value="diario">Diario</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <CalendarRange className="inline w-4 h-4 mr-1" /> Fecha Inicio
                </label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <CalendarRange className="inline w-4 h-4 mr-1" /> Fecha Fin
                </label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                disabled={creandoReporte}
              >
                {creandoReporte ? 'Creando...' : 'Crear Reporte'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
);