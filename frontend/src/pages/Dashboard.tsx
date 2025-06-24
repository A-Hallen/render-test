import React, { useState, useEffect } from "react";
import { CaptacionesCard } from "../components/dashboard/CaptacionesCard";
import { ApexIndicadoresChart } from "../features/dashboard/ApexIndicadoresChart";
import { CarteraCreditoCard } from "../components/dashboard/CarteraCreditoCard";
import { useOficinas } from "../context/DataContext";

export const Dashboard: React.FC = () => {
  const { oficinas, oficinaSeleccionada, setOficinaSeleccionada, fetchOficinasIfNeeded } = useOficinas();
  const [codigoOficina, setCodigoOficina] = useState<string>("CNS");

  // Cargar oficinas al iniciar el componente
  useEffect(() => {
    fetchOficinasIfNeeded();
  }, [fetchOficinasIfNeeded]);

  // Actualizar el código de oficina cuando cambia la oficina seleccionada
  useEffect(() => {
    if (oficinaSeleccionada) {
      setCodigoOficina(oficinaSeleccionada.codigo);
    }
  }, [oficinaSeleccionada]);

  // Manejar cambio de oficina
  const handleOficinaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevaOficina = oficinas.find(o => o.codigo === e.target.value);
    if (nuevaOficina) {
      setOficinaSeleccionada(nuevaOficina);
    }
  };

  return (
    <div className="space-y-6">
      {/* Selector de oficina */}
      <div className="">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Dashboard Financiero</h2>
          
          <div className="relative">
            <label htmlFor="oficina-selector" className="mr-2 text-sm font-medium text-gray-700">
              Oficina:
            </label>
            <select
              id="oficina-selector"
              value={codigoOficina}
              onChange={handleOficinaChange}
              className="appearance-none pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              disabled={oficinas.length === 0}
            >
              {oficinas.length > 0 ? (
                oficinas.map(oficina => (
                  <option key={oficina.codigo} value={oficina.codigo}>
                    {oficina.nombre}
                  </option>
                ))
              ) : (
                <option value="">Cargando oficinas...</option>
              )}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <CarteraCreditoCard codigoOficina={codigoOficina} />
        <CaptacionesCard tipo="vista" codigoOficina={codigoOficina} />
        <CaptacionesCard tipo="plazo" codigoOficina={codigoOficina} />
      </div>

      <div className="space-y-4">
        <ApexIndicadoresChart />
      </div>
    </div>
  );
};
