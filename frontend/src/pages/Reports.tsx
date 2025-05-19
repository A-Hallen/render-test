import React, { useState, useEffect, useRef } from "react";
import { FileText, Edit2, Trash, PlusIcon } from "lucide-react";
import {
  ConfiguracionGuardadaResponse,
  ConfiguracionReporteDTO,
} from "shared/src/types/reportes.types";
import {
  CrearEditarConfiguracionView,
  CrearEditarConfiguracionHandle,
} from "../features/reportes/crearEditarConfiguracion";
import {
  NuevoReporteHandle,
  NuevoReporteView,
} from "../features/reportes/nuevoReporte";
import { OficinasDTO } from "shared/src/types/oficinas.types";
import toast, { Toaster } from "react-hot-toast";
import { ApiResponse } from "shared/src/types/generic.types";
import {
  EliminarConfiguracionDialog,
  EliminarConfiguracionHandle,
} from "../features/reportes/eliminarReporteDialog";

export const Reports: React.FC = () => {
  const [reportesActivos, setReportesActivos] = useState<
    ConfiguracionReporteDTO[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [oficinas, setOficinas] = useState<OficinasDTO[]>([]);
  const nuevoReporteRef = useRef<NuevoReporteHandle>(null);
  const crearEditarConfiguracionRef =
    useRef<CrearEditarConfiguracionHandle>(null);
  const eliminarConfiguracionRef = useRef<EliminarConfiguracionHandle>(null);

  // To open for new config
  const handleNuevaConfiguracion = () => {
    crearEditarConfiguracionRef.current?.openModal();
  };

  const reload = async () => {
    const reportesResponse = await fetch("/api/reportes/activos");
    const reportesData = await reportesResponse.json();
    setReportesActivos(reportesData.configuraciones);
  };

  const handleEliminarConfiguracion = (
    configuracion: ConfiguracionReporteDTO
  ) => {
    eliminarConfiguracionRef.current?.openModal(configuracion);
  };

  // To open for editing
  const handleEditarConfiguracion = (
    configuracion: ConfiguracionReporteDTO
  ) => {
    crearEditarConfiguracionRef.current?.openModal(configuracion);
  };

  const deleteConfiguration = async (
    configuracion: ConfiguracionReporteDTO
  ) => {
    const promise = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/reportes/configuracion", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(configuracion),
        });
        const parseResponse = await response.json();
        if (!(parseResponse as ApiResponse).success) {
          throw new Error("Ah ocurrido un error al eliminar la configuración");
        }
        await reload();
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };
    await toast.promise(promise, {
      loading: "Eliminando configuración ...",
      success: "Configuración eliminada!",
      error: "Ah ocurrido un error al eliminar la configuración",
    });
  };

  const updateConfiguration = async (
    configuracion: ConfiguracionReporteDTO
  ) => {
    const promise = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/reportes/configuracion", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(configuracion),
        });
        const parseResponse =
          (await response.json()) as ConfiguracionGuardadaResponse;
        if (!parseResponse.success) {
          throw new Error("A ocurrido un error al actualizar la configuración");
        }
        await reload();
      } catch (error) {
        throw error;
      } finally {
        setIsLoading(false);
      }
    };
    await toast.promise(promise, {
      loading: "Actualizando configuración ...",
      success: "Configuración actualizada correctamente",
      error: "Ah ocurrido un error al actualizada la configuración",
    });
  };

  const saveNewConfiguration = async (
    configuracion: ConfiguracionReporteDTO
  ) => {
    const promise = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/reportes/configuracion", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(configuracion),
        });
        const parsedResponse =
          (await response.json()) as ConfiguracionGuardadaResponse;
        if (!parsedResponse.success) {
          throw new Error("Ah ocurrido un error al crear la configuración");
        }

        await reload();
      } catch (error) {
        throw error;
      } finally {
        setIsLoading(false);
      }
    };
    await toast.promise(promise, {
      loading: "Creando configuración ...",
      success: "Configuración creada correctamente",
      error: "A ocurrido un error al crear la configuración",
    });
  };

  useEffect(() => {
    const cargarOficinas = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/oficinas");
        const data = await response.json();
        setOficinas(data.oficinas);
      } catch (error) {
        console.error("Error fetching oficinas:", error);
      } finally {
        setIsLoading(false);
      }
    };
    const fetchReportesActivos = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/reportes/activos");
        const data = await response.json();
        setReportesActivos(data.configuraciones);
      } catch (error) {
        console.error("Error fetching active reports:", error);
      } finally {
        setIsLoading(false);
      }
    };
    cargarOficinas();
    fetchReportesActivos();
  }, []);

  const handleNewReportClosed = () => {
    // Refresh the list after creating a new report
    const fetchReportesActivos = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/reportes/activos");
        const data = await response.json();
        setReportesActivos(data.configuraciones);
      } catch (error) {
        console.error("Error fetching active reports:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReportesActivos();
  };

  const filteredReports = reportesActivos?.filter((report) => {
    const matchesSearch =
      report.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.nombre.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const getStatusBadge = (status: boolean) => {
    switch (status) {
      case true:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
            Activo
          </span>
        );
      case false:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
            Inactivo
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Informes y Reportes
          </h1>
          <p className="text-gray-600">
            Gestiona y descarga los informes generados por el sistema
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center justify-center hover:bg-blue-700 transition"
            onClick={() => nuevoReporteRef.current?.openModal()}
          >
            <FileText className="mr-2" size={18} />
            <span>Generar nuevo informe</span>
          </button>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Buscar informes..."
              className="pl-9 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
          </div>
          <button
            onClick={handleNuevaConfiguracion}
            className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-md flex gap-1 items-center justify-center hover:bg-blue-700 transition"
          >
            <PlusIcon size={18} />
            <span>Nueva configuración</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Nombre
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/2"
                  >
                    Descripción
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Estado
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReports?.map((report) => (
                  <tr key={report.nombre} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-md bg-blue-50 text-blue-600">
                          <FileText size={20} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {report.nombre}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">
                        {report.descripcion}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(report.esActivo)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      {report.esActivo ? (
                        <>
                          <button
                            onClick={() => handleEditarConfiguracion(report)}
                            className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded-md"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleEliminarConfiguracion(report)}
                            className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded-md"
                          >
                            <Trash size={18} />
                          </button>
                        </>
                      ) : (
                        <span className="text-gray-400 cursor-not-allowed">
                          En proceso...
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <EliminarConfiguracionDialog
        ref={eliminarConfiguracionRef}
        onDelete={(config) => deleteConfiguration(config)}
      />

      <CrearEditarConfiguracionView
        ref={crearEditarConfiguracionRef}
        onEdit={(config) => updateConfiguration(config)}
        onSave={(config) => {
          saveNewConfiguration(config);
        }}
      />
      <NuevoReporteView
        oficinas={oficinas}
        ref={nuevoReporteRef}
        tiposReporte={reportesActivos}
        onClose={handleNewReportClosed}
      />
      <Toaster />
    </div>
  );
};
