import { motion } from "framer-motion";
import { Database, Server, Calendar, ArrowRight, Clock } from "lucide-react";
import { RespuestaEstadoSincronizacion, SyncData } from "shared";

export function SkeletonEstadoSincronizacion() {
  return (
    <>
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="h-6 w-48 bg-gray-200 rounded mb-2 animate-pulse"></div>
          <div className="h-4 w-36 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
      </div>

      {/* Skeleton for progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 animate-pulse"></div>

        {/* Skeleton for progress details */}
        <div className="mt-3 space-y-2">
          <div className="flex justify-between">
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
          
          <div className="flex justify-between border-t pt-2 mt-2">
            <div className="h-4 w-36 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
          
          <div className="flex items-center">
            <div className="h-3 w-28 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Skeleton Firebase */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-blue-100 rounded-full mr-3">
              <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-5 w-20 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-4 w-36 bg-gray-200 rounded mb-1 animate-pulse"></div>
          <div className="h-6 w-24 bg-gray-200 rounded mb-4 animate-pulse"></div>
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Skeleton AWS */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-green-100 rounded-full mr-3">
              <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-5 w-20 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-4 w-36 bg-gray-200 rounded mb-1 animate-pulse"></div>
          <div className="h-6 w-24 bg-gray-200 rounded mb-4 animate-pulse"></div>
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Skeleton Sync Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-purple-100 rounded-full mr-3">
              <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-5 w-28 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-4 w-full bg-gray-200 rounded mb-1 animate-pulse"></div>
          <div className="h-4 w-3/4 bg-gray-200 rounded mb-1 animate-pulse"></div>
          <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </>
  );
}

interface EstadoSincronizacionCardProps {
    estadoSincronizacion: RespuestaEstadoSincronizacion;
    syncData: SyncData | null;
}

export function EstadoSincronizacionCard({ estadoSincronizacion, syncData }: EstadoSincronizacionCardProps) {

  return (
    <>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">
            Estado de sincronización
          </h2>
          <p className="text-sm text-gray-500">
            {estadoSincronizacion.status === "idle" && "Listo para sincronizar datos"}
            {estadoSincronizacion.status === "syncing" &&
              "Sincronizando datos con el servidor..."}
            {estadoSincronizacion.status === "success" && "Sincronización completada con éxito"}
            {estadoSincronizacion.status === "error" && "Error durante la sincronización"}
            {estadoSincronizacion.status === "paused" && "Sincronización pausada"}
            {estadoSincronizacion.status === "stopped" && "Sincronización detenida"}
          </p>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            estadoSincronizacion.status === "idle"
              ? "bg-gray-100 text-gray-800"
              : estadoSincronizacion.status === "syncing"
              ? "bg-blue-100 text-blue-800"
              : estadoSincronizacion.status === "success"
              ? "bg-green-100 text-green-800"
              : estadoSincronizacion.status === "paused"
              ? "bg-yellow-100 text-yellow-800"
              : estadoSincronizacion.status === "stopped"
              ? "bg-red-100 text-red-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {estadoSincronizacion.status === "idle" && "Inactivo"}
          {estadoSincronizacion.status === "syncing" && "Sincronizando"}
          {estadoSincronizacion.status === "success" && "Completado"}
          {estadoSincronizacion.status === "error" && "Error"}
          {estadoSincronizacion.status === "paused" && "Pausado"}
          {estadoSincronizacion.status === "stopped" && "Detenido"}
        </div>
      </div>

      {(estadoSincronizacion.status === "syncing" || estadoSincronizacion.status === "paused") && syncData && syncData.syncProgress !== undefined && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progreso</span>
            <span>{syncData?.syncProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <motion.div
              className="bg-blue-500 h-2.5 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${syncData?.syncProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Enhanced progress details */}
          <div className="mt-3 space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <div className="flex items-center">
                <span className="mr-1">Procesados:</span>
                <span className="font-medium">{syncData?.registrosProcesados}</span>
                <span className="ml-1">registros</span>
                {syncData?.registrosFallidos > 0 && (
                  <span className="ml-2 text-red-500">
                    ({syncData?.registrosFallidos} fallidos)
                  </span>
                )}
              </div>
              <div className="flex items-center">
                <span className="mr-1">Fecha actual:</span>
                <span className="font-medium">{syncData?.fechaActual}</span>
              </div>
            </div>
            
            {/* Time estimation section */}
            <div className="flex justify-between border-t pt-2 mt-2">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1 text-blue-500" />
                <span className="mr-1">Tiempo restante:</span>
                <span className="font-medium">{syncData?.tiempoEstimado || "Calculando..."}</span>
              </div>
              <div className="flex items-center">
                <span className="mr-1">Transcurrido:</span>
                <span className="font-medium">{syncData?.tiempoTranscurrido || "--"}</span>
              </div>
            </div>
            
            {/* Speed information */}
            {syncData?.velocidadPromedio !== undefined && (
              <div className="flex items-center text-xs text-gray-500">
                <span>Velocidad: </span>
                <span className="font-medium ml-1">
                  {syncData.velocidadPromedio.toFixed(2)} registros/segundo
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Estado Firebase */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-blue-100 rounded-full mr-3">
              <Database className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-medium text-gray-700">Firebase</h3>
          </div>
          <div className="flex items-center text-sm text-gray-600 mb-1">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Última fecha sincronizada:</span>
          </div>
          <p className="text-lg font-bold text-gray-800 mb-4">
            {estadoSincronizacion.firebaseData?.ultimaFecha}
          </p>
        </div>

        {/* Estado AWS */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-orange-100 rounded-full mr-3">
              <Server className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="font-medium text-gray-700">AWS RDS</h3>
          </div>
          <div className="flex items-center text-sm text-gray-600 mb-1">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Última fecha disponible:</span>
          </div>
          <p className="text-lg font-bold text-gray-800 mb-4">
            {estadoSincronizacion.awsData?.ultimaFecha}
          </p>
        </div>

        {/* Diferencia */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-purple-100 rounded-full mr-3">
              <ArrowRight className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-medium text-gray-700">Datos a sincronizar</h3>
          </div>
          <div className="flex items-center text-sm text-gray-600 mb-1">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Rango de fechas:</span>
          </div>
          <p className="text-lg font-bold text-gray-800 mb-1">
            {estadoSincronizacion.syncData ? estadoSincronizacion.syncData.rangoFechas : "Calculando..."}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">
              {estadoSincronizacion.syncData?.registrosNuevos === -1 ? "" : estadoSincronizacion.syncData?.registrosNuevos}
            </span>{" "}
            {estadoSincronizacion.syncData ? "registros nuevos" : "Calculando registros nuevos... "}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            <Clock className="w-3 h-3 inline mr-1" />
            Tiempo estimado: {estadoSincronizacion.syncData ? estadoSincronizacion.syncData.tiempoEstimado : "Calculando..."}
          </p>
        </div>
      </div>
    </>
  );
}
