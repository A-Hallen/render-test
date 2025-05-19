import { forwardRef, useImperativeHandle, useState } from "react";
import { ConfiguracionReporteDTO } from "shared/src/types/reportes.types";
import { AlertTriangle, X, Trash2 } from "lucide-react";

export type EliminarConfiguracionHandle = {
  openModal: (configuracion: ConfiguracionReporteDTO) => void;
  closeModal: () => void;
};

interface EliminarConfiguracionProps {
  onDelete?: (configuracion: ConfiguracionReporteDTO) => void;
}

export const EliminarConfiguracionDialog = forwardRef<
  EliminarConfiguracionHandle,
  EliminarConfiguracionProps
>(({ onDelete }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [configuracion, setConfiguracion] = useState<ConfiguracionReporteDTO | null>(null);

  const openModal = (config: ConfiguracionReporteDTO) => {
    setConfiguracion(config);
    setIsOpen(true);
    setTimeout(() => setIsVisible(true), 100);
  };

  const closeModal = () => {
    setIsVisible(false);
    setTimeout(() => {
      setIsOpen(false);
      setConfiguracion(null);
    }, 300);
  };

  const handleDelete = () => {
    if (configuracion && onDelete) {
      onDelete(configuracion);
    }
    closeModal();
  };

  useImperativeHandle(ref, () => ({
    openModal,
    closeModal,
  }));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4 h-full">
        {/* Fondo oscuro con transición */}
        <div
          className={`fixed inset-0 bg-black transition-opacity duration-300 ${
            isVisible ? "opacity-50" : "opacity-0"
          }`}
          onClick={closeModal}
        />

        {/* Contenido del modal con animación de escala */}
        <div
          className={`relative w-full max-w-md bg-white rounded-lg shadow-xl transform transition-all duration-300 ${
            isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
        >
          {/* Encabezado del modal */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center">
              <AlertTriangle className="w-6 h-6 text-yellow-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">
                Eliminar Configuración
              </h3>
            </div>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-500"
              onClick={closeModal}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Cuerpo del modal */}
          <div className="p-6">
            <p className="text-gray-700 mb-4">
              ¿Estás seguro que deseas eliminar la configuración{" "}
              <span className="font-semibold">
                {configuracion?.nombre || "esta configuración"}
              </span>
              ? Esta acción no se puede deshacer.
            </p>
          </div>

          {/* Pie del modal */}
          <div className="flex justify-end p-4 border-t gap-3">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={closeModal}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center"
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});