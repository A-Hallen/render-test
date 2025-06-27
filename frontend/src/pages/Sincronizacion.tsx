import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Settings,
  Clock,
  Cloud,
  Pause,
  Square,
} from "lucide-react";
import { ConfiguracionSincronizacion } from "../components/sincronizacion/ConfiguracionSincronizacion";
import {
  EstadoSincronizacionCard,
  SkeletonEstadoSincronizacion,
} from "../components/sincronizacion/EstadoSincronizacionCard";
import {
  obtenerHistorialSincronizacion,
  iniciarSincronizacion,
  obtenerEstadoSincronizacion,
  pausarSincronizacion,
  detenerSincronizacion,
} from "../services/sincronizacion.service";
import { HistorialSincronizacion, SyncData } from "shared";
import { RespuestaEstadoSincronizacion } from "shared";
import HistorialSincronizacionSection from "../components/sincronizacion/HistorialSincronizacionSection";

const Sincronizacion = () => {
  const [syncData, setSyncData] = useState<SyncData | null>(null);
  const [data, setData] = useState<RespuestaEstadoSincronizacion | null>(null);
  const initialized = useRef(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [horaProgramada, setHoraProgramada] = useState<string>("");
  const [activarSincAuto, setActivarSincAuto] = useState<boolean>(false);
  const [historial, setHistorial] = useState<HistorialSincronizacion[]>([]);

  const [periodicidad, setPeriodicidad] = useState({
    value: 1,
    unit: "horas" as "horas" | "dias",
  });

  useEffect(() => {
    const eventSource = new EventSource(
      "/api/sincronizacion/contabilidad/progress-stream"
    );
    eventSource.addEventListener("progressUpdate", (e) => {
      console.log("receiving updates", e.data);
      const dataResponse = JSON.parse(e.data);
      setSyncData(dataResponse);

      // Update the status to syncing when we receive progress updates
      // Using functional update to avoid dependency on data
      setData({
        ...data,
        status: dataResponse.status,
        lastSync: dataResponse.lastSync,
      });
    });
    // Manejo de errores
    eventSource.onerror = () => {
      console.error("Error en la conexión SSE");
      eventSource.close();
    };

    return () => {
      eventSource.close(); // Limpieza al desmontar el componente
    };
  }, []); // Empty dependency array - only run once on mount

  useEffect(() => {
    const fetchEstadoSincronizacion = async () => {
      try {
        const estado = await obtenerEstadoSincronizacion();
        console.log("estado", estado);
        setData(estado);
      } catch (error) {
        console.error("Error al obtener estado de sincronización:", error);
      }
    };

    const fetchHistorial = async () => {
      try {
        const response = await obtenerHistorialSincronizacion();
        setHistorial(response.historial);
      } catch (error) {
        console.error("Error cargando historial:", error);
      }
    };

    if (!initialized.current) {
      initialized.current = true;
      fetchEstadoSincronizacion();
      fetchHistorial();
    }
  }, [syncData]);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const startSync = async () => {
    await iniciarSincronizacion();
    setData((prevData) => ({
      ...prevData,
      status: "syncing",
      lastSync: prevData?.lastSync || "",
      firebaseData: {
        ultimaFecha: prevData?.firebaseData?.ultimaFecha || "",
      },
      awsData: {
        ultimaFecha: prevData?.awsData?.ultimaFecha || "",
      },
    }));
  };

  const handlePauseSync = async () => {
    await pausarSincronizacion();
    setData((prevData) => {
      if (prevData) {
        return {
          ...prevData,
          status: "paused",
        };
      }
      return prevData;
    });
  };

  const handleStopSync = async () => {
    await detenerSincronizacion();
    setData((prevData) => ({
      ...prevData,
      status: "stopped",
      lastSync: prevData?.lastSync || "",
      firebaseData: {
        ultimaFecha: prevData?.firebaseData?.ultimaFecha || "",
      },
      awsData: {
        ultimaFecha: prevData?.awsData?.ultimaFecha || "",
      },
    }));
  };

  const handleSaveConfig = () => {
    console.log("Configuración guardada");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <Cloud className="w-6 h-6 mr-2 text-blue-500" />
            Sincronización de Datos
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500 flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              Última sincronización: {data?.lastSync}
            </span>
            {data?.status === "idle" || data?.status === "stopped" ? (
              <button
                onClick={startSync}
                className="px-4 py-2 rounded-md flex items-center bg-blue-500 hover:bg-blue-600 text-white transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Sincronizar ahora
              </button>
            ) : null}

            {data?.status === "syncing" ? (
              <button
                onClick={handlePauseSync}
                className="px-4 py-2 rounded-md flex items-center bg-yellow-500 hover:bg-yellow-600 text-white transition-colors"
              >
                <Pause className="w-4 h-4 mr-2" />
                Pausar
              </button>
            ) : null}

            {data?.status === "paused" ? (
              <button
                onClick={startSync}
                className="px-4 py-2 rounded-md flex items-center bg-green-500 hover:bg-green-600 text-white transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reanudar
              </button>
            ) : null}

            {(data?.status === "syncing" || data?.status === "paused") && (
              <button
                onClick={handleStopSync}
                className="px-4 py-2 rounded-md flex items-center bg-red-500 hover:bg-red-600 text-white transition-colors"
              >
                <Square className="w-4 h-4 mr-2" />
                Detener
              </button>
            )}
          </div>
        </div>

        {/* EstadoSincronizacionCard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-6 mb-8"
        >
          <div className="grid grid-cols-1 gap-6">
            {data ? (
              <EstadoSincronizacionCard
                estadoSincronizacion={data}
                syncData={syncData}
              />
            ) : (
              <SkeletonEstadoSincronizacion />
            )}
          </div>
        </motion.div>

        {/* Sync Sections */}
        <div className="space-y-4">
          {/* Sync Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden"
          >
            <div
              className="flex justify-between items-center p-6 cursor-pointer"
              onClick={() => toggleSection("settings")}
            >
              <div className="flex items-center">
                <Settings className="w-5 h-5 mr-3 text-blue-500" />
                <h2 className="text-lg font-semibold">
                  Configuración de sincronización
                </h2>
              </div>
              {expandedSection === "settings" ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </div>
            <AnimatePresence>
              {expandedSection === "settings" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-6 pb-6"
                >
                  <ConfiguracionSincronizacion
                    horaProgramada={horaProgramada}
                    setHoraProgramada={setHoraProgramada}
                    activarSincAuto={activarSincAuto}
                    setActivarSincAuto={setActivarSincAuto}
                    handleSaveConfig={handleSaveConfig}
                    periodicidad={periodicidad}
                    setPeriodicidad={setPeriodicidad}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Sync Logs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden"
          >
            <div
              className="flex justify-between items-center p-6 cursor-pointer"
              onClick={() => toggleSection("logs")}
            >
              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-3 text-gray-500" />
                <h2 className="text-lg font-semibold">
                  Historial de sincronización
                </h2>
              </div>
              {expandedSection === "logs" ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </div>
            <AnimatePresence>
              {expandedSection === "logs" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-6 pb-6"
                >
                  <HistorialSincronizacionSection historial={historial} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Sincronizacion;
